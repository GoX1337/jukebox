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
        console.log(req.headers['x-forwarded-for'] || req.socket.remoteAddress);
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

router.get("/cache/clear", async (req, res) => {
    try {
        await spotify.clearCache();
        res.status(200).send("Redis cache cleared");
    } catch(e){
        console.error(e.response.data);
        res.status(500).send();
    }
});

router.post("/vote", async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const body = req.body;
        console.log("Vote: ", ip, body);
        const tracks = await spotify.vote(ip, body.trackId, body.upvote, body.index);
        res.status(200).send(tracks);
    } catch(e){
        console.error(e);
        res.status(500).send();
    }
});

router.get("/spotify*", async (req, res) => {
    try {
        console.log(req.query)
        const resp = await spotify.call('GET', req.url.replace("/spotify", ""));
        res.status(200).send(resp);
    } catch(e){
        console.error(e.response.data);
        res.status(500).send();
    }
});

router.put("/spotify*", async (req, res) => {
    try {
        const resp = await spotify.call('PUT', req.url.replace("/spotify", ""));
        res.status(200).send(resp);
    } catch(e){
        console.error(e.response.data);
        res.status(500).send();
    }
});

module.exports = router;