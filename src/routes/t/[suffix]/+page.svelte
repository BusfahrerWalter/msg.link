<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";

	const { data } = $props<{ data: App.TextApiResponse }>();
	let isPreview = $state(false);

	if (globalThis.location) {
		const search = new URLSearchParams(globalThis.location.search);
		isPreview = search.get('preview') === 'true';
	}
</script>

<main class="w-full h-full flex items-center justify-center p-3">
	<p>{data.text}</p>
</main>

{#if isPreview}
	<Button
		class="fixed top-2 left-2"
		href="/config"
		variant="link"
	>
		← Back
	</Button>
{/if}

<svelte:head>
	<title>{data.text}</title>
</svelte:head>