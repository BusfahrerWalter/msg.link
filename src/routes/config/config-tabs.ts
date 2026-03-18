import * as m from '$lib/paraglide/messages';

const configTabs = [
	'message-settings',
	'user-settings',
	'preferences',
	'manage-users',
	'statistics',
	'admin-settings'
] as const;

export function resolveConfigTab(tab: string | undefined): App.SidebarTab {
	if (tab && configTabs.includes(tab as App.SidebarTab)) {
		return tab as App.SidebarTab;
	}

	return 'message-settings';
}

export function getConfigTabPath(tab: App.SidebarTab): string {
	return `/config/${tab}`;
}

export function getConfigTabLabel(tab: App.SidebarTab): string {
	switch (tab) {
		case 'message-settings': return m.sidebar_message_settings();
		case 'user-settings': return m.sidebar_user_settings();
		case 'preferences': return m.sidebar_preferences();
		case 'manage-users': return m.config_manage_users();
		case 'statistics': return m.sidebar_statistics();
		case 'admin-settings': return m.config_application_settings();
		default: return '';
	}
}