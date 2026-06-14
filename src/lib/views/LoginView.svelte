<script lang="ts">
	import { login } from '$lib/api/auth';
	import { authStore } from '$lib/stores/auth.svelte';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!username || !password) return;
		loading = true;
		error = null;
		try {
			const { token, user } = await login(username, password);
			authStore.login(token, user);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex h-screen items-center justify-center bg-gray-50">
	<div class="w-full max-w-sm">
		<!-- Logo / Wordmark -->
		<div class="mb-8 text-center">
			<span class="text-2xl font-semibold text-gray-900">paperless ui</span>
		</div>

		<form onsubmit={submit} class="rounded-xl border border-gray-200 bg-white px-8 py-8 shadow-sm flex flex-col gap-5">
			<h1 class="text-sm font-semibold text-gray-900">Anmelden</h1>

			{#if error}
				<p class="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
			{/if}

			<div class="flex flex-col gap-1.5">
				<label for="username" class="text-xs font-medium text-gray-500">Benutzername</label>
				<input
					id="username"
					type="text"
					bind:value={username}
					autocomplete="username"
					class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
					placeholder="Benutzername"
					disabled={loading}
				/>
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="password" class="text-xs font-medium text-gray-500">Passwort</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					autocomplete="current-password"
					class="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
					placeholder="Passwort"
					disabled={loading}
				/>
			</div>

			<button
				type="submit"
				disabled={loading || !username || !password}
				class="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
			>
				{loading ? 'Wird angemeldet…' : 'Anmelden'}
			</button>
		</form>
	</div>
</div>
