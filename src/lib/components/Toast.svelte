<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	export type ToastType = 'success' | 'error' | 'info' | 'warning';

	export interface Toast {
		id: string;
		message: string;
		type: ToastType;
		duration: number;
	}

	function createToastStore() {
		const { subscribe, update } = writable<Toast[]>([]);

		return {
			subscribe,
			add: (toast: Omit<Toast, 'id'>) => {
				const id = Math.random().toString(36).slice(2, 9);
				const newToast = { ...toast, id };
				
				update(toasts => [...toasts, newToast]);

				// Auto-dismiss
				setTimeout(() => {
					update(toasts => toasts.filter(t => t.id !== id));
				}, toast.duration);

				return id;
			},
			remove: (id: string) => {
				update(toasts => toasts.filter(t => t.id !== id));
			}
		};
	}

	export const toasts = createToastStore();

	export function showToast(
		message: string, 
		type: ToastType = 'info', 
		duration: number = 4000
	) {
		return toasts.add({ message, type, duration });
	}
</script>

<script lang="ts">
	import { fly, fade } from 'svelte/transition';

	const borderColors = {
		success: 'var(--tertiary)',
		error: 'var(--error)',
		info: 'var(--secondary)',
		warning: 'var(--tertiary)'
	};
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div
			class="toast toast-{toast.type}"
			style="--border-color: {borderColors[toast.type]}"
			in:fly={{ y: -20, duration: 300 }}
			out:fade={{ duration: 200 }}
		>
			<span class="toast-message">{toast.message}</span>
			<button 
				class="toast-close" 
				onclick={() => toasts.remove(toast.id)}
				aria-label="Dismiss"
			>
				&times;
			</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: var(--space-4);
		left: 50%;
		transform: translateX(-50%);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: calc(100vw - var(--space-8));
		pointer-events: none;
	}

	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3) var(--space-4);
		background-color: var(--surface-container);
		border-radius: var(--radius-md);
		border-left: 4px solid var(--border-color);
		box-shadow: var(--shadow-elevated);
		pointer-events: auto;
		min-width: 280px;
		max-width: 400px;
	}

	.toast-message {
		flex: 1;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface);
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: transparent;
		border: none;
		color: var(--on-surface-variant);
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background-color var(--transition-fast);
	}

	.toast-close:hover {
		background-color: var(--surface-container-high);
	}
</style>
