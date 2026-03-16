import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';

export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.TextApiResponse = {
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const settings = await msg.getMessageSettings(user.username);
	const hasValidSettings = settings !== null;

	const payload: App.MessageSettingsApiResponse = {
		...(settings ?? {}),
		code: hasValidSettings ? 'MSG_SETTINGS_LOAD_SUCCESS' : 'MSG_SETTINGS_LOAD_ERROR'
	};

	return json(payload);
};

// export const POST: RequestHandler = async ({ cookies, request }) => {
// 	const user = await auth.getAuthenticatedUser(cookies);
// 	if (!user) {
// 		const payload: App.MessageSettingsApiResponse = {
// 			code: 'AUTH_REQUIRED'
// 		};

// 		return json(payload, { status: 401 });
// 	}
// };