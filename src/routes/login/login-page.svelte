<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import * as m from '$lib/paraglide/messages';

	type Props = {
		username: string;
		password: string;
		onSubmit: (event: SubmitEvent) => void;
	}

	let {
		username = $bindable(''),
		password = $bindable(''),
		onSubmit
	}: Props = $props();
</script>

<form class="min-w-form space-y-3" onsubmit={onSubmit}>
	<h1 class="mb-5 text-center">{m.login_form_title()}</h1>

	<Label>
		<div class="block">{m.login_form_username()}</div>
		<Input
			type="text"
			bind:value={username}
			autocomplete="username"
			placeholder={m.login_form_username_placeholder()}
			required
		/>
	</Label>
	<Label>
		<div class="block">{m.login_form_password()}</div>
		<Input
			type="password"
			bind:value={password}
			autocomplete="current-password"
			placeholder={m.login_form_password_placeholder()}
			required
		/>
	</Label>

	<div class="mt-5 flex flex-col justify-stretch">
		<Button type="submit" class="grow">{m.login_form_submit()}</Button>
	</div>
</form>