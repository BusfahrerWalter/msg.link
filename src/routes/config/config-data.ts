import type { Cookies } from '@sveltejs/kit';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';
import * as txt from '$lib/server/text-store';
import * as stats from '$lib/server/statistics-store';

type LoadConfigDataOptions = {
	includeStatistics?: boolean;
};

export async function loadConfigData(cookies: Cookies, options: LoadConfigDataOptions = {}) {
	const { includeStatistics = false } = options;
	const user = await auth.getAuthenticatedUser(cookies);

	const content = user ? txt.getTextForSuffix(user.urlSuffix) : null;
	const messageSettings = user ? msg.getMessageSettings(user.username) : null;
	const statistics = user && includeStatistics ? stats.getRecentPageVisits(user.username, 56) : [];

	return {
		authenticated: Boolean(user),
		user,
		messageSettings,
		content,
		statistics
	};
}
