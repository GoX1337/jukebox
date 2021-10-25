require('dotenv').config();
const express = require('express');
const router = express.Router({ caseSensitive: true });

router.get("/", async (req, res) => {
    res.status(200).send("OK");
});

module.exports = router;