import { fetchAll } from './client';
import type { Group } from '$lib/types';

export async function getGroups(): Promise<Group[]> {
	return fetchAll<Group>('/api/groups/');
}
