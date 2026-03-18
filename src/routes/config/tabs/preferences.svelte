<script lang="ts">
	import Label from "@/components/ui/label/label.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { setMode } from 'mode-watcher';

	import Dropdown from '@/components/dropdown.svelte';

	import { toMode } from "$src/util";
	import * as m from '$lib/paraglide/messages';
	import { setLocale } from '$lib/paraglide/runtime';

	type Props = {
		currentUser: App.UserProfile | null;
	};

	let {
		currentUser = $bindable(null)
	}: Props = $props();

	const themes = $derived([
		{ value: 'light', label: m.preferences_light() },
		{ value: 'dark', label: m.preferences_dark() },
		{ value: 'system', label: m.preferences_system() }
	]);

	const languages = $derived([
		{ value: 'en', label: m.preferences_english() },
		{ value: 'de', label: m.preferences_german() }
	]);

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
			body: JSON.stringify({
				theme: currentUser.theme,
				language: currentUser.language
			})
		});

		if (!response.ok && response.status === 401) {
			currentUser = null;
			return;
		}

		if (response.ok) {
			setMode(toMode(currentUser.theme));
			setLocale(currentUser.language);
		}
	}
</script>

<form class="min-w-form space-y-3 mb-5" onsubmit={saveProfile}>
	<h2>{m.preferences_title()}</h2>
	<Label>
		<span>{m.preferences_color_theme()}</span>
		<Dropdown values={themes} bind:value={currentUser!.theme} required />
	</Label>
	<Label>
		<span>{m.common_language()}</span>
		<Dropdown values={languages} bind:value={currentUser!.language} required />
	</Label>
	<Button type="submit">{m.common_apply()}</Button>
</form>
