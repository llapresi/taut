const http = require('http');
const serveStatic = require('./serveStatic.js');
const ChatChannel = require('./chatChannel.js');
const channelManager = require('./channelManager');

const query = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
let counter = 0;

http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (serveStatic.getStaticFile(req, res) === false) {
      channelManager.channelRoutes(req, res);
    }
  } else if (req.method === 'POST') {
    if (req.url === '/testChannel') {
      counter += 1;
      console.log(`fricking frick ${counter}`);
      let body = '';

      req.on('error', (err) => {
        console.dir(err);
        res.statusCode = 400;
        res.end();
      });

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const userMsg = query.parse(body);
        testChannel.addMessage(userMsg.user, userMsg.message_text);
        res.statusCode = 201;
        res.end();
      });
    }
  }
}).listen(port);

console.log(`Server is listening on port ${port}`);
