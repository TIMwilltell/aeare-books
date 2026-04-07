<script lang="ts">
	import { goto } from '$app/navigation';
	import Scanner from '$lib/components/Scanner.svelte';

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
			if (errorTimeout) clearTimeout(errorTimeout);
			scanError = 'That doesn’t look like an ISBN. Try the barcode on the back cover.';
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
	<section class="scan-hero">
		<p class="eyebrow">Scan</p>
		<h1 class="page-title">Scan a book.</h1>
		<p>
			Point your camera at the ISBN, or enter it by hand.
		</p>
	</section>

	{#if permissionDenied}
		<section class="permission-denied section-card">
			<div class="denied-icon" aria-hidden="true">Camera</div>
			<h2>Camera access is off.</h2>
			<p>Allow camera access in your browser, or enter the ISBN instead.</p>
			<button class="secondary-button" onclick={handleManualEntry}>Enter ISBN</button>
		</section>
	{:else}
		<section class="scan-stage section-card">
			<div class="scanner-wrapper">
				<Scanner onDetected={handleDetected} onError={handleError} />
			</div>

			<div class="scan-guidance">
				<div class="guide-card surface-muted">
					<p><strong>Framing</strong> Center the barcode and hold still.</p>
				</div>
				<div class="guide-card surface-muted">
					<p><strong>Barcode</strong> Scan the ISBN, not the store barcode.</p>
				</div>
			</div>

			{#if scanError}
				<div class="scan-error" aria-live="polite">
					<p>{scanError}</p>
				</div>
			{/if}

			<div class="manual-entry">
				<button class="ghost-button" onclick={handleManualEntry}>Enter ISBN by hand</button>
			</div>
		</section>
	{/if}
</div>

<style>
	.scan-page {
		display: grid;
		gap: 1rem;
	}

	.scan-hero {
		display: grid;
		gap: 0.8rem;
		padding: 0.4rem 0.1rem 0;
	}

	.scan-hero p:last-child {
		margin: 0;
		max-width: 38rem;
		line-height: 1.6;
	}

	.scan-stage,
	.permission-denied {
		display: grid;
		gap: 0.95rem;
		padding: 1rem;
	}

	.scanner-wrapper {
		border-radius: calc(var(--radius-md) - 0.2rem);
		overflow: hidden;
		min-height: 28rem;
		background: #171311;
	}

	.scan-guidance {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.guide-card {
		display: grid;
		gap: 0.35rem;
		align-items: start;
		padding: 0.9rem;
	}

	.guide-card p {
		line-height: 1.45;
	}

	.guide-card p,
	.scan-error p,
	.permission-denied p,
	.permission-denied h2 {
		margin: 0;
	}

	.scan-error {
		padding: 0.9rem 1rem;
		border-radius: var(--radius-sm);
		background: rgba(240, 201, 119, 0.18);
		border: 1px solid rgba(240, 201, 119, 0.32);
		color: #7c5a19;
	}

	.manual-entry {
		display: flex;
		justify-content: center;
	}

	.permission-denied {
		justify-items: center;
		text-align: center;
		padding: 2rem 1.3rem;
	}

	.denied-icon {
		display: grid;
		place-items: center;
		padding: 0.45rem 0.8rem;
		border-radius: var(--radius-pill);
		background: var(--surface-strong);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.permission-denied h2 {
		font-family: var(--font-serif);
		font-size: 1.7rem;
		color: var(--text-strong);
	}

	.permission-denied p {
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.scanner-wrapper {
			min-height: 24rem;
		}

		.scan-guidance {
			grid-template-columns: 1fr;
		}
	}
</style>
