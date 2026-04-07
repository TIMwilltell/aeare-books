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

	function isValidISBN10(code: string): boolean {
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
		const clean = code.replace(/[-\s]/g, '');

		if (/^\d{13}$/.test(clean)) {
			if ((clean.startsWith('978') || clean.startsWith('979')) && isValidISBN13(clean)) {
				return clean;
			}
			if (isValidISBN13(clean)) {
				console.log('[Scanner] Rejected: valid checksum but not ISBN-13 prefix (must start with 978 or 979)');
			}
		}

		if (/^\d{9}[\dX]$/i.test(clean) && isValidISBN10(clean)) {
			return convertISBN10to13(clean);
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

				const normalizedISBN = normalizeISBN(code);
				if (normalizedISBN) {
					console.log('[Scanner] Valid ISBN detected:', normalizedISBN, '(from original:', code + ')');
					status = 'found';
					Quagga.stop();
					onDetected(normalizedISBN);
				} else {
					console.log('[Scanner] Detected but not valid ISBN:', code, '- this may be a product barcode, not a book ISBN. Make sure to scan the ISBN barcode (usually on the back cover).');
					if (status !== 'error') {
						onError?.('not-isbn');
					}
				}
			}
		});

		Quagga.onProcessed((processingResult) => {
			if (!processingResult) return;
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
	<div class="scanner-overlay" aria-hidden="true">
		<div class="scanner-frame">
			<span class="corner top left"></span>
			<span class="corner top right"></span>
			<span class="corner bottom left"></span>
			<span class="corner bottom right"></span>
			<div class="scan-line"></div>
		</div>
	</div>

	<div class="scanner-copy">
		<p class="eyebrow">Live camera</p>
		<div class="scanner-status" aria-live="polite" aria-atomic="true">
			{#if status === 'initializing'}
				<span class="status-text">Starting camera...</span>
			{:else if status === 'scanning'}
				<span class="status-text">Line up the ISBN inside the frame.</span>
			{:else if status === 'found'}
				<span class="status-text status-found">Book found. Opening...</span>
			{:else if status === 'error'}
				<span class="status-text status-error">{errorMessage}</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.scanner-container {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 25rem;
		background:
			radial-gradient(circle at top, rgba(213, 111, 91, 0.18), transparent 30%),
			linear-gradient(180deg, rgba(18, 14, 13, 0.45), rgba(18, 14, 13, 0.7));
		overflow: hidden;
	}

	.scanner-container :global(video) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: saturate(0.88) contrast(1.04);
	}

	.scanner-overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.scanner-frame {
		position: relative;
		width: min(84%, 19rem);
		height: 10.5rem;
		border-radius: 1.6rem;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.18);
		box-shadow: 0 0 0 999px rgba(14, 10, 9, 0.44), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
		backdrop-filter: blur(2px);
	}

	.corner {
		position: absolute;
		width: 1.8rem;
		height: 1.8rem;
		border-color: rgba(240, 201, 119, 0.94);
		border-style: solid;
	}

	.corner.top {
		top: 0.8rem;
		border-bottom: none;
	}

	.corner.bottom {
		bottom: 0.8rem;
		border-top: none;
	}

	.corner.left {
		left: 0.8rem;
		border-right: none;
	}

	.corner.right {
		right: 0.8rem;
		border-left: none;
	}

	.scan-line {
		position: absolute;
		left: 1rem;
		right: 1rem;
		top: 50%;
		height: 2px;
		background: linear-gradient(90deg, transparent, rgba(213, 111, 91, 0.95), transparent);
		box-shadow: 0 0 18px rgba(213, 111, 91, 0.8);
		animation: scan 2.4s ease-in-out infinite;
	}

	.scanner-copy {
		position: absolute;
		inset: auto 1rem 1rem;
		display: grid;
		gap: 0.6rem;
	}

	.scanner-status {
		display: flex;
		justify-content: start;
	}

	.status-text {
		display: inline-flex;
		align-items: center;
		min-height: 2.8rem;
		padding: 0.75rem 1rem;
		border-radius: var(--radius-pill);
		background: rgba(22, 17, 15, 0.75);
		color: rgba(255, 251, 245, 0.96);
		font-size: 0.92rem;
		line-height: 1.4;
		backdrop-filter: blur(18px);
	}

	.status-found {
		background: rgba(70, 97, 79, 0.86);
	}

	.status-error {
		background: rgba(185, 85, 71, 0.86);
	}

	@keyframes scan {
		0%,
		100% {
			transform: translateY(-2.9rem);
			opacity: 0.55;
		}

		50% {
			transform: translateY(2.9rem);
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scan-line {
			animation: none;
			opacity: 0.75;
		}
	}
</style>
