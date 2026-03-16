import { dataManager } from '$lib/server/data/DataManager';

const messageSettingsStorageKey = 'content/message-settings-map';

const defaultSettings: Server.StoredMessageSettings = {
	type: 'text',
	content: '',
	color: '#000000',
	background: '#ffffff',
	fontSize: '16px',
	font: 'Arial, sans-serif'
};

function sanitizeUsername(username: string) {
	const normalizedUsername = username.trim();
	if (normalizedUsername.length === 0) {
		throw new TypeError('Username must not be empty');
	}

	return normalizedUsername;
}

function sanitizeMessageType(type: unknown): Server.MessageType {
	if (type === 'text' || type === 'image' || type === 'markdown' || type === 'link') {
		return type;
	}

	return 'text';
}

function sanitizeStringField(value: unknown, fallbackValue = '') {
	return typeof value === 'string' ? value : fallbackValue;
}

function sanitizeMessageSettings(settings: Server.StoredMessageSettings): Server.StoredMessageSettings {
	return {
		type: sanitizeMessageType(settings.type),
		content: sanitizeStringField(settings.content, defaultSettings.content),
		color: sanitizeStringField(settings.color, defaultSettings.color),
		background: sanitizeStringField(settings.background, defaultSettings.background),
		fontSize: sanitizeStringField(settings.fontSize, defaultSettings.fontSize),
		font: sanitizeStringField(settings.font, defaultSettings.font)
	};
}

async function loadMessageSettingsMap() {
	return dataManager.load<Record<string, Server.StoredMessageSettings>>(messageSettingsStorageKey, {});
}

export async function getMessageSettings(username: string): Promise<Server.StoredMessageSettings | null> {
	const normalizedUsername = sanitizeUsername(username);
	const messageSettingsMap = await loadMessageSettingsMap();
	const settings = messageSettingsMap[normalizedUsername];

	if (!settings) {
		return null;
	}

	return sanitizeMessageSettings(settings);
}

export async function setMessageSettings(username: string, settings: Server.StoredMessageSettings) {
	const normalizedUsername = sanitizeUsername(username);
	const messageSettingsMap = await loadMessageSettingsMap();

	messageSettingsMap[normalizedUsername] = sanitizeMessageSettings(settings);
	await dataManager.save(messageSettingsStorageKey, messageSettingsMap);
}

export async function createMessageSettings(username: string) {
	await setMessageSettings(username, { ...defaultSettings });
}