import { dataManager } from '$lib/server/data/DataManager';

export function getTextForSuffix(urlSuffix: string) {
	return dataManager.loadText(urlSuffix);
}

export function setTextForSuffix(urlSuffix: string, text: string) {
	dataManager.saveText(urlSuffix, text);
}

export async function moveTextToSuffix(previousSuffix: string, nextSuffix: string) {
	if (previousSuffix === nextSuffix) {
		return;
	}

	dataManager.updateSuffix(previousSuffix, nextSuffix);
}