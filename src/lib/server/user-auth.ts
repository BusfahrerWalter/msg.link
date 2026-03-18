import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import argon2 from 'argon2';
import type { Cookies } from '@sveltejs/kit';
import { dataManager } from '$lib/server/data/DataManager';
import * as txt from '$lib/server/text-store';
import * as msg from '$lib/server/message-settings-store';

const userSessionCookieName = 'user_session';
const defaultSessionDays = 7;
const defaultAdminPassword = (env.DEFAULT_ADMIN_PASSWORD ?? 'admin123').trim();
const defaultAdminUsername = (env.DEFAULT_ADMIN_USERNAME ?? 'admin').trim();

ensureDefaultUser();

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

function isSessionExpired(session: Data.StoredSession) {
	return Date.parse(session.expiresAt) <= Date.now();
}

function toPublicUserProfile(user: Data.StoredUser): App.UserProfile {
	return {
		username: user.username,
		urlSuffix: user.urlSuffix,
		isAdmin: user.isAdmin,
		theme: user.theme,
		language: user.language
	};
}

async function ensureDefaultUser() {
	const existingDefaultUser = dataManager.loadUser(defaultAdminUsername);
	if (existingDefaultUser) {
		return;
	}

	createUser({
		username: defaultAdminUsername,
		password: defaultAdminPassword,
		urlSuffix: defaultAdminUsername,
		isAdmin: true,
		theme: 'light',
		language: 'en'
	});
}

function findUserByUsername(username: string): Data.StoredUser | null {
	return dataManager.loadUser(username);
}

async function getSessionFromCookie(cookies: Cookies): Promise<Data.StoredSession | null> {
	const token = cookies.get(userSessionCookieName);
	if (!token) {
		return null;
	}

	const tokenHash = await hashToken(token);
	const session = dataManager.loadSession(tokenHash);
	if (!session) {
		return null;
	}

	if (isSessionExpired(session)) {
		dataManager.removeSession(tokenHash);
		return null;
	}

	return session;
}

export async function verifyCredentials(username: string, password: string): Promise<App.UserProfile | null> {
	const user = findUserByUsername(username.trim());
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

	dataManager.saveSession({
		tokenHash,
		username,
		expiresAt: expiresAt.toISOString()
	});

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

	const user = findUserByUsername(session.username);
	if (!user) {
		return null;
	}

	return toPublicUserProfile(user);
}

export function isSuffixInUse(suffix: string): boolean {
	return dataManager.isSuffixInUse(suffix);
}

export function findUserBySuffix(suffix: string): Data.StoredUser | null {
	return dataManager.loadUserBySuffix(suffix);
}

export function listUsers(): App.UserProfile[] {
	const users = dataManager.loadUsers();

	return users.map((user) => {
		return {
			username: user.username,
			urlSuffix: user.urlSuffix,
			isAdmin: user.isAdmin,
			theme: user.theme,
			language: user.language
		};
	});
}

export async function createUser(input: {
	username: string;
	password: string;
	urlSuffix: string;
	isAdmin: boolean;
	theme: App.ThemeMode;
	language: App.Locale;
}) {
	const existingUser = findUserByUsername(input.username);
	if (existingUser) {
		return null;
	}

	const passwordHash = await argon2.hash(input.password, {
		type: argon2.argon2id
	});

	const nextUser: Data.StoredUser = {
		username: input.username,
		passwordHash,
		urlSuffix: input.urlSuffix,
		isAdmin: input.isAdmin,
		theme: input.theme,
		language: input.language
	};

	dataManager.saveUser(nextUser);
	msg.createMessageSettings(nextUser.username);
	txt.setTextForSuffix(nextUser.urlSuffix, 'This is your default text. You can change it by editing the text in the configuration page.');

	return toPublicUserProfile(nextUser);
}

export function deleteUser(username: string) {
	const existingUser = findUserByUsername(username);
	if (!existingUser) {
		return false;
	}

	dataManager.removeSessionsByUsername(existingUser.username);
	dataManager.removeSettingsByUsername(existingUser.username);
	dataManager.removeTextBySuffix(existingUser.urlSuffix);
	dataManager.deleteUser(existingUser.username);

	return true;
}

export async function updateUserSuffix(cookies: Cookies, suffix: string): Promise<App.UserProfile | null> {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return null;
	}

	const user = findUserByUsername(session.username);
	if (!user) {
		return null;
	}

	const previousSuffix = user.urlSuffix;
	const updatedUserInfo = {
		...user,
		urlSuffix: suffix
	};

	dataManager.saveUser(updatedUserInfo);
	txt.moveTextToSuffix(previousSuffix, suffix);

	return toPublicUserProfile(updatedUserInfo);
}

export async function updateUserProfile(
	cookies: Cookies,
	updates: { urlSuffix?: string; theme?: App.ThemeMode; language?: App.Locale }
): Promise<App.UserProfile | null> {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return null;
	}

	const user = findUserByUsername(session.username);
	if (!user) {
		return null;
	}

	const previousSuffix = user.urlSuffix;
	const updatedUserInfo = { ...user, ...updates };

	dataManager.saveUser(updatedUserInfo);

	if (updates.urlSuffix && updates.urlSuffix !== previousSuffix) {
		txt.moveTextToSuffix(previousSuffix, updates.urlSuffix);
	}

	return toPublicUserProfile(updatedUserInfo);
}

export async function updateUserPassword(cookies: Cookies, currentPassword: string, newPassword: string): Promise<boolean> {
	const session = await getSessionFromCookie(cookies);
	if (!session) {
		return false;
	}

	const user = findUserByUsername(session.username);
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

	dataManager.saveUser(updatedUserInfo);
	return true;
}

export async function clearSession(cookies: Cookies): Promise<void> {
	const token = cookies.get(userSessionCookieName);
	if (token) {
		const tokenHash = await hashToken(token);
		dataManager.removeSession(tokenHash);
	}

	cookies.delete(userSessionCookieName, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev
	});
}