<script lang="ts">
	import type { Document } from '$lib/types';

	let { doc }: { doc: Document | null } = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}
</script>

<div class="flex h-full flex-col p-6">
	{#if !doc}
		<div class="flex flex-1 items-center justify-center text-sm text-gray-400">
			Dokument auswählen
		</div>
	{:else}
		<h1 class="mb-4 text-base font-semibold text-gray-900">{doc.title}</h1>

		<dl class="mb-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			<dt class="text-gray-400">Datum</dt>
			<dd class="text-gray-700">{formatDate(doc.created)}</dd>

			{#if doc.correspondent_name}
				<dt class="text-gray-400">Korrespondent</dt>
				<dd class="text-gray-700">{doc.correspondent_name}</dd>
			{/if}

			{#if doc.original_file_name}
				<dt class="text-gray-400">Datei</dt>
				<dd class="truncate text-gray-700">{doc.original_file_name}</dd>
			{/if}

			{#if doc.tag_names && doc.tag_names.length > 0}
				<dt class="text-gray-400">Tags</dt>
				<dd class="flex flex-wrap gap-1">
					{#each doc.tag_names as tag}
						<span class="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
					{/each}
				</dd>
			{/if}
		</dl>

		{#if doc.content}
			<div class="border-t border-gray-100 pt-4">
				<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Inhalt</p>
				<p class="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{doc.content}</p>
			</div>
		{/if}
	{/if}
</div>
