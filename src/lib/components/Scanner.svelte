<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Quagga from 'quagga';

	interface Props {
		onDetected: (isbn: string) => void;
		onError?: (error: string) => void;
	}

	let { onDetected, onError }: Props = $props();

	let videoElement: HTMLVideoElement;
	let status = $state<'initializing' | 'scanning' | 'found' | 'error'>('initializing');
	let errorMessage = $state<string>('');

	onMount(() => {
		initScanner();
	});

	onDestroy(() => {
		Quagga.stop();
	});

	function initScanner() {
		Quagga.init(
			{
				inputStream: {
					type: 'LiveStream',
					target: videoElement,
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
					console.error('Scanner init error:', err);
					status = 'error';
					errorMessage = err.message || 'Camera access denied';
					onError?.(errorMessage);
					return;
				}
				Quagga.start();
				status = 'scanning';
			}
		);

		Quagga.onDetected((result) => {
			if (result.codeResult?.code) {
				const code = result.codeResult.code;
				// Validate it looks like an ISBN (10 or 13 digits)
				if (/^\d{10}$|^\d{13}$/.test(code)) {
					status = 'found';
					Quagga.stop();
					onDetected(code);
				}
			}
		});

		Quagga.onProcessed((processingResult) => {
			if (processingResult.boxes?.length) {
				// Drawing boxes can be added here for visual feedback
			}
		});
	}

	export function restart() {
		status = 'scanning';
		initScanner();
	}
</script>

<div class="scanner-container">
	<video
		bind:this={videoElement}
		class="scanner-video"
		playsinline
		muted
		autoplay
	></video>
	
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

	.scanner-video {
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
