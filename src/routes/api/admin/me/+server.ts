import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '$lib/server/admin-auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);

	if (!user) {
		const payload: App.AdminUserApiResponse = {
			authenticated: false,
			message: 'Unauthorized',
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const payload: App.AdminUserApiResponse = {
		authenticated: true,
		user,
		message: 'User profile loaded'
	};

	return json(payload);
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const urlSuffix = requestBody?.urlSuffix;

	if (typeof urlSuffix !== 'string') {
		const payload: App.AdminUserApiResponse = {
			authenticated: false,
			message: 'Field "urlSuffix" must be a string',
			code: 'INVALID_URL_SUFFIX'
		};

		return json(payload, { status: 400 });
	}

	const user = await auth.updateAuthenticatedUserInfo(cookies, { urlSuffix });
	if (!user) {
		const payload: App.AdminUserApiResponse = {
			authenticated: false,
			message: 'Unauthorized',
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const payload: App.AdminUserApiResponse = {
		authenticated: true,
		user,
		message: 'User profile updated'
	};

	return json(payload);
};