const ChatChannel = require('./chatChannel.js');
const query = require('querystring');

const url = require('url');

const channels = [

];

function addChannel(name) {
  const c = new ChatChannel(name);
  channels.push(c);
}

addChannel('testChannel');
addChannel('general');
addChannel('memes');
addChannel('cool-shit');

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
  for (let i = 0; i < channels.length; i++) {
    if (parsedURL.pathname === `/channels/${channels[i].name}`) {
      channels[i].getMessages(req, res, parsedQuery.latestTimestamp);
      return true;
    }
  }
  if (req.url === '/channels') {
    listChannels(req, res);
    return true;
  }
  return false;
};

const addMessageRoutes = (req, res) => {
  const parsedURL = url.parse(req.url);
  for (let i = 0; i < channels.length; i++) {
    if (parsedURL.pathname === `/channels/${channels[i].name}`) {
      parseQuery(req, res, (data) => {
        channels[i].addMessage(data.user, data.message_text);
        res.statusCode = 201;
        res.end();
        return true;
      });
    }
  }
  return false;
};

module.exports.getMessageRoutes = getMessageRoutes;
module.exports.addMessageRoutes = addMessageRoutes;
