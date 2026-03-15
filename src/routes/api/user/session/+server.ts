import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/admin-auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const authenticated = await auth.hasAdminSession(cookies);
	const user = authenticated ? await auth.getAuthenticatedUser(cookies) : undefined;
	const payload: App.AuthApiResponse = {
		authenticated,
		user: user ?? undefined,
		message: authenticated ? 'Session is active' : 'No active session'
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
			message: 'Username is required',
			code: 'USERNAME_REQUIRED'
		};

		return json(payload, { status: 400 });
	}

	if (typeof password !== 'string' || password.length === 0) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			message: 'Password is required',
			code: 'PASSWORD_REQUIRED'
		};

		return json(payload, { status: 400 });
	}

	try {
		const user = await auth.verifyAdminCredentials(username, password);
		if (!user) {
			const payload: App.AuthApiResponse = {
				authenticated: false,
				message: 'Invalid username or password',
				code: 'INVALID_CREDENTIALS'
			};

			return json(payload, { status: 401 });
		}

		const expiresAt = await auth.createAdminSession(cookies, user.username);

		const payload: App.AuthApiResponse = {
			authenticated: true,
			expiresAt: expiresAt.toISOString(),
			user,
			message: 'Login successful'
		};

		return json(payload);
	} catch (error) {
		console.error('Failed to verify admin password', error);
		const payload: App.AuthApiResponse = {
			authenticated: false,
			message: 'Admin authentication is not configured correctly',
			code: 'AUTH_CONFIG_ERROR'
		};

		return json(payload, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	await auth.clearAdminSession(cookies);
	const payload: App.AuthApiResponse = {
		authenticated: false,
		message: 'Logged out'
	};

	return json(payload);
};