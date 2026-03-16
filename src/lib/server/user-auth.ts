import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import argon2 from 'argon2';
import type { Cookies } from '@sveltejs/kit';
import { dataManager } from '$lib/server/data/DataManager';
import * as txt from '$lib/server/text-store';

const userSessionCookieName = 'user_session';
const defaultSessionDays = 7;
const defaultAdminPassword = 'admin123';
const defaultAdminUsername = 'admin';
const sessionsStorageKey = 'auth/sessions';
const usersStorageKey = 'auth/users';

function getSessionLifetimeDays() {
	const configuredDays = Number(env.USER_SESSION_TTL_DAYS ?? defaultSessionDays);
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

function toPublicUserProfile(user: Server.StoredUser): App.UserProfile {
	return {
		username: user.username,
		urlSuffix: user.urlSuffix
	};
}

async function saveUser(user: Server.StoredUser) {
	const users = await getOrCreateUsers();
	const userIndex = users.findIndex((u) => u.username === user.username);
	if (userIndex === -1) {
		users.push(user);
	} else {
		users[userIndex] = user;
	}

	await saveUsers(users);
}

async function saveUsers(users: Server.StoredUser[]) {
	await dataManager.save(usersStorageKey, users);
}

async function getOrCreateUsers() {
	const existingUsers = await dataManager.load<Server.StoredUser[]>(usersStorageKey, []);
	if (existingUsers.length > 0) {
		return existingUsers;
	}

	const password = (env.DEFAULT_ADMIN_PASSWORD ?? defaultAdminPassword).trim();
	const username = (env.DEFAULT_ADMIN_USERNAME ?? defaultAdminUsername).trim();

	const generatedHash = await argon2.hash(password, {
		type: argon2.argon2id
	});

	const defaultUser: Server.StoredUser = {
		username,
		passwordHash: generatedHash,
		urlSuffix: username
	};

	await saveUsers([defaultUser]);
	return [defaultUser];
}

async function findUserByUsername(username: string): Promise<Server.StoredUser | null> {
	const users = await getOrCreateUsers();
	return users.find((user) => user.username === username) ?? null;
}

async function getSessionFromCookie(cookies: Cookies): Promise<Server.StoredSession | null> {
	const token = cookies.get(userSessionCookieName);
	if (!token) {
		return null;
	}

	const tokenHash = await hashToken(token);
	const sessions = await pruneExpiredSessions();

	return sessions.find((session) => session.tokenHash === tokenHash) ?? null;
}

export async function verifyCredentials(username: string, password: string): Promise<App.UserProfile | null> {
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

export async function createSession(cookies: Cookies, username: string): Promise<Date> {
	const token = `${globalThis.crypto.randomUUID()}${globalThis.crypto.randomUUID()}`;
	const tokenHash = await hashToken(token);
	const expiresAt = new Date(Date.now() + getSessionLifetimeMs());
	const sessions = await pruneExpiredSessions();

	sessions.push({ tokenHash, username, expiresAt: expiresAt.toISOString() });
	await dataManager.save(sessionsStorageKey, sessions);

	cookies.set(userSessionCookieName, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		expires: expiresAt,
		maxAge: Math.floor(getSessionLifetimeMs() / 1000)
	});

	return expiresAt;
}

export async function hasSession(cookies: Cookies): Promise<boolean> {
	return Boolean(await getSessionFromCookie(cookies));
}

export async function getAuthenticatedUser(cookies: Cookies): Promise<App.UserProfile | null> {
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

export async function updateUserSuffix(cookies: Cookies, suffix: string): Promise<App.UserProfile | null> {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return null;
	}

	const user = await findUserByUsername(session.username);
	if (!user) {
		return null;
	}

	if (typeof suffix !== 'string') {
		return null;
	}

	const requestedSuffix = suffix.trim();
	if (requestedSuffix.length === 0 || requestedSuffix.length > 50) {
		return null;
	}

	const users = await getOrCreateUsers();
	const alreadyUsedByAnotherUser = users.some((existingUser) => {
		return existingUser.urlSuffix === requestedSuffix && existingUser.username !== user.username;
	});

	if (alreadyUsedByAnotherUser) {
		return null;
	}

	const previousSuffix = user.urlSuffix;
	const updatedUserInfo = {
		...user,
		urlSuffix: requestedSuffix
	};

	await saveUser(updatedUserInfo);
	await txt.moveTextToSuffix(previousSuffix, requestedSuffix);
	return toPublicUserProfile(updatedUserInfo);
}

export async function updateUserPassword(cookies: Cookies, currentPassword: string, newPassword: string): Promise<boolean> {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return false;
	}

	const user = await findUserByUsername(session.username);
	if (!user) {
		return false;
	}

	const currentPasswordMatches = await argon2.verify(user.passwordHash, currentPassword);
	if (!currentPasswordMatches) {
		return false;
	}

	const nextPasswordHash = await argon2.hash(newPassword, {
		type: argon2.argon2id
	});

	const updatedUserInfo = {
		...user,
		passwordHash: nextPasswordHash
	};

	await saveUser(updatedUserInfo);
	return true;
}

export async function clearSession(cookies: Cookies): Promise<void> {
	const token = cookies.get(userSessionCookieName);
	const sessions = await pruneExpiredSessions();

	if (token) {
		const tokenHash = await hashToken(token);
		const remainingSessions = sessions.filter((session) => session.tokenHash !== tokenHash);

		if (remainingSessions.length !== sessions.length) {
			await dataManager.save(sessionsStorageKey, remainingSessions);
		}
	}

	cookies.delete(userSessionCookieName, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev
	});
}