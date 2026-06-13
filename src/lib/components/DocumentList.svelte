<script lang="ts">
	import type { Document } from '$lib/types';

	let {
		documents,
		selectedId,
		onselect,
	}: {
		documents: Document[];
		selectedId: number | null;
		onselect: (doc: Document) => void;
	} = $props();

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}
</script>

<div class="flex h-full flex-col overflow-y-auto">
	{#if documents.length === 0}
		<p class="p-6 text-sm text-gray-400">Keine Dokumente gefunden.</p>
	{:else}
		{#each documents as doc}
			<button
				onclick={() => onselect(doc)}
				class="flex w-full flex-col gap-1 border-b border-gray-100 px-4 py-3 text-left transition-colors
					{selectedId === doc.id ? 'bg-blue-50' : 'hover:bg-gray-50'}"
			>
				<span class="text-sm font-medium text-gray-900 line-clamp-2">{doc.title}</span>
				<div class="flex items-center gap-2 text-xs text-gray-400">
					<span>{formatDate(doc.created)}</span>
					{#if doc.correspondent_name}
						<span>·</span>
						<span>{doc.correspondent_name}</span>
					{/if}
				</div>
				{#if doc.tag_names && doc.tag_names.length > 0}
					<div class="flex flex-wrap gap-1 mt-1">
						{#each doc.tag_names as tag}
							<span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">{tag}</span>
						{/each}
					</div>
				{/if}
			</button>
		{/each}
	{/if}
</div>
