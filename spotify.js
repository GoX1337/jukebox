require('dotenv').config();
const moment = require('moment');
const axios = require('axios');
const Redis = require("ioredis");
const redis = new Redis(); 

const spotifyTokenUrl = "https://accounts.spotify.com/api/token";
const spotifyApiUrl   = "https://api.spotify.com/v1";
const redirectUri     = process.env.REDIRECT_URI;
let token;
let refreshToken;
let tokenExpirationDate;
let authorizationCode;
let playlistSnapshot;

redis.get("token", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get token from redis`);
          token = value;
        }
    }
});
redis.get("refreshToken", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get refreshToken from redis`);
          refreshToken = value;
        }
    }
});
redis.get("tokenExpirationDate", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get tokenExpirationDate from redis`);
          tokenExpirationDate = moment(value);
        }
    }
});

const scope = 'playlist-modify-private playlist-read-private ' +
              'playlist-modify-public playlist-read-collaborative ' + 
              'user-read-playback-state user-modify-playback-state ' + 
              'user-read-currently-playing user-library-modify user-library-read ' + 
              'user-read-playback-position user-read-recently-played user-top-read ' + 
              'app-remote-control streaming user-follow-modify user-follow-read';

axios.interceptors.request.use(async (config) => {
    if(config.url.indexOf(spotifyTokenUrl) == -1){
        if(!token){
            await getToken();
        } else if(token && moment().isAfter(tokenExpirationDate)){
            await getToken(true);
        }
        config.headers['Content-type'] = 'application/json';
        config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
    }, (error) => {
    return Promise.reject(error);
});

module.exports.buildAuthCodeFlowUrl = () => {
    return 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: redirectUri
    }).toString();
}

let getToken = async (refresh) => {
    const credentialsBase64 = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
    const params = new URLSearchParams();
    if(!refresh){
        params.append('grant_type', 'authorization_code');
        params.append('code', authorizationCode);
        params.append('redirect_uri', redirectUri);
    } else {
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', refreshToken);
    }
    try {
        const response = await axios({
            method: 'POST',
            url: spotifyTokenUrl,
            params: params,
            headers: { 
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + credentialsBase64 
            },
        });
        token = response.data.access_token;
        refreshToken = response.data.refresh_token;
        tokenExpirationDate = moment().add(response.data.expires_in, 'seconds');
        console.log("Get new token from spotify api"); 
        redis.set("token", token);
        redis.set("refreshToken", refreshToken);
        redis.set("tokenExpirationDate", tokenExpirationDate.toISOString());
    } catch(e){
        console.error(e.data);
    }
}

module.exports.getTracks = async () => {  
    let tracks;
    let t = await redis.get("tracks");
    if(t){
        tracks = JSON.parse(t);
        console.log("Get tracks from redis");
    } else {
        console.log("No tracks in redis, get tracks calling spotify api");
    }
    
    if(!tracks){
        const response = await axios({
            method: 'GET',
            url: spotifyApiUrl + '/playlists/' + process.env.JUKEBOX_PLAYLIST_ID + '/tracks',
        });
        tracks = response.data;
    }

    let votes = await redis.hgetall("votes");
    tracks.items.forEach(item => {
        delete item.track.available_markets;
        delete item.track.album.available_markets;
        if(votes && votes[item.track.id]){
            item.track.voteCount = Number(votes[item.track.id]);
        } else {
            item.track.voteCount = 0;
        }
    });

    tracks.items.sort((a, b) =>  b.track.voteCount - a.track.voteCount)
    redis.set("tracks", JSON.stringify(tracks));

    tracks.items.forEach(item => {
       console.log("  -", item.track.artists[0].name, item.track.name, item.track.voteCount)
    });

    return tracks;
}

module.exports.getMe = async () => {    
    const response = await axios({
        method: 'GET',
        url: spotifyApiUrl + '/me'
    });
    return response.data;
}

module.exports.getPlaylist = async () => {    
    const response = await axios({
        method: 'GET',
        url: spotifyApiUrl + '/playlists/' + process.env.JUKEBOX_PLAYLIST_ID
    });
    return response.data;
}

let updatePlaylist = async (snapshotId, rangeStart, insertBefore, rangeLength) => {    
    const response = await axios({
        method: 'PUT',
        url: spotifyApiUrl + '/playlists/' + process.env.JUKEBOX_PLAYLIST_ID + '/tracks',
        data: {
            "range_start"  : rangeStart,
            "insert_before": insertBefore,
            "range_length" : rangeLength,
            "snapshot_id"  : snapshotId
        }
    });
    return response.data;
}

module.exports.call = async (method, route) => {    
    const response = await axios({
        method: method,
        url: spotifyApiUrl + route
    });
    return response.data;
}

module.exports.setAuthorizationCode = (code) => {
    authorizationCode = code;
}

module.exports.clearCache = () => {
    redis.del("token");
    redis.del("refreshToken");
    redis.del("tokenExpirationDate");
    redis.del("tracks");
    redis.del("votes");
    token = null;
    refreshToken = null;
    tokenExpirationDate = null;
}

module.exports.vote = async (ip, trackId, upvote, index) => {
    redis.hincrby("votes", trackId, (upvote ? 1 : -1));
    let tracks = await this.getTracks();
    let updatedIndex = 0;
    for(; updatedIndex < tracks.items.length; updatedIndex++){
        if(tracks.items[updatedIndex].track.id == trackId){
            break;
        }
    }

    if(!playlistSnapshot){
        const playlist = await this.getPlaylist();
        playlistSnapshot = playlist.snapshot_id;
        console.log("snapshot_id", playlistSnapshot);
    }

    let res = await updatePlaylist(playlistSnapshot, index, updatedIndex > index ? updatedIndex + 1 : updatedIndex, 1);
    playlistSnapshot = res.snapshot_id;
    return tracks;
}