<script>
	import ErrorPage from "$lib/components/error-page.svelte";
</script>

<ErrorPage
	code={404}
	title="Page not found"
	description="The URL you entered wandered off into the void."
>
	<a class="home" href="/">← Back to safety</a>
</ErrorPage>
