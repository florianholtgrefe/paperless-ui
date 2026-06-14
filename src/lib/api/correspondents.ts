import { fetchAll } from './client';
import type { Correspondent } from '$lib/types';

export async function getCorrespondents(): Promise<Correspondent[]> {
	return fetchAll<Correspondent>('/api/correspondents/');
}
