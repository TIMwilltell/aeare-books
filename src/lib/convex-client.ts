import { setupConvex } from 'convex-svelte';
import { browser } from '$app/environment';

if (browser) {
	setupConvex(import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud');
}
