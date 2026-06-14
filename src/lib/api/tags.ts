import { fetchAll } from './client';
import type { Tag } from '$lib/types';

export async function getTags(): Promise<Tag[]> {
	return fetchAll<Tag>('/api/tags/');
}
