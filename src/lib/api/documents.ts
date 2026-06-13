import { get, BASE, fetchBlob, type PagedResponse } from './client';
import type { Document } from '$lib/types';

export async function getDocuments(nextUrl?: string | null): Promise<PagedResponse<Document>> {
	const path = nextUrl
		? new URL(nextUrl).pathname + new URL(nextUrl).search
		: '/api/documents/?page_size=50';
	return get(path);
}

export async function getDocument(id: number): Promise<Document> {
	return get(`/api/documents/${id}/`);
}

export function thumbnailUrl(id: number): string {
	return `${BASE}/api/documents/${id}/thumb/`;
}

export function downloadUrl(id: number): string {
	return `${BASE}/api/documents/${id}/download/`;
}

export { fetchBlob };
