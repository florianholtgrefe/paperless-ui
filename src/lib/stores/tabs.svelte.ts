import type { Document } from '$lib/types';

export type Tab =
	| { id: 'documents'; type: 'documents'; label: string }
	| { id: string; type: 'document'; label: string; doc: Document };

function createTabStore() {
	let tabs = $state<Tab[]>([]);
	let activeId = $state<string | null>(null);

	function openDocuments() {
		const existing = tabs.find((t) => t.id === 'documents');
		if (existing) {
			activeId = 'documents';
			return;
		}
		tabs = [{ id: 'documents', type: 'documents', label: 'Dokumente' }, ...tabs];
		activeId = 'documents';
	}

	function open(doc: Document) {
		const existing = tabs.find((t) => t.id === `doc-${doc.id}`);
		if (existing) {
			activeId = existing.id;
			return;
		}
		const tab: Tab = {
			id: `doc-${doc.id}`,
			type: 'document',
			label: doc.title.length > 24 ? doc.title.slice(0, 24) + '…' : doc.title,
			doc,
		};
		tabs = [...tabs, tab];
		activeId = tab.id;
	}

	function close(id: string) {
		const idx = tabs.findIndex((t) => t.id === id);
		tabs = tabs.filter((t) => t.id !== id);
		if (activeId === id) {
			activeId = tabs.length > 0 ? tabs[Math.max(0, idx - 1)].id : null;
		}
	}

	function activate(id: string) {
		activeId = id;
	}

	return {
		get tabs() { return tabs; },
		get activeId() { return activeId; },
		get active() { return tabs.find((t) => t.id === activeId) ?? null; },
		openDocuments,
		open,
		close,
		activate,
	};
}

export const tabStore = createTabStore();
