<script lang="ts">
	import { onMount } from 'svelte';
	import { narrativeApi } from '$lib/api.js';
	import type { Narrative } from '$lib/types.js';

	interface Props {
		onEdit: (id: string) => void;
		onNew: () => void;
	}

	let { onEdit, onNew }: Props = $props();

	let narratives = $state<Narrative[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		console.log('NarrativeList component mounted, testing API connection...');
		
		// Test API connectivity first
		const isConnected = await narrativeApi.testConnection();
		if (!isConnected) {
			error = 'Unable to connect to the API server. Make sure the backend is running on http://localhost:8080';
			loading = false;
			return;
		}
		
		try {
			console.log('Connection successful, fetching narratives...');
			const result = await narrativeApi.getAll();
			console.log('Narratives fetched in component:', result);
			console.log('Narratives type:', typeof result);
			console.log('Narratives is array:', Array.isArray(result));
			console.log('Narratives length:', result?.length);
			
			narratives = result || []; // Ensure we have an array
			console.log('Narratives state updated:', narratives);
		} catch (err) {
			console.error('Error loading narratives:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading narratives';
		} finally {
			loading = false;
			console.log('Loading completed. Final state - narratives:', narratives, 'error:', error);
		}
	});

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this narrative?')) {
			return;
		}

		try {
			await narrativeApi.delete(id);
			narratives = narratives.filter((narrative) => narrative.id !== id);
		} catch (err) {
			alert(`Failed to delete narrative: ${err instanceof Error ? err.message : 'An error occurred'}`);
		}
	}

	function handleNarrativeClick(id: string) {
		onEdit(id);
	}

	function handleKeydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onEdit(id);
		}
	}

	async function handleClean() {
		try {
			const response = await fetch('http://localhost:8080/api/v1/clean', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			console.log('Clean operation completed successfully');
			// Reload narratives after cleaning
			const result = await narrativeApi.getAll();
			narratives = result;
		} catch (err) {
			console.error('Clean operation failed:', err);
			error = err instanceof Error ? err.message : 'Clean operation failed';
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-gray-200">Narratives</h1>
		<div class="flex space-x-3">
			<button
				onclick={handleClean}
				class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
			>
				Clean
			</button>
			<button
				onclick={onNew}
				class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
			>
				New Narrative
			</button>
		</div>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="text-gray-400">Loading narratives...</div>
		</div>
	{:else if error}
		<div class="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md">
			Error: {error}
		</div>
	{:else}
		<!-- Debug Information -->
		<div class="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4 text-xs">
			<div class="text-gray-400">
				<strong>Debug Info:</strong> 
				Narratives: {narratives ? narratives.length : 'null'} | 
				Type: {typeof narratives} | 
				Is Array: {Array.isArray(narratives)} |
				Loading: {loading} |
				Error: {error || 'none'}
			</div>
		</div>
		
		{#if narratives.length === 0}
			<div class="text-center py-8">
				<div class="text-gray-400 mb-4">No narratives found</div>
				<button
					onclick={onNew}
					class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
				>
					Create your first narrative
				</button>
			</div>
		{:else}
			<div class="space-y-4 max-h-96 overflow-y-auto">
				{#each narratives as narrative (narrative.id)}
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-lg hover:bg-gray-750 transition-all">
					<div class="flex justify-between items-start">
						<div 
							class="flex-1 cursor-pointer" 
							role="button"
							tabindex="0"
							onclick={() => handleNarrativeClick(narrative.id)}
							onkeydown={(e) => handleKeydown(e, narrative.id)}
						>
							<h2 class="text-xl font-semibold text-gray-200 mb-2">
								{narrative.title || 'Untitled Narrative'}
							</h2>
							{#if narrative.content}
								<p class="text-gray-400 line-clamp-3">
									{narrative.content.substring(0, 150)}{narrative.content.length > 150 ? '...' : ''}
								</p>
							{/if}
							{#if narrative.created_at}
								<p class="text-sm text-gray-500 mt-2">
									Created: {new Date(narrative.created_at).toLocaleDateString()}
								</p>
							{/if}
						</div>
						<div class="flex space-x-2 ml-4">
							<button
								onclick={() => onEdit(narrative.id)}
								class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-medium transition-colors"
							>
								Edit
							</button>
							<button
								onclick={() => handleDelete(narrative.id)}
								class="bg-red-800 hover:bg-red-700 text-red-300 px-3 py-1 rounded text-sm font-medium transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
		{/if}
	{/if}
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>