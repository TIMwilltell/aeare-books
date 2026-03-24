<script lang="ts">
	interface Props {
		open: boolean;
		bookTitle: string;
		onClose: () => void;
		onConfirm: () => void;
	}

	let { open, bookTitle, onClose, onConfirm }: Props = $props();
</script>

{#if open}
	<div 
		class="dialog-overlay" 
		onclick={onClose} 
		onkeydown={(e) => e.key === 'Escape' && onClose()}
		role="dialog" 
		aria-modal="true"
		tabindex="-1"
	>
		<div 
			class="dialog-content" 
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<h2>Delete Book</h2>
			<p>Are you sure you want to delete "{bookTitle}"?</p>
			<p class="warning">This action cannot be undone.</p>
			<div class="dialog-actions">
				<button class="btn-cancel" onclick={onClose}>Cancel</button>
				<button class="btn-delete" onclick={onConfirm}>Delete</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.dialog-content {
		background: white;
		padding: 24px;
		border-radius: 12px;
		max-width: 320px;
		width: 90%;
	}

	h2 {
		margin: 0 0 16px;
		font-size: 20px;
	}

	p {
		margin: 0 0 8px;
		color: #333;
	}

	.warning {
		color: #888;
		font-size: 14px;
	}

	.dialog-actions {
		display: flex;
		gap: 12px;
		margin-top: 24px;
	}

	.btn-cancel,
	.btn-delete {
		flex: 1;
		padding: 12px;
		font-size: 16px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-cancel {
		background: #e5e5e5;
		color: #333;
	}

	.btn-delete {
		background: #fee2e2;
		color: #dc2626;
	}

	.btn-cancel:hover {
		background: #d5d5d5;
	}

	.btn-delete:hover {
		background: #fecaca;
	}
</style>
