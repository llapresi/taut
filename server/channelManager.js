const ChatChannel = require('./chatChannel.js');
const query = require('querystring');
const xss = require('xss');

const url = require('url');

const channels = [
  new ChatChannel('testChannel'),
  new ChatChannel('general'),
  new ChatChannel('memes'),
  new ChatChannel('cool-stuff'),
];

const parseQuery = (req, res, callback) => {
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
    const data = query.parse(body);
    callback(data);
  });
};

const listChannels = (req, res) => {
  let output = '{"channels": [';
  for (let i = 0; i < channels.length; i++) {
    output = `${output}"${channels[i].name}"`;
    if (i !== channels.length - 1) {
      output = `${output},`;
    }
  }
  output = `${output}]}`;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(output);
  res.end();
};

const getMessageRoutes = (req, res) => {
  const parsedURL = url.parse(req.url);
  const parsedQuery = query.parse(parsedURL.query);
  let timeStamp = 0;

  if (parsedQuery.latestTimestamp !== undefined) {
    timeStamp = parsedQuery.latestTimestamp;
  }

  for (let i = 0; i < channels.length; i++) {
    if (parsedURL.pathname === `/channels/${channels[i].name}`) {
      channels[i].getMessages(req, res, timeStamp);
      return true;
    }
  }
  if (req.url === '/channels') {
    listChannels(req, res);
    return true;
  }
  return false;
};

const getMessageHeadRoute = (req, res) => {
  const parsedURL = url.parse(req.url);

  for (let i = 0; i < channels.length; i++) {
    if (parsedURL.pathname === `/channels/${channels[i].name}`) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end();
      return true;
    }
  }
  if (req.url === '/channels') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end();
    return true;
  }
  return false;
};

const addMessageRoutes = (req, res) => {
  const parsedURL = url.parse(req.url);
  for (let i = 0; i < channels.length; i++) {
    if (parsedURL.pathname === `/channels/${channels[i].name}`) {
      parseQuery(req, res, (data) => {
        channels[i].addMessage(xss(data.user), xss(data.message_text));
        res.statusCode = 201;
        res.end();
      });
      return true;
    }
  }
  return false;
};

module.exports.getMessageRoutes = getMessageRoutes;
module.exports.getMessageHeadRoute = getMessageHeadRoute;
module.exports.addMessageRoutes = addMessageRoutes;
