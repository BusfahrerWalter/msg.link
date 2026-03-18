<script>
	import ErrorPage from "$lib/components/error-page.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import * as m from '$lib/paraglide/messages';
</script>

<ErrorPage
	code={404}
	title={m.error_not_found_title()}
	description={m.error_not_found_description()}
>
	<Button href="/" variant="link">← {m.common_back_safety()}</Button>
</ErrorPage>
