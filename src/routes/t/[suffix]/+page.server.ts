import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const suffix = encodeURIComponent(params.suffix);

	const textResponse = await fetch(`/api/text?suffix=${suffix}`);
	const settingsResponse = await fetch(`/api/settings/public/${suffix}`);

	const textPayload: App.TextApiResponse = await textResponse.json().catch(() => null);
	const settingsPayload: App.MessageSettingsApiResponse = await settingsResponse.json().catch(() => null);

	if (!textPayload || !textPayload.success || !settingsPayload || !settingsPayload.success) {
		throw error(404);
	}

	return {
		text: textPayload.text,
		settings: settingsPayload.settings,
		suffix: params.suffix
	};
};
