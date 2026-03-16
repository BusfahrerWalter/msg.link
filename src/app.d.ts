// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface UserProfile {
			username: string;
			urlSuffix: string;
		}

		type ApiResponse<TPayload extends object = object> = {
			code: string;
		} & TPayload;

		type TextApiResponse = ApiResponse<{
			text?: string | null;
		}>;

		type MessageSettingsApiResponse = ApiResponse<Partial<Data.StoredMessageSettings>>;

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

	namespace Data {
		interface StoredUser {
			username: string;
			passwordHash: string;
			urlSuffix: string;
		}

		interface StoredMessage {
			urlSuffix: string;
			text: string;
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

		type TableName = 'users' | 'sessions' | 'texts' | 'settings';
	}
}

export {};
