import type { PageServerLoad } from './$types';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';
import * as txt from '$lib/server/text-store';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);

	const content = user ? txt.getTextForSuffix(user.urlSuffix) : null;
	const messageSettings = user ? msg.getMessageSettings(user.username) : null;

	return {
		authenticated: Boolean(user),
		user,
		messageSettings,
		content
	};
};