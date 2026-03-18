import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';
import {
	MAX_PASSWORD_LENGTH,
	MAX_USERNAME_LENGTH,
	MIN_PASSWORD_LENGTH,
	MIN_USERNAME_LENGTH
} from '$lib/public-env';

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

	if (!isUsernameString || trimmedUsername.length < MIN_USERNAME_LENGTH || trimmedUsername.length > MAX_USERNAME_LENGTH) {
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

	if (!isPasswordString || trimmedPassword.length < MIN_PASSWORD_LENGTH || trimmedPassword.length > MAX_PASSWORD_LENGTH) {
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