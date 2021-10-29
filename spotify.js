require('dotenv').config();
const moment = require('moment');
const axios = require('axios');
const Redis = require("ioredis");
const redis = new Redis(); 

const spotifyTokenUrl = 'https://accounts.spotify.com/api/token';
const spotifyApiUrl   = "https://api.spotify.com/v1";
const redirectUri     = "http://localhost:8080/jukebox/callback";
let token;
let refreshToken;
let tokenExpirationDate;
let authorizationCode;

redis.get("token", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get token from redis ${value}`);
          token = value;
        }
    }
});
redis.get("refreshToken", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get refreshToken from redis ${value}`);
          refreshToken = value;
        }
    }
});
redis.get("tokenExpirationDate", (err, value) => {
    if (err) {
      console.error(err);
    } else {
        if(value){
          console.log(`Get tokenExpirationDate from redis ${value}`);
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
    }, function (error) {
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
    console.log(`token: ${token}; expire at ${tokenExpirationDate}`);
    redis.set("token", token);
    redis.set("refreshToken", refreshToken);
    redis.set("tokenExpirationDate", tokenExpirationDate.toISOString());
    return response.data;
}

module.exports.getTracks = async () => {    
    const response = await axios({
        method: 'GET',
        url: spotifyApiUrl + '/playlists/' + process.env.JUKEBOX_PLAYLIST_ID,
    });
    return response.data.tracks;
}

module.exports.getMe = async () => {    
    const response = await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me'
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

module.exports.updatePlaylist = async () => {    
    const response = await axios({
        method: 'PUT',
        url: spotifyApiUrl + '/playlists/' + process.env.JUKEBOX_PLAYLIST_ID + '/tracks',
        data: {
            "range_start": 0,
            "insert_before": 10,
            "range_length": 1,
            "snapshot_id" : "NjIsNGY1YzM5NWE4MGQ3N2Q1NGNmMzUzYzU0NGI2MTVmMjRjYzM3ZjU2OQ=="
        }
    });
    return response.data;
}

module.exports.get = async (route) => {    
    const response = await axios({
        method: 'GET',
        url: spotifyApiUrl + route
    });
    return response.data;
}

module.exports.setAuthorizationCode = (code) => {
    authorizationCode = code;
}