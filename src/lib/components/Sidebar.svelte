<script lang="ts">
	import { page } from '$app/state';

	const links = [
		{ href: '/', label: 'Dokumente', icon: '📄' },
		{ href: '/tags', label: 'Tags', icon: '🏷️' },
		{ href: '/correspondents', label: 'Korrespondenten', icon: '👤' },
		{ href: '/settings', label: 'Einstellungen', icon: '⚙️' },
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
					<span>{link.icon}</span>
					{link.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
