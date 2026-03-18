import type { LayoutServerLoad } from './$types';
import * as auth from '@/server/user-auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const user = await auth.getAuthenticatedUser(cookies);

	return {
		user
	};
};