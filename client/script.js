window.onload = () => {
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
  const channelSelect = document.getElementById('channel-select');
  const contentParent = document.getElementById('messages-parent');
  let currentChannelURL = './channels/testChannel';

  let lastReceivedTimeStamp = 0;

  function updateMessages() {
    fetch(`${currentChannelURL}?latestTimestamp=${lastReceivedTimeStamp}`, {
      method: 'GET',
    }).then((res) => {
      if (res.status === 200) {
        return res.json();
      }
      return Response.error();
    }).then((data) => {
      if (data.length > 0) {
        data.sort((a, b) => a.timestamp - b.timestamp);
        data.forEach((msg, idx, array) => {
          const newMessage = document.createElement('span');
          newMessage.className = 'message';
          if (idx === array.length - 1) {
            newMessage.className = 'message new-message';
          }
          newMessage.innerHTML = `<span class="message--user">${msg.user}: </span>${msg.text}`;
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
      method: 'GET',
    }).then(res => res.json()).then((data) => {
      channelSelect.innerHTML = '';
      data.channels.forEach((channel) => {
        channelSelect.innerHTML = `${channelSelect.innerHTML}<a class="channel-link" href="/channels/${channel}" id="${channel}">${channel}</a> `;
      });
      callback();
    });
  }

  // Set-up message sending
  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = document.getElementById('message_text').value;
    const messageUser = document.getElementById('message_user').value;

    fetch(currentChannelURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `message_text=${messageText}&user=${messageUser}`,
    });
    e.preventDefault();
  });

  // Setup our update loop
  let msgLoop = {};

  const setCurrentChatChannel = (channelURL) => {
    clearInterval(msgLoop);
    currentChannelURL = `.${channelURL}`;
    lastReceivedTimeStamp = 0;
    content.innerHTML = '';
    console.log(currentChannelURL);
    updateMessages();
    msgLoop = setInterval(() => {
      updateMessages();
    }, 800);
  };

  listServerChannels(() => {
    const channelLinks = document.querySelectorAll('.channel-link');
    channelLinks.forEach((channel) => {
      channel.addEventListener('click', (e) => {
        e.preventDefault();
        setCurrentChatChannel(channel.getAttribute('href'));
        // Set active channel style
        channelLinks.forEach((c) => {
          const q = c;
          q.className = '';
        });
        const q = channel;
        q.className = 'channel-open';
      });
    });
    document.getElementById('testChannel').className = 'channel-open';
  });

  setCurrentChatChannel(currentChannelURL);
};
