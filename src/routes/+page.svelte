<script lang="ts">
	import ErrorPage from "$lib/components/error-page.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import * as m from '$lib/paraglide/messages';

	let value = $state('');

	function go() {
		if (!value) {
			return;
		}

		const path = value.replace(/^\/?t?\//, '');
		window.location.href = `/t/${encodeURIComponent(path)}`;
	}

	function handleInput(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			go();
		}
	}
</script>

<ErrorPage
	title={m.error_not_found_title()}
	description={m.home_not_found_description()}
	animate={false}
>
	<div class="flex flex-row gap-1 justify-center mb-4">
		<Input
			placeholder="/some-page"
			bind:value={value}
			onkeydown={handleInput}
		/>
		<Button onclick={go}>{m.common_go()}</Button>
	</div>
	<Button variant="link" href="/login">{m.common_login()}</Button>
</ErrorPage>

