<script lang="ts">
	import { goto } from '$app/navigation';
	import Scanner from '$lib/components/Scanner.svelte';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import { showToast } from '$lib/components/Toast.svelte';

	let permissionDenied = $state(false);
	let scanError = $state('');
	let errorTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleDetected(isbn: string) {
		goto(`/book/new?isbn=${isbn}`);
	}

	function handleError(error: string) {
		if (error.includes('denied') || error.includes('NotAllowedError')) {
			permissionDenied = true;
			scanError = '';
		} else if (error === 'not-isbn') {
			// Non-ISBN barcode scanned - show helpful message
			// Clear any existing timeout and set new one
			if (errorTimeout) clearTimeout(errorTimeout);
			scanError = 'Scanned code is not a valid book ISBN. Please scan the ISBN barcode on the book.';
			errorTimeout = setTimeout(() => {
				scanError = '';
			}, 3000);
		}
	}

	function handleManualEntry() {
		goto('/book/new');
	}
</script>

<svelte:head>
	<title>Scan Book - AeAre Books</title>
</svelte:head>

<div class="scan-page">
	<header class="glass-header">
		<button class="back-button" onclick={() => goto('/')} aria-label="Go back">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m12 19-7-7 7-7"/>
				<path d="M19 12H5"/>
			</svg>
		</button>
		<h1>Scan Book</h1>
	</header>

	{#if permissionDenied}
		<div class="permission-denied">
			<div class="permission-icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8"/>
					<path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z"/>
					<line x1="2" y1="2" x2="22" y2="22"/>
				</svg>
			</div>
			<h2>Camera access was denied</h2>
			<p>Please allow camera access in your browser settings, or enter the ISBN manually.</p>
			<PrimaryButton label="Enter ISBN Manually" onclick={handleManualEntry} />
		</div>
	{:else}
		<div class="scanner-wrapper">
			<Scanner onDetected={handleDetected} onError={handleError} />
		</div>
		{#if scanError}
			<div class="scan-error">
				<p>{scanError}</p>
			</div>
		{/if}
		<div class="manual-entry">
			<button class="link-button" onclick={handleManualEntry}>Or enter ISBN manually</button>
		</div>
	{/if}
</div>

<style>
	.scan-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--surface);
	}

	.glass-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--outline-variant);
	}

	.glass-header h1 {
		flex: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--on-surface);
		text-align: center;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--on-surface);
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.back-button:hover {
		background-color: var(--surface-container);
	}

	.back-button:active {
		background-color: var(--surface-container-high);
	}

	.scanner-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		min-height: 400px;
	}

	.scanner-wrapper :global(.scanner-container) {
		width: 100%;
		max-width: 480px;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-elevated);
	}

	.permission-denied {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-4);
		flex: 1;
		padding: var(--space-8);
		text-align: center;
	}

	.permission-icon {
		color: var(--on-surface-variant);
		opacity: 0.6;
	}

	.permission-denied h2 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--on-surface);
	}

	.permission-denied p {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--on-surface-variant);
		max-width: 300px;
	}

	.manual-entry {
		display: flex;
		justify-content: center;
		padding: var(--space-6);
	}

	.link-button {
		background: none;
		border: none;
		padding: var(--space-2) var(--space-4);
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--primary);
		text-decoration: underline;
		text-underline-offset: 4px;
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.link-button:hover {
		color: var(--primary-container);
	}

	.link-button:active {
		color: var(--primary-fixed);
	}

	.scan-error {
		display: flex;
		justify-content: center;
		padding: var(--space-3) var(--space-4);
		margin: 0 var(--space-4);
		background-color: var(--tertiary-container);
		border-radius: var(--radius-md);
	}

	.scan-error p {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-tertiary-container);
		text-align: center;
	}
</style>
