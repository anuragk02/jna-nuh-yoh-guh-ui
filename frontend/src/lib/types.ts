export interface Narrative {
	id: string;
	title: string;
	content: string;
	created_at: string; // Always present according to API docs
	updated_at?: string; // Present on updates
}

export interface CreateNarrativeRequest {
	title: string;
	content: string;
}

export interface UpdateNarrativeRequest {
	title: string;
	content: string;
}

export interface DeleteNarrativeResponse {
	message: string;
}

export interface ApiError {
	message: string;
	status?: number;
}