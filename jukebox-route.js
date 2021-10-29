require('dotenv').config();
const express = require('express');
const spotify = require('./spotify');
const router = express.Router({ caseSensitive: true });

router.get("/login", async (req, res) => {
    res.redirect(spotify.buildAuthCodeFlowUrl());
});

router.get('/callback', async (req, res) => {
    try {
        if(req.query.code){
            spotify.setAuthorizationCode(req.query.code);
            res.redirect('/jukebox/tracks');
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

router.get("/spotify*", async (req, res) => {
    try {
        console.log(req.query)
        const resp = await spotify.get(req.url.replace("/spotify", ""));
        res.status(200).send(resp);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

module.exports = router;