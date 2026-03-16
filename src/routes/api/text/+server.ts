import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import * as auth from '@/server/user-auth';
import * as txt from '$lib/server/text-store';

const defaultTextMaxLength = 280;

function getTextMaxLength() {
	const configuredMaxLength = Number(env.MAX_CONTENT_LENGTH ?? defaultTextMaxLength);
	if (!Number.isInteger(configuredMaxLength) || configuredMaxLength <= 0) {
		return defaultTextMaxLength;
	}

	return configuredMaxLength;
}

export const GET: RequestHandler = async ({ url }) => {
	const suffix = url.searchParams.get('suffix') ?? '';
	const text = await txt.getTextForSuffix(suffix);
	const hasValidText = typeof text === 'string' && text.trim().length > 0;

	const payload: App.TextApiResponse = {
		text,
		code: hasValidText ? 'TEXT_LOAD_SUCCESS' : 'TEXT_LOAD_ERROR'
	};

	return json(payload);
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const textMaxLength = getTextMaxLength();

	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.TextApiResponse = {
			code: 'AUTH_REQUIRED'
		};

		return json(payload, { status: 401 });
	}

	const requestBody = await request.json().catch(() => null);
	const text = requestBody?.text;

	if (typeof text !== 'string') {
		const payload: App.TextApiResponse = {
			code: 'INVALID_TEXT_TYPE'
		};

		return json(payload, { status: 400 });
	}

	const trimmedText = text.trim();

	if (trimmedText.length === 0) {
		const payload: App.TextApiResponse = {
			code: 'EMPTY_TEXT'
		};

		return json(payload, { status: 400 });
	}

	if (trimmedText.length > textMaxLength) {
		const payload: App.TextApiResponse = {
			code: 'TEXT_TOO_LONG'
		};

		return json(payload, { status: 400 });
	}

	await txt.setTextForSuffix(user.urlSuffix, trimmedText);

	const payload: App.TextApiResponse = {
		text: await txt.getTextForSuffix(user.urlSuffix),
		code: 'TEXT_UPDATE_SUCCESS'
	};

	return json(payload);
};