<script lang="ts">
	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();
</script>

<button class="fab" onclick={onclick} aria-label="Scan book">
	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<path d="M3 7V5a2 2 0 0 1 2-2h2"/>
		<path d="M17 3h2a2 2 0 0 1 2 2v2"/>
		<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
		<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
		<line x1="7" y1="12" x2="17" y2="12"/>
	</svg>
</button>

<style>
	.fab {
		position: fixed;
		bottom: 24px;
		right: 24px;
		width: 56px;
		height: 56px;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, var(--primary, #4A90D9) 0%, var(--primary-container, #C8E6FF) 100%);
		color: var(--on-primary, white);
		border: none;
		box-shadow: 0 4px 12px rgba(74, 144, 217, 0.3);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.fab:hover {
		transform: scale(1.05);
		box-shadow: 0 6px 20px rgba(74, 144, 217, 0.4);
	}

	.fab:active {
		transform: scale(0.95);
		background: var(--primary-fixed, #2563eb);
	}

	svg {
		width: 24px;
		height: 24px;
	}
</style>
