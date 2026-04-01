<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
		color?: string;
	}

	let { size = 'medium', color = 'var(--color-coral-1)' }: Props = $props();

	const sizes = {
		small: '20px',
		medium: '34px',
		large: '50px'
	};
</script>

<div class="spinner" style:--size={sizes[size]} style:--color={color} aria-hidden="true"></div>

<style>
	.spinner {
		width: var(--size);
		height: var(--size);
		border: 3px solid rgba(70, 51, 36, 0.12);
		border-top-color: var(--color);
		border-right-color: color-mix(in srgb, var(--color) 65%, white);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
