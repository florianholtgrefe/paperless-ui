<script lang="ts">
	import { tick } from 'svelte';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import X from 'lucide-svelte/icons/x';

	let {
		value = $bindable<number | ''>(''),
		options,
		placeholder = '— Keine Auswahl —',
		id,
	}: {
		value: number | '';
		options: { id: number; name: string }[];
		placeholder?: string;
		id?: string;
	} = $props();

	let open = $state(false);
	let query = $state('');
	let highlighted = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let listEl = $state<HTMLUListElement | null>(null);
	let containerEl = $state<HTMLDivElement | null>(null);

	const selected = $derived(options.find(o => o.id === value));

	const filtered = $derived(
		query.trim()
			? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
			: options
	);

	// highlighted wird auf 0 zurückgesetzt wenn query sich ändert
	$effect(() => {
		query; // dependency
		highlighted = 0;
	});

	async function openDropdown() {
		open = true;
		highlighted = 0;
		query = '';
		await tick();
		inputEl?.focus();
	}

	function close() {
		open = false;
		query = '';
		highlighted = 0;
	}

	function selectIndex(idx: number) {
		const opt = filtered[idx];
		if (opt) value = opt.id;
		close();
	}

	function scrollHighlightedIntoView() {
		tick().then(() => {
			const li = listEl?.querySelector<HTMLElement>(`[data-idx="${highlighted}"]`);
			li?.scrollIntoView({ block: 'nearest' });
		});
	}

	function onKeydown(e: KeyboardEvent) {
		const total = filtered.length;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlighted = (highlighted + 1) % Math.max(total, 1);
			scrollHighlightedIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlighted = (highlighted - 1 + Math.max(total, 1)) % Math.max(total, 1);
			scrollHighlightedIntoView();
		} else if (e.key === 'Enter') {
			e.preventDefault();
			selectIndex(highlighted);
		} else if (e.key === 'Escape') {
			close();
		}
	}

	function onDocClick(e: MouseEvent) {
		if (open && containerEl && !containerEl.contains(e.target as Node)) {
			close();
		}
	}
</script>

<svelte:document onclick={onDocClick} />

<div bind:this={containerEl} {id} class="relative">
	<!-- Trigger -->
	<button
		type="button"
		onclick={openDropdown}
		class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-xs bg-white transition-colors
			{open ? 'border-gray-400 ring-1 ring-gray-400' : 'border-gray-200 hover:border-gray-300'}"
	>
		<span class={selected ? 'text-gray-900' : 'text-gray-400'}>{selected?.name ?? placeholder}</span>
		<div class="flex items-center gap-1 shrink-0">
			{#if value !== ''}
				<span
					role="button"
					tabindex="0"
					class="text-gray-400 hover:text-gray-700"
					onmousedown={(e) => { e.stopPropagation(); e.preventDefault(); value = ''; }}
					onkeydown={(e) => { if (e.key === 'Enter') value = ''; }}
				><X size={12} /></span>
			{/if}
			<ChevronDown size={12} class="text-gray-400 transition-transform {open ? 'rotate-180' : ''}" />
		</div>
	</button>

	<!-- Dropdown -->
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
			<ul bind:this={listEl} class="max-h-52 overflow-y-auto">
				{#each filtered as opt, i}
					<li>
						<button
							data-idx={i}
							onmouseenter={() => highlighted = i}
							onclick={() => selectIndex(i)}
							class="w-full px-3 py-2 text-left text-xs transition-colors
								{highlighted === i ? 'bg-gray-100' : 'hover:bg-gray-50'}
								{value === opt.id ? 'font-medium text-gray-900' : 'text-gray-700'}"
						>{opt.name}</button>
					</li>
				{/each}
				{#if filtered.length === 0}
					<li class="px-3 py-2 text-xs text-gray-400">Keine Ergebnisse</li>
				{/if}
			</ul>
		</div>
	{/if}
</div>
