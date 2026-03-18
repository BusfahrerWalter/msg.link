<script lang="ts">
	import Label from "@/components/ui/label/label.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";

	import * as m from '$lib/paraglide/messages';
	import {
		MAX_PASSWORD_LENGTH,
		MAX_SUFFIX_LENGTH,
		MIN_PASSWORD_LENGTH
	} from '$lib/public-env';
	import { type ApiToastMap, getCode, notifyToast, readPayload } from '$lib/api-toast';

	type Props = {
		currentUser: App.UserProfile | null;
	};

	let {
		currentUser = $bindable(null)
	}: Props = $props();

	let currentPassword = $state('');
	let newPassword = $state('');

	const profileToastMap = {
		AUTH_REQUIRED: { message: m.manage_users_auth_required() },
		INVALID_URL_SUFFIX: { message: m.manage_users_invalid_suffix() },
		URL_SUFFIX_IN_USE: { message: m.manage_users_suffix_in_use() },
		USER_PROFILE_UPDATE_SUCCESS: { message: m.common_apply(), variant: 'success' }
	} satisfies ApiToastMap;

	const passwordToastMap = {
		AUTH_REQUIRED: { message: m.manage_users_auth_required() },
		CURRENT_PASSWORD_REQUIRED: { message: m.login_invalid_password() },
		NEW_PASSWORD_INVALID_LENGTH: { message: m.login_invalid_password() },
		INVALID_CURRENT_PASSWORD: { message: m.login_invalid_password() },
		PASSWORD_CHANGE_SUCCESS: { message: m.user_update_password(), variant: 'success' }
	} satisfies ApiToastMap;

	async function saveProfile(event: SubmitEvent) {
		event.preventDefault();
		if (!currentUser) {
			return;
		}

		const response = await fetch('/api/user/me', {
			method: 'PATCH',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ urlSuffix: currentUser.urlSuffix })
		});

		const payload = await readPayload(response);
		const code = getCode(payload);
		if (!response.ok) {
			if (response.status === 401) {
				notifyToast(code, profileToastMap, m.login_request_failed());
				currentUser = null;
				return;
			}

			notifyToast(code, profileToastMap, m.login_request_failed());
			return;
		}

		currentUser = (payload?.user as App.UserProfile | undefined) ?? currentUser;
		notifyToast(code, profileToastMap, m.common_apply());
	}

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();

		const response = await fetch('/api/user/password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ currentPassword, newPassword })
		});

		const payload = await readPayload(response);
		const code = getCode(payload);

		if (!response.ok) {
			if (response.status === 401) {
				notifyToast(code, passwordToastMap, m.login_request_failed());
				currentUser = null;
				return;
			}

			notifyToast(code, passwordToastMap, m.login_request_failed());
			return;
		}

		currentPassword = '';
		newPassword = '';
		notifyToast(code, passwordToastMap, m.user_update_password());
	}
</script>

<form class="min-w-form space-y-3 mb-5" onsubmit={saveProfile}>
	<h2>{m.user_change_url_suffix()}</h2>
	<Label>
		<span>{m.user_url_suffix()}</span>
		<Input
			type="text"
			bind:value={currentUser!.urlSuffix}
			maxlength={MAX_SUFFIX_LENGTH}
			required
		/>
	</Label>
	<Button type="submit">{m.common_apply()}</Button>
</form>

<form class="min-w-form space-y-3" onsubmit={changePassword}>
	<h2>{m.user_change_password()}</h2>
	<Label>
		<span>{m.user_current_password()}</span>
		<Input
			type="password"
			bind:value={currentPassword}
			autocomplete="current-password"
			minlength={MIN_PASSWORD_LENGTH}
			maxlength={MAX_PASSWORD_LENGTH}
			required
		/>
	</Label>
	<Label>
		<span>{m.user_new_password()}</span>
		<Input
			type="password"
			bind:value={newPassword}
			autocomplete="new-password"
			minlength={MIN_PASSWORD_LENGTH}
			maxlength={MAX_PASSWORD_LENGTH}
			required
		/>
	</Label>
	<Button type="submit">{m.user_update_password()}</Button>
</form>