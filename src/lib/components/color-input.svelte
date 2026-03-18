<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '$lib/utils.js';

	type Props = WithElementRef<HTMLInputAttributes> & {
		value: string;
	};

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: Props = $props();

	const hexColorPattern = "^#([A-Fa-f0-9]{6})$";
</script>


<div class={cn(
	'flex flex-row gap-2 justify-stretch items-center',
	'border-input bg-background selection:bg-primary dark:bg-input/30 selection:text-primary-foreground ring-offset-background placeholder:text-muted-foreground h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
	'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
	'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
	className
)}>
	<input
		bind:this={ref}
		bind:value={value}
		class="w-auto aspect-square"
		type="color"
		{...restProps}
	/>

	<input
		bind:value={value}
		class="grow w-full min-w-20 outline-none"
		type="text"
		pattern={hexColorPattern}
	/>
</div>

