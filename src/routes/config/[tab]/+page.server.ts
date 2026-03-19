import type { PageServerLoad } from './$types';
import { loadConfigData } from '../config-data';
import { resolveConfigTab } from '../config-tabs';

export const load: PageServerLoad = async ({ cookies, params }) => {
	const selectedTab = resolveConfigTab(params.tab);

	return {
		...(await loadConfigData(cookies, { includeStatistics: selectedTab === 'statistics' })),
		selectedTab
	};
};
