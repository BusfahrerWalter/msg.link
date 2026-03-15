<script lang="ts">
	let { data } = $props<{ data: { authenticated: boolean; user?: App.AdminUserProfile | null } }>();

	let username = $state('');
	let password = $state('');
	let nextText = $state('');
	let currentPassword = $state('');
	let newPassword = $state('');
	let urlSuffix = $state('');
	let message = $state('');
	let authenticated = $state(false);
	let currentUser = $state<App.AdminUserProfile | null>(null);

	$effect(() => {
		authenticated = data.authenticated;
		currentUser = data.user ?? null;
		username = data.user?.username ?? username;
		urlSuffix = data.user?.urlSuffix ?? '';
		clearMessage();
	});

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

	async function login(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/admin/session', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ username, password })
		});

		const payload = await readPayload(response);
		message = typeof payload?.message === 'string' ? payload.message : 'Request failed';
		if (!response.ok) {
			return;
		}

		authenticated = true;
		currentUser = (payload?.user as App.AdminUserProfile | undefined) ?? null;
		username = currentUser?.username ?? username;
		urlSuffix = currentUser?.urlSuffix ?? '';
		password = '';
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
				authenticated = false;
				currentUser = null;
			}
			return;
		}

		nextText = '';
	}

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/admin/me', {
			method: 'PATCH',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ urlSuffix })
		});

		const payload = await readPayload(response);
		message = typeof payload?.message === 'string' ? payload.message : 'Request failed';
		if (!response.ok) {
			if (response.status === 401) {
				authenticated = false;
				currentUser = null;
			}
			return;
		}

		currentUser = (payload?.user as App.AdminUserProfile | undefined) ?? currentUser;
		urlSuffix = currentUser?.urlSuffix ?? urlSuffix;
	}

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/admin/password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ currentPassword, newPassword })
		});

		message = await readMessage(response);
		if (!response.ok) {
			if (response.status === 401) {
				authenticated = false;
				currentUser = null;
			}
			return;
		}

		currentPassword = '';
		newPassword = '';
	}

	async function logout() {
		const response = await fetch('/api/admin/session', { method: 'DELETE' });
		message = await readMessage(response);
		authenticated = false;
		currentUser = null;
		nextText = '';
		password = '';
		currentPassword = '';
		newPassword = '';
	}
</script>

<main class="admin-page">
	{#if authenticated}
		<form class="admin-form" onsubmit={saveText}>
			<h1>Update text</h1>
			<p>Signed in as <strong>{currentUser?.username}</strong></p>
			<label>
				<span>New text</span>
				<input type="text" bind:value={nextText} maxlength="280" required />
			</label>
			<button type="submit">Save</button>
		</form>

		<form class="admin-form" onsubmit={saveProfile}>
			<h2>Profile</h2>
			<label>
				<span>URL suffix</span>
				<input type="text" bind:value={urlSuffix} maxlength="120" />
			</label>
			<button type="submit">Save profile</button>
		</form>

		<form class="admin-form" onsubmit={changePassword}>
			<h2>Change password</h2>
			<label>
				<span>Current password</span>
				<input type="password" bind:value={currentPassword} autocomplete="current-password" required />
			</label>
			<label>
				<span>New password</span>
				<input type="password" bind:value={newPassword} autocomplete="new-password" required />
			</label>
			<button type="submit">Update password</button>
		</form>

		<div class="actions">
			<button type="button" class="secondary-button" onclick={logout}>Log out</button>
			<p>{message}</p>
		</div>
	{:else}
		<form class="admin-form" onsubmit={login}>
			<h1>Admin login</h1>
			<label>
				<span>Username</span>
				<input type="text" bind:value={username} autocomplete="username" required />
			</label>
			<label>
				<span>Password</span>
				<input type="password" bind:value={password} autocomplete="current-password" required />
			</label>
			<button type="submit">Log in</button>
			<p>{message}</p>
		</form>
	{/if}

	<a href="/" class="back-link">← Back to home</a>
</main>

<style>
	.admin-page {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		box-sizing: border-box;
		padding: 20px;
	}

	.admin-form {
		display: grid;
		gap: 0.75rem;
		width: min(420px, 100%);
	}

	.actions {
		display: grid;
		gap: 0.75rem;
		width: min(420px, 100%);
	}

	label {
		display: grid;
		gap: 0.35rem;
	}

	input,
	button {
		font: inherit;
		padding: 0.6rem 0.7rem;
	}

	button {
		cursor: pointer;
	}

	.secondary-button {
		background: transparent;
		border: 1px solid currentColor;
	}

	.back-link {
		display: inline-block;
		margin-top: 0.5rem;
		color: inherit;
		text-decoration: none;
		opacity: 0.6;
	}

	.back-link:hover {
		opacity: 1;
	}
</style>