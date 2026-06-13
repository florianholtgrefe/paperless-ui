export interface Document {
	id: number;
	title: string;
	created: string;
	added: string;
	correspondent: number | null;
	correspondent_name?: string;
	document_type: number | null;
	document_type_name?: string;
	tags: number[];
	tag_names?: string[];
	tag_objects?: Tag[];
	content?: string;
	original_file_name?: string;
	mime_type?: string;
	page_count?: number;
	owner?: number;
	owner_name?: string;
}

export interface Tag {
	id: number;
	name: string;
	color: string;
	text_color: string;
}

export interface Correspondent {
	id: number;
	name: string;
}

export interface DocumentType {
	id: number;
	name: string;
}

export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
}
