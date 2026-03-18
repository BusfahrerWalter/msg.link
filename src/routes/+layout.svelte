<script lang="ts">
	import { page } from '$app/state';
	import { locales, localizeHref, setLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { toMode } from '$src/util';

	type Props = {
		children: import('svelte').Snippet;
		data: { user?: App.UserProfile | null };
	};

	let { children, data }: Props = $props();
	const preferredMode = $derived(toMode(data.user?.theme));

	onMount(() => {
		if (data.user?.language) {
			setLocale(data.user.language, { reload: false });
		}
		setMode(preferredMode);
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<ModeWatcher
	defaultMode={preferredMode}
	themeColors={{ light: '#ffffff', dark: '#0f172a' }}
/>

{@render children()}

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
	<span>{m.common_login()}</span>
</div>
