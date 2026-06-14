import { fetchAll } from './client';
import type { User } from '$lib/types';

export async function getUsers(): Promise<User[]> {
	return fetchAll<User>('/api/users/');
}
