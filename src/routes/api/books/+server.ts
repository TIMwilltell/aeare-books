import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const OPEN_LIBRARY_SEARCH_API = 'https://openlibrary.org/search.json';

/**
 * Lookup book metadata from Open Library Search API
 * This gives us author names directly in the response
 */
async function lookupOpenLibrary(isbn: string): Promise<Response> {
	const url = `${OPEN_LIBRARY_SEARCH_API}?isbn=${isbn}`;
	return fetch(url);
}

export const GET: RequestHandler = async ({ url }) => {
	const isbn = url.searchParams.get('isbn');

	if (!isbn) {
		return json({ error: 'ISBN is required' }, { status: 400 });
	}

	// Clean the ISBN (remove hyphens and spaces)
	const cleanIsbn = isbn.replace(/[-\s]/g, '');

	try {
		const response = await lookupOpenLibrary(cleanIsbn);
		
		if (!response.ok) {
			if (response.status === 404) {
				return json({ error: 'Book not found' }, { status: 404 });
			}
			return json({ error: `Open Library lookup failed: ${response.status}` }, { status: response.status });
		}

		const data = await response.json();
		const book = parseOpenLibrarySearchResponse(data);
		
		if (book) {
			return json(book);
		}
		
		return json({ error: 'Book not found' }, { status: 404 });
	} catch (e) {
		return json({ error: 'Network error during lookup' }, { status: 500 });
	}
};

interface OpenLibrarySearchResponse {
	numFound: number;
	docs?: Array<{
		title: string;
		author_name?: string[];
		cover_i?: number;
		first_publish_year?: number;
	}>;
}

function parseOpenLibrarySearchResponse(data: OpenLibrarySearchResponse) {
	if (!data.numFound || !data.docs || data.docs.length === 0) {
		return null;
	}

	const doc = data.docs[0];
	
	if (!doc.title) {
		return null;
	}

	const title = doc.title;
	const author = doc.author_name?.[0] || 'Unknown Author';
	
	// Get cover URL from Open Library covers API
	let coverUrl: string | undefined;
	if (doc.cover_i) {
		coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
	}

	return {
		title,
		author,
		coverUrl,
		source: 'open-library' as const
	};
}
