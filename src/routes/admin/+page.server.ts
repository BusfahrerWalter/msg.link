import type { PageServerLoad } from './$types';
import { getAuthenticatedUser } from '$lib/server/admin-auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const user = await getAuthenticatedUser(cookies);

	return {
		authenticated: Boolean(user),
		user
	};
};