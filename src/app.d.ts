// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface UserProfile {
			username: string;
			urlSuffix: string;
		}

		type ApiResponse<TPayload extends object = object> = {
			message: string;
			code?: string;
		} & TPayload;

		type TextApiResponse = ApiResponse<{
			text?: string;
		}>;

		type AuthApiResponse = ApiResponse<{
			authenticated: boolean;
			expiresAt?: string;
			user?: UserProfile;
		}>;

		type AdminUserApiResponse = ApiResponse<{
			authenticated: boolean;
			user?: UserProfile;
		}>;

		type SidebarTab = 'message-settings' | 'user-settings' | 'general-settings' | 'manage-users';
	}

	namespace Server {
		interface StoredAdminUser {
			username: string;
			passwordHash: string;
			urlSuffix: string;
		}

		interface StoredSession {
			tokenHash: string;
			username: string;
			expiresAt: string;
		}
	}
}

export {};
