window.onload = () => {
  // Consts for DOM stuff
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
  const channelSelect = document.getElementById('channel-select');
  const contentParent = document.getElementById('messages-parent');

  // Stores the current URL to fetch JSON from and the current array of messages in memory
  let currentChannelURL = './channels/testChannel';
  let currentMessageArray = [];

  // Stores timestamp of the last message, used to
  let lastReceivedTimeStamp = 0;

  // Actually puts the messages into the view
  function displayMessages() {
    // Clear the content DOM object
    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }

    // Foreach the current messageArray to append messages to the DOM
    currentMessageArray.forEach((msg, idx) => {
      const newMessage = document.createElement('span');
      newMessage.className = 'message';
      if (idx === currentMessageArray.length - 1) {
        newMessage.className = 'message new-message';
      }
      newMessage.innerHTML = `<span class="message--user">${msg.user}: </span>${msg.text}`;
      content.appendChild(newMessage);
    });
  }

  // Fetches messages from servers and fills array
  function updateMessages() {
    // Call to the server
    fetch(`${currentChannelURL}?latestTimestamp=${lastReceivedTimeStamp}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }).then((res) => {
      // Only go forward if we get a 200 status
      if (res.status === 200) {
        return res.json();
      }
      return Response.error();
    }).then((data) => {
      if (data.length > 0) {
        // add new messages to the message array
        data.forEach((msg) => {
          currentMessageArray.push(msg);
        });

        // Removes duplicates messages from the array
        currentMessageArray = Array.from(new Set(currentMessageArray));
        // Sorts message array by message timestamp
        currentMessageArray.sort((a, b) => a.timestamp - b.timestamp);
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
    currentMessageArray = [];
    console.log(currentChannelURL);
    updateMessages();
    msgLoop = setInterval(() => {
      updateMessages();
    }, 400);
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
