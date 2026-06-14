const TOKEN_KEY = 'paperless_token';
const USER_KEY = 'paperless_user';

export interface AuthUser {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	is_staff: boolean;
	is_superuser: boolean;
}

function createAuthStore() {
	let token = $state<string | null>(
		typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
	);
	let user = $state<AuthUser | null>(
		typeof localStorage !== 'undefined'
			? JSON.parse(localStorage.getItem(USER_KEY) ?? 'null')
			: null
	);

	return {
		get token() { return token; },
		get user() { return user; },
		get isLoggedIn() { return !!token; },

		login(newToken: string, newUser: AuthUser) {
			token = newToken;
			user = newUser;
			localStorage.setItem(TOKEN_KEY, newToken);
			localStorage.setItem(USER_KEY, JSON.stringify(newUser));
		},

		logout() {
			token = null;
			user = null;
			localStorage.removeItem(TOKEN_KEY);
			localStorage.removeItem(USER_KEY);
		},
	};
}

export const authStore = createAuthStore();
