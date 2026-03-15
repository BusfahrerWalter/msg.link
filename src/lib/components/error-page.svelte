<script lang="ts">
	type Props = {
		code?: number;
		title?: string;
		description?: string;
		animate?: boolean;
		children?: any;
	};

	const {
		code,
		title = 'Something went wrong',
		description,
		animate = true,
		children
	}: Props = $props();
</script>

<main class="page">
	<div class="content" class:animate={animate}>
		{#if typeof code === 'number'}
			<h1>{code}</h1>
		{/if}

		<p class="title">{title}</p>

		{#if description}
			<p class="desc">{description}</p>
		{/if}

		{#if children}
			{@render children()}
		{/if}
	</div>
</main>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<style>
	.page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		font-family: system-ui, sans-serif;
		background: radial-gradient(
			circle at 50% 30%,
			color-mix(in srgb, var(--color-background) 90%, var(--color-foreground)),
			var(--color-background)
		);
		color: var(--color-foreground);
		text-align: center;
		padding: 1rem;
		box-sizing: border-box;
	}

	.content.animate {
		animation: float 6s ease-in-out infinite;
	}

	h1 {
		font-size: clamp(6rem, 15vw, 10rem);
		font-weight: bold;
		margin: 0;
		line-height: 1;
		letter-spacing: 0.05em;
		background: linear-gradient(90deg, #6cf, #c6f);
		background-clip: text;
		-webkit-background-clip: text;
		color: transparent;
		user-select: none;
	}

	.title {
		font-size: 2rem;
		margin: 0.5rem 0 0.75rem;
	}

	.desc {
		opacity: 0.6;
		margin-bottom: 2rem;
	}

	@keyframes float {
		0%,100% {
			transform: translateY(5px);
		}
		50% {
			transform: translateY(-5px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.content.animate {
			animation: none;
		}
	}
</style>