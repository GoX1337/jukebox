const express = require('express');
const morgan = require('morgan');
const app = express();
const server = require('http').createServer(app);
const view = require('./view');
const jukebox = require('./jukebox');
const port = process.env.PORT || 8080;

app.disable('x-powered-by');
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('short'));

app.use('/', view);
app.use('/jukebox', jukebox);

server.listen(port, () => {
    console.log(`Jukebox nodejs server listening on port ${port}`);
});