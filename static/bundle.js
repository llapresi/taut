'use strict';

window.onload = function () {
  var content = document.getElementById('messages');
  var messageForm = document.getElementById('messageForm');
  var channelSelect = document.getElementById('channel-select');
  var currentChannelURL = '/channels/testChannel';

  var lastReceivedTimeStamp = 0;

  function updateMessages() {
    fetch(currentChannelURL + '?latestTimestamp=' + lastReceivedTimeStamp, {
      method: 'GET'
    }).then(function (res) {
      return res.json();
    }).then(function (data) {
      if (data.length > 0) {
        data.sort(function (a, b) {
          return a.timestamp - b.timestamp;
        });
        data.forEach(function (msg) {
          content.innerHTML += '<br/><span class="message"><span class="message--user">' + msg.user + ': </span>' + msg.text + '</span>';
        });
        lastReceivedTimeStamp = data[data.length - 1].timestamp;
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
        channelSelect.innerHTML = channelSelect.innerHTML + '<a class="channel-link" href="/channels/' + channel + '">' + channel + '</a> ';
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
  var msgLoop = setInterval(function () {
    updateMessages();
  }, 1000);

  listServerChannels(function () {
    var channelLinks = document.querySelectorAll('.channel-link');
    channelLinks.forEach(function (channel) {
      channel.addEventListener('click', function (e) {
        e.preventDefault();
        console.log(channel.getAttribute('href'));
        clearInterval(msgLoop);
        currentChannelURL = channel.getAttribute('href');
        lastReceivedTimeStamp = 0;
        content.innerHTML = '';
        console.log(currentChannelURL);
        updateMessages();
        msgLoop = setInterval(function () {
          updateMessages();
        }, 500);
      });
    });
  });
};
