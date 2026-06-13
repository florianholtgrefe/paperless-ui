import { get, type PagedResponse } from './client';
import type { User } from '$lib/types';

export async function getUsers(): Promise<PagedResponse<User>> {
	return get('/api/users/?page_size=200');
}
