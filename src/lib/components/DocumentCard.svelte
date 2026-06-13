<script lang="ts">
	import { onMount } from 'svelte';
	import User from 'lucide-svelte/icons/user';
	import File from 'lucide-svelte/icons/file';
	import UserLock from 'lucide-svelte/icons/user-lock';
	import Calendar1 from 'lucide-svelte/icons/calendar-1';
	import Files from 'lucide-svelte/icons/files';
	import type { Document } from '$lib/types';
	import { thumbnailUrl, downloadUrl, fetchBlob } from '$lib/api/index';

	let { doc, ondetail }: { doc: Document; ondetail: (doc: Document) => void } = $props();

	let thumbSrc = $state('');
	let downloading = $state(false);

	onMount(() => {
		fetchBlob(thumbnailUrl(doc.id)).then((blob) => {
			if (blob) thumbSrc = URL.createObjectURL(blob);
		});
		return () => { if (thumbSrc) URL.revokeObjectURL(thumbSrc); };
	});

	async function download() {
		if (downloading) return;
		downloading = true;
		try {
			const blob = await fetchBlob(downloadUrl(doc.id));
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = doc.original_file_name ?? `document-${doc.id}`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			downloading = false;
		}
	}

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
			<File class="h-8 w-8 text-gray-200" />
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
			<dt class="flex items-center text-gray-400"><User size={14} /></dt>
			<dd class="truncate text-gray-600 self-center">{doc.correspondent_name ?? '—'}</dd>

			<dt class="flex items-center text-gray-400"><File size={14} /></dt>
			<dd class="truncate text-gray-600 self-center">{doc.document_type_name ?? '—'}</dd>

			<dt class="flex items-center text-gray-400"><Calendar1 size={14} /></dt>
			<dd class="text-gray-600 self-center">{formatDate(doc.created)}</dd>

			<dt class="flex items-center text-gray-400"><UserLock size={14} /></dt>
			<dd class="truncate text-gray-600 self-center">{doc.owner_name ?? '—'}</dd>

			<dt class="flex items-center text-gray-400"><Files size={14} /></dt>
			<dd class="text-gray-600 self-center">Seiten: {doc.page_count ?? '—'}</dd>
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
		<button
			onclick={download}
			disabled={downloading}
			class="flex-1 rounded-lg bg-gray-900 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
		>
			{downloading ? '…' : 'Download'}
		</button>
	</div>
</div>
