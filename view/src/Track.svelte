<script>
	export let track;
    export let i;
</script>

<p>{i + 1} - {track.track.artists[0] && track.track.artists[0].name} - {track.track.name}</p>