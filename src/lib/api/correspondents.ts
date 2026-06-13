import { get, type PagedResponse } from './client';
import type { Correspondent } from '$lib/types';

export async function getCorrespondents(): Promise<PagedResponse<Correspondent>> {
	return get('/api/correspondents/?page_size=200');
}
