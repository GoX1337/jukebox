const { Server } = require("socket.io");
let io;

module.exports = (httpServer) => {
    io = new Server(httpServer,  { cors: { origin: '*' } });
}

module.exports.server = () => {
    return io;
}
