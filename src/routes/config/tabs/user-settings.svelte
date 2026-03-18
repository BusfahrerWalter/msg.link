<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Label from "@/components/ui/label/label.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";

	const maxSuffixLength = Number(env.PUBLIC_MAX_SUFFIX_LENGTH ?? '280');
	const minPasswordLength = Number(env.PUBLIC_MIN_PASSWORD_LENGTH ?? '6');
	const maxPasswordLength = Number(env.PUBLIC_MAX_PASSWORD_LENGTH ?? '50');

	type Props = {
		currentUser: App.UserProfile | null;
	};

	let {
		currentUser = $bindable(null)
	}: Props = $props();

	let currentPassword = $state('');
	let newPassword = $state('');

	async function readPayload(response: Response) {
		return (await response.json().catch(() => null)) as Record<string, unknown> | null;
	}

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
		if (!response.ok) {
			if (response.status === 401) {
				currentUser = null;
			}
			return;
		}

		currentUser = (payload?.user as App.UserProfile | undefined) ?? currentUser;
	}

	async function changePassword(event: SubmitEvent) {
		event.preventDefault();

		const response = await fetch('/api/user/password', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ currentPassword, newPassword })
		});

		if (!response.ok) {
			if (response.status === 401) {
				currentUser = null;
			}
			return;
		}

		currentPassword = '';
		newPassword = '';
	}
</script>

<form class="min-w-form space-y-3 mb-5" onsubmit={saveProfile}>
	<h2>Change URL suffix</h2>
	<Label>
		<span>URL suffix</span>
		<Input
			type="text"
			bind:value={currentUser!.urlSuffix}
			maxlength={maxSuffixLength}
			required
		/>
	</Label>
	<Button type="submit">Apply</Button>
</form>

<form class="min-w-form space-y-3" onsubmit={changePassword}>
	<h2>Change password</h2>
	<Label>
		<span>Current password</span>
		<Input
			type="password"
			bind:value={currentPassword}
			autocomplete="current-password"
			minlength={minPasswordLength}
			maxlength={maxPasswordLength}
			required
		/>
	</Label>
	<Label>
		<span>New password</span>
		<Input
			type="password"
			bind:value={newPassword}
			autocomplete="new-password"
			minlength={minPasswordLength}
			maxlength={maxPasswordLength}
			required
		/>
	</Label>
	<Button type="submit">Update password</Button>
</form>