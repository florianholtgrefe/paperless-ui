<script lang="ts">
	import { onMount } from 'svelte';
	import type { Document } from '$lib/types';
	import { thumbnailUrl, downloadUrl, fetchBlob } from '$lib/api/index';

	let { doc, ondetail }: { doc: Document; ondetail: (doc: Document) => void } = $props();

	let thumbSrc = $state('');

	onMount(() => {
		fetchBlob(thumbnailUrl(doc.id)).then((blob) => {
			if (blob) thumbSrc = URL.createObjectURL(blob);
		});
		return () => { if (thumbSrc) URL.revokeObjectURL(thumbSrc); };
	});

	function formatDate(iso: string | undefined) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}
</script>

<div class="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
	<!-- Preview -->
	<div class="relative h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
		{#if thumbSrc}
			<img src={thumbSrc} alt="Vorschau {doc.title}" class="h-full w-full object-cover object-top" />
		{:else}
			<svg class="h-8 w-8 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
			</svg>
		{/if}
	</div>

	<!-- Tags -->
	{#if doc.tag_objects && doc.tag_objects.length > 0}
		<div class="flex flex-wrap gap-1 px-3 pt-2">
			{#each doc.tag_objects as tag}
				<span
					class="rounded-full px-2 py-0.5 text-xs font-medium"
					style="background-color: {tag.color}; color: {tag.text_color}"
				>
					{tag.name}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Metadaten -->
	<div class="flex flex-1 flex-col px-3 py-2">
		<p class="mb-2 text-sm font-medium text-gray-900 line-clamp-2 leading-snug">{doc.title}</p>

		<dl class="grid grid-cols-[16px_1fr] gap-x-2 gap-y-1 text-xs">
			<!-- Korrespondent -->
			<dt class="flex items-center text-gray-400">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
				</svg>
			</dt>
			<dd class="truncate text-gray-600 self-center">{doc.correspondent_name ?? '—'}</dd>

			<!-- Dokumenttyp -->
			<dt class="flex items-center text-gray-400">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
				</svg>
			</dt>
			<dd class="truncate text-gray-600 self-center">{doc.document_type_name ?? '—'}</dd>

			<!-- Ausstellungsdatum -->
			<dt class="flex items-center text-gray-400">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
				</svg>
			</dt>
			<dd class="text-gray-600 self-center">{formatDate(doc.created)}</dd>

			<!-- Eigentümer -->
			<dt class="flex items-center text-gray-400">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-4 w-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
				</svg>
			</dt>
			<dd class="truncate text-gray-600 self-center">{doc.owner_name ?? '—'}</dd>
		</dl>
	</div>

	<!-- Aktionen -->
	<div class="flex gap-2 border-t border-gray-100 px-3 py-2">
		<button
			onclick={() => ondetail(doc)}
			class="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
		>
			Details
		</button>
		<a
			href={downloadUrl(doc.id)}
			download
			class="flex-1 rounded-lg bg-gray-900 py-1.5 text-center text-xs font-medium text-white hover:bg-gray-700 transition-colors"
		>
			Download
		</a>
	</div>
</div>
