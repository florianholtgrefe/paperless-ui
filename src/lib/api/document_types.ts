import { get, type PagedResponse } from './client';
import type { DocumentType } from '$lib/types';

export async function getDocumentTypes(): Promise<PagedResponse<DocumentType>> {
	return get('/api/document_types/?page_size=200');
}
