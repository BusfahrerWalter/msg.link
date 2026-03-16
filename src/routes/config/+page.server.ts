import type { PageServerLoad } from './$types';
import * as auth from '@/server/user-auth';
import * as msg from '$lib/server/message-settings-store';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	const messageSettings = user ? await msg.getMessageSettings(user.username) : null;

	return {
		authenticated: Boolean(user),
		user,
		messageSettings
	};
};