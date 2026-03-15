import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import argon2 from 'argon2';
import type { Cookies } from '@sveltejs/kit';
import { dataManager } from '$lib/server/data/DataManager';

const adminSessionCookieName = 'admin_session';
const defaultSessionDays = 7;
const defaultAdminPassword = 'admin123';
const defaultAdminUsername = 'admin';
const sessionsStorageKey = 'auth/admin-sessions';
const usersStorageKey = 'auth/admin-users';

function getSessionLifetimeDays() {
	const configuredDays = Number(env.ADMIN_SESSION_DAYS ?? defaultSessionDays);
	if (!Number.isFinite(configuredDays) || configuredDays <= 0) {
		return defaultSessionDays;
	}

	return configuredDays;
}

function getSessionLifetimeMs() {
	return getSessionLifetimeDays() * 24 * 60 * 60 * 1000;
}

async function hashToken(token: string) {
	const data = new TextEncoder().encode(token);
	const digest = await globalThis.crypto.subtle.digest('SHA-256', data);

	return Array.from(new Uint8Array(digest), (value) => {
		return value.toString(16).padStart(2, '0');
	}).join('');
}

async function pruneExpiredSessions() {
	const sessions = await dataManager.load<Server.StoredSession[]>(sessionsStorageKey, []);
	const now = Date.now();
	const activeSessions = sessions.filter((session) => Date.parse(session.expiresAt) > now);

	if (activeSessions.length !== sessions.length) {
		await dataManager.save(sessionsStorageKey, activeSessions);
	}

	return activeSessions;
}

function toPublicUserProfile(user: Server.StoredAdminUser): App.AdminUserProfile {
	return {
		username: user.username,
		urlSuffix: user.urlSuffix
	};
}

async function saveUsers(users: Server.StoredAdminUser[]) {
	await dataManager.save(usersStorageKey, users);
}

async function getOrCreateUsers() {
	const existingUsers = await dataManager.load<Server.StoredAdminUser[]>(usersStorageKey, []);
	if (existingUsers.length > 0) {
		return existingUsers;
	}

	const password = (env.DEFAULT_ADMIN_PASSWORD ?? defaultAdminPassword).trim();
	const username = (env.DEFAULT_ADMIN_USERNAME ?? defaultAdminUsername).trim();

	const generatedHash = await argon2.hash(password, {
		type: argon2.argon2id
	});

	const defaultUser: Server.StoredAdminUser = {
		username,
		passwordHash: generatedHash,
		urlSuffix: ''
	};

	await saveUsers([defaultUser]);
	return [defaultUser];
}

async function findUserByUsername(username: string) {
	const users = await getOrCreateUsers();
	return users.find((user) => user.username === username) ?? null;
}

async function getSessionFromCookie(cookies: Cookies) {
	const token = cookies.get(adminSessionCookieName);
	if (!token) {
		return null;
	}

	const tokenHash = await hashToken(token);
	const sessions = await pruneExpiredSessions();

	return sessions.find((session) => session.tokenHash === tokenHash) ?? null;
}

export async function verifyAdminCredentials(username: string, password: string) {
	const user = await findUserByUsername(username.trim());
	if (!user) {
		return null;
	}

	const isValid = await argon2.verify(user.passwordHash, password);
	if (!isValid) {
		return null;
	}

	return toPublicUserProfile(user);
}

export async function createAdminSession(cookies: Cookies, username: string) {
	const token = `${globalThis.crypto.randomUUID()}${globalThis.crypto.randomUUID()}`;
	const tokenHash = await hashToken(token);
	const expiresAt = new Date(Date.now() + getSessionLifetimeMs());
	const sessions = await pruneExpiredSessions();

	sessions.push({ tokenHash, username, expiresAt: expiresAt.toISOString() });
	await dataManager.save(sessionsStorageKey, sessions);

	cookies.set(adminSessionCookieName, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		expires: expiresAt,
		maxAge: Math.floor(getSessionLifetimeMs() / 1000)
	});

	return expiresAt;
}

export async function hasAdminSession(cookies: Cookies) {
	return Boolean(await getSessionFromCookie(cookies));
}

export async function getAuthenticatedUser(cookies: Cookies) {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return null;
	}

	const user = await findUserByUsername(session.username);
	if (!user) {
		return null;
	}

	return toPublicUserProfile(user);
}

export async function updateAuthenticatedUserInfo(
	cookies: Cookies,
	updates: { urlSuffix?: string }
) {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return null;
	}

	const users = await getOrCreateUsers();
	const userIndex = users.findIndex((user) => user.username === session.username);
	if (userIndex === -1) {
		return null;
	}

	if (typeof updates.urlSuffix === 'string') {
		users[userIndex] = {
			...users[userIndex],
			urlSuffix: updates.urlSuffix.trim()
		};
	}

	await saveUsers(users);
	return toPublicUserProfile(users[userIndex]);
}

export async function changeAuthenticatedUserPassword(
	cookies: Cookies,
	currentPassword: string,
	newPassword: string
) {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return false;
	}

	const users = await getOrCreateUsers();
	const userIndex = users.findIndex((user) => user.username === session.username);
	if (userIndex === -1) {
		return false;
	}

	const user = users[userIndex];
	const currentPasswordMatches = await argon2.verify(user.passwordHash, currentPassword);
	if (!currentPasswordMatches) {
		return false;
	}

	const nextPasswordHash = await argon2.hash(newPassword, {
		type: argon2.argon2id
	});

	users[userIndex] = {
		...user,
		passwordHash: nextPasswordHash
	};

	await saveUsers(users);

	return true;
}

export async function clearAdminSession(cookies: Cookies) {
	const token = cookies.get(adminSessionCookieName);
	const sessions = await pruneExpiredSessions();

	if (token) {
		const tokenHash = await hashToken(token);
		const remainingSessions = sessions.filter((session) => session.tokenHash !== tokenHash);

		if (remainingSessions.length !== sessions.length) {
			await dataManager.save(sessionsStorageKey, remainingSessions);
		}
	}

	cookies.delete(adminSessionCookieName, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev
	});
}