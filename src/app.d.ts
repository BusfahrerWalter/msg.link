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

		type UserApiResponse = ApiResponse<{
			authenticated: boolean;
			user?: UserProfile;
		}>;

		type SidebarTab = 'message-settings' | 'user-settings' | 'general-settings' | 'manage-users';
	}

	namespace Server {
		interface StoredUser {
			username: string;
			passwordHash: string;
			urlSuffix: string;
		}

		type MessageType = 'text' | 'image' | 'markdown' | 'link';

		interface StoredMessageSettings {
			type: MessageType;
			content: string;
			color: string;
			background: string;
			fontSize: string;
			font: string;
		}

		interface StoredSession {
			tokenHash: string;
			username: string;
			expiresAt: string;
		}
	}
}

export {};
