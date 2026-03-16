import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const authenticated = await auth.hasSession(cookies);
	const user = authenticated ? await auth.getAuthenticatedUser(cookies) : undefined;
	const payload: App.AuthApiResponse = {
		authenticated,
		user: user ?? undefined,
		code: authenticated ? 'SESSION_ACTIVE' : 'NO_ACTIVE_SESSION'
	};

	return json(payload);
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const payload = await request.json().catch(() => null);
	const username = payload?.username;
	const password = payload?.password;

	if (typeof username !== 'string' || username.trim().length === 0) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'USERNAME_REQUIRED'
		};

		return json(payload, { status: 400 });
	}

	if (typeof password !== 'string' || password.length === 0) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'PASSWORD_REQUIRED'
		};

		return json(payload, { status: 400 });
	}

	try {
		const user = await auth.verifyCredentials(username, password);
		if (!user) {
			const payload: App.AuthApiResponse = {
				authenticated: false,
				code: 'INVALID_CREDENTIALS'
			};

			return json(payload, { status: 401 });
		}

		const expiresAt = await auth.createSession(cookies, user.username);

		const payload: App.AuthApiResponse = {
			authenticated: true,
			expiresAt: expiresAt.toISOString(),
			user,
			code: 'LOGIN_SUCCESS'
		};

		return json(payload);
	} catch (error) {
		console.error('Failed to verify admin password', error);
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'AUTH_CONFIG_ERROR'
		};

		return json(payload, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	await auth.clearSession(cookies);
	const payload: App.AuthApiResponse = {
		authenticated: false,
		code: 'LOGOUT_SUCCESS'
	};

	return json(payload);
};