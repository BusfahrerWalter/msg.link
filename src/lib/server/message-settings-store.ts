import { dataManager } from '$lib/server/data/DataManager';

export const defaultSettings: Data.StoredMessageSettings = {
	type: 'text',
	color: '#000000',
	background: '#ffffff',
	fontSize: '16px',
	font: 'Arial, sans-serif'
} as const;

function sanitizeUsername(username: string) {
	const normalizedUsername = username.trim();
	if (normalizedUsername.length === 0) {
		throw new TypeError('Username must not be empty');
	}

	return normalizedUsername;
}

function sanitizeMessageType(type: unknown): Data.MessageType {
	if (type === 'text' || type === 'image' || type === 'markdown' || type === 'link') {
		return type;
	}

	return defaultSettings.type;
}

function sanitizeStringField(value: unknown, fallbackValue = '') {
	return typeof value === 'string' ? value : fallbackValue;
}

function sanitizeMessageSettings(settings: Data.StoredMessageSettings): Data.StoredMessageSettings {
	return {
		type: sanitizeMessageType(settings.type),
		color: sanitizeStringField(settings.color, defaultSettings.color),
		background: sanitizeStringField(settings.background, defaultSettings.background),
		fontSize: sanitizeStringField(settings.fontSize, defaultSettings.fontSize),
		font: sanitizeStringField(settings.font, defaultSettings.font)
	};
}

export function getMessageSettings(username: string): Data.StoredMessageSettings | null {
	return dataManager.loadSettings(sanitizeUsername(username));
}

export function setMessageSettings(username: string, settings: Data.StoredMessageSettings) {
	dataManager.saveSettings(sanitizeUsername(username), sanitizeMessageSettings(settings));
}

export function createMessageSettings(username: string): Data.StoredMessageSettings {
	const settings = { ...defaultSettings };
	setMessageSettings(username, settings);
	return settings;
}