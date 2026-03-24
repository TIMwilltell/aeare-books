<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
		color?: string;
	}

	let { size = 'medium', color = '#4A90D9' }: Props = $props();

	const sizes = {
		small: '20px',
		medium: '32px',
		large: '48px'
	};
</script>

<div class="spinner" style="--size: {sizes[size]}; --color: {color}"></div>

<style>
	.spinner {
		width: var(--size);
		height: var(--size);
		border: 3px solid #e5e5e5;
		border-top-color: var(--color);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
