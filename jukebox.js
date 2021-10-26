require('dotenv').config();
const express = require('express');
const spotify = require('./spotify-api');
const router = express.Router({ caseSensitive: true });

router.get("/login", async (req, res) => {
    res.redirect('https://accounts.spotify.com/authorize?' + spotify.buildAuthCodeFlowParams());
});

router.get('/callback', async (req, res) => {
    try {
        if(req.query.code){
            spotify.setAuthorizationCode(req.query.code);
            res.redirect('http://localhost:8080/jukebox/tracks');
        } else {
            res.status(500).send();
        }
    }
    catch(e){
        console.error(e);
        res.status(500).send();
    }
});

router.get("/tracks", async (req, res) => {
    try {
        const tracks = await spotify.getTracks();
        res.status(200).send(tracks);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

router.get("/me", async (req, res) => {
    try {
        const tracks = await spotify.getMe();
        res.status(200).send(tracks);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

router.get("/playlist", async (req, res) => {
    try {
        const tracks = await spotify.getPlaylist();
        res.status(200).send(tracks);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

router.get("/updatePlaylist", async (req, res) => {
    try {
        const tracks = await spotify.updatePlaylist();
        res.status(200).send(tracks);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

module.exports = router;