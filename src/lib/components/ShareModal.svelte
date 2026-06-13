<script lang="ts">
	import { onMount } from 'svelte';
	import { getShareLinks, createShareLink, deleteShareLink, shareUrl } from '$lib/api/index';
	import type { ShareLink } from '$lib/api/share_links';
	import X from 'lucide-svelte/icons/x';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import Copy from 'lucide-svelte/icons/copy';
	import Check from 'lucide-svelte/icons/check';

	let { docId, onclose }: { docId: number; onclose: () => void } = $props();

	let links = $state<ShareLink[]>([]);
	let loading = $state(true);
	let creating = $state(false);
	let fileVersion = $state<'archive' | 'original'>('archive');
	let expiration = $state<string>('7');
	let copiedId = $state<number | null>(null);

	const expirationOptions = [
		{ value: '', label: 'Nie' },
		{ value: '1', label: '1 Tag' },
		{ value: '7', label: '7 Tage' },
		{ value: '30', label: '30 Tage' },
	];

	onMount(async () => {
		links = await getShareLinks(docId);
		loading = false;
	});

	function expirationIso(): string | null {
		if (!expiration) return null;
		const d = new Date();
		d.setDate(d.getDate() + parseInt(expiration, 10));
		return d.toISOString();
	}

	async function create() {
		creating = true;
		try {
			const link = await createShareLink({
				document: docId,
				expiration: expirationIso(),
				file_version: fileVersion,
			});
			links = [...links, link];
		} finally {
			creating = false;
		}
	}

	async function remove(id: number) {
		await deleteShareLink(id);
		links = links.filter((l) => l.id !== id);
	}

	async function copy(link: ShareLink) {
		await navigator.clipboard.writeText(shareUrl(link.slug));
		copiedId = link.id;
		setTimeout(() => { copiedId = null; }, 2000);
	}

	function formatExpiry(iso: string | null) {
		if (!iso) return 'Läuft nicht ab';
		return 'Läuft ab: ' + new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
	}
</script>

<!-- Overlay -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onmousedown={(e) => { if (e.target === e.currentTarget) onclose(); }}
>
	<div class="w-[480px] rounded-xl border border-gray-200 bg-white shadow-xl">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
			<h2 class="text-sm font-semibold text-gray-900">Linkfreigabe</h2>
			<button onclick={onclose} class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
				<X size={16} />
			</button>
		</div>

		<!-- Bestehende Links -->
		<div class="min-h-[60px] border-b border-gray-100">
			{#if loading}
				<div class="flex items-center justify-center py-5 text-xs text-gray-400">Lädt…</div>
			{:else if links.length === 0}
				<p class="py-5 text-center text-xs text-gray-400">Keine Links vorhanden</p>
			{:else}
				<ul class="divide-y divide-gray-100">
					{#each links as link (link.id)}
						<li class="flex items-center gap-3 px-5 py-3">
							<div class="flex flex-1 flex-col gap-0.5 min-w-0">
								<span class="truncate text-xs text-gray-700 font-mono">{shareUrl(link.slug)}</span>
								<span class="text-[11px] text-gray-400">{formatExpiry(link.expiration)} · {link.file_version === 'archive' ? 'Archiv' : 'Original'}</span>
							</div>
							<button aria-label="Link kopieren" onclick={() => copy(link)} class="shrink-0 rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
								{#if copiedId === link.id}
									<Check size={14} class="text-green-600" />
								{:else}
									<Copy size={14} />
								{/if}
							</button>
							<button aria-label="Link löschen" onclick={() => remove(link.id)} class="shrink-0 rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
								<Trash2 size={14} />
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Erstellen -->
		<div class="px-5 py-4 flex flex-col gap-3">
			<label class="flex items-center justify-between text-xs text-gray-700">
				Archiv-Version freigeben
				<button
					role="switch"
					aria-label="Archiv-Version freigeben"
					aria-checked={fileVersion === 'archive'}
					onclick={() => fileVersion = fileVersion === 'archive' ? 'original' : 'archive'}
					class="relative h-5 w-9 rounded-full transition-colors {fileVersion === 'archive' ? 'bg-gray-900' : 'bg-gray-300'}"
				>
					<span class="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform {fileVersion === 'archive' ? 'translate-x-4' : 'translate-x-0'}"></span>
				</button>
			</label>

			<div class="flex items-center gap-2">
				<span class="text-xs text-gray-500 shrink-0">Läuft ab:</span>
				<select
					bind:value={expiration}
					class="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
				>
					{#each expirationOptions as opt}
						<option value={opt.value}>{opt.label}</option>
					{/each}
				</select>
				<button
					onclick={create}
					disabled={creating}
					class="shrink-0 rounded-lg border border-gray-900 px-4 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors disabled:opacity-50"
				>
					{creating ? '…' : '+ Erstellen'}
				</button>
			</div>
		</div>
	</div>
</div>
