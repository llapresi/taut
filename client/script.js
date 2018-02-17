window.onload = () => {
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');
  let lastReceivedTimeStamp = 0;

  function updateMessages() {
    fetch(`/channels/testChannel?latestTimestamp=${lastReceivedTimeStamp}`, {
      method: 'GET',
    }).then(res => res.json()).then((data) => {
      console.log(data);
      data.sort((a, b) => a.timestamp - b.timestamp);
      data.forEach((msg) => {
        content.innerHTML += `<br/><span class="message"><span class="message--user">${msg.user}: </span>${msg.text}</span>`;
      });
      lastReceivedTimeStamp = data[data.length - 1].timestamp;
      console.log(lastReceivedTimeStamp);
    });
  }

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = document.getElementById('message_text').value;
    const messageUser = document.getElementById('message_user').value;

    fetch('/channels/testChannel', {
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
