<script lang="ts">
	import MsgIcon from '@lucide/svelte/icons/message-square-heart';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import LogoutIcon from '@lucide/svelte/icons/log-out';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import UserIcon from '@lucide/svelte/icons/user';
	import UsersIcon from '@lucide/svelte/icons/users';
	import StatsIcon from '@lucide/svelte/icons/chart-column';
	import AppSettingsIcon from '@lucide/svelte/icons/settings-2';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as m from '$lib/paraglide/messages';

	type Props = {
		user: App.UserProfile;
		onTabChange?: (tab: App.SidebarTab) => void;
		onLogout?: () => void;
	};

	const { user, onTabChange, onLogout }: Props = $props();

	let topItems = $state<any[]>([]);
	let adminItems = $state<any[]>([]);
	let bottomItems = $state<any[]>([]);

	$effect(() => {
		topItems = [{
			title: m.sidebar_message_settings(),
			icon: MsgIcon,
			onClick: () => onTabChange?.('message-settings'),
		}, {
			title: m.sidebar_user_settings(),
			icon: UserIcon,
			onClick: () => onTabChange?.('user-settings'),
		}, {
			title: m.sidebar_preferences(),
			icon: SettingsIcon,
			onClick: () => onTabChange?.('preferences'),
		}, {
			title: m.sidebar_statistics(),
			icon: StatsIcon,
			onClick: () => onTabChange?.('statistics'),
		}];

		adminItems = [{
			title: m.config_manage_users(),
			icon: UsersIcon,
			onClick: () => onTabChange?.('manage-users'),
		}, {
			title: m.config_application_settings(),
			icon: AppSettingsIcon,
			onClick: () => onTabChange?.('admin-settings'),
		}];

		bottomItems = [{
			title: m.sidebar_show_my_page(),
			url: `/t/${user.urlSuffix || user.username}?preview=true`,
			icon: EyeIcon,
		}, {
			title: m.common_logout(),
			icon: LogoutIcon,
			onClick: onLogout,
		}];
	});
</script>

{#snippet section(items: any[], title?: string)}
	<Sidebar.Group>
		{#if title}
			<Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
		{/if}
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#each items as item (item.title)}
					<Sidebar.MenuItem>
						<Sidebar.MenuButton onclick={item.onClick} tooltipContent={item.title}>
							{#snippet child({ props })}
								<a href={item.url} {...props}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				{/each}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
{/snippet}

<Sidebar.Root>
	<Sidebar.Content>
		{@render section(topItems, m.app_title())}

		{#if user.isAdmin}
			{@render section(adminItems, m.sidebar_administrator())}
		{/if}

		<div class="grow"></div>

		{@render section(bottomItems)}
	</Sidebar.Content>
</Sidebar.Root>
