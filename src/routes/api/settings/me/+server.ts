import { json } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';

/**
 * Load message settings for the authenticated user
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	const settings = msg.getMessageSettings(user.username);
	const hasValidSettings = settings !== null;

	const payload: App.MessageSettingsApiResponse = {
		settings: settings ?? {},
		code: hasValidSettings ? 'MSG_SETTINGS_LOAD_SUCCESS' : 'MSG_SETTINGS_LOAD_ERROR',
		success: hasValidSettings
	};

	return json(payload);
};

/**
 * Update message settings for the authenticated user
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	const requestBody = await request.json().catch(() => null);
	const settings = requestBody as Partial<Data.StoredMessageSettings> | null;

	// validate that we have required fields
	if (!settings || typeof settings !== 'object') {
		const payload: App.MessageSettingsApiResponse = {
			settings: {},
			code: 'INVALID_MESSAGE_SETTINGS',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// merge with existing settings to ensure required fields are present
	const existingSettings = msg.getMessageSettings(user.username);
	const mergedSettings: Data.StoredMessageSettings = {
		type: (settings.type as Data.MessageType) || existingSettings?.type || msg.defaultSettings.type,
		color: typeof settings.color === 'string' ? settings.color : (existingSettings?.color || msg.defaultSettings.color),
		background: typeof settings.background === 'string' ? settings.background : (existingSettings?.background || msg.defaultSettings.background),
		fontSize: typeof settings.fontSize === 'string' ? settings.fontSize : (existingSettings?.fontSize || msg.defaultSettings.fontSize),
		font: typeof settings.font === 'string' ? settings.font : (existingSettings?.font || msg.defaultSettings.font)
	};

	// update settings
	msg.setMessageSettings(user.username, mergedSettings);

	const payload: App.MessageSettingsApiResponse = {
		settings: mergedSettings,
		code: 'MSG_SETTINGS_UPDATE_SUCCESS',
		success: true
	};

	return json(payload);
};