window.onload = () => {
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
  const channelSelect = document.getElementById('channel-select');
  let currentChannelURL = '/channels/testChannel';

  let lastReceivedTimeStamp = 0;

  function updateMessages() {
    fetch(`${currentChannelURL}?latestTimestamp=${lastReceivedTimeStamp}`, {
      method: 'GET',
    }).then(res => res.json()).then((data) => {
      if (data.length > 0) {
        data.sort((a, b) => a.timestamp - b.timestamp);
        data.forEach((msg) => {
          content.innerHTML += `<br/><span class="message"><span class="message--user">${msg.user}: </span>${msg.text}</span>`;
        });
        lastReceivedTimeStamp = data[data.length - 1].timestamp;
      }
    });
  }

  function listServerChannels(callback) {
    fetch('/channels', {
      method: 'GET',
    }).then(res => res.json()).then((data) => {
      channelSelect.innerHTML = '';
      data.channels.forEach((channel) => {
        channelSelect.innerHTML = `${channelSelect.innerHTML}<a class="channel-link" href="/channels/${channel}">${channel}</a> `;
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
  let msgLoop = setInterval(() => {
    updateMessages();
  }, 1000);

  listServerChannels(() => {
    const channelLinks = document.querySelectorAll('.channel-link');
    channelLinks.forEach((channel) => {
      channel.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(channel.getAttribute('href'));
        clearInterval(msgLoop);
        currentChannelURL = channel.getAttribute('href');
        lastReceivedTimeStamp = 0;
        content.innerHTML = '';
        console.log(currentChannelURL);
        updateMessages();
        msgLoop = setInterval(() => {
          updateMessages();
        }, 500);
      });
    });
  });
};
