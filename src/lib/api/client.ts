export const BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_PAPERLESS_URL ?? '');

export function authHeader(): HeadersInit {
	const token = typeof localStorage !== 'undefined'
		? localStorage.getItem('paperless_token')
		: null;
	return token ? { Authorization: `Token ${token}` } : {};
}

export async function get<T>(path: string): Promise<T> {
	const res = await fetch(`${BASE}${path}`, { headers: authHeader() });
	if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
	return res.json();
}

export async function fetchBlob(url: string): Promise<Blob | null> {
	try {
		const res = await fetch(url, { headers: authHeader() });
		if (!res.ok) return null;
		return res.blob();
	} catch {
		return null;
	}
}

export interface PagedResponse<T> {
	count: number;
	next: string | null;
	results: T[];
}

export async function fetchAll<T>(path: string): Promise<T[]> {
	let url: string | null = `${path}${path.includes('?') ? '&' : '?'}page_size=500`;
	const results: T[] = [];
	while (url) {
		const page: PagedResponse<T> = await get<PagedResponse<T>>(url);
		results.push(...page.results);
		url = page.next ? new URL(page.next).pathname + new URL(page.next).search : null;
	}
	return results;
}
