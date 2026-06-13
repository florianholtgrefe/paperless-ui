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

const PAPERLESS_URL = import.meta.env.VITE_PAPERLESS_URL ?? '';

export function shareUrl(slug: string): string {
	return `${PAPERLESS_URL}/share/${slug}`;
}
