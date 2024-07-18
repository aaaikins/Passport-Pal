// Listener for when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});
// Listener for when the extension icon is clicked
chrome.action.onClicked.addListener((tab)=> {
  // Request an OAuth token interactively
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    // Handle any errors that occur during token retrieval
    if (chrome.runtime.lastError) {
      console.error('Error getting token:', chrome.runtime.lastError.message);
      return;
    }

    // Log the retrieved token
    console.log('Token:', token);

    // Store the token in Chrome's local storage
    chrome.storage.local.set({ authToken: token }, () => {
      // Handle any errors that occur during token storage
      if (chrome.runtime.lastError) {
        console.error('Error setting token:', chrome.runtime.lastError.message);
      } else {
        console.log('Token saved to local storage');
      }
    });
  });
});