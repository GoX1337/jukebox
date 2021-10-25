const express = require('express');
const path = require('path');
const router = express.Router();

router.use(express.static(__dirname + '/../view/'));

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/view/index.html'));
});

module.exports = router;