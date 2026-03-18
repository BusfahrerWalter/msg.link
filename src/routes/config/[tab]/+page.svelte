<script lang="ts">
	import ConfigPage from '../config-page.svelte';

	type Props = {
		data: {
			authenticated: boolean;
			user?: App.UserProfile | null;
			messageSettings?: Data.StoredMessageSettings | null;
			content?: string | null;
			selectedTab: App.SidebarTab;
		};
	};

	let { data }: Props = $props();
</script>

<ConfigPage {data} />
