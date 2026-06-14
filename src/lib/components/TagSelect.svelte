<script lang="ts">
	import { tick } from 'svelte';
	import type { Tag } from '$lib/types';
	import X from 'lucide-svelte/icons/x';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	let {
		value = $bindable<number[]>([]),
		options,
	}: {
		value: number[];
		options: Tag[];
	} = $props();

	let open = $state(false);
	let query = $state('');
	let highlighted = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);
	let containerEl = $state<HTMLDivElement | null>(null);

	const selectedTags = $derived(options.filter(t => value.includes(t.id)));
	const filtered = $derived(
		query.trim()
			? options.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
			: options
	);

	$effect(() => {
		query;
		highlighted = 0;
	});

	async function openDropdown() {
		open = true;
		query = '';
		highlighted = 0;
		await tick();
		inputEl?.focus();
	}

	function toggle(id: number) {
		value = value.includes(id) ? value.filter(v => v !== id) : [...value, id];
	}

	function selectHighlighted() {
		const opt = filtered[highlighted];
		if (opt) toggle(opt.id);
	}

	function scrollHighlightedIntoView() {
		tick().then(() => {
			const li = listEl?.querySelector<HTMLElement>(`[data-idx="${highlighted}"]`);
			li?.scrollIntoView({ block: 'nearest' });
		});
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlighted = (highlighted + 1) % Math.max(filtered.length, 1);
			scrollHighlightedIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlighted = (highlighted - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1);
			scrollHighlightedIntoView();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			selectHighlighted();
		} else if (e.key === 'Escape') {
			open = false;
			query = '';
		}
	}

	function onDocClick(e: MouseEvent) {
		if (open && containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
			query = '';
		}
	}
</script>

<svelte:document onclick={onDocClick} />

<div bind:this={containerEl} class="relative">
	<button
		type="button"
		onclick={openDropdown}
		class="flex min-h-[30px] w-full flex-wrap items-center gap-1 rounded-lg border px-2 py-1.5 text-left bg-white transition-colors
			{open ? 'border-gray-400 ring-1 ring-gray-400' : 'border-gray-200 hover:border-gray-300'}"
	>
		{#if selectedTags.length === 0}
			<span class="text-xs text-gray-400 px-1">Tags auswählen…</span>
		{:else}
			{#each selectedTags as tag}
				<span
					class="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
					style="background-color: {tag.color}; color: {tag.text_color}"
				>
					{tag.name}
					<span
						role="button"
						tabindex="0"
						onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); toggle(tag.id); }}
						onkeydown={(e) => { if (e.key === 'Enter') toggle(tag.id); }}
						class="opacity-70 hover:opacity-100"
					><X size={10} /></span>
				</span>
			{/each}
		{/if}
		<ChevronDown size={12} class="ml-auto shrink-0 text-gray-400 transition-transform {open ? 'rotate-180' : ''}" />
	</button>

	{#if open}
		<div class="absolute z-30 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
			<div class="border-b border-gray-100 px-3 py-2">
				<input
					bind:this={inputEl}
					bind:value={query}
					placeholder="Suchen…"
					class="w-full text-xs text-gray-900 outline-none"
					onkeydown={onKeydown}
				/>
			</div>
			<ul bind:this={listEl} class="max-h-48 overflow-y-auto">
				{#each filtered as tag, i}
					<li>
						<button
							data-idx={i}
							onmouseenter={() => highlighted = i}
							onclick={() => toggle(tag.id)}
							class="flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors
								{highlighted === i ? 'bg-gray-100' : 'hover:bg-gray-50'}"
						>
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium"
								style="background-color: {tag.color}; color: {tag.text_color}"
							>{tag.name}</span>
							{#if value.includes(tag.id)}
								<span class="ml-auto text-gray-500 text-[10px]">✓</span>
							{/if}
						</button>
					</li>
				{/each}
				{#if filtered.length === 0}
					<li class="px-3 py-2 text-xs text-gray-400">Keine Ergebnisse</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
