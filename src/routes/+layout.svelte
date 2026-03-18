<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { toMode } from '$src/util';

	type Props = {
		children: import('svelte').Snippet;
		data: {
			user?: App.UserProfile | null;
		};
	};

	let { children, data }: Props = $props();

	const preferredMode = $derived(toMode(data.user?.theme));

	onMount(() => {
		setMode(preferredMode);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ModeWatcher defaultMode={preferredMode} themeColors={{ light: '#ffffff', dark: '#0f172a' }} />

{@render children()}
