<script lang="ts">
	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();
</script>

<button class="fab" onclick={onclick} aria-label="Scan book">
	<span class="fab-icon" aria-hidden="true">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M3 7V5a2 2 0 0 1 2-2h2"/>
			<path d="M17 3h2a2 2 0 0 1 2 2v2"/>
			<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
			<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
			<line x1="7" y1="12" x2="17" y2="12"/>
		</svg>
	</span>
	<span class="fab-label">Scan</span>
</button>

<style>
	.fab {
		position: fixed;
		right: 1rem;
		bottom: max(1rem, env(safe-area-inset-bottom));
		z-index: 20;
		display: inline-flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.85rem 1rem 0.85rem 0.9rem;
		border: none;
		border-radius: var(--radius-pill);
		background: linear-gradient(135deg, rgba(45, 38, 33, 0.98), rgba(69, 61, 54, 0.98));
		color: var(--text-on-accent);
		box-shadow: 0 12px 22px rgba(38, 31, 26, 0.22);
		cursor: pointer;
		transition: transform var(--transition-soft), box-shadow var(--transition-soft);
	}

	.fab:hover {
		transform: translateY(-1px);
		box-shadow: 0 16px 24px rgba(38, 31, 26, 0.26);
	}

	.fab-icon {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 999px;
		background: linear-gradient(135deg, rgba(192, 109, 93, 0.96), rgba(216, 184, 121, 0.92));
	}

	.fab-label {
		font-size: 0.95rem;
		font-weight: 700;
	}

	@media (min-width: 720px) {
		.fab {
			right: max(1rem, calc((100vw - var(--content-width)) / 2 - 4.5rem));
		}
	}
</style>
