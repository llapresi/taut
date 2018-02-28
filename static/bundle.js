'use strict';

window.onload = function () {
  var content = document.getElementById('messages');
  var messageForm = document.getElementById('messageForm');
  var channelSelect = document.getElementById('channel-select');
  var contentParent = document.getElementById('messages-parent');
  var currentChannelURL = './channels/testChannel';

  var lastReceivedTimeStamp = 0;

  function updateMessages() {
    fetch(currentChannelURL + '?latestTimestamp=' + lastReceivedTimeStamp, {
      method: 'GET'
    }).then(function (res) {
      if (res.status === 200) {
        return res.json();
      }
      return Response.error();
    }).then(function (data) {
      if (data.length > 0) {
        data.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });
        data.forEach(function (msg, idx, array) {
          var newMessage = document.createElement('span');
          newMessage.className = 'message';
          if (idx === array.length - 1) {
            newMessage.className = 'message new-message';
          }
          newMessage.innerHTML = '<span class="message--user">' + msg.user + ': </span>' + msg.text;
          content.appendChild(newMessage);
        });
        lastReceivedTimeStamp = data[data.length - 1].timestamp;
        contentParent.scrollTop = contentParent.scrollHeight;
        document.getElementById('message_text').value = '';
      }
    });
  }

  function listServerChannels(callback) {
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
    content.innerHTML = '';
    console.log(currentChannelURL);
    updateMessages();
    msgLoop = setInterval(function () {
      updateMessages();
    }, 800);
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
