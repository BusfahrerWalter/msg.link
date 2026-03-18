import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';

const maxSuffixLength = Number(env.PUBLIC_MAX_SUFFIX_LENGTH ?? '20');

/**
 * Load an existing user
 */
export const GET: RequestHandler = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	const payload: App.UserApiResponse = {
		user,
		authenticated: true,
		code: 'USER_PROFILE_LOAD_SUCCESS',
		success: true
	};

	return json(payload);
};

/**
 * Update user profile (urlSuffix, theme, language)
 */
export const PATCH: RequestHandler = async ({ cookies, request }) => {
	const requestBody = await request.json().catch(() => null);
	const updates: {
		urlSuffix?: string;
		theme?: App.ThemeMode;
		language?: App.Locale;
	} = {};

	// validate urlSuffix if provided
	if (requestBody?.urlSuffix !== undefined) {
		const urlSuffix = requestBody.urlSuffix;
		const isString = typeof urlSuffix === 'string';
		const trimmedSuffix = isString ? urlSuffix.trim() : '';

		if (!isString || trimmedSuffix.length === 0 || trimmedSuffix.length > maxSuffixLength) {
			const payload: App.UserApiResponse = {
				authenticated: false,
				code: 'INVALID_URL_SUFFIX',
				success: false
			};

			return json(payload, { status: 400 });
		}

		const suffixInUse = auth.isSuffixInUse(trimmedSuffix);
		if (suffixInUse) {
			const payload: App.UserApiResponse = {
				authenticated: false,
				code: 'URL_SUFFIX_IN_USE',
				success: false
			};

			return json(payload, { status: 400 });
		}

		updates.urlSuffix = trimmedSuffix;
	}

	// validate theme if provided
	if (requestBody?.theme !== undefined) {
		const theme = requestBody.theme;
		const isString = typeof theme === 'string';
		const trimmedTheme = isString ? theme.trim() : '';

		if (!isString || (trimmedTheme !== 'light' && trimmedTheme !== 'dark' && trimmedTheme !== 'system')) {
			const payload: App.UserApiResponse = {
				authenticated: false,
				code: 'INVALID_THEME',
				success: false
			};

			return json(payload, { status: 400 });
		}

		updates.theme = trimmedTheme;
	}

	// validate language if provided
	if (requestBody?.language !== undefined) {
		const language = requestBody.language;
		const isString = typeof language === 'string';
		const trimmedLanguage = isString ? language.trim() : '';

		if (!isString || trimmedLanguage.length === 0) {
			const payload: App.UserApiResponse = {
				authenticated: false,
				code: 'INVALID_LANGUAGE',
				success: false
			};

			return json(payload, { status: 400 });
		}

		updates.language = trimmedLanguage as App.Locale;
	}

	if (Object.keys(updates).length === 0) {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'NO_UPDATES_PROVIDED',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// apply all validated updates
	const user = await auth.updateUserProfile(cookies, updates);
	if (!user) {
		const payload: App.UserApiResponse = {
			authenticated: false,
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	const payload: App.UserApiResponse = {
		user,
		authenticated: true,
		code: 'USER_PROFILE_UPDATE_SUCCESS',
		success: true
	};

	return json(payload);
};