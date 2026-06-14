<script lang="ts">
	import { tick } from 'svelte';
	import X from 'lucide-svelte/icons/x';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';

	let {
		value = $bindable<number | ''>(''),
		options,
		placeholder = '— Kein Eigentümer —',
		id,
	}: {
		value: number | '';
		options: { id: number; name: string }[];
		placeholder?: string;
		id?: string;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let inputEl = $state<HTMLInputElement | null>(null);
	let containerEl = $state<HTMLDivElement | null>(null);

	const selected = $derived(options.find(o => o.id === value));
	const filtered = $derived(
		query.trim()
			? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
			: options
	);

	async function openDropdown() {
		open = true;
		query = '';
		await tick();
		inputEl?.focus();
	}

	function select(id: number | '') {
		value = id;
		open = false;
		query = '';
	}

	function onDocClick(e: MouseEvent) {
		if (open && containerEl && !containerEl.contains(e.target as Node)) {
			open = false;
			query = '';
		}
	}
</script>

<svelte:document onclick={onDocClick} />

<div bind:this={containerEl} {id} class="relative">
	<button
		type="button"
		onclick={openDropdown}
		class="flex min-h-[30px] w-full items-center gap-1 rounded-lg border px-2 py-1.5 text-left bg-white transition-colors
			{open ? 'border-gray-400 ring-1 ring-gray-400' : 'border-gray-200 hover:border-gray-300'}"
	>
		{#if selected}
			<span class="flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">
				{selected.name}
				<span
					role="button"
					tabindex="0"
					class="opacity-60 hover:opacity-100"
					onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); select(''); }}
					onkeydown={(e) => { if (e.key === 'Enter') select(''); }}
				><X size={10} /></span>
			</span>
		{:else}
			<span class="text-xs text-gray-400 px-1">{placeholder}</span>
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
					onkeydown={(e) => { if (e.key === 'Escape') { open = false; query = ''; } }}
				/>
			</div>
			<ul class="max-h-48 overflow-y-auto">
				<li>
					<button
						onclick={() => select('')}
						class="w-full px-3 py-2 text-left text-xs text-gray-400 hover:bg-gray-50 transition-colors"
					>{placeholder}</button>
				</li>
				{#each filtered as opt}
					<li>
						<button
							onclick={() => select(opt.id)}
							class="flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-gray-50"
						>
							<span class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">{opt.name}</span>
							{#if value === opt.id}
								<span class="ml-auto text-gray-400">✓</span>
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
