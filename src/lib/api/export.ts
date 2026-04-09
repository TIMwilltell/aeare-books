import { fetchAccessToken } from '$lib/auth/auth0';
import { getBrowserConvexClient } from '$lib/convex/client';
import { api } from '../../convex/_generated/api';

export interface ExportData {
	exportedAt: string;
	version: '1.0';
	books: any[];
	progressEvents: any[];
}

function toIsoString(value: number | null | undefined) {
	return value ? new Date(value).toISOString() : null;
}

export async function exportLibrary(): Promise<void> {
	const client = getBrowserConvexClient();
	client.setAuth(fetchAccessToken);
	const accessToken = await fetchAccessToken({ forceRefreshToken: true });
	if (!accessToken) {
		throw new Error('Sign in again before exporting your library.');
	}

	let books;
	let progressEvents;
	try {
		[books, progressEvents] = await Promise.all([
			client.query(api.books.getAll, {}),
			client.query(api.progress.getAll, {})
		]);
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Export failed.';
		throw new Error(`Could not export your library: ${message}`);
	}

	const exportData: ExportData = {
		exportedAt: new Date().toISOString(),
		version: '1.0',
		books: (books ?? []).map((b: any) => ({
			...b,
			readDate: toIsoString(b.readDate),
			quizDate: toIsoString(b.quizDate),
			createdAt: new Date(b.createdAt).toISOString(),
			updatedAt: new Date(b.updatedAt).toISOString(),
		})),
		progressEvents: (progressEvents ?? []).map((event: any) => ({
			...event,
			eventDate: new Date(event.eventDate).toISOString(),
			createdAt: new Date(event.createdAt).toISOString()
		}))
	};

	const jsonString = JSON.stringify(exportData, null, 2);
	const blob = new Blob([jsonString], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const link = document.createElement('a');
	link.href = url;
	link.download = `aeare-library-${new Date().toISOString().split('T')[0]}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
