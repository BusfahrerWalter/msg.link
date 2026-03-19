import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/user-auth';
import * as stats from '$lib/server/statistics-store';

export const load: PageServerLoad = async ({ fetch, params, url }) => {
	const suffix = encodeURIComponent(params.suffix);

	const textResponse = await fetch(`/api/text?suffix=${suffix}`);
	const settingsResponse = await fetch(`/api/settings/public/${suffix}`);

	const textPayload: App.TextApiResponse = await textResponse.json().catch(() => null);
	const settingsPayload: App.MessageSettingsApiResponse = await settingsResponse.json().catch(() => null);

	if (!textPayload || !textPayload.success || !settingsPayload || !settingsPayload.success) {
		throw error(404);
	}

	const isPreview = url.searchParams.get('preview') === 'true';
	if (!isPreview) {
		const user = auth.findUserBySuffix(params.suffix);
		if (user?.username) {
			stats.trackPageVisit(user.username);
		}
	}

	return {
		text: textPayload.text,
		settings: settingsPayload.settings,
		suffix: params.suffix
	};
};
