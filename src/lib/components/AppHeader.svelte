<script lang="ts">
	import { authStore } from '$lib/stores/auth.svelte';
	import Bell from 'lucide-svelte/icons/bell';
	import Search from 'lucide-svelte/icons/search';
	import LogOut from 'lucide-svelte/icons/log-out';

	const user = $derived(authStore.user);

	function displayName(u: typeof user) {
		if (!u) return '';
		const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
		return full || u.username;
	}

	let userMenuOpen = $state(false);
	let menuEl = $state<HTMLDivElement | null>(null);

	function onDocClick(e: MouseEvent) {
		if (userMenuOpen && menuEl && !menuEl.contains(e.target as Node)) {
			userMenuOpen = false;
		}
	}
</script>

<svelte:document onclick={onDocClick} />

<header class="flex h-11 shrink-0 items-center border-b border-gray-200 bg-white px-4 gap-4">
	<!-- Left: spacer -->
	<div class="flex-1"></div>

	<!-- Center: search -->
	<div class="flex w-80 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-400">
		<Search size={13} class="shrink-0" />
		<span>Suchen…</span>
	</div>

	<!-- Right: icons + user -->
	<div class="flex flex-1 items-center justify-end gap-2">
		<!-- Notifications (dummy) -->
		<button class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Benachrichtigungen">
			<Bell size={16} />
		</button>

		<!-- User menu -->
		<div bind:this={menuEl} class="relative">
			<button
				onclick={() => userMenuOpen = !userMenuOpen}
				class="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
			>
				<span class="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[10px] font-semibold text-white">
					{(user?.first_name?.[0] ?? user?.username?.[0] ?? '?').toUpperCase()}
				</span>
				<span>{displayName(user)}</span>
			</button>

			{#if userMenuOpen}
				<div class="absolute right-0 top-full mt-1 w-44 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
					<div class="border-b border-gray-100 px-3 py-2.5">
						<p class="text-xs font-medium text-gray-900">{displayName(user)}</p>
						<p class="text-[11px] text-gray-400">{user?.username}</p>
					</div>
					<button
						onclick={() => { userMenuOpen = false; authStore.logout(); }}
						class="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
					>
						<LogOut size={13} />
						Abmelden
					</button>
				</div>
			{/if}
		</div>
	</div>
</header>
