<script>
	import ErrorPage from "$lib/components/error-page.svelte";
	import Button from "@/components/ui/button/button.svelte";
</script>

<ErrorPage
	code={404}
	title="Page not found"
	description="The URL you entered wandered off into the void."
>
	<Button href="/" variant="link">← Back to safety</Button>
</ErrorPage>
