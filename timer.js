const io = require('./socketio').server();
const spotify = require('./spotify');
let isPlaying = false;
let currentTrackId;

let startPlayerCheckerTimer = () => {
    setInterval(async () => {
        const player = await spotify.getPlayer();
        if(!player){
            console.log("No player opened");
        } else {
            isPlaying = player.is_playing;
            currentTrackId = player.item ? player.item.id : null;
            console.log("Player is " + (isPlaying ? "" : "not ") + "playing" + (isPlaying ? " track id " + currentTrackId : ""));
        }
    }, 5000);
}

console.log("Start spotify player checker timer");
startPlayerCheckerTimer();
