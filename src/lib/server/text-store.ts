import { dataManager } from '$lib/server/data/DataManager';

const textMapStorageKey = 'content/text-map';

async function loadTextMap() {
	return dataManager.load<Record<string, string>>(textMapStorageKey, {});
}

export async function getTextForSuffix(urlSuffix: string) {
	const map = await loadTextMap();
	return map[urlSuffix] ?? '';
}

export async function setTextForSuffix(urlSuffix: string, text: string) {
	const map = await loadTextMap();

	map[urlSuffix] = text;
	await dataManager.save(textMapStorageKey, map);
}