import { env } from '$env/dynamic/public';

const DEFAULTS = {
	MIN_USERNAME_LENGTH: 2,
	MAX_USERNAME_LENGTH: 50,
	MIN_PASSWORD_LENGTH: 6,
	MAX_PASSWORD_LENGTH: 50,
	MAX_SUFFIX_LENGTH: 20,
	MAX_CONTENT_LENGTH: 280
} as const;

function readPositiveInteger(value: string | undefined, fallback: number) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return Math.floor(parsed);
}

export const MIN_USERNAME_LENGTH = readPositiveInteger(
	env.PUBLIC_MIN_USERNAME_LENGTH,
	DEFAULTS.MIN_USERNAME_LENGTH
);

export const MAX_USERNAME_LENGTH = readPositiveInteger(
	env.PUBLIC_MAX_USERNAME_LENGTH,
	DEFAULTS.MAX_USERNAME_LENGTH
);

export const MIN_PASSWORD_LENGTH = readPositiveInteger(
	env.PUBLIC_MIN_PASSWORD_LENGTH,
	DEFAULTS.MIN_PASSWORD_LENGTH
);

export const MAX_PASSWORD_LENGTH = readPositiveInteger(
	env.PUBLIC_MAX_PASSWORD_LENGTH,
	DEFAULTS.MAX_PASSWORD_LENGTH
);

export const MAX_SUFFIX_LENGTH = readPositiveInteger(
	env.PUBLIC_MAX_SUFFIX_LENGTH,
	DEFAULTS.MAX_SUFFIX_LENGTH
);

export const MAX_CONTENT_LENGTH = readPositiveInteger(
	env.PUBLIC_MAX_CONTENT_LENGTH,
	DEFAULTS.MAX_CONTENT_LENGTH
);