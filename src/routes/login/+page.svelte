<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import LoginPage from "./login-page.svelte";

	type Props = {
		data: {
			authenticated: boolean;
			user?: App.UserProfile | null
		}
	};

	let { data }: Props = $props();

	let username = $state('');
	let password = $state('');
	let message = $state('');

	$effect(() => {
		if (data.authenticated) {
			redirectToConfig();
			return;
		}

		username = data.user?.username ?? username;
		clearMessage();
	});

	async function readPayload(response: Response) {
		return (await response.json().catch(() => null)) as Record<string, unknown> | null;
	}

	function clearMessage() {
		message = '\u200B'; // zero-width space to prevent layout shift
	}

	function redirectToConfig() {
		window.location.href = '/config';
	}

	async function login(event: SubmitEvent) {
		event.preventDefault();
		clearMessage();

		const response = await fetch('/api/user/session', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		});

		const payload = await readPayload(response);
		message = typeof payload?.message === 'string' ? payload.message : 'Request failed';

		if (!response.ok) {
			return;
		}

		redirectToConfig();
	}
</script>

<main class="w-full h-full flex flex-col items-center justify-center p-4">
	<LoginPage
		bind:username={username}
		bind:password={password}
		onSubmit={login}
	/>

	<p class="mt-2 text-destructive">{message}</p>
	<Button href="/" variant="link">← Back to home</Button>
</main>

<svelte:head>
	<title>Login</title>
</svelte:head>