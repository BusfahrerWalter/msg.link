import type { PageServerLoad } from './$types';
import { loadConfigData } from '../config-data';
import { resolveConfigTab } from '../config-tabs';

export const load: PageServerLoad = async ({ cookies, params }) => {
	return {
		...(await loadConfigData(cookies)),
		selectedTab: resolveConfigTab(params.tab)
	};
};
