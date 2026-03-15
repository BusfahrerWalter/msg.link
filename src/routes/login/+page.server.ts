import type { PageServerLoad } from './$types';
import * as auth from '$lib/server/admin-auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);
	return {
		authenticated: Boolean(user),
		user
	};
};