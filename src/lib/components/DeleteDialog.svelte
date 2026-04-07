<script lang="ts">
	import { tick } from 'svelte';

	interface Props {
		open: boolean;
		bookTitle: string;
		onClose: () => void;
		onConfirm: () => void;
	}

	let { open, bookTitle, onClose, onConfirm }: Props = $props();
	const dialogId = $props.id();
	let dialogContent = $state<HTMLDivElement | null>(null);
	let previousFocusedElement: HTMLElement | null = null;

	function getFocusableElements() {
		if (!dialogContent) {
			return [];
		}

		return Array.from(
			dialogContent.querySelectorAll<HTMLElement>(
				'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)
		);
	}

	async function focusDialog() {
		await tick();
		const focusable = getFocusableElements();
		if (focusable[0]) {
			focusable[0].focus();
			return;
		}
		dialogContent?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!open) {
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}

		if (event.key === 'Tab') {
			const focusable = getFocusableElements();
			if (focusable.length === 0) {
				event.preventDefault();
				dialogContent?.focus();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement as HTMLElement | null;

			if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}

			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
			}
		}
	}

	$effect(() => {
		if (open) {
			previousFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			void focusDialog();
			return;
		}

		if (previousFocusedElement) {
			previousFocusedElement.focus();
			previousFocusedElement = null;
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby={`${dialogId}-title`} aria-describedby={`${dialogId}-description ${dialogId}-warning`}>
		<button class="backdrop-hit" type="button" tabindex="-1" aria-label="Close dialog" onclick={onClose}></button>
		<div class="dialog-content section-card" role="document" tabindex="-1" bind:this={dialogContent}>
			<p class="eyebrow">Remove book</p>
			<h2 id={`${dialogId}-title`}>Delete this book?</h2>
			<p id={`${dialogId}-description`}>“{bookTitle}” will be deleted from your library.</p>
			<p id={`${dialogId}-warning`} class="warning">This can’t be undone.</p>
			<div class="dialog-actions">
				<button type="button" class="ghost-button" onclick={onClose}>Cancel</button>
				<button type="button" class="danger-button" onclick={onConfirm}>Delete</button>
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
