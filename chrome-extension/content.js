// This script runs in the context of Gmail
function getEmails() {
  chrome.storage.local.get('authToken', (data) => {
    const token = data.authToken;
    fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=subject:flight', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => {
      // Process the email data to find flight information
      console.log('Emails:', data);
      const messageId = data.messages[0].id;
      fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => response.json())
      .then(message => {
        const body = message.payload.parts[0].body.data;
        const decodedBody = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
        console.log('Email body:', decodedBody);
        // Extract flight information from the email body
      });
    });
  });
}

// Send extracted flight information to the backend
function sendToBackend(flightInfo) {
  fetch('http://localhost:5000/checklist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ flight_info: flightInfo })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('checklist').innerText = data.checklist;
  });
}

// Add a listener to fetch emails when the button is clicked
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fetch-emails').addEventListener('click', getEmails);
});

async function getTravelChecklist(flightInfo) {
  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`
    },
    body: JSON.stringify({
      prompt: `Given the following flight information: ${flightInfo}, provide a checklist of travel documents needed for this flight.`,
      max_tokens: 150
    })
  });
  const data = await response.json();
  return data.choices[0].text;
}

// Use the function in your content script after extracting flight information
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fetch-emails').addEventListener('click', async () => {
    const flightInfo = '...'; // Extracted flight information
    const checklist = await getTravelChecklist(flightInfo);
    document.getElementById('checklist').innerText = checklist;
  });
});