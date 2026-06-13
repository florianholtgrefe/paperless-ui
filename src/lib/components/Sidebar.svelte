<script lang="ts">
	import { tabStore } from '$lib/stores/tabs.svelte';
	import Files from 'lucide-svelte/icons/files';
	import Tag from 'lucide-svelte/icons/tag';
	import User from 'lucide-svelte/icons/user';
	import Settings from 'lucide-svelte/icons/settings';

	const links = [
		{ label: 'Dokumente', icon: Files, action: () => tabStore.openDocuments() },
		{ label: 'Tags', icon: Tag, action: () => {} },
		{ label: 'Korrespondenten', icon: User, action: () => {} },
		{ label: 'Einstellungen', icon: Settings, action: () => {} },
	];
</script>

<nav class="flex h-screen w-56 flex-col border-r border-gray-200 bg-gray-50 px-3 py-6">
	<div class="mb-8 px-2">
		<span class="text-lg font-semibold text-gray-900">paperless</span>
	</div>

	<ul class="flex flex-col gap-1">
		{#each links as link}
			<li>
				<button
					onclick={link.action}
					class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
				>
					<link.icon size={16} />
					{link.label}
				</button>
			</li>
		{/each}
	</ul>
</nav>
