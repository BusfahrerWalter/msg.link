import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);

	if (!user) {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const payload: App.UserApiResponse = {
		authenticated: true,
		user,
		code: 'USER_PROFILE_LOAD_SUCCESS'
	};

	return json(payload);
};

export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const urlSuffix = requestBody?.urlSuffix;

	if (typeof urlSuffix !== 'string') {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'INVALID_URL_SUFFIX'
		};

		return json(payload, { status: 400 });
	}

	const user = await auth.updateUserSuffix(cookies, urlSuffix);
	if (!user) {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const payload: App.UserApiResponse = {
		authenticated: true,
		user,
		code: 'USER_PROFILE_UPDATE_SUCCESS'
	};

	return json(payload);
};