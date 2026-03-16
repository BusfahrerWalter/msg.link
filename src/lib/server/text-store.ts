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

export async function moveTextToSuffix(previousSuffix: string, nextSuffix: string) {
	if (previousSuffix === nextSuffix) {
		return;
	}

	const map = await loadTextMap();
	const currentText = map[previousSuffix];

	if (typeof currentText !== 'string') {
		return;
	}

	map[nextSuffix] = currentText;
	delete map[previousSuffix];

	await dataManager.save(textMapStorageKey, map);
}