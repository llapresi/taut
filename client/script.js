window.onload = () => {
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
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
  setInterval(() => {
    updateMessages();
  }, 500);
};
