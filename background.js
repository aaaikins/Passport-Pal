chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      console.log('Token:', token);
      chrome.storage.local.set({ authToken: token });
    });
  });