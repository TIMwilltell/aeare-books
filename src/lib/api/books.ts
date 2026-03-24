export interface BookLookupResult {
	success: boolean;
	data?: {
		title: string;
		author: string;
		coverUrl?: string;
	};
	error?: string;
}

export async function lookupBook(isbn: string): Promise<BookLookupResult> {
	try {
		const response = await fetch(`/api/books?isbn=${encodeURIComponent(isbn)}`);
		if (!response.ok) {
			if (response.status === 404) {
				return { success: false, error: 'Book not found' };
			}
			return { success: false, error: 'Lookup failed' };
		}
		const data = await response.json();
		return { success: true, data };
	} catch {
		return { success: false, error: 'Network error' };
	}
}
