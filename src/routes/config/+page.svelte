<script lang="ts">
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import Label from "@/components/ui/label/label.svelte";
	import AppSidebar from "./config-sidebar.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";

	type Props = {
		data: {
			authenticated: boolean;
			user?: App.UserProfile | null
		}
	};

	let { data }: Props = $props();

	let username = $state('');
	let password = $state('');
	let nextText = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let urlSuffix = $state('');
	let message = $state('');
	let currentUser = $state<App.UserProfile | null>(null);

	let currentTab = $state<App.SidebarTab>('message-settings');

	$effect(() => {
		if(!data.authenticated) {
			redirectToLogin();
			return;
		}

		currentUser = data.user ?? null;
		username = data.user?.username ?? username;
		urlSuffix = data.user?.urlSuffix ?? '';
		clearMessage();
	});

	function redirectToLogin() {
		window.location.href = '/login';
	}

	async function readPayload(response: Response) {
		return (await response.json().catch(() => null)) as Record<string, unknown> | null;
	}

	async function readMessage(response: Response) {
		const payload = await readPayload(response);
		if (payload && typeof payload.message === 'string') {
			return payload.message;
		}

		return 'Request failed';
	}

	function clearMessage() {
		message = '\u200B'; // zero-width space to prevent layout shift
	}

	async function saveText(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/text', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: nextText })
		});

		message = await readMessage(response);
		if (!response.ok) {
			if (response.status === 401) {
				currentUser = null;
			}
			return;
		}

		nextText = '';
	}

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/user/me', {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ urlSuffix })
		});

		const payload = await readPayload(response);
		message = typeof payload?.message === 'string' ? payload.message : 'Request failed';
		if (!response.ok) {
			if (response.status === 401) {
				currentUser = null;
			}
			return;
		}

		currentUser = (payload?.user as App.UserProfile | undefined) ?? currentUser;
		urlSuffix = currentUser?.urlSuffix ?? urlSuffix;
	}

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/user/password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ currentPassword, newPassword })
		});

		message = await readMessage(response);
		if (!response.ok) {
			if (response.status === 401) {
				currentUser = null;
			}
			return;
		}

		currentPassword = '';
		newPassword = '';
	}

	async function logout() {
		await fetch('/api/user/session', { method: 'DELETE' });
		redirectToLogin();
	}

	function getCurrentTabName() {
		switch (currentTab) {
			case 'message-settings': return 'Message settings';
			case 'user-settings': return 'User settings';
			case 'general-settings': return 'General settings';
			case 'manage-users': return 'Manage users';
			default: return '';
		}
	}
</script>

<Sidebar.Provider>
	{#if currentUser}
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
						<form class="min-w-form space-y-3" onsubmit={saveText}>
							<h2>Update text</h2>
							<Label>
								<span>New text</span>
								<Input type="text" bind:value={nextText} maxlength={280} required />
							</Label>
							<Button type="submit">Apply</Button>
						</form>
					{:else if currentTab === 'user-settings'}
						<form class="min-w-form space-y-3 mb-5" onsubmit={saveProfile}>
							<h2>Change URL suffix</h2>
							<Label>
								<span>URL suffix</span>
								<Input type="text" bind:value={urlSuffix} required />
							</Label>
							<Button type="submit">Apply</Button>
						</form>

						<form class="min-w-form space-y-3" onsubmit={changePassword}>
							<h2>Change password</h2>
							<Label>
								<span>Current password</span>
								<Input type="password" bind:value={currentPassword} autocomplete="current-password" required />
							</Label>
							<Label>
								<span>New password</span>
								<Input type="password" bind:value={newPassword} autocomplete="new-password" required />
							</Label>
							<Button type="submit">Update password</Button>
						</form>
					{:else if currentTab === 'general-settings'}
						<form class="min-w-form space-y-3">
							<h2>General settings</h2>
							<Label>
								<span>Language</span>
							</Label>
							<Label>
								<span>Theme</span>
							</Label>
						</form>
					{:else if currentTab === 'manage-users'}
						<form class="min-w-form space-y-3">
							<h2>Manage users</h2>
							<p>Nothing here yet.</p>
						</form>
					{/if}

					{#if message.trim()}
						<p class="mt-2 text-destructive">{message}</p>
					{/if}
				</div>
			</div>
		</main>
	{/if}
</Sidebar.Provider>

<svelte:head>
	<title>User configuration</title>
</svelte:head>