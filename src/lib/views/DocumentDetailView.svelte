<script lang="ts">
	import type { Document } from '$lib/types';
	import { downloadUrl, fetchBlob } from '$lib/api/index';
	import User from 'lucide-svelte/icons/user';
	import File from 'lucide-svelte/icons/file';
	import UserLock from 'lucide-svelte/icons/user-lock';
	import Calendar1 from 'lucide-svelte/icons/calendar-1';
	import Files from 'lucide-svelte/icons/files';

	let { doc }: { doc: Document } = $props();

	let downloading = $state(false);

	function formatDate(iso: string | undefined) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}

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
</script>

<div class="flex flex-1 overflow-hidden">
	<!-- PDF Vorschau -->
	<div class="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-6">
		<iframe
			src="{downloadUrl(doc.id)}#toolbar=0"
			title="Dokumentvorschau"
			class="w-full h-full min-h-[800px] rounded-lg border border-gray-200 bg-white shadow-sm"
		></iframe>
	</div>

	<!-- Metadaten Panel -->
	<div class="w-72 flex-shrink-0 border-l border-gray-200 bg-white overflow-y-auto">
		<div class="border-b border-gray-100 px-5 py-4">
			<h2 class="text-sm font-semibold text-gray-900 leading-snug">{doc.title}</h2>
		</div>

		<div class="px-5 py-4 flex flex-col gap-4">
			<!-- Tags -->
			{#if doc.tag_objects && doc.tag_objects.length > 0}
				<div>
					<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Tags</p>
					<div class="flex flex-wrap gap-1">
						{#each doc.tag_objects as tag}
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium"
								style="background-color: {tag.color}; color: {tag.text_color}"
							>{tag.name}</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Metadaten -->
			<div>
				<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Details</p>
				<dl class="grid grid-cols-[16px_1fr] gap-x-2 gap-y-2 text-xs">
					<dt class="flex items-center text-gray-400"><User size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.correspondent_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><File size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.document_type_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><Calendar1 size={14} /></dt>
					<dd class="text-gray-700 self-center">{formatDate(doc.created)}</dd>

					<dt class="flex items-center text-gray-400"><UserLock size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.owner_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><Files size={14} /></dt>
					<dd class="text-gray-700 self-center">Seiten: {doc.page_count ?? '—'}</dd>
				</dl>
			</div>

			<!-- Dateiname -->
			{#if doc.original_file_name}
				<div>
					<p class="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Datei</p>
					<p class="text-xs text-gray-600 break-all">{doc.original_file_name}</p>
				</div>
			{/if}

			<button
				onclick={download}
				disabled={downloading}
				class="w-full rounded-lg bg-gray-900 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
			>
				{downloading ? 'Wird heruntergeladen…' : 'Download'}
			</button>
		</div>
	</div>
</div>
