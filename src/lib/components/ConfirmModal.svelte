<script lang="ts">
	import X from 'lucide-svelte/icons/x';

	let {
		title,
		message,
		confirmLabel = 'Bestätigen',
		cancelLabel = 'Abbrechen',
		dangerous = false,
		onconfirm,
		oncancel,
	}: {
		title: string;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		dangerous?: boolean;
		onconfirm: () => void;
		oncancel: () => void;
	} = $props();
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
	role="dialog"
	aria-modal="true"
	tabindex="-1"
	onmousedown={(e) => { if (e.target === e.currentTarget) oncancel(); }}
>
	<div class="w-[400px] rounded-xl border border-gray-200 bg-white shadow-xl">
		<div class="flex items-center justify-between border-b border-gray-100 px-5 py-4">
			<h2 class="text-sm font-semibold text-gray-900">{title}</h2>
			<button onclick={oncancel} class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
				<X size={16} />
			</button>
		</div>

		<div class="px-5 py-4">
			<p class="text-sm text-gray-600">{message}</p>
		</div>

		<div class="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
			<button
				onclick={oncancel}
				class="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
			>
				{cancelLabel}
			</button>
			<button
				onclick={onconfirm}
				class="rounded-lg px-4 py-2 text-xs font-medium text-white transition-colors
					{dangerous ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-900 hover:bg-gray-700'}"
			>
				{confirmLabel}
			</button>
		</div>
	</div>
</div>
