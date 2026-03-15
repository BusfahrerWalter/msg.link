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
			<div>
				{@render children()}
			</div>
		{/if}
	</div>
</main>

<style>
	.page {
		min-height: 100vh;
		display: grid;
		place-items: center;
		font-family: system-ui, sans-serif;
		background: radial-gradient(circle at 50% 30%, #1a1a1a, #0d0d0d);
		color: #fff;
		text-align: center;
		padding: 1rem;
		box-sizing: border-box;
	}

	.content.animate {
		animation: float 6s ease-in-out infinite;
	}

	h1 {
		font-size: clamp(6rem, 15vw, 10rem);
		margin: 0;
		line-height: 1;
		letter-spacing: 0.05em;
		background: linear-gradient(90deg, #6cf, #c6f);
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

	.home {
		display: inline-block;
		padding: 0.6rem 1.2rem;
		border-radius: 999px;
		text-decoration: none;
		color: #fff;
		background-color: rgba(255,255,255,0.08);
		border: 1px solid rgba(255,255,255,0.15);
		transition: transform 0.15s ease, background-color 0.15s ease;
	}

	.home:hover {
		transform: translateY(-2px);
		background-color: rgba(255,255,255,0.15);
	}

	@keyframes float {
		0%,100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	@media (prefers-reduced-motion: reduce) {
		.content.animate {
			animation: none;
		}
	}
</style>