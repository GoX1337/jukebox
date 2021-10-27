<template>
    <div class="container">
      <div class="Track">{{ index }}<strong class="artistName">{{ track.artists[0].name }}</strong>{{ track.name}}</div>
      <div class="upvote">
        <a href="#" v-on:click="upvote()">
          <img class="arrow" src="@/assets/arrow.png" />
        </a>
      </div>
      <div class="downvote">
        <a href="#" v-on:click="downvote()">
          <img class="arrow arrowDown" src="@/assets/arrow.png" />
        </a>
      </div>
      <div class="votecount">{{ track.vote || 1 }}</div>
    </div>
</template>

<script>
export default {
  name: 'Track',
  props: {
    index: Number,
    track: Object
  },
  data() {
    return {
    }
  },
  methods: {
      upvote: function () {
         console.log("upvote")
      },
      downvote: function () {
         console.log("downvote")
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.arrow {
  height: 30px;
  width: auto;
}

.arrowDown {
  transform: rotateX(180deg);
}

.artistName {
  padding-left: 5px;
  padding-right: 5px;
}

.container {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 30%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 0.8fr 1.4fr 0.8fr;
  gap: 0px 0px;
  grid-auto-flow: row;
  grid-template-areas:
    ". . . . . . upvote"
    "Track Track Track Track Track Track votecount"
    ". . . . . . downvote";
  margin-bottom: 15px;
  border: solid;
  border-width: 0.3px;
}

.Track { 
  display: flex;
  align-items: center;
  text-align: left;
  padding-left: 15px;
  grid-area: Track; 
  vertical-align: middle;
}

.upvote { grid-area: upvote; }

.downvote { grid-area: downvote; }

.votecount {
  grid-area: votecount; 
  display: flex;
  align-items: center;
  padding-left: 45%;
}

</style>
