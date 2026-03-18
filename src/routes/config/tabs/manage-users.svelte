<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Label from '@/components/ui/label/label.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import Button from '@/components/ui/button/button.svelte';
	import * as m from '$lib/paraglide/messages';

	const minUsernameLength = Number(env.PUBLIC_MIN_USERNAME_LENGTH ?? '2');
	const maxUsernameLength = Number(env.PUBLIC_MAX_USERNAME_LENGTH ?? '50');
	const minPasswordLength = Number(env.PUBLIC_MIN_PASSWORD_LENGTH ?? '6');
	const maxPasswordLength = Number(env.PUBLIC_MAX_PASSWORD_LENGTH ?? '50');
	const maxSuffixLength = Number(env.PUBLIC_MAX_SUFFIX_LENGTH ?? '20');

	let users = $state<App.UserProfile[]>([]);
	let username = $state('');
	let password = $state('');
	let urlSuffix = $state('');
	let statusMessage = $state('');
	let loadingUsers = $state(false);
	let creatingUser = $state(false);
	let deletingUsername = $state('');

	function setStatus(code: string, fallback = '') {
		switch (code) {
			case 'AUTH_REQUIRED': statusMessage = m.manage_users_auth_required(); break;
			case 'ADMIN_REQUIRED': statusMessage = m.manage_users_admin_required(); break;
			case 'INVALID_USERNAME': statusMessage = m.login_invalid_username(); break;
			case 'INVALID_PASSWORD': statusMessage = m.login_invalid_password(); break;
			case 'INVALID_URL_SUFFIX': statusMessage = m.manage_users_invalid_suffix(); break;
			case 'USERNAME_IN_USE': statusMessage = m.manage_users_username_in_use(); break;
			case 'URL_SUFFIX_IN_USE': statusMessage = m.manage_users_suffix_in_use(); break;
			case 'USER_NOT_FOUND': statusMessage = m.manage_users_user_not_found(); break;
			case 'USER_CREATE_SUCCESS': statusMessage = m.manage_users_create_success(); break;
			case 'USER_DELETE_SUCCESS': statusMessage = m.manage_users_delete_success(); break;
			case 'USERS_LOAD_SUCCESS': statusMessage = ''; break;
			default: statusMessage = fallback || m.login_request_failed();
		}
	}

	async function readPayload(response: Response) {
		return (await response.json().catch(() => null)) as Record<string, unknown> | null;
	}

	async function loadUsers() {
		loadingUsers = true;

		const response = await fetch('/api/user/manage');
		const payload = await readPayload(response);
		const code = typeof payload?.code === 'string' ? payload.code : '';

		if (!response.ok) {
			setStatus(code);
			loadingUsers = false;
			return;
		}

		users = Array.isArray(payload?.users) ? (payload.users as App.UserProfile[]) : [];
		setStatus(code);
		loadingUsers = false;
	}

	async function createUser(event: SubmitEvent) {
		event.preventDefault();
		creatingUser = true;

		const response = await fetch('/api/user/manage', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				username,
				password,
				urlSuffix
			})
		});

		const payload = await readPayload(response);
		const code = typeof payload?.code === 'string' ? payload.code : '';
		setStatus(code);

		if (response.ok) {
			username = '';
			password = '';
			urlSuffix = '';
			await loadUsers();
		}

		creatingUser = false;
	}

	async function deleteUser(usernameToDelete: string) {
		deletingUsername = usernameToDelete;

		const response = await fetch('/api/user/manage', {
			method: 'DELETE',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ username: usernameToDelete })
		});

		const payload = await readPayload(response);
		const code = typeof payload?.code === 'string' ? payload.code : '';
		setStatus(code);

		if (response.ok) {
			users = users.filter((user) => user.username !== usernameToDelete);
		}

		deletingUsername = '';
	}

	$effect(() => {
		void loadUsers();
	});
</script>

<div class="space-y-6 min-w-form">
	<form class="space-y-3" onsubmit={createUser}>
		<h2>{m.config_manage_users()}</h2>
		<Label>
			<span>{m.login_form_username()}</span>
			<Input
				type="text"
				bind:value={username}
				minlength={minUsernameLength}
				maxlength={maxUsernameLength}
				required
			/>
		</Label>
		<Label>
			<span>{m.login_form_password()}</span>
			<Input
				type="password"
				bind:value={password}
				minlength={minPasswordLength}
				maxlength={maxPasswordLength}
				required
			/>
		</Label>
		<Label>
			<span>{m.user_url_suffix()}</span>
			<Input
				type="text"
				bind:value={urlSuffix}
				maxlength={maxSuffixLength}
			/>
		</Label>

		<Button type="submit" disabled={creatingUser}>
			{m.manage_users_create_user()}
		</Button>
	</form>

	{#if statusMessage}
		<p class="text-sm text-muted-foreground">{statusMessage}</p>
	{/if}

	<div class="overflow-auto border rounded-md">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50">
				<tr>
					<th class="text-left p-2">{m.login_form_username()}</th>
					<th class="text-left p-2">{m.user_url_suffix()}</th>
					<th class="text-left p-2">{m.manage_users_is_admin()}</th>
					<th class="text-right p-2">{m.manage_users_actions()}</th>
				</tr>
			</thead>
			<tbody>
				{#if loadingUsers}
					<tr>
						<td class="p-2" colspan="4">{m.manage_users_loading()}</td>
					</tr>
				{:else if users.length === 0}
					<tr>
						<td class="p-2" colspan="4">{m.manage_users_no_users()}</td>
					</tr>
				{:else}
					{#each users as user (user.username)}
						<tr class="border-b last:border-b-0">
							<td class="p-2">{user.username}</td>
							<td class="p-2">{user.urlSuffix}</td>
							<td class="p-2">{user.isAdmin ? m.manage_users_yes() : m.manage_users_no()}</td>
							<td class="p-2 text-right">
								<Button
									variant="destructive"
									disabled={deletingUsername === user.username}
									onclick={() => deleteUser(user.username)}
								>
									{m.manage_users_delete_user()}
								</Button>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>