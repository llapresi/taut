const http = require('http');
const serveStatic = require('./serveStatic.js');
const channelManager = require('./channelManager');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (serveStatic.getStaticFile(req, res) === false) {
      if (channelManager.getMessageRoutes(req, res) === false) {
        res.statusCode = 404;
        res.end();
      }
    }
  } else if (req.method === 'POST') {
    if (channelManager.addMessageRoutes(req, res) === false) {
      res.statusCode = 404;
      res.end();
    }
  } else if (req.method === 'HEAD') {
    if (serveStatic.getStaticHead(req, res) === false) {
      if (channelManager.getMessageHeadRoute(req, res) === false) {
        res.statusCode = 404;
        res.end();
      }
    }
  }
}).listen(port);

console.log(`Server is listening on port ${port}`);
