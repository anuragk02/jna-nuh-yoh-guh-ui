<script lang="ts">
	import { onMount } from 'svelte';
	import { essayApi } from '$lib/api.js';
	import type { Essay } from '$lib/types.js';

	interface Props {
		onEdit: (id: string) => void;
		onNew: () => void;
	}

	let { onEdit, onNew }: Props = $props();

	let essays = $state<Essay[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		console.log('EssayList component mounted, testing API connection...');
		
		// Test API connectivity first
		const isConnected = await essayApi.testConnection();
		if (!isConnected) {
			error = 'Unable to connect to the API server. Make sure the backend is running on http://localhost:8080';
			loading = false;
			return;
		}
		
		try {
			console.log('Connection successful, fetching essays...');
			const result = await essayApi.getAll();
			console.log('Essays fetched in component:', result);
			console.log('Essays type:', typeof result);
			console.log('Essays is array:', Array.isArray(result));
			console.log('Essays length:', result?.length);
			
			essays = result || []; // Ensure we have an array
			console.log('Essays state updated:', essays);
		} catch (err) {
			console.error('Error loading essays:', err);
			error = err instanceof Error ? err.message : 'An error occurred while loading essays';
		} finally {
			loading = false;
			console.log('Loading completed. Final state - essays:', essays, 'error:', error);
		}
	});

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this essay?')) {
			return;
		}

		try {
			await essayApi.delete(id);
			essays = essays.filter((essay) => essay.id !== id);
		} catch (err) {
			alert(`Failed to delete essay: ${err instanceof Error ? err.message : 'An error occurred'}`);
		}
	}

	function handleEssayClick(id: string) {
		onEdit(id);
	}

	function handleKeydown(event: KeyboardEvent, id: string) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onEdit(id);
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-gray-200">Essays</h1>
		<button
			onclick={onNew}
			class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
		>
			New Essay
		</button>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="text-gray-400">Loading essays...</div>
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
				Essays: {essays ? essays.length : 'null'} | 
				Type: {typeof essays} | 
				Is Array: {Array.isArray(essays)} |
				Loading: {loading} |
				Error: {error || 'none'}
			</div>
		</div>
		
		{#if essays.length === 0}
			<div class="text-center py-8">
				<div class="text-gray-400 mb-4">No essays found</div>
				<button
					onclick={onNew}
					class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
				>
					Create your first essay
				</button>
			</div>
		{:else}
			<div class="space-y-4 max-h-96 overflow-y-auto">
				{#each essays as essay (essay.id)}
					<div class="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-lg hover:bg-gray-750 transition-all">
					<div class="flex justify-between items-start">
						<div 
							class="flex-1 cursor-pointer" 
							role="button"
							tabindex="0"
							onclick={() => handleEssayClick(essay.id)}
							onkeydown={(e) => handleKeydown(e, essay.id)}
						>
							<h2 class="text-xl font-semibold text-gray-200 mb-2">
								{essay.title || 'Untitled Essay'}
							</h2>
							{#if essay.content}
								<p class="text-gray-400 line-clamp-3">
									{essay.content.substring(0, 150)}{essay.content.length > 150 ? '...' : ''}
								</p>
							{/if}
							{#if essay.created_at}
								<p class="text-sm text-gray-500 mt-2">
									Created: {new Date(essay.created_at).toLocaleDateString()}
								</p>
							{/if}
						</div>
						<div class="flex space-x-2 ml-4">
							<button
								onclick={() => onEdit(essay.id)}
								class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded text-sm font-medium transition-colors"
							>
								Edit
							</button>
							<button
								onclick={() => handleDelete(essay.id)}
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