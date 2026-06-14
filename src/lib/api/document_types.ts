import { fetchAll } from './client';
import type { DocumentType } from '$lib/types';

export async function getDocumentTypes(): Promise<DocumentType[]> {
	return fetchAll<DocumentType>('/api/document_types/');
}
