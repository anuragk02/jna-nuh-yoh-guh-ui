<script lang="ts">
	import { onMount } from 'svelte';
	import { essayApi } from '$lib/api.js';
	import type { Essay } from '$lib/types.js';

	interface Props {
		essayId: string | null;
		onSave: () => void;
		onCancel: () => void;
	}

	let { essayId, onSave, onCancel }: Props = $props();

	let title = $state('');
	let content = $state('');
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	let isEditing = $derived(essayId !== null);

	onMount(async () => {
		if (essayId) {
			await loadEssay();
		}
	});

	async function loadEssay() {
		if (!essayId) return;
		
		loading = true;
		error = null;
		
		try {
			const essay: Essay = await essayApi.getById(essayId);
			title = essay.title || '';
			content = essay.content || '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load essay';
		} finally {
			loading = false;
		}
	}

	async function handleSave() {
		if (!title.trim()) {
			alert('Please enter a title for your essay');
			return;
		}

		saving = true;
		error = null;

		try {
			const essayData = { title: title.trim(), content: content.trim() };
			
			if (isEditing && essayId) {
				await essayApi.update(essayId, essayData);
			} else {
				await essayApi.create(essayData);
			}
			
			onSave();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save essay';
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
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-200 mb-2">
			{isEditing ? 'Edit Essay' : 'New Essay'}
		</h1>
		<p class="text-gray-400">
			{isEditing ? 'Update your essay below' : 'Write your thoughts and ideas'}
		</p>
	</div>

	{#if loading}
		<div class="text-center py-8">
			<div class="text-gray-400">Loading essay...</div>
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
					placeholder="Enter your essay title..."
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
					placeholder="Start writing your essay here..."
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
						onclick={handleSave}
						disabled={saving || !title.trim()}
						class="bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-200 px-6 py-2 rounded-md font-medium transition-colors"
					>
						{#if saving}
							Saving...
						{:else}
							{isEditing ? 'Update Essay' : 'Save Essay'}
						{/if}
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>