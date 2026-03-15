import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/text?suffix=${encodeURIComponent(params.suffix)}`);
	const payload: App.TextApiResponse = await response.json().catch(() => null);

	if (!payload || !payload.text) {
		throw error(404);
	}

	return {
		...payload,
		suffix: params.suffix
	};
};
