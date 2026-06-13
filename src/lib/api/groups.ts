import { get, type PagedResponse } from './client';
import type { Group } from '$lib/types';

export async function getGroups(): Promise<PagedResponse<Group>> {
	return get('/api/groups/?page_size=200');
}
