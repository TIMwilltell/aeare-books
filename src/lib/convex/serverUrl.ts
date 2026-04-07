import { env } from '$env/dynamic/private';

export function getServerConvexUrl(): string {
	const url = env.PUBLIC_CONVEX_URL ?? env.VITE_CONVEX_URL;

	if (!url) {
		throw new Error('Missing Convex URL. Set PUBLIC_CONVEX_URL (or VITE_CONVEX_URL) before handling dev inbox requests.');
	}

	return url;
}
