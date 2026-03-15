<script lang="ts">
	import ErrorPage from "$lib/components/error-page.svelte";

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
	title="Page not found"
	description="Try entering a valid URL suffix to see a page."
	animate={false}
>
	<input
		id="pathInput"
		placeholder="/some-page"
		bind:value={value}
		onkeydown={handleInput}
	/>
	<button id="goBtn" onclick={go}>Go</button>
</ErrorPage>
