require('dotenv').config();
const moment = require('moment');
const axios = require('axios');

const spotifyTokenUrl    = 'https://accounts.spotify.com/api/token';
const spotifyPlaylistUrl = 'https://api.spotify.com/v1/playlists';
const redirectUri        = "http://localhost:8080/jukebox/callback";
let token;
let refreshToken;
let tokenExpirationDate;
let authorizationCode;

const scope = 'playlist-modify-private playlist-read-private ' +
              'playlist-modify-public playlist-read-collaborative ' + 
              'user-read-playback-state user-modify-playback-state ' + 
              'user-read-currently-playing user-library-modify user-library-read ' + 
              'user-read-playback-position user-read-recently-played user-top-read ' + 
              'app-remote-control streaming user-follow-modify user-follow-read';

module.exports.buildAuthCodeFlowParams = () => {
    return new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: scope,
        redirect_uri: redirectUri
    }).toString();
}

let getToken = async (code) => {
    if(code){
        authorizationCode = code;
    }
    const credentialsBase64 = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', authorizationCode);
    params.append('redirect_uri', redirectUri);

    const response = await axios({
        method: 'POST',
        url: spotifyTokenUrl,
        params: params,
        headers: { 
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + credentialsBase64 
        },
    });
    console.log(response.data);
    token = response.data.access_token;
    refreshToken = response.data.refresh_token;
    tokenExpirationDate = moment().add(response.data.expires_in, 'seconds');
    console.log("Get new token from spotify api");
    console.log(`token: ${token}; expire at ${tokenExpirationDate}`);
    return response.data;
}

let getRefreshedToken = async (code) => {
    if(code){
        authorizationCode = code;
    }
    const credentialsBase64 = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    const response = await axios({
        method: 'POST',
        url: spotifyTokenUrl,
        params: params,
        headers: { 
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + credentialsBase64 
        },
    });
    console.log(response.data);
    token = response.data.access_token;
    tokenExpirationDate = moment().add(response.data.expires_in, 'seconds');
    console.log("Get new token from spotify api");
    console.log(`token: ${token}; expire at ${tokenExpirationDate}`);
    return response.data;
}

module.exports.getTracks = async () => {    
    if(!token || moment().isAfter(tokenExpirationDate)){
        await getToken();
    }
    const response = await axios({
        method: 'GET',
        url: spotifyPlaylistUrl + '/' + process.env.JUKEBOX_PLAYLIST_ID,
        headers: { 
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer ' + token 
        },
    });
    return response.data.tracks;
}

module.exports.getMe = async () => {    
    if(!token || moment().isAfter(tokenExpirationDate)){
        await getToken();
    }
    const response = await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/me',
        headers: { 
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer ' + token 
        },
    });
    return response.data;
}

module.exports.getPlaylist = async () => {    
    if(!token || moment().isAfter(tokenExpirationDate)){
        await getToken();
    }
    const response = await axios({
        method: 'GET',
        url: spotifyPlaylistUrl + '/' + process.env.JUKEBOX_PLAYLIST_ID,
        headers: { 
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer ' + token 
        }
    });
    return response.data;
}

module.exports.updatePlaylist = async () => {    
    if(!token || moment().isAfter(tokenExpirationDate)){
        await getToken();
    }
    const response = await axios({
        method: 'PUT',
        url: spotifyPlaylistUrl + '/' + process.env.JUKEBOX_PLAYLIST_ID + '/tracks',
        headers: { 
            'Content-Type' : 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        data: {
            "range_start": 0,
            "insert_before": 10,
            "range_length": 1,
            "snapshot_id" : "NjIsNGY1YzM5NWE4MGQ3N2Q1NGNmMzUzYzU0NGI2MTVmMjRjYzM3ZjU2OQ=="
        }
    });
    return response.data;
}

module.exports.setAuthorizationCode = (code) => {
    authorizationCode = code;
}