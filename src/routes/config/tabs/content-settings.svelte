<script lang="ts">
	import { env } from '$env/dynamic/public';
	import Label from "@/components/ui/label/label.svelte";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Textarea from '@/components/ui/textarea/textarea.svelte';

	import Dropdown from '@/components/dropdown.svelte';
	import ColorInput from '@/components/color-input.svelte';

	const maxTextLength = Number(env.PUBLIC_MAX_CONTENT_LENGTH ?? '280');

	type Props = {
		currentUser: App.UserProfile | null;
		messageSettings: Data.StoredMessageSettings;
		content: string | null;
	};

	let {
		currentUser = $bindable(null),
		messageSettings = $bindable(),
		content = $bindable(null)
	}: Props = $props();

	const messageTypes = [
		{ value: 'text', label: 'Text' },
		{ value: 'image', label: 'Image' },
		{ value: 'link', label: 'Link' },
		{ value: 'markdown', label: 'Markdown' }
	];

	const fontSizes = Array.from({ length: 120 }, (_, i) => {
		const size = i + 6;
		return {
			value: `${size}px`,
			label: `${size}px`
		};
	})

	async function saveText(event: SubmitEvent) {
		event.preventDefault();

		const response = await fetch('/api/text', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: content })
		});

		if (!response.ok && response.status === 401) {
			currentUser = null;
		}
	}

	async function saveSettings(event: SubmitEvent) {
		event.preventDefault();

		const response = await fetch('/api/settings/me', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				type: messageSettings.type,
				color: messageSettings.color,
				background: messageSettings.background,
				fontSize: messageSettings.fontSize,
				font: messageSettings.font
			})
		});

		if (!response.ok && response.status === 401) {
			currentUser = null;
		}
	}
</script>

<form class="min-w-form space-y-3 mb-4" onsubmit={saveText}>
	<h2>Update text</h2>
	<Label>
		<span>New text</span>
		<Textarea
			class="resize-y h-40"
			bind:value={content}
			maxlength={maxTextLength}
			required
		/>
	</Label>

	<Button type="submit">Apply</Button>
</form>

<form class="min-w-form space-y-3" onsubmit={saveSettings}>
	<h2>Update settings</h2>
	<Label>
		<span>Type</span>
		<Dropdown values={messageTypes} bind:value={messageSettings.type} required />
	</Label>
	<Label>
		<span>Text color</span>
		<ColorInput bind:value={messageSettings.color} required />
	</Label>
	<Label>
		<span>Background color</span>
		<ColorInput bind:value={messageSettings.background} required />
	</Label>
	<Label>
		<span>Font size</span>
		<Dropdown values={fontSizes} bind:value={messageSettings.fontSize} required />
	</Label>
	<Label>
		<span>Font</span>
		<Input type="text" bind:value={messageSettings.font} required />
	</Label>

	<Button type="submit">Apply</Button>
</form>