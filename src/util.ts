export function toMode(theme: string | undefined): App.ThemeMode {
	if (theme === 'dark' || theme === 'system') {
		return theme;
	}

	return 'light';
}