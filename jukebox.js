require('dotenv').config();
const express = require('express');
const spotify = require('./spotify-api');
const router = express.Router({ caseSensitive: true });

router.get("/tracks", async (req, res) => {
    const tracks = await spotify.getTracks();
    res.status(200).send(tracks);
});

module.exports = router;