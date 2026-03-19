import { dataManager } from '$lib/server/data/DataManager';

const millisecondsPerDay = 24 * 60 * 60 * 1000;

function toIsoDay(date: Date) {
	return date.toISOString().slice(0, 10);
}

function getIsoDayDaysAgo(daysAgo: number) {
	const date = new Date(Date.now() - (daysAgo * millisecondsPerDay));
	return toIsoDay(date);
}

export function trackPageVisit(username: string) {
	dataManager.recordPageVisit(username, toIsoDay(new Date()));
}

export function getRecentPageVisits(username: string, daysBack: number) {
	const safeDaysBack = Number.isFinite(daysBack) ? Math.max(1, Math.floor(daysBack)) : 56;
	const sinceDay = getIsoDayDaysAgo(safeDaysBack - 1);

	return dataManager.loadRecentPageVisits(username, sinceDay);
}
