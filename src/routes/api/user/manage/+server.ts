import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

const minUsernameLength = Number(env.PUBLIC_MIN_USERNAME_LENGTH ?? '2');
const maxUsernameLength = Number(env.PUBLIC_MAX_USERNAME_LENGTH ?? '50');
const minPasswordLength = Number(env.PUBLIC_MIN_PASSWORD_LENGTH ?? '6');
const maxPasswordLength = Number(env.PUBLIC_MAX_PASSWORD_LENGTH ?? '50');
const maxSuffixLength = Number(env.PUBLIC_MAX_SUFFIX_LENGTH ?? '20');

async function getAdminUser(cookies: Parameters<RequestHandler>[0]['cookies']) {
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.ApiResponse = {
			code: 'AUTH_REQUIRED',
			success: false
		};

		return {
			user: null,
			response: json(payload, { status: 401 })
		};
	}

	if (!user.isAdmin) {
		const payload: App.ApiResponse = {
			code: 'ADMIN_REQUIRED',
			success: false
		};

		return {
			user: null,
			response: json(payload, { status: 403 })
		};
	}

	return {
		user,
		response: null
	};
}

export const GET: RequestHandler = async ({ cookies }) => {
	const adminCheck = await getAdminUser(cookies);
	if (adminCheck.response) {
		return adminCheck.response;
	}

	const users = auth.listUsers();
	const payload: App.ApiResponse<{ users: App.UserProfile[] }> = {
		users,
		code: 'USERS_LOAD_SUCCESS',
		success: true
	};

	return json(payload);
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const adminCheck = await getAdminUser(cookies);
	if (adminCheck.response) {
		return adminCheck.response;
	}

	const requestBody = await request.json().catch(() => null);

	const username = typeof requestBody?.username === 'string' ? requestBody.username.trim() : '';
	const password = typeof requestBody?.password === 'string' ? requestBody.password.trim() : '';
	const urlSuffixValue = typeof requestBody?.urlSuffix === 'string' ? requestBody.urlSuffix.trim() : '';
	const urlSuffix = urlSuffixValue || username;

	if (username.length < minUsernameLength || username.length > maxUsernameLength) {
		const payload: App.ApiResponse = {
			code: 'INVALID_USERNAME',
			success: false
		};

		return json(payload, { status: 400 });
	}

	if (password.length < minPasswordLength || password.length > maxPasswordLength) {
		const payload: App.ApiResponse = {
			code: 'INVALID_PASSWORD',
			success: false
		};

		return json(payload, { status: 400 });
	}

	if (urlSuffix.length === 0 || urlSuffix.length > maxSuffixLength) {
		const payload: App.ApiResponse = {
			code: 'INVALID_URL_SUFFIX',
			success: false
		};

		return json(payload, { status: 400 });
	}

	if (auth.isSuffixInUse(urlSuffix)) {
		const payload: App.ApiResponse = {
			code: 'URL_SUFFIX_IN_USE',
			success: false
		};

		return json(payload, { status: 409 });
	}

	const createdUser = await auth.createUser({
		username,
		password,
		urlSuffix,
		isAdmin: false,
		theme: 'light',
		language: 'en'
	});

	if (!createdUser) {
		const payload: App.ApiResponse = {
			code: 'USERNAME_IN_USE',
			success: false
		};

		return json(payload, { status: 409 });
	}

	const payload: App.ApiResponse<{ user: App.UserProfile }> = {
		user: createdUser,
		code: 'USER_CREATE_SUCCESS',
		success: true
	};

	return json(payload, { status: 201 });
};

export const DELETE: RequestHandler = async ({ cookies, request }) => {
	const adminCheck = await getAdminUser(cookies);
	if (adminCheck.response) {
		return adminCheck.response;
	}

	const requestBody = await request.json().catch(() => null);
	const username = typeof requestBody?.username === 'string' ? requestBody.username.trim() : '';

	if (username.length < minUsernameLength || username.length > maxUsernameLength) {
		const payload: App.ApiResponse = {
			code: 'INVALID_USERNAME',
			success: false
		};

		return json(payload, { status: 400 });
	}

	const userDeleted = auth.deleteUser(username);
	if (!userDeleted) {
		const payload: App.ApiResponse = {
			code: 'USER_NOT_FOUND',
			success: false
		};

		return json(payload, { status: 404 });
	}

	const payload: App.ApiResponse = {
		code: 'USER_DELETE_SUCCESS',
		success: true
	};

	return json(payload);
};
