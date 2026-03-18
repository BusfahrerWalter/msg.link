<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import * as m from '$lib/paraglide/messages';

	type Props = {
		data: {
			text: string;
			settings: Data.StoredMessageSettings;
			suffix: string;
		}
	};

	const { data }: Props = $props();
	let isPreview = $state(false);

	if (globalThis.location) {
		const search = new URLSearchParams(globalThis.location.search);
		isPreview = search.get('preview') === 'true';
	}

	$effect(() => {
		if (!globalThis.document?.body) {
			return;
		}

		// apply styles from settings
		globalThis.document.body.style.backgroundColor = data.settings.background;

		// redirect if type is link
		if (data.settings.type === 'link') {
			globalThis.location.href = data.text;
		}
		// if type is image, set the text as background image
		else if (data.settings.type === 'image') {
			globalThis.document.body.style.backgroundImage = `url(${data.text})`;
			globalThis.document.body.style.backgroundSize = 'cover';
			globalThis.document.body.style.backgroundPosition = 'center';
		}

		return () => {
			if (!globalThis.document?.body) {
				return;
			}

			// reset styles on unmount
			globalThis.document.body.style.backgroundColor = '';
			globalThis.document.body.style.backgroundImage = '';
			globalThis.document.body.style.backgroundSize = '';
			globalThis.document.body.style.backgroundPosition = '';
		};
	});
</script>

<main class="w-full h-full flex items-center justify-center p-3 bg-transparent whitespace-pre-wrap">
	<p
		style:display={data.settings.type === 'text' ? 'block' : 'none'}
		style:color={data.settings.color}
		style:font-size={data.settings.fontSize}
		style:font-family={data.settings.font}
	>{data.text}</p>
</main>

{#if isPreview}
	<Button
		class="fixed top-2 left-2"
		href="/config"
		variant="link"
	>
		← {m.preview_back()}
	</Button>
{/if}

<svelte:head>
	<title>{data.text}</title>
</svelte:head>