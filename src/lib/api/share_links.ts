import { get, BASE, authHeader } from './client';

export interface ShareLink {
	id: number;
	slug: string;
	expiration: string | null;
	file_version: 'archive' | 'original';
	document: number;
}

export async function getShareLinks(documentId: number): Promise<ShareLink[]> {
	const res = await get<{ results: ShareLink[] }>(`/api/share_links/?document=${documentId}`);
	return res.results;
}

export async function createShareLink(payload: {
	document: number;
	expiration: string | null;
	file_version: 'archive' | 'original';
}): Promise<ShareLink> {
	const res = await fetch(`${BASE}/api/share_links/`, {
		method: 'POST',
		headers: { ...authHeader(), 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});
	if (!res.ok) throw new Error(`API error ${res.status}`);
	return res.json();
}

export async function deleteShareLink(id: number): Promise<void> {
	const res = await fetch(`${BASE}/api/share_links/${id}/`, {
		method: 'DELETE',
		headers: authHeader(),
	});
	if (!res.ok) throw new Error(`API error ${res.status}`);
}

// Share links route through our own app (/share/{slug}) so the browser
// never needs direct access to the paperless-ngx instance.
// Dev: Vite proxies /share → paperless. Prod: nginx does the same.
export function shareUrl(slug: string): string {
	return `${window.location.origin}/share/${slug}`;
}
