export interface Essay {
	id: string;
	title: string;
	content: string;
	created_at: string; // Always present according to API docs
}

export interface CreateEssayRequest {
	title: string;
	content: string;
}

export interface UpdateEssayRequest {
	title: string;
	content: string;
}

export interface DeleteEssayResponse {
	message: string;
}

export interface ApiError {
	message: string;
	status?: number;
}