<script lang="ts">
	import { onMount } from 'svelte';
	import { narrativeApi } from '$lib/api.js';
	import type { Narrative } from '$lib/types.js';

	interface Props {
		narrativeId: string | null;
		onSave: () => void;
		onCancel: () => void;
	}

	let { narrativeId, onSave, onCancel }: Props = $props();

	let title = $state('');
	let content = $state('');
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);
	
	// Analysis modal state
	let showAnalysisModal = $state(false);
	let analyzing = $state(false);
	let analysisResult = $state<any>(null);
	let analysisError = $state<string | null>(null);

	let isEditing = $derived(narrativeId !== null);

	onMount(async () => {
		if (narrativeId) {
			await loadNarrative();
		}
	});

	async function loadNarrative() {
		if (!narrativeId) return;
		
		loading = true;
		error = null;
		
		try {
			const narrative: Narrative = await narrativeApi.getById(narrativeId);
			title = narrative.title || '';
			content = narrative.content || '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load narrative';
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		if (!title.trim()) {
			alert('Please enter a title for your narrative');
			return;
		}

		saving = true;
		error = null;

		try {
			const narrativeData = { title: title.trim(), content: content.trim() };
			
			if (isEditing && narrativeId) {
				await narrativeApi.update(narrativeId, narrativeData);
			} else {
				await narrativeApi.create(narrativeData);
			}
			
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save narrative';
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		if (title.trim() || content.trim()) {
			if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
				onCancel();
			}
		} else {
			onCancel();
		}
	}

	async function handleAnalyze() {
		if (!title.trim() && !content.trim()) {
			alert('Please add some title or content to analyze');
			return;
		}

		if (!isEditing || !narrativeId) {
			alert('Please save the narrative first before analyzing');
			return;
		}

		// Show modal and start analysis
		showAnalysisModal = true;
		analyzing = true;
		analysisResult = null;
		analysisError = null;

		try {
			const response = await fetch(`http://localhost:8080/api/v1/narratives/analyze`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					id: narrativeId
				})
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const result = await response.json();
			analysisResult = result;
		} catch (err) {
			console.error('Analysis failed:', err);
			analysisError = err instanceof Error ? err.message : 'Analysis failed';
		} finally {
			analyzing = false;
		}
	}

	function closeAnalysisModal() {
		showAnalysisModal = false;
		analyzing = false;
		analysisResult = null;
		analysisError = null;
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-200 mb-2">
			{isEditing ? 'Edit Narrative' : 'New Narrative'}
		</h1>
		<p class="text-gray-400">
			{isEditing ? 'Update your narrative below' : 'Share your thoughts'}
		</p>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="text-gray-400">Loading narrative...</div>
		</div>
	{:else}
		<div class="space-y-6">
			{#if error}
				<div class="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md">
					Error: {error}
				</div>
			{/if}

			<!-- Title Input -->
			<div>
				<label for="title" class="block text-sm font-medium text-gray-300 mb-2">
					Title
				</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					placeholder="Enter your narrative title..."
					class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-200 placeholder-gray-500"
					disabled={saving}
				/>
			</div>

			<!-- Content Textarea -->
			<div>
				<label for="content" class="block text-sm font-medium text-gray-300 mb-2">
					Content
				</label>
				<textarea
					id="content"
					bind:value={content}
					placeholder="Share your systems thinking insights here..."
					rows="20"
					class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-vertical min-h-96 text-gray-200 placeholder-gray-500"
					disabled={saving}
				></textarea>
			</div>

			<!-- Action Buttons -->
			<div class="flex justify-between items-center pt-4">
				<button
					onclick={handleCancel}
					class="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded-md font-medium transition-colors"
					disabled={saving}
				>
					Cancel
				</button>

				<div class="flex space-x-3">
					<div class="text-sm text-gray-500 flex items-center">
						{#if title.trim()}
							Title: {title.trim().length} chars
						{/if}
						{#if content.trim()}
							{title.trim() ? ' | ' : ''}Content: {content.trim().length} chars
						{/if}
					</div>
					
					<button
						onclick={handleAnalyze}
						disabled={saving || (!title.trim() && !content.trim())}
						class="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md font-medium transition-colors"
					>
						Analyze
					</button>
					
					<button
						onclick={handleSave}
						disabled={saving || !title.trim()}
						class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-200 px-6 py-2 rounded-md font-medium transition-colors"
					>
						{#if saving}
							Saving...
						{:else}
							{isEditing ? 'Update Narrative' : 'Save Narrative'}
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Analysis Modal -->
{#if showAnalysisModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-hidden">
			<div class="p-6">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-bold text-gray-200">
						{analyzing ? 'Analyzing Narrative...' : 'Analysis Results'}
					</h2>
					{#if !analyzing}
						<button
							onclick={closeAnalysisModal}
							class="text-gray-400 hover:text-gray-200 text-2xl"
						>
							×
						</button>
					{/if}
				</div>

				<div class="analysis-content">
					{#if analyzing}
						<div class="flex items-center justify-center py-8">
							<div class="text-center">
								<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
								<p class="text-gray-400">Processing your narrative...</p>
							</div>
						</div>
					{:else if analysisError}
						<div class="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4">
							Error: {analysisError}
						</div>
						<div class="flex justify-end">
							<button
								onclick={closeAnalysisModal}
								class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-4 py-2 rounded-md font-medium transition-colors"
							>
								Close
							</button>
						</div>
					{:else if analysisResult}
						<div class="bg-gray-700 p-4 rounded-md mb-4 max-h-64 overflow-y-auto">
							<pre class="text-gray-200 text-sm whitespace-pre-wrap">{JSON.stringify(analysisResult, null, 2)}</pre>
						</div>
						<div class="flex justify-end">
							<button
								onclick={closeAnalysisModal}
								class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md font-medium transition-colors"
							>
								Close
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}