import { BASE } from './client';
import type { AuthUser } from '$lib/stores/auth.svelte';

export async function login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
	const res = await fetch(`${BASE}/api/token/`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username, password }),
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body?.non_field_errors?.[0] ?? 'Anmeldung fehlgeschlagen.');
	}
	const { token } = await res.json();

	// Fetch user info
	const settingsRes = await fetch(`${BASE}/api/ui_settings/`, {
		headers: { Authorization: `Token ${token}` },
	});
	if (!settingsRes.ok) throw new Error('Benutzerdaten konnten nicht geladen werden.');
	const settings = await settingsRes.json();

	const u = settings.user;
	const user: AuthUser = {
		id: u.id,
		username: u.username,
		first_name: u.first_name ?? '',
		last_name: u.last_name ?? '',
		is_staff: u.is_staff,
		is_superuser: u.is_superuser,
	};

	return { token, user };
}
