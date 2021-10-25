<script>
	import { onMount } from 'svelte';
	import Track from "./Track.svelte";

	let tracks = [];

	onMount(async () => {
		const res = await fetch('http://localhost:8080/jukebox/tracks');
		const resJson = await res.json();
		tracks = resJson.items;
		console.log(tracks);
	});
	
</script>

<div class="content">
	<h1>Jukebox</h1>

	{#each tracks as track, i}
		<Track {i} {track} />
	{/each}
</div>

<style>
.content {
	max-width: 50%;
	margin: auto;
}
</style>