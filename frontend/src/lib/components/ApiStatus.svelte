<script lang="ts">
	import { onMount } from 'svelte';
	import { narrativeApi } from '$lib/api.js';

	let connectionStatus = $state<'testing' | 'connected' | 'failed'>('testing');
	let apiUrl = 'http://localhost:8080/api/v1';
	let errorDetails = $state<string>('');

	onMount(async () => {
		console.log('Testing API connection...');
		
		try {
			const isConnected = await narrativeApi.testConnection();
			if (isConnected) {
				connectionStatus = 'connected';
			} else {
				connectionStatus = 'failed';
				errorDetails = 'API server responded but with an error status';
			}
		} catch (error) {
			console.error('Connection test failed:', error);
			connectionStatus = 'failed';
			errorDetails = error instanceof Error ? error.message : 'Unknown connection error';
		}
	});

	async function retryConnection() {
		connectionStatus = 'testing';
		errorDetails = '';
		
		try {
			const isConnected = await narrativeApi.testConnection();
			if (isConnected) {
				connectionStatus = 'connected';
				// Refresh the page to reload narratives
				window.location.reload();
			} else {
				connectionStatus = 'failed';
				errorDetails = 'API server responded but with an error status';
			}
		} catch (error) {
			connectionStatus = 'failed';
			errorDetails = error instanceof Error ? error.message : 'Unknown connection error';
		}
	}
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<div class="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
		<h2 class="text-xl font-semibold text-gray-200 mb-4">API Connection Status</h2>
		
		<div class="flex items-center space-x-3 mb-4">
			<div class="flex items-center space-x-2">
				<div class="w-3 h-3 rounded-full {connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
				<span class="text-sm font-medium text-gray-300">
					{#if connectionStatus === 'testing'}
						Testing connection...
					{:else if connectionStatus === 'connected'}
						✅ Connected
					{:else}
						❌ Connection Failed
					{/if}
				</span>
			</div>
			
			{#if connectionStatus === 'failed'}
				<button 
					onclick={retryConnection}
					class="bg-gray-600 hover:bg-gray-500 text-gray-200 px-3 py-1 rounded text-sm font-medium transition-colors"
				>
					Retry
				</button>
			{/if}
		</div>
		
		<div class="text-sm text-gray-400 mb-2">
			<strong>API Endpoint:</strong> {apiUrl}
		</div>
		
		{#if errorDetails}
			<div class="bg-red-900 border border-red-700 text-red-300 px-3 py-2 rounded text-sm">
				<strong>Error:</strong> {errorDetails}
			</div>
		{/if}
		
		{#if connectionStatus === 'failed'}
			<div class="mt-4 p-4 bg-gray-700 border border-gray-600 rounded">
				<h3 class="text-sm font-medium text-gray-300 mb-2">Troubleshooting:</h3>
				<ul class="text-sm text-gray-400 space-y-1">
					<li>• Make sure your backend server is running on port 8080</li>
					<li>• Check that the API endpoints are accessible at {apiUrl}</li>
					<li>• Verify CORS is properly configured on the backend</li>
					<li>• Ensure the essays endpoint exists and returns valid JSON</li>
				</ul>
			</div>
		{/if}
	</div>
</div>