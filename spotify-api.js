require('dotenv').config();
const moment = require('moment');
const axios = require('axios');

const spotifyTokenUrl    = 'https://accounts.spotify.com/api/token';
const spotifyPlaylistUrl = 'https://api.spotify.com/v1/playlists';
let token;
let tokenExpirationDate;

let getToken = async () => {
    const credentialsBase64 = Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios({
        method: 'POST',
        url: spotifyTokenUrl,
        params: params,
        headers: { 
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + credentialsBase64 
        },
    });
    return response.data;
}

let getTracks = async () => {
    if(!token || moment().isAfter(tokenExpirationDate)){
        const tokenResponse = await getToken();
        token = tokenResponse.access_token;
        tokenExpirationDate = moment().add(tokenResponse.expires_in, 'seconds');
        console.log("Get new token from spotify api");
        console.log(`token: ${token}; expire at ${tokenExpirationDate}`);
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

module.exports.getTracks = getTracks;