// Quagga barcode scanner type declarations

declare module 'quagga' {
	interface QuaggaConfig {
		inputStream: {
			type: string;
			target: HTMLElement;
			constraints: {
				facingMode: string;
				width: { min: number; ideal: number; max: number };
				height: { min: number; ideal: number; max: number };
			};
			// Scan area configuration (percentage-based)
			area?: {
				top: string;
				right: string;
				bottom: string;
				left: string;
			};
		};
		locator: {
			patchSize: string;
			halfSample: boolean;
		};
		decoder: {
			readers: string[];
		};
		locate: boolean;
		frequency?: number;
		numOfWorkers?: number;
		debug?: {
			drawBoundingBox?: boolean;
			showFrequency?: boolean;
			showPattern?: boolean;
			showPatches?: boolean;
			showFoundPatches?: boolean;
		};
	}

	interface CodeResult {
		code: string;
		format?: string;
	}

	interface Result {
		codeResult: CodeResult;
	}

	interface ProcessingResult {
		boxes?: string[][];
		codeResult?: CodeResult;
		err?: Error;
		[x: string]: unknown;
	}

	export function init(
		config: QuaggaConfig,
		callback: (err: Error | null) => void
	): void;
	export function start(): void;
	export function stop(): void;
	export function onDetected(callback: (result: Result) => void): void;
	export function onProcessed(callback: (result: ProcessingResult | undefined) => void): void;
}
