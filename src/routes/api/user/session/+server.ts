import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

const minUsernameLength = Number(env.PUBLIC_MIN_USERNAME_LENGTH ?? '2');
const maxUsernameLength = Number(env.PUBLIC_MAX_USERNAME_LENGTH ?? '50');
const minPasswordLength = Number(env.PUBLIC_MIN_PASSWORD_LENGTH ?? '6');
const maxPasswordLength = Number(env.PUBLIC_MAX_PASSWORD_LENGTH ?? '50');

/**
 * Check if user session is active and return user info if authenticated
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	const authenticated = !!user;

	const payload: App.AuthApiResponse = {
		authenticated,
		user: user ?? undefined,
		code: authenticated ? 'SESSION_ACTIVE' : 'NO_ACTIVE_SESSION',
		success: authenticated
	};

	return json(payload, { status: authenticated ? 200 : 401 });
};

/**
 * Authenticate user and create new session
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const username = requestBody?.username;
	const password = requestBody?.password;

	// validate username
	const isUsernameString = typeof username === 'string';
	const trimmedUsername = isUsernameString ? username.trim() : '';

	if (!isUsernameString || trimmedUsername.length < minUsernameLength || trimmedUsername.length > maxUsernameLength) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'INVALID_USERNAME',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// validate password
	const isPasswordString = typeof password === 'string';
	const trimmedPassword = isPasswordString ? password.trim() : '';

	if (!isPasswordString || trimmedPassword.length < minPasswordLength || trimmedPassword.length > maxPasswordLength) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'INVALID_PASSWORD',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// verify credentials
	const user = await auth.verifyCredentials(trimmedUsername, trimmedPassword);
	if (!user) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'INVALID_CREDENTIALS',
			success: false
		};

		return json(payload, { status: 401 });
	}

	// create session and return user info
	const expiresAt = await auth.createSession(cookies, user.username);
	const payload: App.AuthApiResponse = {
		user,
		authenticated: true,
		expiresAt: expiresAt.toISOString(),
		code: 'LOGIN_SUCCESS',
		success: true
	};

	return json(payload);
};

/**
 * Clear user session and log out
 */
export const DELETE: RequestHandler = async ({ cookies }) => {
	await auth.clearSession(cookies);
	const payload: App.AuthApiResponse = {
		authenticated: false,
		code: 'LOGOUT_SUCCESS',
		success: true
	};

	return json(payload);
};