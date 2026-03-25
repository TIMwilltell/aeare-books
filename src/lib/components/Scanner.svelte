<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Quagga from 'quagga';

	interface Props {
		onDetected: (isbn: string) => void;
		onError?: (error: string) => void;
	}

	let { onDetected, onError }: Props = $props();

	let scannerContainer: HTMLDivElement;
	let status = $state<'initializing' | 'scanning' | 'found' | 'error'>('initializing');
	let errorMessage = $state<string>('');

	// ISBN validation and conversion utilities
	function isValidISBN10(code: string): boolean {
		// ISBN-10: 9 digits + check digit (0-9 or X)
		if (!/^\d{9}[\dX]$/i.test(code)) return false;
		
		let sum = 0;
		for (let i = 0; i < 9; i++) {
			sum += (10 - i) * parseInt(code[i], 10);
		}
		const checkDigit = code[9].toUpperCase() === 'X' ? 10 : parseInt(code[9], 10);
		sum += checkDigit;
		return sum % 11 === 0;
	}

	function isValidISBN13(code: string): boolean {
		// ISBN-13: 13 digits, should start with 978 or 979
		if (!/^\d{13}$/.test(code)) return false;
		
		let sum = 0;
		for (let i = 0; i < 12; i++) {
			const digit = parseInt(code[i], 10);
			sum += i % 2 === 0 ? digit : digit * 3;
		}
		const checkDigit = (10 - (sum % 10)) % 10;
		return checkDigit === parseInt(code[12], 10);
	}

	function convertISBN10to13(isbn10: string): string {
		// ISBN-10: first 9 digits + prefix 978 + new check digit
		const base9 = isbn10.substring(0, 9);
		const withPrefix = '978' + base9;
		
		let sum = 0;
		for (let i = 0; i < 12; i++) {
			const digit = parseInt(withPrefix[i], 10);
			sum += i % 2 === 0 ? digit : digit * 3;
		}
		const checkDigit = (10 - (sum % 10)) % 10;
		return withPrefix + checkDigit;
	}

	function normalizeISBN(code: string): string | null {
		// Remove any hyphens or spaces
		const clean = code.replace(/[-\s]/g, '');
		
		// Try ISBN-13 first
		// ISBN-13 must start with 978 or 979 to be a book ISBN
		if (/^\d{13}$/.test(clean)) {
			if ((clean.startsWith('978') || clean.startsWith('979')) && isValidISBN13(clean)) {
				return clean;
			}
			// Log why invalid ISBN-13 was rejected
			if (isValidISBN13(clean)) {
				console.log('[Scanner] Rejected: valid checksum but not ISBN-13 prefix (must start with 978 or 979)');
			}
		}
		
		// Try ISBN-10
		if (/^\d{9}[\dX]$/i.test(clean)) {
			if (isValidISBN10(clean)) {
				// Convert to ISBN-13 for compatibility
				return convertISBN10to13(clean);
			}
		}
		
		return null;
	}

	onMount(() => {
		initScanner();
	});

	onDestroy(() => {
		Quagga.stop();
	});

	function initScanner() {
		console.log('[Scanner] Starting Quagga init, container:', scannerContainer);
		
		Quagga.init(
			{
				inputStream: {
					type: 'LiveStream',
					target: scannerContainer,
					constraints: {
						facingMode: 'environment',
						width: { min: 640, ideal: 1280, max: 1920 },
						height: { min: 480, ideal: 720, max: 1080 }
					}
				},
				locator: {
					patchSize: 'medium',
					halfSample: true
				},
				decoder: {
					readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader']
				},
				locate: true
			},
			(err) => {
				if (err) {
					console.error('[Scanner] Init error:', err);
					status = 'error';
					errorMessage = err.message || 'Camera access denied';
					onError?.(errorMessage);
					return;
				}
				console.log('[Scanner] Init success, starting Quagga...');
				Quagga.start();
				status = 'scanning';
			}
		);

		Quagga.onDetected((result) => {
			console.log('[Scanner] onDetected:', result);
			if (result.codeResult?.code) {
				const code = result.codeResult.code;
				const format = result.codeResult.format;
				console.log(`[Scanner] Detected: ${code} (format: ${format})`);
				
				// Use proper ISBN validation with checksum verification
				const normalizedISBN = normalizeISBN(code);
				if (normalizedISBN) {
					console.log('[Scanner] Valid ISBN detected:', normalizedISBN, '(from original:', code + ')');
					status = 'found';
					Quagga.stop();
					onDetected(normalizedISBN);
				} else {
					console.log('[Scanner] Detected but not valid ISBN:', code, '- this may be a product barcode, not a book ISBN. Make sure to scan the ISBN barcode (usually on the back cover).');
					// Show helpful error to user (but not for every detection - only once per invalid scan attempt)
					if (status !== 'error') {
						onError?.('not-isbn');
					}
				}
			}
		});

		Quagga.onProcessed((processingResult) => {
			// processingResult can be undefined before first frame is processed
			// or when processing errors occur
			if (!processingResult) return;
			// Log detection attempts
			if (processingResult.boxes?.length) {
				console.log('[Scanner] Found boxes:', processingResult.boxes.length);
			}
			if (processingResult.codeResult) {
				console.log('[Scanner] Decoded:', processingResult.codeResult);
			}
			if (processingResult.err) {
				console.log('[Scanner] Decode error:', processingResult.err);
			}
		});
	}

	export function restart() {
		status = 'scanning';
		initScanner();
	}
</script>

<div class="scanner-container" bind:this={scannerContainer}>
	<div class="scanner-overlay">
		<div class="scanner-frame"></div>
	</div>

	<div class="scanner-status">
		{#if status === 'initializing'}
			<span class="status-text">Initializing camera...</span>
		{:else if status === 'scanning'}
			<span class="status-text">Point camera at barcode</span>
		{:else if status === 'found'}
			<span class="status-text status-found">Barcode found!</span>
		{:else if status === 'error'}
			<span class="status-text status-error">{errorMessage}</span>
		{/if}
	</div>
</div>

<style>
	.scanner-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
		background: #000;
		overflow: hidden;
	}

	.scanner-container :global(video) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.scanner-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.scanner-frame {
		width: 280px;
		height: 150px;
		border: 2px solid rgba(74, 144, 217, 0.8);
		border-radius: 8px;
		box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}

	.scanner-status {
		position: absolute;
		bottom: 20px;
		left: 0;
		right: 0;
		text-align: center;
	}

	.status-text {
		display: inline-block;
		padding: 8px 16px;
		background: rgba(0, 0, 0, 0.7);
		color: #fff;
		border-radius: 20px;
		font-size: 14px;
	}

	.status-found {
		color: #4ade80;
	}

	.status-error {
		color: #f87171;
	}
</style>
