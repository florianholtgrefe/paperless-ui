<script lang="ts">
	import { page } from '$app/state';
	import Files from 'lucide-svelte/icons/files';
	import Tag from 'lucide-svelte/icons/tag';
	import User from 'lucide-svelte/icons/user';
	import Settings from 'lucide-svelte/icons/settings';

	const links = [
		{ href: '/', label: 'Dokumente', icon: Files },
		{ href: '/tags', label: 'Tags', icon: Tag },
		{ href: '/correspondents', label: 'Korrespondenten', icon: User },
		{ href: '/settings', label: 'Einstellungen', icon: Settings },
	];
</script>

<nav class="flex h-screen w-56 flex-col border-r border-gray-200 bg-gray-50 px-3 py-6">
	<div class="mb-8 px-2">
		<span class="text-lg font-semibold text-gray-900">paperless</span>
	</div>

	<ul class="flex flex-col gap-1">
		{#each links as link}
			<li>
				<a
					href={link.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors
						{page.url.pathname === link.href
						? 'bg-gray-200 font-medium text-gray-900'
						: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}"
				>
					<link.icon size={16} />
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
