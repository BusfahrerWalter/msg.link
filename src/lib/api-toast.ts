import { toast } from 'svelte-sonner';

export type ApiPayload = Record<string, unknown> | null;
export type ApiToastVariant = 'success' | 'error' | 'none';
export type ApiToastEntry = {
	message: string;
	variant?: ApiToastVariant;
};
export type ApiToastMap = Record<string, ApiToastEntry>;

export async function readPayload(response: Response): Promise<ApiPayload> {
	return (await response.json().catch(() => null)) as ApiPayload;
}

export function getCode(payload: ApiPayload): string {
	return typeof payload?.code === 'string' ? payload.code : '';
}

export function resolveToast(code: string, map: ApiToastMap, fallbackMessage: string): Required<ApiToastEntry> {
	const entry = map[code];
	if (!entry) {
		return { message: fallbackMessage, variant: 'error' };
	}

	return {
		message: entry.message,
		variant: entry.variant ?? 'error'
	};
}

export function notifyToast(code: string, map: ApiToastMap, fallbackMessage: string) {
	notifyToastEntry(resolveToast(code, map, fallbackMessage));
}

export function notifyToastEntry(entry: ApiToastEntry) {
	if (!entry.message || entry.variant === 'none') {
		return;
	}

	if (entry.variant === 'success') {
		toast.success(entry.message);
		return;
	}

	toast.error(entry.message);
}