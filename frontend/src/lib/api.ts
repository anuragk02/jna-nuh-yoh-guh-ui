import type { Narrative, CreateNarrativeRequest, UpdateNarrativeRequest, DeleteNarrativeResponse } from './types.js';

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Helper function to handle API responses with better error messages
 */
async function handleResponse<T>(response: Response): Promise<T> {
	console.log('Response status:', response.status);
	console.log('Response headers:', response.headers);
	console.log('Response ok:', response.ok);
	
	if (!response.ok) {
		let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
		
		try {
			const errorBody = await response.text();
			if (errorBody) {
				console.error('API Error Response:', errorBody);
				errorMessage += ` - ${errorBody}`;
			}
		} catch (e) {
			console.error('Failed to read error response body:', e);
		}
		
		throw new Error(errorMessage);
	}
	
	try {
		const responseText = await response.text();
		console.log('Raw response text:', responseText);
		
		if (!responseText) {
			console.log('Empty response body, returning empty array for narratives');
			return [] as T;
		}
		
		const parsed = JSON.parse(responseText);
		console.log('Parsed response:', parsed);
		console.log('Response type:', typeof parsed);
		console.log('Is array:', Array.isArray(parsed));
		
		return parsed;
	} catch (e) {
		console.error('Failed to parse JSON response:', e);
		throw new Error('Invalid JSON response from server');
	}
}

/**
 * Narrative API functions with proper TypeScript types and enhanced error handling
 */
export const narrativeApi = {
	/**
	 * Test API connectivity
	 */
	async testConnection(): Promise<boolean> {
		console.log('Testing API connectivity to:', API_BASE_URL);
		
		try {
			// Try a simple GET request to see if the server is responding
			const response = await fetch(`${API_BASE_URL}/health`, {
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			});
			
			console.log('API Response status:', response.status);
			console.log('API Response headers:', response.headers);
			
			if (response.ok) {
				console.log('✅ API connection successful');
				return true;
			} else {
				console.log('❌ API responded but with error status:', response.status);
				return false;
			}
		} catch (error) {
			console.error('❌ API connection failed:', error);
			return false;
		}
	},

	/**
	 * Get all narratives
	 */
	async getAll(): Promise<Narrative[]> {
		console.log('Fetching all narratives from:', `${API_BASE_URL}/narratives`);
		
		try {
			const response = await fetch(`${API_BASE_URL}/narratives`);
			const result = await handleResponse<Narrative[]>(response);
			
			// Ensure we always return an array
			if (!result) {
				console.log('API returned null/undefined, returning empty array');
				return [];
			}
			
			if (!Array.isArray(result)) {
				console.warn('API returned non-array response:', result);
				return [];
			}
			
			console.log('Successfully fetched narratives:', result.length, 'items');
			return result;
		} catch (error) {
			console.error('Failed to fetch narratives:', error);
			throw error;
		}
	},

	/**
	 * Get a single narrative by ID
	 */
	async getById(id: string): Promise<Narrative> {
		console.log('Fetching narrative by ID:', id);
		
		try {
			const response = await fetch(`${API_BASE_URL}/narratives/${id}`);
			return await handleResponse<Narrative>(response);
		} catch (error) {
			console.error(`Failed to fetch narrative ${id}:`, error);
			throw error;
		}
	},

	/**
	 * Create a new narrative
	 */
	async create(narrative: CreateNarrativeRequest): Promise<Narrative> {
		console.log('Creating new narrative:', narrative);
		
		try {
			const response = await fetch(`${API_BASE_URL}/narratives`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(narrative)
			});
			return await handleResponse<Narrative>(response);
		} catch (error) {
			console.error('Failed to create narrative:', error);
			throw error;
		}
	},

	/**
	 * Update an existing narrative
	 */
	async update(id: string, narrative: UpdateNarrativeRequest): Promise<Narrative> {
		console.log('Updating narrative:', id, narrative);
		
		try {
			const response = await fetch(`${API_BASE_URL}/narratives/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(narrative)
			});
			return await handleResponse<Narrative>(response);
		} catch (error) {
			console.error(`Failed to update narrative ${id}:`, error);
			throw error;
		}
	},

	/**
	 * Delete a narrative
	 */
	async delete(id: string): Promise<DeleteNarrativeResponse> {
		console.log('Deleting narrative:', id);
		
		try {
			const response = await fetch(`${API_BASE_URL}/narratives/${id}`, {
				method: 'DELETE'
			});
			return await handleResponse<DeleteNarrativeResponse>(response);
		} catch (error) {
			console.error(`Failed to delete narrative ${id}:`, error);
			throw error;
		}
	}
};