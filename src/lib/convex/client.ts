import { browser } from '$app/environment';
import { ConvexClient } from 'convex/browser';
import { getPublicConvexUrl } from './url';

let browserConvexClient: ConvexClient | null = null;

export function getBrowserConvexClient(): ConvexClient {
	if (!browserConvexClient) {
		browserConvexClient = new ConvexClient(getPublicConvexUrl(), {
			disabled: !browser,
		});
	}

	return browserConvexClient;
}
