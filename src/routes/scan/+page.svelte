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
	<h1>Scan Book</h1>

	{#if permissionDenied}
		<div class="permission-denied">
			<p>Camera access was denied.</p>
			<p>Please allow camera access in your browser settings, or enter the ISBN manually.</p>
			<button class="btn-primary" onclick={handleManualEntry}>Enter ISBN Manually</button>
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
			<button class="btn-link" onclick={handleManualEntry}>Enter ISBN manually</button>
		</div>
	{/if}
</div>

<style>
	.scan-page {
		padding: 20px;
		min-height: 100vh;
		background: #f5f5f5;
	}

	h1 {
		margin: 0 0 20px;
		font-size: 24px;
		text-align: center;
	}

	.scanner-wrapper {
		height: 450px;
		border-radius: 12px;
		overflow: hidden;
	}

	.permission-denied {
		text-align: center;
		padding: 40px 20px;
	}

	.permission-denied p {
		margin: 0 0 16px;
		color: #666;
	}

	.manual-entry {
		text-align: center;
		margin-top: 20px;
	}

	.btn-primary {
		padding: 14px 28px;
		font-size: 16px;
		background: #4A90D9;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}

	.btn-link {
		background: none;
		border: none;
		color: #4A90D9;
		font-size: 16px;
		cursor: pointer;
		text-decoration: underline;
	}

	.scan-error {
		text-align: center;
		padding: 12px;
		margin-top: 16px;
		background: #fef3c7;
		border-radius: 8px;
		color: #92400e;
	}

	.scan-error p {
		margin: 0;
	}
</style>
