<script lang="ts">
	import Modal from './Modal.svelte';

	interface Props {
		open: boolean;
		bookTitle: string;
		onClose: () => void;
		onConfirm: () => void;
	}

	let { open, bookTitle, onClose, onConfirm }: Props = $props();
</script>

<Modal
	{open}
	title="Delete Book"
	{onClose}
	showCancel={true}
	showConfirm={true}
	confirmLabel="Delete"
	{onConfirm}
	destructive={true}
>
	<p>Are you sure you want to delete "{bookTitle}"?</p>
	<p class="warning">This action cannot be undone.</p>
</Modal>

<style>
	p {
		margin: 0 0 8px;
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
		color: var(--on-surface, #1a1a1a);
	}

	.warning {
		color: var(--on-surface-variant, #666);
		font-size: 0.875rem;
	}
</style>