<script lang="ts">
	import { onMount } from 'svelte';
	import { getDocuments, getTags, getCorrespondents, getDocumentTypes, getUsers } from '$lib/api/index';
	import DocumentCard from '$lib/components/DocumentCard.svelte';
	import { tabStore } from '$lib/stores/tabs.svelte';
	import type { Document, Tag, Correspondent, DocumentType, User } from '$lib/types';

	let documents: Document[] = $state([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let error = $state('');
	let nextUrl: string | null = $state(null);
	let totalCount: number = $state(0);
	let sentinel: HTMLDivElement | undefined = $state();

	let tagMap = new Map<number, Tag>();
	let corrMap = new Map<number, string>();
	let docTypeMap = new Map<number, string>();
	let userMap = new Map<number, string>();

	function displayName(u: User): string {
		const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
		return full || u.username;
	}

	function enrich(raw: Document[]): Document[] {
		return raw.map((doc) => ({
			...doc,
			correspondent_name: doc.correspondent ? corrMap.get(doc.correspondent) : undefined,
			document_type_name: doc.document_type ? docTypeMap.get(doc.document_type) : undefined,
			tag_objects: doc.tags.map((id) => tagMap.get(id)).filter(Boolean) as Tag[],
			owner_name: doc.owner ? userMap.get(doc.owner) : undefined,
		}));
	}

	async function loadMore() {
		if (!nextUrl || loadingMore) return;
		loadingMore = true;
		try {
			const res = await getDocuments(nextUrl);
			documents = [...documents, ...enrich(res.results)];
			nextUrl = res.next;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Fehler beim Nachladen';
		} finally {
			loadingMore = false;
		}
	}

	onMount(() => {
		async function init() {
			try {
				const [docsRes, tags, corrs, docTypes, users] = await Promise.all([
					getDocuments(),
					getTags(),
					getCorrespondents(),
					getDocumentTypes(),
					getUsers().catch(() => [] as User[]),
				]);

				tagMap = new Map(tags.map((t: Tag) => [t.id, t]));
				corrMap = new Map(corrs.map((c: Correspondent) => [c.id, c.name]));
				docTypeMap = new Map(docTypes.map((d: DocumentType) => [d.id, d.name]));
				userMap = new Map(users.map((u: User) => [u.id, displayName(u)]));

				documents = enrich(docsRes.results);
				nextUrl = docsRes.next;
				totalCount = docsRes.count;
			} catch (e) {
				error = e instanceof Error ? e.message : 'Unbekannter Fehler';
			} finally {
				loading = false;
			}
		}

		init();
	});

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => { if (entries[0].isIntersecting) loadMore(); },
			{ rootMargin: '200px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<div class="flex-1 overflow-y-auto px-6 pb-6">
	<div class="sticky top-0 z-10 mb-6 flex items-center justify-between border-b border-gray-100 bg-white py-3">
		<h1 class="text-base font-semibold text-gray-900">Dokumente</h1>
		{#if !loading && totalCount > 0}
			<span class="text-sm text-gray-400">{documents.length} von {totalCount}</span>
		{/if}
	</div>

	{#if loading}
		<div class="flex flex-col items-center justify-center gap-3 py-24">
			<svg class="h-6 w-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
			</svg>
			<span class="text-sm text-gray-400">Dokumente werden geladen…</span>
		</div>
	{:else if error}
		<p class="text-sm text-red-500">{error}</p>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
			{#each documents as doc (doc.id)}
				<DocumentCard {doc} ondetail={(d) => tabStore.open(d)} />
			{/each}
		</div>

		<div bind:this={sentinel} class="flex h-16 items-center justify-center">
			{#if loadingMore}
				<svg class="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
				</svg>
			{:else if !nextUrl}
				<span class="text-sm text-gray-300">Alle {totalCount} Dokumente geladen</span>
			{/if}
		</div>
	{/if}
</div>
