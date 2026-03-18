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
			title: 'Message settings',
			icon: MsgIcon,
			onClick: () => onTabChange?.('message-settings'),
		}, {
			title: 'User settings',
			icon: UserIcon,
			onClick: () => onTabChange?.('user-settings'),
		}, {
			title: 'Preferences',
			icon: SettingsIcon,
			onClick: () => onTabChange?.('preferences'),
		}, {
			title: 'Statistics',
			icon: StatsIcon,
			onClick: () => onTabChange?.('statistics'),
		}];

		adminItems = [{
			title: 'Manage users',
			icon: UsersIcon,
			onClick: () => onTabChange?.('manage-users'),
		}, {
			title: 'Application settings',
			icon: AppSettingsIcon,
			onClick: () => onTabChange?.('admin-settings'),
		}];

		bottomItems = [{
			title: 'Show my page',
			url: `/t/${user.urlSuffix || user.username}?preview=true`,
			icon: EyeIcon,
		}, {
			title: 'Logout',
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
						<Sidebar.MenuButton onclick={item.onClick}>
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
		{@render section(topItems, 'Message.link')}

		{#if user.isAdmin}
			{@render section(adminItems, 'Administrator')}
		{/if}

		<div class="grow"></div>

		{@render section(bottomItems)}
	</Sidebar.Content>
</Sidebar.Root>
