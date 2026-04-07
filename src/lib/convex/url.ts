import { env } from '$env/dynamic/public';

export function getPublicConvexUrl(): string {
	const url = env.PUBLIC_CONVEX_URL || import.meta.env.VITE_CONVEX_URL;

	if (!url) {
		throw new Error('Missing Convex URL. Set PUBLIC_CONVEX_URL (or VITE_CONVEX_URL) before starting the app.');
	}

	return url;
}
