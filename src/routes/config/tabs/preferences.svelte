<script lang="ts">
	import Label from "@/components/ui/label/label.svelte";
	import Button from "@/components/ui/button/button.svelte";

	import Dropdown from '@/components/dropdown.svelte';

	type Props = {
		currentUser: App.UserProfile | null;
	};

	let {
		currentUser = $bindable(null)
	}: Props = $props();

	const themes = [
		{ value: 'light', label: 'Light' },
		{ value: 'dark', label: 'Dark' },
		{ value: 'system', label: 'System' }
	];

	const languages = [
		{ value: 'en', label: 'English' },
		{ value: 'de', label: 'German' }
	];

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
		}
	}
</script>

<form class="min-w-form space-y-3 mb-5" onsubmit={saveProfile}>
	<h2>Preferences</h2>
	<Label>
		<span>Color theme</span>
		<Dropdown values={themes} bind:value={currentUser!.theme} required />
	</Label>
	<Label>
		<span>Language</span>
		<Dropdown values={languages} bind:value={currentUser!.language} required />
	</Label>
	<Button type="submit">Apply</Button>
</form>
