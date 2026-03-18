import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../../$types';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';

/**
 * Load message settings for any url suffix (public endpoint)
 */
export const GET: RequestHandler = async ({ url }) => {
	const suffix = url.pathname.split('/').at(-1);
	if (!suffix) {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'SUFFIX_NOT_FOUND',
			success: false
		};

		return json(payload, { status: 404 });
	}

	const user = auth.findUserBySuffix(suffix);
	if (!user) {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'SUFFIX_NOT_FOUND',
			success: false
		};

		return json(payload, { status: 404 });
	}

	const settings = msg.getMessageSettings(user.username);
	if (!settings) {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'SUFFIX_NOT_FOUND',
			success: false
		};

		return json(payload, { status: 404 });
	}

	const payload: App.MessageSettingsApiResponse = {
		settings: settings ?? {},
		code: 'MSG_SETTINGS_LOAD_SUCCESS',
		success: true
	};

	return json(payload);
};
