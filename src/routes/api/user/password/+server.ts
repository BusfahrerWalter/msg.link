import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

const minPasswordLength = Number(env.PUBLIC_MIN_PASSWORD_LENGTH ?? '6');
const maxPasswordLength = Number(env.PUBLIC_MAX_PASSWORD_LENGTH ?? '50');

/**
 * Update user password
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const currentPassword = requestBody?.currentPassword;
	const newPassword = requestBody?.newPassword;

	// validate current password
	const isCurrPwString = typeof currentPassword === 'string';
	const trimmedCurrPw = isCurrPwString ? currentPassword.trim() : '';

	if (!isCurrPwString || trimmedCurrPw.length === 0) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'CURRENT_PASSWORD_REQUIRED',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// validate new password
	const isNewPwString = typeof newPassword === 'string';
	const trimmedNewPw = isNewPwString ? newPassword.trim() : '';

	if (!isNewPwString || trimmedNewPw.length < minPasswordLength || trimmedNewPw.length > maxPasswordLength) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'NEW_PASSWORD_INVALID_LENGTH',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// check if user is authenticated
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	// try to update password
	const passwordChanged = await auth.updateUserPassword(cookies, trimmedCurrPw, trimmedNewPw);
	if (!passwordChanged) {
		const payload: App.AuthApiResponse = {
			authenticated: true,
			code: 'INVALID_CURRENT_PASSWORD',
			success: false
		};

		return json(payload, { status: 400 });
	}

	const payload: App.AuthApiResponse = {
		user: user,
		authenticated: true,
		code: 'PASSWORD_CHANGE_SUCCESS',
		success: true
	};

	return json(payload);
};