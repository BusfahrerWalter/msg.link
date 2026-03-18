import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as auth from '@/server/user-auth';
import * as txt from '$lib/server/text-store';
import { MAX_CONTENT_LENGTH, MAX_SUFFIX_LENGTH } from '$lib/public-env';

/**
 * Load text content for a given URL suffix
 */
export const GET: RequestHandler = async ({ url }) => {
	const suffix = url.searchParams.get('suffix') ?? '';

	// validate suffix
	const isSuffixString = typeof suffix === 'string';
	const trimmedSuffix = suffix.trim();

	if (!isSuffixString || trimmedSuffix.length === 0 || trimmedSuffix.length > MAX_SUFFIX_LENGTH) {
		const payload: App.TextApiResponse = {
			code: 'INVALID_SUFFIX',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// load content for suffix
	const content = txt.getTextForSuffix(trimmedSuffix);

	const isContentString = typeof content === 'string';
	const trimmedContent = isContentString ? content.trim() : '';
	const hasValidContent = isContentString && trimmedContent.length > 0;

	const payload: App.TextApiResponse = {
		text: trimmedContent,
		code: hasValidContent ? 'CONTENT_LOAD_SUCCESS' : 'CONTENT_NOT_FOUND',
		success: hasValidContent
	};

	return json(payload, { status: hasValidContent ? 200 : 404 });
};

/**
 * Update text content for the authenticated user's URL suffix
 */
export const POST: RequestHandler = async ({ cookies, request }) => {
	// check if user is authenticated
	const user = await auth.getAuthenticatedUser(cookies);
	if (!user) {
		const payload: App.TextApiResponse = {
			code: 'AUTH_REQUIRED',
			success: false
		};

		return json(payload, { status: 401 });
	}

	const requestBody = await request.json().catch(() => null);
	const text = requestBody?.text;

	// validate text
	const isTextString = typeof text === 'string';
	const trimmedText = isTextString ? text.trim() : '';

	if (!isTextString || trimmedText.length === 0 || trimmedText.length > MAX_CONTENT_LENGTH) {
		const payload: App.TextApiResponse = {
			code: 'INVALID_TEXT_LENGTH',
			success: false
		};

		return json(payload, { status: 400 });
	}

	// update text for user's suffix
	txt.setTextForSuffix(user.urlSuffix, trimmedText);

	const payload: App.TextApiResponse = {
		text: trimmedText,
		code: 'TEXT_UPDATE_SUCCESS',
		success: true
	};

	return json(payload);
};