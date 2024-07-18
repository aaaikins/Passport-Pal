// This script runs in the context of Gmail

// Fetch flight-related emails
async function getEmails() {
  try {
    // Retrieve the auth token from Chrome's local storage
    const data = await chrome.storage.local.get('authToken');
    const token = data.authToken;

    // Fetch flight-related emails using Gmail API
    const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?q=subject:flight', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    // Parse the response as JSON
    const emailData = await response.json();
    console.log('Emails:', emailData);

    // Check if there are any flight-related emails
    if (!emailData.messages || emailData.messages.length === 0) {
      throw new Error('No flight-related emails found');
    }

    // Fetch the first email message
    const messageId = emailData.messages[0].id;
    const messageResponse = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Check if the message response is ok
    if (!messageResponse.ok) {
      throw new Error('Failed to fetch email message');
    }

    // Parse the email message as JSON
    const message = await messageResponse.json();
    const body = message.payload.parts[0].body.data;
    const decodedBody = atob(body.replace(/-/g, '+').replace(/_/g, '/'));
    console.log('Email body:', decodedBody);

    // Extract flight information from the email body
    const flightInfo = extractFlightInfo(decodedBody);

    // Send the extracted flight information to the backend
    await sendToBackend(flightInfo);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Extract flight information from the email body
function extractFlightInfo(emailBody) {
  // Implement this function based on the format of the flight information in the email body
  // This is a placeholder implementation
  const match = emailBody.match(/Flight Information: (.*)/);
  return match ? match[1] : null;
}

// Send the extracted flight information to the backend
async function sendToBackend(flightInfo) {
  try {
    // Send a POST request to the backend with the flight information
    const response = await fetch('http://localhost:5000/checklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ flight_info: flightInfo })
    });

    // Check if the response is ok
    if (!response.ok) {
      throw new Error('Failed to send flight information to backend');
    }

    // Parse the response as JSON
    const data = await response.json();
    document.getElementById('checklist').innerText = data.checklist;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Event listener for the fetch-emails button
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('fetch-emails').addEventListener('click', async () => {
    await getEmails();
  });
});
