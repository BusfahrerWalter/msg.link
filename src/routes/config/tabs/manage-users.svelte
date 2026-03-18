<script lang="ts">
	import Label from '@/components/ui/label/label.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import Button from '@/components/ui/button/button.svelte';

	import * as m from '$lib/paraglide/messages';
	import {
		MAX_PASSWORD_LENGTH,
		MAX_SUFFIX_LENGTH,
		MAX_USERNAME_LENGTH,
		MIN_PASSWORD_LENGTH,
		MIN_USERNAME_LENGTH
	} from '$lib/public-env';
	import { type ApiToastMap, getCode, notifyToast, readPayload } from '$lib/api-toast';

	let users = $state<App.UserProfile[]>([]);
	let username = $state('');
	let password = $state('');
	let urlSuffix = $state('');
	let loadingUsers = $state(false);
	let creatingUser = $state(false);
	let deletingUsername = $state('');

	const userManageToastMap = {
		AUTH_REQUIRED: { message: m.manage_users_auth_required() },
		ADMIN_REQUIRED: { message: m.manage_users_admin_required() },
		INVALID_USERNAME: { message: m.login_invalid_username() },
		INVALID_PASSWORD: { message: m.login_invalid_password() },
		INVALID_URL_SUFFIX: { message: m.manage_users_invalid_suffix() },
		USERNAME_IN_USE: { message: m.manage_users_username_in_use() },
		URL_SUFFIX_IN_USE: { message: m.manage_users_suffix_in_use() },
		USER_NOT_FOUND: { message: m.manage_users_user_not_found() },
		USER_CREATE_SUCCESS: { message: m.manage_users_create_success(), variant: 'success' },
		USER_DELETE_SUCCESS: { message: m.manage_users_delete_success(), variant: 'success' },
		USERS_LOAD_SUCCESS: { message: '', variant: 'none' }
	} satisfies ApiToastMap;

	async function loadUsers() {
		loadingUsers = true;

		const response = await fetch('/api/user/manage');
		const payload = await readPayload(response);
		const code = getCode(payload);

		if (!response.ok) {
			notifyToast(code, userManageToastMap, m.login_request_failed());
			loadingUsers = false;
			return;
		}

		users = Array.isArray(payload?.users) ? (payload.users as App.UserProfile[]) : [];
		notifyToast(code, userManageToastMap, m.login_request_failed());
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
		const code = getCode(payload);
		notifyToast(code, userManageToastMap, m.login_request_failed());

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
		const code = getCode(payload);
		notifyToast(code, userManageToastMap, m.login_request_failed());

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
		<h2>{m.manage_users_create_new_user()}</h2>
		<Label>
			<span>{m.login_form_username()}</span>
			<Input
				type="text"
				bind:value={username}
				minlength={MIN_USERNAME_LENGTH}
				maxlength={MAX_USERNAME_LENGTH}
				required
			/>
		</Label>
		<Label>
			<span>{m.login_form_password()}</span>
			<Input
				type="password"
				bind:value={password}
				minlength={MIN_PASSWORD_LENGTH}
				maxlength={MAX_PASSWORD_LENGTH}
				required
			/>
		</Label>
		<Label>
			<span>{m.user_url_suffix()}</span>
			<Input
				type="text"
				bind:value={urlSuffix}
				maxlength={MAX_SUFFIX_LENGTH}
			/>
		</Label>

		<Button type="submit" disabled={creatingUser}>
			{m.manage_users_create_user()}
		</Button>
	</form>

	<h2 class="mb-3">{m.manage_users_user_list()}</h2>
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