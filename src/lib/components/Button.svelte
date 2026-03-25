<script lang="ts">
	import PrimaryButton from './PrimaryButton.svelte';
	import SecondaryButton from './SecondaryButton.svelte';

	interface Props {
		label: string;
		variant?: 'primary' | 'secondary';
		onclick?: () => void;
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit';
		fullWidth?: boolean;
	}

	let {
		label,
		variant = 'primary',
		onclick,
		disabled = false,
		loading = false,
		type = 'button',
		fullWidth = false
	}: Props = $props();
</script>

{#if variant === 'primary'}
	<PrimaryButton
		{label}
		{onclick}
		{disabled}
		{loading}
		{type}
		{fullWidth}
	/>
{:else}
	<SecondaryButton
		{label}
		{onclick}
		{disabled}
		{type}
		{fullWidth}
	/>
{/if}
