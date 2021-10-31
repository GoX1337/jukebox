<template>
  <Track v-for="(track, index) in orderedTracks" :track="track" :index="index" :key="track.id" @vote="vote"></Track>
</template>

<script>
import Track from './Track.vue'
import axios from 'axios';

export default {
  name: 'Tracks',
  props: {
  },
  components: {
    Track
  },
  data() {
    return {
      tracks: []
    }
  },
  mounted() {
      axios
          .get('/jukebox/tracks', {
            withCredentials: true
          })
          .then(response => {
              if(response.data){
                  this.tracks = response.data.items.map(t => t.track);
              }
          })
          .catch(err => { console.error(err)});
  },
  methods: {
      vote: async function (index, trackId, upvote) {
           axios
            .post('/jukebox/vote', {
              trackId: trackId,
              upvote: upvote
            })
            .then(async (resp) => {
                this.tracks = resp.data.items.map(t => t.track);
            })
            .catch(err => { console.error(err)});
      }
  },
  computed: {
    orderedTracks: function() {
        let orderedTracks = this.tracks;
        orderedTracks.sort((a, b) =>  b.voteCount - a.voteCount);
        return orderedTracks;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
