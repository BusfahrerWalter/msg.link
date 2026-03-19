import type { PageServerLoad } from './$types';
import { loadConfigData } from './config-data';

export const load: PageServerLoad = async ({ cookies }) => {
	return {
		...(await loadConfigData(cookies, { includeStatistics: false })),
		selectedTab: 'message-settings' as const
	};
};