window.onload = () => {
  const content = document.getElementById('messages');
  const messageForm = document.getElementById('messageForm');

  function updateMessages() {
    fetch('/testChannel', {
      method: 'GET',
    }).then(res => res.json()).then((data) => {
      content.innerHTML = '';
      data.sort((a, b) => a.timestamp - b.timestamp);
      data.forEach((msg) => {
        content.innerHTML += `<br/><span class="message"><span class="message--user">${msg.user}: </span>${msg.text}</span>`;
      });
    });
  }

  messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const messageText = document.getElementById('message_text').value;
    const messageUser = document.getElementById('message_user').value;

    fetch('/testChannel', {
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
