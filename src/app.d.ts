// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface AdminUserProfile {
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
			user?: AdminUserProfile;
		}>;

		type AdminUserApiResponse = ApiResponse<{
			authenticated: boolean;
			user?: AdminUserProfile;
		}>;
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
