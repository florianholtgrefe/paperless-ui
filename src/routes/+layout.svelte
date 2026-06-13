<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';

	let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-white">
	<Sidebar />
	<main class="flex flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
