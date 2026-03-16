import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

const minPasswordLength = 8;

export const POST: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const currentPassword = requestBody?.currentPassword;
	const newPassword = requestBody?.newPassword;

	if (typeof currentPassword !== 'string' || currentPassword.length === 0) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			message: 'Current password is required',
			code: 'CURRENT_PASSWORD_REQUIRED'
		};

		return json(payload, { status: 400 });
	}

	if (typeof newPassword !== 'string' || newPassword.length < minPasswordLength) {
		const payload: App.AuthApiResponse = {
			authenticated: false,
			message: `New password must be at least ${minPasswordLength} characters long`,
			code: 'NEW_PASSWORD_TOO_SHORT'
		};

		return json(payload, { status: 400 });
	}

	const passwordChanged = await auth.updateUserPassword(
		cookies,
		currentPassword,
		newPassword
	);

	if (!passwordChanged) {
		const hasSession = await auth.hasSession(cookies);
		const payload: App.AuthApiResponse = {
			authenticated: hasSession,
			message: hasSession ? 'Current password is incorrect' : 'Unauthorized',
			code: hasSession ? 'INVALID_CURRENT_PASSWORD' : 'AUTH_REQUIRED'
		};

		return json(payload, { status: hasSession ? 400 : 401 });
	}

	const user = await auth.getAuthenticatedUser(cookies);
	const payload: App.AuthApiResponse = {
		authenticated: true,
		user: user ?? undefined,
		message: 'Password changed successfully'
	};

	return json(payload);
};