class ChatChannel {
  constructor(name) {
    this.name = name;
    // Adding some test data to messages
    this.messages = [{
      text: `This is the first message in channel ${this.name}`,
      user: 'Taut-Service',
      timestamp: 1337,
    }];
  }

  getMessages(req, res, timestamp) {
    const returningMessages = JSON.stringify(this.messages.filter(msg => msg.timestamp > timestamp));
    if (returningMessages === '[]') {
      res.writeHead(204, { 'Content-Type': 'application/json' });
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write(JSON.stringify(this.messages.filter(msg => msg.timestamp > timestamp)));
    }
    res.end();
  }

  addMessage(msgUser, msgText) {
    const newMessage = {
      text: msgText,
      user: msgUser,
      timestamp: Date.now(),
    };
    this.messages.push(newMessage);
  }
}

module.exports = ChatChannel;
