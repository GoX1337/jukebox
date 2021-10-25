const express = require('express');
const path = require('path');
const router = express.Router();

router.use(express.static(__dirname + '/view/public'));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/public/index.html'));
});

module.exports = router;