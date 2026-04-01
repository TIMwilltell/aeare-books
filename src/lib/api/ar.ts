export interface ArLookupResult {
	success: boolean;
	data?: {
		arLevel: number;
		arPoints: number;
		source: 'cache' | 'bookroo' | 'scrape';
	};
	error?: string;
}

export async function lookupAr(isbn: string): Promise<ArLookupResult> {
	try {
		const response = await fetch(`/api/ar?isbn=${encodeURIComponent(isbn)}`);
		const data = await response.json();

		if (!response.ok) {
			return { success: false, error: data.error || 'AR lookup failed' };
		}

		return {
			success: true,
			data: {
				arLevel: data.arLevel,
				arPoints: data.arPoints,
				source: data.source
			}
		};
	} catch {
		return { success: false, error: 'Network error during AR lookup' };
	}
}
