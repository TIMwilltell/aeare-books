import { fetchAccessToken } from '$lib/auth/auth0';
import { getBrowserConvexClient } from '$lib/convex/client';
import { api } from '../../convex/_generated/api';

export interface ExportData {
	exportedAt: string;
	version: '1.0';
	books: any[];
	progressEvents: any[];
}

export async function exportLibrary(): Promise<void> {
	const client = getBrowserConvexClient();
	const accessToken = await fetchAccessToken({ forceRefreshToken: true });
	if (!accessToken) {
		throw new Error('Sign in again before exporting your library.');
	}

	let books;
	try {
		books = await client.query(api.books.getAll, {});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Export failed.';
		throw new Error(`Could not export your library: ${message}`);
	}

	const exportData: ExportData = {
		exportedAt: new Date().toISOString(),
		version: '1.0',
		books: (books ?? []).map((b: any) => ({
			...b,
			readDate: b.readDate ? new Date(b.readDate).toISOString() : null,
			quizDate: b.quizDate ? new Date(b.quizDate).toISOString() : null,
			createdAt: new Date(b.createdAt).toISOString(),
			updatedAt: new Date(b.updatedAt).toISOString(),
		})),
		progressEvents: [],
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
