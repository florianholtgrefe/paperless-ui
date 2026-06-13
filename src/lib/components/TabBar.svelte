<script lang="ts">
	import { tabStore } from '$lib/stores/tabs.svelte';
	import X from 'lucide-svelte/icons/x';
	import Files from 'lucide-svelte/icons/files';
	import FileText from 'lucide-svelte/icons/file-text';
</script>

{#if tabStore.tabs.length > 0}
<div class="flex items-end gap-0 border-b border-gray-200 bg-gray-50 px-4 overflow-x-auto">
	{#each tabStore.tabs as tab (tab.id)}
		{@const active = tab.id === tabStore.activeId}
		<button
			onclick={() => tabStore.activate(tab.id)}
			class="group relative flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-t border-l border-r transition-colors
				{active
				? 'bg-white border-gray-200 text-gray-900 -mb-px rounded-t-lg z-10'
				: 'bg-transparent border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-t-lg'}"
		>
			{#if tab.type === 'documents'}
				<Files size={13} />
			{:else}
				<FileText size={13} />
			{/if}
			<span>{tab.label}</span>
			<span
				role="button"
				tabindex="0"
				aria-label="Tab schließen"
				onclick={(e) => { e.stopPropagation(); tabStore.close(tab.id); }}
				onkeydown={(e) => e.key === 'Enter' && tabStore.close(tab.id)}
				class="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
			>
				<X size={11} />
			</span>
		</button>
	{/each}
</div>
{/if}
