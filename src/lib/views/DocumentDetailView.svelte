<script lang="ts">
	import { onMount } from 'svelte';
	import type { Document, User, Group } from '$lib/types';
	import { downloadUrl, fetchBlob, getDocument, getDocumentMetadata, getDocumentHistory, getUsers, getGroups } from '$lib/api/index';
	import type { DocumentMetadata, HistoryEntry } from '$lib/api/documents';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import User_ from 'lucide-svelte/icons/user';
	import File from 'lucide-svelte/icons/file';
	import UserLock from 'lucide-svelte/icons/user-lock';
	import Calendar1 from 'lucide-svelte/icons/calendar-1';
	import Files from 'lucide-svelte/icons/files';

	let { doc }: { doc: Document } = $props();

	type SidebarTab = 'details' | 'metadaten' | 'verlauf' | 'berechtigung';
	let activeTab = $state<SidebarTab>('details');

	let downloading = $state(false);
	let shareOpen = $state(false);
	let pdfSrc = $state('');
	let pdfLoading = $state(true);

	// Für Berechtigungen
	let userMap = $state(new Map<number, string>());
	let groupMap = $state(new Map<number, string>());
	let fullDoc = $state<Document | null>(null);
	let docMetadata = $state<DocumentMetadata | null>(null);
	let history = $state<HistoryEntry[] | null>(null);
	let historyError = $state<string | null>(null);

	function displayName(u: User): string {
		const full = [u.first_name, u.last_name].filter(Boolean).join(' ');
		return full || u.username;
	}

	function formatDate(iso: string | undefined) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString('de-DE', {
			day: '2-digit', month: '2-digit', year: 'numeric',
		});
	}

	function formatDateTime(iso: string | undefined) {
		if (!iso) return '—';
		return new Date(iso).toLocaleString('de-DE', {
			day: '2-digit', month: '2-digit', year: 'numeric',
			hour: '2-digit', minute: '2-digit',
		});
	}

	async function download() {
		if (downloading) return;
		downloading = true;
		try {
			const blob = await fetchBlob(downloadUrl(doc.id));
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = doc.original_file_name ?? `document-${doc.id}`;
			a.click();
			URL.revokeObjectURL(url);
		} finally {
			downloading = false;
		}
	}

	onMount(() => {
		fetchBlob(downloadUrl(doc.id)).then((blob) => {
			if (blob) pdfSrc = URL.createObjectURL(blob);
			pdfLoading = false;
		});

		Promise.all([
			getDocument(doc.id),
			getUsers().catch(() => ({ results: [] })),
			getGroups().catch(() => ({ results: [] })),
			getDocumentMetadata(doc.id).catch(() => null),
		]).then(([d, usersRes, groupsRes, meta]) => {
			fullDoc = d;
			userMap = new Map(usersRes.results.map((u: User) => [u.id, displayName(u)]));
			groupMap = new Map(groupsRes.results.map((g: Group) => [g.id, g.name]));
			docMetadata = meta;
		});

		getDocumentHistory(doc.id)
			.then((h) => { history = h; })
			.catch(() => { historyError = 'Keine Berechtigung zum Anzeigen des Verlaufs.'; });

		return () => { if (pdfSrc) URL.revokeObjectURL(pdfSrc); };
	});

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
	}

	const sidebarTabs: { id: SidebarTab; label: string }[] = [
		{ id: 'details', label: 'Details' },
		{ id: 'metadaten', label: 'Metadaten' },
		{ id: 'verlauf', label: 'Verlauf' },
		{ id: 'berechtigung', label: 'Berechtigung' },
	];
</script>

<div class="flex flex-1 overflow-hidden">
	<!-- PDF: 2/3 -->
	<div class="flex basis-2/3 overflow-hidden bg-gray-100">
		{#if pdfLoading}
			<div class="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
				<svg class="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
				</svg>
				<span class="text-sm">Dokument wird geladen…</span>
			</div>
		{:else if pdfSrc}
			<iframe src={pdfSrc} title="Dokumentvorschau" class="flex-1 w-full h-full border-0"></iframe>
		{:else}
			<div class="flex flex-1 items-center justify-center text-sm text-gray-400">Vorschau nicht verfügbar</div>
		{/if}
	</div>

	<!-- Sidebar: 1/3 -->
	<div class="flex basis-1/3 flex-col border-l border-gray-200 bg-white overflow-hidden">
		<!-- Titel -->
		<div class="border-b border-gray-100 px-5 py-4">
			<h2 class="text-sm font-semibold text-gray-900 leading-snug">{doc.title}</h2>
		</div>

		<!-- Reiter -->
		<div class="flex border-b border-gray-200 bg-gray-50">
			{#each sidebarTabs as tab}
				<button
					onclick={() => activeTab = tab.id}
					class="flex-1 py-2.5 text-xs font-medium transition-colors border-b-2
						{activeTab === tab.id
						? 'border-gray-900 text-gray-900'
						: 'border-transparent text-gray-500 hover:text-gray-700'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		<!-- Tab-Inhalt -->
		<div class="flex-1 overflow-y-auto px-5 py-4">

			{#if activeTab === 'details'}
				<!-- Tags -->
				{#if doc.tag_objects && doc.tag_objects.length > 0}
					<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Tags</p>
					<div class="mb-4 flex flex-wrap gap-1">
						{#each doc.tag_objects as tag}
							<span class="rounded-full px-2 py-0.5 text-xs font-medium"
								style="background-color: {tag.color}; color: {tag.text_color}">{tag.name}</span>
						{/each}
					</div>
				{/if}

				<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Details</p>
				<dl class="grid grid-cols-[16px_1fr] gap-x-3 gap-y-2 text-xs">
					<dt class="flex items-center text-gray-400"><User_ size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.correspondent_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><File size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.document_type_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><Calendar1 size={14} /></dt>
					<dd class="text-gray-700 self-center">{formatDate(doc.created)}</dd>

					<dt class="flex items-center text-gray-400"><UserLock size={14} /></dt>
					<dd class="text-gray-700 self-center">{doc.owner_name ?? '—'}</dd>

					<dt class="flex items-center text-gray-400"><Files size={14} /></dt>
					<dd class="text-gray-700 self-center">Seiten: {doc.page_count ?? '—'}</dd>
				</dl>

				{#if doc.original_file_name}
					<p class="mt-4 mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">Datei</p>
					<p class="text-xs text-gray-600 break-all">{doc.original_file_name}</p>
				{/if}

				{#if doc.content}
					<p class="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Inhalt</p>
					<p class="whitespace-pre-wrap text-xs text-gray-700 leading-relaxed">{doc.content}</p>
				{/if}

			{:else if activeTab === 'metadaten'}
				{#if docMetadata}
					<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Originaldatei</p>
					<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
						<dt class="text-gray-400 shrink-0">MIME-Typ</dt>
						<dd class="text-gray-700 break-all">{docMetadata.original_mime_type}</dd>
						<dt class="text-gray-400 shrink-0">Größe</dt>
						<dd class="text-gray-700">{formatBytes(docMetadata.original_size)}</dd>
						<dt class="text-gray-400 shrink-0">Prüfsumme</dt>
						<dd class="text-gray-700 font-mono break-all text-[10px]">{docMetadata.original_checksum}</dd>
						{#if docMetadata.lang}
							<dt class="text-gray-400 shrink-0">Sprache</dt>
							<dd class="text-gray-700">{docMetadata.lang}</dd>
						{/if}
					</dl>

					{#if docMetadata.has_archive_version && docMetadata.archive_size}
						<p class="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Archivdatei</p>
						<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
							<dt class="text-gray-400 shrink-0">Größe</dt>
							<dd class="text-gray-700">{formatBytes(docMetadata.archive_size)}</dd>
							{#if docMetadata.archive_checksum}
								<dt class="text-gray-400 shrink-0">Prüfsumme</dt>
								<dd class="text-gray-700 font-mono break-all text-[10px]">{docMetadata.archive_checksum}</dd>
							{/if}
						</dl>
					{/if}

					{#if docMetadata.original_metadata.length > 0}
						<p class="mt-4 mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Datei-Metadaten</p>
						<dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs">
							{#each docMetadata.original_metadata as entry}
								<dt class="text-gray-400 shrink-0">{entry.prefix}:{entry.key}</dt>
								<dd class="text-gray-700 break-all">{entry.value}</dd>
							{/each}
						</dl>
					{/if}
				{:else}
					<div class="flex justify-center py-8">
						<svg class="h-4 w-4 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
						</svg>
					</div>
				{/if}

			{:else if activeTab === 'verlauf'}
				{#if historyError}
					<p class="text-xs text-gray-400">{historyError}</p>
				{:else if history === null}
					<div class="flex justify-center py-8">
						<svg class="h-4 w-4 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
						</svg>
					</div>
				{:else if history.length === 0}
					<p class="text-xs text-gray-400">Kein Verlauf vorhanden.</p>
				{:else}
					<ol class="relative border-l border-gray-200 ml-1.5 flex flex-col gap-0">
						{#each history as entry (entry.id)}
							{@const isCreate = entry.action === 0}
							{@const isDelete = entry.action === 2}
							{@const actor = entry.actor
								? ([entry.actor.first_name, entry.actor.last_name].filter(Boolean).join(' ') || entry.actor.username)
								: 'System'}
							{@const changes = entry.changes ? Object.entries(entry.changes) : []}
							<li class="mb-5 ml-4">
								<span class="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-white
									{isCreate ? 'bg-green-400' : isDelete ? 'bg-red-400' : 'bg-gray-400'}">
								</span>
								<div class="flex flex-col gap-0.5">
									<span class="text-[11px] text-gray-400">{formatDateTime(entry.timestamp)}</span>
									<span class="text-xs font-medium text-gray-800">
										{#if isCreate}Erstellt{:else if isDelete}Gelöscht{:else}Geändert{/if}
										<span class="font-normal text-gray-500"> · {actor}</span>
									</span>
									{#if changes.length > 0}
										<ul class="mt-1 flex flex-col gap-0.5">
											{#each changes as [field, [from, to]]}
												<li class="text-[11px] text-gray-500">
													<span class="font-medium text-gray-600">{field}:</span>
													{#if from !== null && from !== ''}<span class="line-through text-gray-400">{String(from).slice(0, 60)}</span> → {/if}{String(to ?? '').slice(0, 60)}
												</li>
											{/each}
										</ul>
									{/if}
								</div>
							</li>
						{/each}
					</ol>
				{/if}

			{:else if activeTab === 'berechtigung'}
				{#if fullDoc?.permissions}
					{@const perms = fullDoc.permissions}
					<div class="flex flex-col gap-5">
						<div>
							<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Anzeigen</p>
							{#if perms.view.users.length === 0 && perms.view.groups.length === 0}
								<p class="text-xs text-gray-400">Keine expliziten Berechtigungen</p>
							{:else}
								<ul class="flex flex-col gap-1">
									{#each perms.view.users as uid}
										<li class="flex items-center gap-2 text-xs text-gray-700">
											<User_ size={12} class="text-gray-400" />
											{userMap.get(uid) ?? `User ${uid}`}
										</li>
									{/each}
									{#each perms.view.groups as gid}
										<li class="flex items-center gap-2 text-xs text-gray-700">
											<span class="text-gray-400 text-[10px] font-medium">GRP</span>
											{groupMap.get(gid) ?? `Group ${gid}`}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
						<div>
							<p class="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">Bearbeiten</p>
							{#if perms.change.users.length === 0 && perms.change.groups.length === 0}
								<p class="text-xs text-gray-400">Keine expliziten Berechtigungen</p>
							{:else}
								<ul class="flex flex-col gap-1">
									{#each perms.change.users as uid}
										<li class="flex items-center gap-2 text-xs text-gray-700">
											<User_ size={12} class="text-gray-400" />
											{userMap.get(uid) ?? `User ${uid}`}
										</li>
									{/each}
									{#each perms.change.groups as gid}
										<li class="flex items-center gap-2 text-xs text-gray-700">
											<span class="text-gray-400 text-[10px] font-medium">GRP</span>
											{groupMap.get(gid) ?? `Group ${gid}`}
										</li>
									{/each}
								</ul>
							{/if}
						</div>
					</div>
				{:else}
					<div class="flex flex-col items-center justify-center gap-2 py-8 text-gray-300">
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
						</svg>
					</div>
				{/if}
			{/if}
		</div>

		<!-- Download + Share -->
		<div class="border-t border-gray-100 px-5 py-3 flex flex-col gap-2">
			<button
				onclick={download}
				disabled={downloading}
				class="w-full rounded-lg bg-gray-900 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
			>
				{downloading ? 'Wird heruntergeladen…' : 'Download'}
			</button>
			<button
				onclick={() => shareOpen = true}
				class="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
			>
				Teilen
			</button>
		</div>
	</div>
</div>

{#if shareOpen}
	<ShareModal docId={doc.id} onclose={() => shareOpen = false} />
{/if}
