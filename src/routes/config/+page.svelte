<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import AppSidebar from "./config-sidebar.svelte";

	import UserSettings from "./tabs/user-settings.svelte";
	import ContentSettings from "./tabs/content-settings.svelte";
	import Preferences from "./tabs/preferences.svelte";

	type Props = {
		data: {
			authenticated: boolean;
			user?: App.UserProfile | null,
			messageSettings?: Data.StoredMessageSettings | null,
			content?: string | null;
		}
	};

	let { data }: Props = $props();

	let currentUser = $state<App.UserProfile | null>(null);
	let currentMessageSettings = $state<Data.StoredMessageSettings | null>(null);
	let currentContent = $state<string | null>(null);
	let currentTab = $state<App.SidebarTab>('message-settings');

	$effect(() => {
		if(!data.authenticated) {
			redirectToLogin();
			return;
		}

		currentUser = data.user ?? null;
		currentMessageSettings = data.messageSettings ?? null;
		currentContent = data.content ?? null;
	});

	function redirectToLogin() {
		window.location.href = '/login';
	}

	async function logout() {
		await fetch('/api/user/session', { method: 'DELETE' });
		redirectToLogin();
	}

	function getCurrentTabName() {
		switch (currentTab) {
			case 'message-settings': return 'Message settings';
			case 'user-settings': return 'User settings';
			case 'preferences': return 'Preferences';
			case 'manage-users': return 'Manage users';
			case 'statistics': return 'Statistics';
			case 'admin-settings': return 'Application settings';
			default: return '';
		}
	}
</script>

<Sidebar.Provider>
	{#if currentUser && currentMessageSettings}
		<AppSidebar
			user={currentUser}
			onTabChange={(tab) => currentTab = tab}
			onLogout={logout}
		/>

		<main class="w-full min-h-full flex flex-col">
			<div class="w-full h-10 pt-3 pb-1 px-3 flex flex-row items-center justify-start gap-2 bg-sidebar">
				<Sidebar.Trigger />
				<Sidebar.Separator orientation="vertical" decorative={true} />

				<p>
					<span>{getCurrentTabName()}</span>
				</p>
				<div class="grow"></div>
				<p>
					<span>Logged in as:</span>
					<span class="font-semibold">{currentUser.username}</span>
				</p>
			</div>

			<div class="w-full h-full p-2 bg-sidebar">
				<div class="w-full h-full rounded-md overflow-auto p-3 bg-background">
					{#if currentTab === 'message-settings'}
						<ContentSettings
							bind:currentUser={currentUser}
							bind:messageSettings={currentMessageSettings}
							bind:content={currentContent}
						/>
					{:else if currentTab === 'user-settings'}
						<UserSettings
							bind:currentUser={currentUser}
						/>
					{:else if currentTab === 'preferences'}
						<Preferences
							bind:currentUser={currentUser}
						/>
					{:else if currentTab === 'manage-users'}
						<form class="min-w-form space-y-3">
							<h2>Manage users</h2>
							<p>Nothing here yet.</p>
						</form>
					{/if}
				</div>
			</div>
		</main>
	{/if}
</Sidebar.Provider>

<svelte:head>
	<title>User configuration</title>
</svelte:head>