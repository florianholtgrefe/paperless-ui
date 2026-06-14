<script lang="ts">
	import { onMount } from 'svelte';
	import type { Document, User, Group, Tag, Correspondent, DocumentType } from '$lib/types';
	import { downloadUrl, fetchBlob, getDocument, getDocumentMetadata, getDocumentHistory, getUsers, getGroups, patchDocument, deleteDocument, getTags, getCorrespondents, getDocumentTypes } from '$lib/api/index';
	import { tabStore } from '$lib/stores/tabs.svelte';
	import type { DocumentMetadata, HistoryEntry } from '$lib/api/documents';
	import ShareModal from '$lib/components/ShareModal.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import User_ from 'lucide-svelte/icons/user';
	import File from 'lucide-svelte/icons/file';
	import UserLock from 'lucide-svelte/icons/user-lock';
	import Calendar1 from 'lucide-svelte/icons/calendar-1';
	import Files from 'lucide-svelte/icons/files';
	import Pencil from 'lucide-svelte/icons/pencil';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import UsersRound from 'lucide-svelte/icons/users-round';
	import SearchSelect from '$lib/components/SearchSelect.svelte';
	import TagSelect from '$lib/components/TagSelect.svelte';

	let { doc }: { doc: Document } = $props();

	type SidebarTab = 'details' | 'metadaten' | 'verlauf' | 'berechtigung';
	let activeTab = $state<SidebarTab>('details');

	let downloading = $state(false);
	let shareOpen = $state(false);
	let pdfSrc = $state('');
	let pdfLoading = $state(true);

	// Berechtigungen / Metadaten
	let userMap = $state(new Map<number, string>());
	let groupMap = $state(new Map<number, string>());
	let fullDoc = $state<Document | null>(null);
	let docMetadata = $state<DocumentMetadata | null>(null);
	let history = $state<HistoryEntry[] | null>(null);
	let historyError = $state<string | null>(null);

	// Edit-Modus
	let editing = $state(false);
	let saving = $state(false);
	let allTags = $state<Tag[]>([]);
	let allCorrespondents = $state<Correspondent[]>([]);
	let allDocumentTypes = $state<DocumentType[]>([]);

	// Editierbare Felder (lokale Kopie)
	let editTitle = $state('');
	let editCorrespondent = $state<number | ''>('');
	let editDocumentType = $state<number | ''>('');
	let editCreated = $state('');
	let editTags = $state<number[]>([]);
	let editOwner = $state<number | ''>('');
	let editUsers = $state<User[]>([]);

	function startEdit() {
		editTitle = doc.title;
		editCorrespondent = doc.correspondent ?? '';
		editDocumentType = doc.document_type ?? '';
		editCreated = doc.created ? doc.created.slice(0, 10) : '';
		editTags = [...(doc.tags ?? [])];
		editOwner = doc.owner ?? '';
		editing = true;
	}

	function cancelEdit() {
		editing = false;
	}

	let deleting = $state(false);
	let confirmDelete = $state(false);
	let contentExpanded = $state(false);

	async function deleteDoc() {
		deleting = true;
		try {
			await deleteDocument(doc.id);
			tabStore.close(`doc-${doc.id}`);
		} finally {
			deleting = false;
			confirmDelete = false;
		}
	}

	async function saveEdit() {
		saving = true;
		try {
			const updated = await patchDocument(doc.id, {
				title: editTitle,
				correspondent: editCorrespondent === '' ? null : Number(editCorrespondent),
				document_type: editDocumentType === '' ? null : Number(editDocumentType),
				created: editCreated || undefined,
				tags: editTags,
				owner: editOwner === '' ? null : Number(editOwner),
			});
			// Felder im doc-Objekt aktualisieren
			doc.title = updated.title;
			doc.correspondent = updated.correspondent;
			doc.document_type = updated.document_type;
			doc.created = updated.created;
			doc.tags = updated.tags;
			doc.owner = updated.owner;
			// Namen neu auflösen
			doc.correspondent_name = allCorrespondents.find(c => c.id === updated.correspondent)?.name ?? undefined;
			doc.document_type_name = allDocumentTypes.find(t => t.id === updated.document_type)?.name ?? undefined;
			doc.tag_objects = allTags.filter(t => updated.tags.includes(t.id));
			const ownerUser = editUsers.find(u => u.id === updated.owner);
			doc.owner_name = ownerUser ? displayName(ownerUser) : undefined;
			editing = false;
		} finally {
			saving = false;
		}
	}

	function toggleTag(id: number) {
		if (editTags.includes(id)) {
			editTags = editTags.filter(t => t !== id);
		} else {
			editTags = [...editTags, id];
		}
	}

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
			getUsers().catch(() => [] as User[]),
			getGroups().catch(() => [] as Group[]),
			getDocumentMetadata(doc.id).catch(() => null),
			getTags().catch(() => [] as Tag[]),
			getCorrespondents().catch(() => [] as Correspondent[]),
			getDocumentTypes().catch(() => [] as DocumentType[]),
		]).then(([d, users, groups, meta, tags, corrs, types]) => {
			fullDoc = d;
			editUsers = users;
			userMap = new Map(users.map((u: User) => [u.id, displayName(u)]));
			groupMap = new Map(groups.map((g: Group) => [g.id, g.name]));
			docMetadata = meta;
			allTags = tags;
			allCorrespondents = corrs;
			allDocumentTypes = types;
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
		<div class="border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-2">
			<h2 class="text-sm font-semibold text-gray-900 leading-snug">{doc.title}</h2>
			{#if !editing}
				<div class="flex items-center gap-0.5">
					<button onclick={startEdit} class="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Bearbeiten">
						<Pencil size={14} />
					</button>
					<button onclick={() => confirmDelete = true} disabled={deleting} class="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-50" title="Löschen">
						<Trash2 size={14} />
					</button>
				</div>
			{/if}
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
				{#if editing}
					<!-- Edit-Formular -->
					<div class="flex flex-col gap-4">
						<div class="flex flex-col gap-1">
							<label for="edit-title" class="text-xs font-medium text-gray-500">Titel</label>
							<input
								id="edit-title"
								bind:value={editTitle}
								class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="edit-correspondent" class="text-xs font-medium text-gray-500">Korrespondent</label>
							<SearchSelect
								id="edit-correspondent"
								bind:value={editCorrespondent}
								options={allCorrespondents}
								placeholder="— Kein Korrespondent —"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="edit-doctype" class="text-xs font-medium text-gray-500">Dokumenttyp</label>
							<SearchSelect
								id="edit-doctype"
								bind:value={editDocumentType}
								options={allDocumentTypes}
								placeholder="— Kein Typ —"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="edit-created" class="text-xs font-medium text-gray-500">Ausstellungsdatum</label>
							<input
								id="edit-created"
								type="date"
								bind:value={editCreated}
								class="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<label for="edit-owner" class="text-xs font-medium text-gray-500">Eigentümer</label>
							<SearchSelect
								id="edit-owner"
								bind:value={editOwner}
								options={editUsers.map(u => ({ id: u.id, name: displayName(u) }))}
								placeholder="— Kein Eigentümer —"
							/>
						</div>

						<div class="flex flex-col gap-1">
							<span class="text-xs font-medium text-gray-500">Tags</span>
							<TagSelect bind:value={editTags} options={allTags} />
						</div>
					</div>
				{:else}
					<!-- Leseansicht -->
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
						<div class="mt-4 border-t border-gray-100 pt-3">
							<button
								onclick={() => contentExpanded = !contentExpanded}
								class="flex w-full items-center justify-between text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
							>
								<span class="uppercase tracking-wide">Inhalt</span>
								<ChevronDown size={14} class="transition-transform {contentExpanded ? 'rotate-180' : ''}" />
							</button>
							{#if contentExpanded}
								<div class="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
									<p class="whitespace-pre-wrap text-xs text-gray-600 leading-relaxed">{doc.content}</p>
								</div>
							{/if}
						</div>
					{/if}
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
											<UsersRound size={12} class="text-gray-400" />
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
											<UsersRound size={12} class="text-gray-400" />
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

		<!-- Buttons -->
		<div class="border-t border-gray-100 px-5 py-3 flex flex-col gap-2">
			{#if editing}
				<button
					onclick={saveEdit}
					disabled={saving}
					class="w-full rounded-lg bg-gray-900 py-2 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
				>
					{saving ? 'Wird gespeichert…' : 'Speichern'}
				</button>
				<button
					onclick={cancelEdit}
					disabled={saving}
					class="w-full rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
				>
					Abbrechen
				</button>
			{:else}
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
			{/if}
		</div>
	</div>
</div>

{#if shareOpen}
	<ShareModal docId={doc.id} onclose={() => shareOpen = false} />
{/if}

{#if confirmDelete}
	<ConfirmModal
		title="Dokument löschen"
		message={`„${doc.title}" wird unwiderruflich gelöscht. Möchtest du fortfahren?`}
		confirmLabel={deleting ? 'Wird gelöscht…' : 'Löschen'}
		cancelLabel="Abbrechen"
		dangerous={true}
		onconfirm={deleteDoc}
		oncancel={() => confirmDelete = false}
	/>
{/if}
