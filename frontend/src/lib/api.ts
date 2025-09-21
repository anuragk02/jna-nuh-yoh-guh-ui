import type { Essay, CreateEssayRequest, UpdateEssayRequest, DeleteEssayResponse } from './types.js';

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
			console.log('Empty response body, returning empty array for essays');
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
 * Essay API functions with proper TypeScript types and enhanced error handling
 */
export const essayApi = {
	/**
	 * Test API connectivity
	 */
	async testConnection(): Promise<boolean> {
		console.log('Testing API connectivity to:', API_BASE_URL);
		
		try {
			// Try a simple GET request to see if the server is responding
			const response = await fetch(`${API_BASE_URL}/essays`, {
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
	 * Get all essays
	 */
	async getAll(): Promise<Essay[]> {
		console.log('Fetching all essays from:', `${API_BASE_URL}/essays`);
		
		try {
			const response = await fetch(`${API_BASE_URL}/essays`);
			const result = await handleResponse<Essay[]>(response);
			
			// Ensure we always return an array
			if (!result) {
				console.log('API returned null/undefined, returning empty array');
				return [];
			}
			
			if (!Array.isArray(result)) {
				console.warn('API returned non-array response:', result);
				return [];
			}
			
			console.log('Successfully fetched essays:', result.length, 'items');
			return result;
		} catch (error) {
			console.error('Failed to fetch essays:', error);
			throw error;
		}
	},

	/**
	 * Get a single essay by ID
	 */
	async getById(id: string): Promise<Essay> {
		console.log('Fetching essay by ID:', id);
		
		try {
			const response = await fetch(`${API_BASE_URL}/essays/${id}`);
			return await handleResponse<Essay>(response);
		} catch (error) {
			console.error(`Failed to fetch essay ${id}:`, error);
			throw error;
		}
	},

	/**
	 * Create a new essay
	 */
	async create(essay: CreateEssayRequest): Promise<Essay> {
		console.log('Creating new essay:', essay);
		
		try {
			const response = await fetch(`${API_BASE_URL}/essays`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(essay)
			});
			return await handleResponse<Essay>(response);
		} catch (error) {
			console.error('Failed to create essay:', error);
			throw error;
		}
	},

	/**
	 * Update an existing essay
	 */
	async update(id: string, essay: UpdateEssayRequest): Promise<Essay> {
		console.log('Updating essay:', id, essay);
		
		try {
			const response = await fetch(`${API_BASE_URL}/essays/${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(essay)
			});
			return await handleResponse<Essay>(response);
		} catch (error) {
			console.error(`Failed to update essay ${id}:`, error);
			throw error;
		}
	},

	/**
	 * Delete an essay
	 */
	async delete(id: string): Promise<DeleteEssayResponse> {
		console.log('Deleting essay:', id);
		
		try {
			const response = await fetch(`${API_BASE_URL}/essays/${id}`, {
				method: 'DELETE'
			});
			return await handleResponse<DeleteEssayResponse>(response);
		} catch (error) {
			console.error(`Failed to delete essay ${id}:`, error);
			throw error;
		}
	}
};