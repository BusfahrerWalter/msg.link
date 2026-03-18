<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import { cn } from '$lib/utils.js';

	type Props = {
		ref?: HTMLElement | null;
		required?: boolean;
		class?: string;
		values: { value: string; label: string }[];
		value: string;
	};

	let {
		ref = $bindable(null),
		values = $bindable(),
		value = $bindable(''),
		required = $bindable(false),
		class: className
	}: Props = $props();

	const triggerContent = $derived.by(() => {
		const selected = values.find((val) => val.value === value);
		return selected ? (selected.label ?? selected.value) : 'Select an option';
	})
</script>

<Select.Root type="single" bind:value {required}>
	<Select.Trigger bind:ref={ref} class={cn('w-full', className)}>
		{triggerContent}
	</Select.Trigger>
	<Select.Content>
		<Select.Group>
			{#each values as val (val.value)}
				<Select.Item
					value={val.value}
					label={val.label}
					disabled={val.value === "grapes"}
				>
					{val.label}
				</Select.Item>
			{/each}
		</Select.Group>
	</Select.Content>
</Select.Root>
