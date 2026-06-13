import { get, BASE, fetchBlob, type PagedResponse } from './client';
import type { Document } from '$lib/types';

export async function getDocuments(nextUrl?: string | null): Promise<PagedResponse<Document>> {
	const path = nextUrl
		? new URL(nextUrl).pathname + new URL(nextUrl).search
		: '/api/documents/?page_size=50';
	return get(path);
}

export async function getDocument(id: number): Promise<Document> {
	return get(`/api/documents/${id}/?full_perms=true`);
}

export interface DocumentMetadataEntry {
	namespace: string;
	prefix: string;
	key: string;
	value: string;
}

export interface DocumentMetadata {
	original_checksum: string;
	original_size: number;
	original_mime_type: string;
	original_filename: string;
	media_filename: string;
	has_archive_version: boolean;
	archive_checksum: string | null;
	archive_size: number | null;
	archive_media_filename: string | null;
	lang: string | null;
	original_metadata: DocumentMetadataEntry[];
	archive_metadata: DocumentMetadataEntry[];
}

export async function getDocumentMetadata(id: number): Promise<DocumentMetadata> {
	return get(`/api/documents/${id}/metadata/`);
}

export interface HistoryActor {
	id: number;
	username: string;
	first_name?: string;
	last_name?: string;
}

export interface HistoryEntry {
	id: number;
	timestamp: string;
	actor: HistoryActor | null;
	verb: string;
	action: 0 | 1 | 2; // 0=create, 1=update, 2=delete
	changes: Record<string, [unknown, unknown]> | null;
}

export async function getDocumentHistory(id: number): Promise<HistoryEntry[]> {
	return get(`/api/documents/${id}/history/`);
}

export interface DocumentPatch {
	title?: string;
	correspondent?: number | null;
	document_type?: number | null;
	created?: string;
	tags?: number[];
	owner?: number | null;
}

export async function patchDocument(id: number, data: DocumentPatch): Promise<Document> {
	const { BASE, authHeader } = await import('./client');
	const res = await fetch(`${BASE}/api/documents/${id}/`, {
		method: 'PATCH',
		headers: { ...authHeader(), 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});
	if (!res.ok) throw new Error(`API error ${res.status}`);
	return res.json();
}

export function thumbnailUrl(id: number): string {
	return `${BASE}/api/documents/${id}/thumb/`;
}

export function downloadUrl(id: number): string {
	return `${BASE}/api/documents/${id}/download/`;
}

export { fetchBlob };
