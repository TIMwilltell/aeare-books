<script lang="ts">
	interface Props {
		open: boolean;
		bookTitle: string;
		onClose: () => void;
		onConfirm: () => void;
	}

	let { open, bookTitle, onClose, onConfirm }: Props = $props();
	const dialogId = $props.id();

	function handleKeydown(event: KeyboardEvent) {
		if (open && event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`} aria-describedby={`${dialogId}-description`}>
		<button class="backdrop-hit" type="button" aria-label="Close dialog" onclick={onClose}></button>
		<div class="dialog-content section-card" role="document">
			<p class="eyebrow">Delete entry</p>
			<h2 id={`${dialogId}-title`}>Remove this book?</h2>
			<p id={`${dialogId}-description`}>“{bookTitle}” will be deleted from your library.</p>
			<p class="warning">This action cannot be undone.</p>
			<div class="dialog-actions">
				<button class="ghost-button" onclick={onClose}>Cancel</button>
				<button class="danger-button" onclick={onConfirm}>Delete book</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(25, 19, 16, 0.56);
		backdrop-filter: blur(10px);
	}

	.dialog-content {
		position: relative;
		z-index: 1;
		width: min(100%, 26rem);
		padding: 1.35rem;
	}

	.backdrop-hit {
		position: absolute;
		inset: 0;
		border: 0;
		padding: 0;
		background: transparent;
		cursor: default;
	}

	h2,
	p {
		margin: 0;
	}

	h2 {
		margin-top: 0.35rem;
		font-family: var(--font-serif);
		font-size: 1.8rem;
		color: var(--text-strong);
	}

	p {
		margin-top: 0.75rem;
		line-height: 1.6;
	}

	.warning {
		color: var(--color-danger);
		font-weight: 600;
	}

	.dialog-actions {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
		margin-top: 1.3rem;
	}

	@media (max-width: 480px) {
		.dialog-actions {
			grid-template-columns: 1fr;
		}
	}
</style>
