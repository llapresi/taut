'use strict';

window.onload = function () {
  // Consts for DOM stuff
  var content = document.getElementById('messages');
  var messageForm = document.getElementById('messageForm');
  var channelSelect = document.getElementById('channel-select');
  var contentParent = document.getElementById('messages-parent');

  // Stores the current URL to fetch JSON from and the current array of messages in memory
  var currentChannelURL = './channels/testChannel';
  var currentMessageArray = [];

  // Stores timestamp of the last message, used to
  var lastReceivedTimeStamp = 0;

  // Actually puts the messages into the view
  function displayMessages() {
    // Clear the content DOM object
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    // Foreach the current messageArray to append messages to the DOM
    currentMessageArray.forEach(function (msg, idx) {
      var newMessage = document.createElement('span');
      newMessage.className = 'message';
      if (idx === currentMessageArray.length - 1) {
        newMessage.className = 'message new-message';
      }
      newMessage.innerHTML = '<span class="message--user">' + msg.user + ': </span>' + msg.text;
      content.appendChild(newMessage);
    });
  }

  // Fetches messages from servers and fills array
  function updateMessages() {
    // Call to the server
    fetch(currentChannelURL + '?latestTimestamp=' + lastReceivedTimeStamp, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    }).then(function (res) {
      // Only go forward if we get a 200 status
      if (res.status === 200) {
        return res.json();
      }
      return Response.error();
    }).then(function (data) {
      if (data.length > 0) {
        // add new messages to the message array
        data.forEach(function (msg) {
          currentMessageArray.push(msg);
        });

        // Removes duplicates messages from the array
        currentMessageArray = Array.from(new Set(currentMessageArray));
        // Sorts message array by message timestamp
        currentMessageArray.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });
        console.log(currentMessageArray);
        // Calls display messages to render this to the view
        displayMessages();

        // Scrolls message view to the bottom to auto show new message
        lastReceivedTimeStamp = data[data.length - 1].timestamp;
        contentParent.scrollTop = contentParent.scrollHeight;

        // Clears message text box after sending message
        document.getElementById('message_text').value = '';
      }
    });
  }

  function listServerChannels(callback) {
    // Get list of channels from our server and add them to the menu
    fetch('/channels', {
      method: 'GET'
    }).then(function (res) {
      return res.json();
    }).then(function (data) {
      channelSelect.innerHTML = '';
      data.channels.forEach(function (channel) {
        channelSelect.innerHTML = channelSelect.innerHTML + '<a class="channel-link" href="/channels/' + channel + '" id="' + channel + '">' + channel + '</a> ';
      });
      callback();
    });
  }

  // Set-up message sending
  messageForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var messageText = document.getElementById('message_text').value;
    var messageUser = document.getElementById('message_user').value;

    fetch(currentChannelURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'message_text=' + messageText + '&user=' + messageUser
    });
    e.preventDefault();
  });

  // Setup our update loop
  var msgLoop = {};

  var setCurrentChatChannel = function setCurrentChatChannel(channelURL) {
    clearInterval(msgLoop);
    currentChannelURL = '.' + channelURL;
    lastReceivedTimeStamp = 0;
    currentMessageArray = [];
    console.log(currentChannelURL);
    updateMessages();
    msgLoop = setInterval(function () {
      updateMessages();
    }, 400);
  };

  listServerChannels(function () {
    var channelLinks = document.querySelectorAll('.channel-link');
    channelLinks.forEach(function (channel) {
      channel.addEventListener('click', function (e) {
        e.preventDefault();
        setCurrentChatChannel(channel.getAttribute('href'));
        // Set active channel style
        channelLinks.forEach(function (c) {
          var q = c;
          q.className = '';
        });
        var q = channel;
        q.className = 'channel-open';
      });
    });
    document.getElementById('testChannel').className = 'channel-open';
  });

  setCurrentChatChannel(currentChannelURL);
};
