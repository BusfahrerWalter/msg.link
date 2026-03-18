<script lang="ts">
	import Label from "@/components/ui/label/label.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import Dropdown from '@/components/dropdown.svelte';
	import ColorInput from '@/components/color-input.svelte';

	import * as m from '$lib/paraglide/messages';
	import { MAX_CONTENT_LENGTH } from '$lib/public-env';
	import { type ApiToastMap, getCode, notifyToast, readPayload } from '$lib/api-toast';

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

	const messageTypes = $derived([
		{ value: 'text', label: m.content_type_text() },
		{ value: 'image', label: m.content_type_image() },
		{ value: 'link', label: m.content_type_link() },
		{ value: 'markdown', label: m.content_type_markdown() }
	]);

	const fontSizes = Array.from({ length: 120 }, (_, i) => {
		const size = i + 6;
		return {
			value: `${size}px`,
			label: `${size}px`
		};
	});

	const fontFamilies = [
		// System / Generic
		{ label: "System Default", value: "system-ui, sans-serif" },
		{ label: "Sans-serif (generic)", value: "sans-serif" },
		{ label: "Serif (generic)", value: "serif" },
		{ label: "Monospace (generic)", value: "monospace" },
		{ label: "Cursive (generic)", value: "cursive" },
		{ label: "Fantasy (generic)", value: "fantasy" },

		// Sans-serif
		{ label: "Arial", value: "Arial, Helvetica, sans-serif" },
		{ label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
		{ label: "Verdana", value: "Verdana, Geneva, sans-serif" },
		{ label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
		{ label: "Trebuchet MS", value: "'Trebuchet MS', Helvetica, sans-serif" },
		{ label: "Gill Sans", value: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" },
		{ label: "Segoe UI", value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
		{ label: "Roboto", value: "Roboto, Arial, sans-serif" },
		{ label: "Ubuntu", value: "Ubuntu, Arial, sans-serif" },
		{ label: "Noto Sans", value: "'Noto Sans', Arial, sans-serif" },
		{ label: "Cantarell", value: "Cantarell, Arial, sans-serif" },

		// Serif
		{ label: "Times New Roman", value: "'Times New Roman', Times, serif" },
		{ label: "Georgia", value: "Georgia, serif" },
		{ label: "Garamond", value: "Garamond, serif" },
		{ label: "Palatino", value: "'Palatino Linotype', Palatino, serif" },
		{ label: "Baskerville", value: "Baskerville, serif" },
		{ label: "Cambria", value: "Cambria, serif" },
		{ label: "Didot", value: "Didot, serif" },
		{ label: "Book Antiqua", value: "'Book Antiqua', Palatino, serif" },

		// Monospace
		{ label: "Consolas", value: "Consolas, 'Courier New', monospace" },
		{ label: "Courier New", value: "'Courier New', Courier, monospace" },
		{ label: "Lucida Console", value: "'Lucida Console', Monaco, monospace" },
		{ label: "Monaco", value: "Monaco, Consolas, monospace" },
		{ label: "Menlo", value: "Menlo, Monaco, monospace" },
		{ label: "Source Code Pro", value: "'Source Code Pro', monospace" },
		{ label: "DejaVu Sans Mono", value: "'DejaVu Sans Mono', monospace" },
		{ label: "Liberation Mono", value: "'Liberation Mono', monospace" },

		// Cursive / Handwriting
		{ label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
		{ label: "Brush Script MT", value: "'Brush Script MT', cursive" },
		{ label: "Lucida Handwriting", value: "'Lucida Handwriting', cursive" },
		{ label: "Apple Chancery", value: "'Apple Chancery', cursive" },
		{ label: "Segoe Script", value: "'Segoe Script', cursive" },

		// Decorative / Fantasy
		{ label: "Impact", value: "Impact, fantasy" },
		{ label: "Papyrus", value: "Papyrus, fantasy" },
		{ label: "Copperplate", value: "Copperplate, fantasy" }
	];

	const contentTextToastMap = {
		AUTH_REQUIRED: { message: m.manage_users_auth_required() },
		INVALID_TEXT_LENGTH: { message: m.login_request_failed() },
		TEXT_UPDATE_SUCCESS: { message: m.content_update_text(), variant: 'success' }
	} satisfies ApiToastMap;

	const contentSettingsToastMap = {
		AUTH_REQUIRED: { message: m.manage_users_auth_required() },
		INVALID_MESSAGE_SETTINGS: { message: m.login_request_failed() },
		MSG_SETTINGS_UPDATE_SUCCESS: { message: m.content_update_settings(), variant: 'success' }
	} satisfies ApiToastMap;

	async function saveText(event: SubmitEvent) {
		event.preventDefault();

		const response = await fetch('/api/text', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ text: content })
		});

		const payload = await readPayload(response);
		const code = getCode(payload);

		if (!response.ok && response.status === 401) {
			notifyToast(code, contentTextToastMap, m.login_request_failed());
			currentUser = null;
			return;
		}

		if (!response.ok) {
			notifyToast(code, contentTextToastMap, m.login_request_failed());
			return;
		}

		notifyToast(code, contentTextToastMap, m.content_update_text());
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

		const payload = await readPayload(response);
		const code = getCode(payload);

		if (!response.ok && response.status === 401) {
			notifyToast(code, contentSettingsToastMap, m.login_request_failed());
			currentUser = null;
			return;
		}

		if (!response.ok) {
			notifyToast(code, contentSettingsToastMap, m.login_request_failed());
			return;
		}

		notifyToast(code, contentSettingsToastMap, m.content_update_settings());
	}
</script>

<form class="min-w-form space-y-3 mb-4" onsubmit={saveText}>
	<h2>{m.content_update_text()}</h2>
	<Label>
		<span>{m.content_new_text()}</span>
		<Textarea
			class="resize-y h-40"
			bind:value={content}
			maxlength={MAX_CONTENT_LENGTH}
			required
		/>
	</Label>

	<Button type="submit">{m.common_apply()}</Button>
</form>

<form class="min-w-form space-y-3" onsubmit={saveSettings}>
	<h2>{m.content_update_settings()}</h2>
	<Label>
		<span>{m.content_type()}</span>
		<Dropdown values={messageTypes} bind:value={messageSettings.type} required />
	</Label>
	<Label>
		<span>{m.content_text_color()}</span>
		<ColorInput bind:value={messageSettings.color} required />
	</Label>
	<Label>
		<span>{m.content_background_color()}</span>
		<ColorInput bind:value={messageSettings.background} required />
	</Label>
	<Label>
		<span>{m.content_font_size()}</span>
		<Dropdown values={fontSizes} bind:value={messageSettings.fontSize} required />
	</Label>
	<Label>
		<span>{m.content_font()}</span>
		<Dropdown values={fontFamilies} bind:value={messageSettings.font} required />
	</Label>

	<Button type="submit">{m.common_apply()}</Button>
</form>