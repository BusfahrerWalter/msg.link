<script lang="ts">
	const { data } = $props<{ data: App.TextApiResponse }>();
</script>

<svelte:head>
	<title>{data.text}</title>
</svelte:head>

<main class="page">
	<p>{data.text}</p>
</main>

<style>
	.page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		font-size: 2rem;
		text-align: center;
		box-sizing: border-box;
		padding: 1rem;
	}
</style>
