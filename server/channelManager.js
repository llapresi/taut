const ChatChannel = require('./chatChannel.js');

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


const channelRoutes = (req, res) => {
  for (let i = 0; i < channels.length; i++) {
    if (req.url.substr(1) === channels[i].name) {
      channels[i].getMessages(req, res);
      return true;
    }
  }
  return false;
};

module.exports.channelRoutes = channelRoutes;
