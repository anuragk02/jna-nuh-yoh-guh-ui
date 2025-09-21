<script lang="ts">
	import EssayList from '$lib/components/EssayList.svelte';
	import EssayEditor from '$lib/components/EssayEditor.svelte';
	import ApiStatus from '$lib/components/ApiStatus.svelte';

	let currentView: 'list' | 'editor' | 'status' = 'status'; // Start with status check
	let editingEssayId: string | null = null;

	function showList() {
		currentView = 'list';
		editingEssayId = null;
	}

	function showEditor(essayId: string | null = null) {
		currentView = 'editor';
		editingEssayId = essayId;
	}

	function showStatus() {
		currentView = 'status';
	}

	function handleEssaySaved() {
		showList();
	}

	function handleEditorCancel() {
		showList();
	}
</script>

<svelte:head>
	<title>jna-nuh-yoh-guh</title>
	<meta name="description" content="Knowledge management system for essays, concepts, and ideas" />
</svelte:head>

<main class="min-h-screen bg-gray-900">
	<!-- Navigation -->
	<nav class="bg-gray-800 shadow-sm border-b border-gray-700">
		<div class="max-w-4xl mx-auto px-6 py-4">
			<div class="flex space-x-4">
				<button 
					onclick={showStatus}
					class="px-3 py-1 rounded text-sm font-medium transition-colors {currentView === 'status' ? 'bg-gray-700 text-gray-200' : 'text-gray-400 hover:text-gray-200'}"
				>
					API Status
				</button>
				<button 
					onclick={showList}
					class="px-3 py-1 rounded text-sm font-medium transition-colors {currentView === 'list' ? 'bg-gray-700 text-gray-200' : 'text-gray-400 hover:text-gray-200'}"
				>
					Essays
				</button>
			</div>
		</div>
	</nav>

	<!-- Content -->
	{#if currentView === 'status'}
		<ApiStatus />
	{:else if currentView === 'list'}
		<EssayList 
			onEdit={showEditor} 
			onNew={() => showEditor(null)}
		/>
	{:else if currentView === 'editor'}
		<EssayEditor 
			essayId={editingEssayId}
			onSave={handleEssaySaved}
			onCancel={handleEditorCancel}
		/>
	{/if}
</main>
