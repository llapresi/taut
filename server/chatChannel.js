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
    const returningMessages =
      JSON.stringify(this.messages.filter(msg => msg.timestamp > timestamp));
    if (returningMessages === '[]') {
      res.statusCode = 204;
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
      msgID: this.nextMsgID,
    };
    this.messages.push(newMessage);
    this.nextMsgID += 1;
  }
}

module.exports = ChatChannel;
