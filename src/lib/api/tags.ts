import { get, type PagedResponse } from './client';
import type { Tag } from '$lib/types';

export async function getTags(): Promise<PagedResponse<Tag>> {
	return get('/api/tags/?page_size=200');
}
