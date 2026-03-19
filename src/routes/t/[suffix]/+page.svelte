<script lang="ts">
	import LinkIcon from '@lucide/svelte/icons/link';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Button from "@/components/ui/button/button.svelte";
	import * as m from '$lib/paraglide/messages';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	type Props = {
		data: {
			text: string;
			settings: Data.StoredMessageSettings;
			suffix: string;
		}
	};

	const { data }: Props = $props();
	let isPreview = $state(false);
	let markdownHtml = $state('');
	let copied = $state(false);

	async function share() {
		const url = `${globalThis.location.origin}/t/${encodeURIComponent(data.suffix)}`;
		await navigator.clipboard.writeText(url);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}

	if (globalThis.location) {
		const search = new URLSearchParams(globalThis.location.search);
		isPreview = search.get('preview') === 'true';
	}

	$effect(() => {
		const body = globalThis.document?.body;
		if (!body) {
			return;
		}

		// apply styles from settings
		body.style.backgroundColor = data.settings.background;

		// redirect if type is link
		if (data.settings.type === 'link') {
			globalThis.location.href = data.text;
		}
		// if type is image, set the text as background image
		else if (data.settings.type === 'image') {
			body.style.backgroundImage = `url(${data.text})`;
			body.style.backgroundSize = 'cover';
			body.style.backgroundPosition = 'center';
		}
		// parse and sanitize markdown content
		else if (data.settings.type === 'markdown') {
			const rawHtml = marked.parse(data.text, { async: false });
			markdownHtml = DOMPurify.sanitize(rawHtml);
		}

		return () => {
			if (!body) {
				return;
			}

			// reset styles on unmount
			body.style.backgroundColor = '';
			body.style.backgroundImage = '';
			body.style.backgroundSize = '';
			body.style.backgroundPosition = '';
		};
	});
</script>

<main class="w-full h-full flex items-center justify-center p-3 bg-transparent">
	<p
		class="whitespace-pre-wrap"
		style:display={data.settings.type === 'text' ? 'block' : 'none'}
		style:color={data.settings.color}
		style:font-size={data.settings.fontSize}
		style:font-family={data.settings.font}
	>{data.text}</p>
	<div
		class="markdown max-w-prose w-fit"
		style:display={data.settings.type === 'markdown' ? 'block' : 'none'}
		style:color={data.settings.color}
		style:font-size={data.settings.fontSize}
		style:font-family={data.settings.font}
	>
		{@html markdownHtml}
	</div>
</main>

{#if isPreview}
	<Button
		class="fixed top-2 left-2"
		variant="outline"
		size="sm"
		href="/config"
	>
		← {m.preview_back()}
	</Button>

	<Button
		class="fixed top-2 right-2 gap-1.5"
		variant="outline"
		size="sm"
		onclick={share}
		aria-label="Copy link"
	>
		{#if copied}
			<CheckIcon class="size-4" />
			{m.share_copied()}
		{:else}
			<LinkIcon class="size-4" />
			{m.share_copy_link()}
		{/if}
	</Button>
{/if}

<svelte:head>
	<title>{data.text}</title>
</svelte:head>

<style>
	.markdown :global(h1) { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
	.markdown :global(h2) { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
	.markdown :global(h3) { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
	.markdown :global(h4),
	.markdown :global(h5),
	.markdown :global(h6) { font-weight: bold; margin: 1em 0; }
	.markdown :global(p) { margin: 1em 0; }
	.markdown :global(ul) { list-style: disc; margin: 1em 0; padding-left: 2em; }
	.markdown :global(ol) { list-style: decimal; margin: 1em 0; padding-left: 2em; }
	.markdown :global(li) { margin: 0.25em 0; }
	.markdown :global(a) { text-decoration: underline; }
	.markdown :global(strong) { font-weight: bold; }
	.markdown :global(em) { font-style: italic; }
	.markdown :global(code) { font-family: monospace; background: rgba(128,128,128,0.15); padding: 0.1em 0.35em; border-radius: 3px; }
	.markdown :global(pre) { background: rgba(128,128,128,0.15); padding: 1em; border-radius: 6px; overflow-x: auto; margin: 1em 0; }
	.markdown :global(pre code) { background: none; padding: 0; }
	.markdown :global(blockquote) { border-left: 3px solid currentColor; margin: 1em 0; padding-left: 1em; opacity: 0.75; }
	.markdown :global(hr) { border: none; border-top: 1px solid currentColor; margin: 1.5em 0; opacity: 0.3; }
	.markdown :global(table) { border-collapse: collapse; width: 100%; margin: 1em 0; }
	.markdown :global(th),
	.markdown :global(td) { border: 1px solid currentColor; padding: 0.4em 0.75em; }
	.markdown :global(th) { font-weight: bold; }
</style>