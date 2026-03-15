<script lang="ts">
	import MsgIcon from "@lucide/svelte/icons/message-square-heart";
	import EyeIcon from "@lucide/svelte/icons/eye";
	import LogoutIcon from "@lucide/svelte/icons/log-out";
	import SettingsIcon from "@lucide/svelte/icons/settings";
	import UserIcon from "@lucide/svelte/icons/user";
	import UsersIcon from "@lucide/svelte/icons/users";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";

	type Props = {
		user: App.UserProfile,
		onTabChange?: (tab: App.SidebarTab) => void,
		onLogout?: () => void
	};

	const {
		user,
		onTabChange,
		onLogout
	}: Props = $props();

	let topItems = $state<any[]>([]);
	let adminItems = $state<any[]>([]);
	let bottomItems = $state<any[]>([]);

	$effect(() => {
		topItems = [{
			title: "Message settings",
			icon: MsgIcon,
			onClick: () => onTabChange?.('message-settings')
		}, {
			title: "User settings",
			icon: UserIcon,
			onClick: () => onTabChange?.('user-settings')
		}, {
			title: "General settings",
			icon: SettingsIcon,
			onClick: () => onTabChange?.('general-settings')
		}];

		adminItems = [{
			title: "Manage users",
			icon: UsersIcon,
			onClick: () => onTabChange?.('manage-users')
		}];

		bottomItems = [{
			title: "Show my page",
			url: `/t/${user.urlSuffix || user.username}?preview=true`,
			icon: EyeIcon
		}, {
			title: "Logout",
			icon: LogoutIcon,
			onClick: onLogout
		}];
	});
</script>

<Sidebar.Root>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Message.link</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each topItems as item (item.title)}
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

					{#if true}
						<Sidebar.Separator />
						{#each adminItems as item (item.title)}
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
					{/if}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<div class="grow"></div>

		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each bottomItems as item (item.title)}
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
	</Sidebar.Content>
</Sidebar.Root>
