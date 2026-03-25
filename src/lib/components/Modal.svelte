<script lang="ts">
	import type { Snippet } from 'svelte';

	interface ModalProps {
		open: boolean;
		title: string;
		children?: Snippet;
		onClose: () => void;
		showCancel?: boolean;
		showConfirm?: boolean;
		confirmLabel?: string;
		onConfirm?: () => void;
		destructive?: boolean;
		closeOnBackdropClick?: boolean;
	}

	let {
		open = false,
		title,
		children,
		onClose,
		showCancel = true,
		showConfirm = true,
		confirmLabel = 'Confirm',
		onConfirm,
		destructive = false,
		closeOnBackdropClick = true
	}: ModalProps = $props();

	let dialogRef: HTMLDivElement;

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	function handleBackdropClick(e: MouseEvent) {
		if (closeOnBackdropClick && e.target === e.currentTarget) {
			onClose();
		}
	}

	$effect(() => {
		if (open && dialogRef) {
			dialogRef.focus();
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div 
		class="modal-backdrop" 
		onclick={handleBackdropClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div 
			class="modal-container" 
			bind:this={dialogRef}
			tabindex="-1"
		>
			<h2 id="modal-title" class="modal-title">{title}</h2>
			<div class="modal-body">
				{#if children}
					{@render children()}
				{/if}
			</div>
			<div class="modal-actions">
				{#if showCancel}
					<button class="btn-cancel" onclick={onClose}>
						Cancel
					</button>
				{/if}
				{#if showConfirm && onConfirm}
					<button 
						class="btn-confirm" 
						class:destructive
						onclick={onConfirm}
					>
						{confirmLabel}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-container {
		background: var(--surface-container-lowest, #fafafa);
		border-radius: var(--radius-lg, 1rem);
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
		padding: 24px;
		max-width: 320px;
		width: 90%;
		animation: scaleIn 0.2s ease-out;
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (min-width: 768px) {
		.modal-container {
			max-width: 400px;
		}
	}

	.modal-title {
		font-family: var(--font-serif, 'Noto Serif', Georgia, serif);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--on-surface, #1a1a1a);
		margin: 0 0 16px;
		line-height: 1.3;
	}

	.modal-body {
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
		font-size: 1rem;
		color: var(--on-surface-variant, #666);
		margin-bottom: 24px;
		line-height: 1.5;
	}

	.modal-actions {
		display: flex;
		gap: 12px;
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		padding: 12px;
		font-size: 1rem;
		font-weight: 500;
		border: none;
		border-radius: var(--radius-md, 0.75rem);
		cursor: pointer;
		transition: background 0.2s, transform 0.1s;
	}

	.btn-cancel {
		background: var(--surface-container-highest, #e5e5e5);
		color: var(--on-surface, #1a1a1a);
	}

	.btn-cancel:hover {
		background: var(--surface-container-high, #d5d5d5);
	}

	.btn-confirm {
		background: var(--primary, #4A90D9);
		color: var(--on-primary, white);
	}

	.btn-confirm:hover {
		background: var(--primary-hover, #3a7bc8);
	}

	.btn-confirm:active {
		transform: scale(0.98);
	}

	.btn-confirm.destructive {
		background: var(--error, #dc2626);
		color: var(--on-error, white);
	}

	.btn-confirm.destructive:hover {
		background: var(--error-hover, #b91c1c);
	}
</style>