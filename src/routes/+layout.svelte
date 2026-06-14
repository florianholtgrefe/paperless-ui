<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import TabBar from '$lib/components/TabBar.svelte';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import LoginView from '$lib/views/LoginView.svelte';
	import DocumentsView from '$lib/views/DocumentsView.svelte';
	import DocumentDetailView from '$lib/views/DocumentDetailView.svelte';
	import { tabStore } from '$lib/stores/tabs.svelte';
	import { authStore } from '$lib/stores/auth.svelte';
</script>

{#if !authStore.isLoggedIn}
	<LoginView />
{:else}
	<div class="flex h-screen overflow-hidden bg-white">
		<Sidebar />
		<div class="flex flex-1 flex-col overflow-hidden">
			<AppHeader />
			<TabBar />

			{#if tabStore.tabs.length === 0}
				<div class="flex flex-1 flex-col items-center justify-center gap-4 text-gray-300">
					<p class="text-4xl font-semibold tracking-tight">paperless ui</p>
					<p class="text-sm">Wähle einen Bereich aus der Navigation</p>
				</div>
			{:else}
				<div class="relative flex-1 overflow-hidden">
					{#each tabStore.tabs as tab (tab.id)}
						<div
							class="absolute inset-0 flex overflow-hidden"
							class:invisible={tab.id !== tabStore.activeId}
							class:pointer-events-none={tab.id !== tabStore.activeId}
						>
							{#if tab.type === 'documents'}
								<DocumentsView />
							{:else if tab.type === 'document'}
								<DocumentDetailView doc={tab.doc} />
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
