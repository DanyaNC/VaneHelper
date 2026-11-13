// background.js - Service worker. Routes messages to feature-specific handlers.

// Feature helper scripts. Add one line per feature that needs background work.
importScripts('features/reverse-stories/notion.js');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Vane-Helper extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'addToNotion') {
    addVideoToNotion(request)
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep the message channel open for the async response
  }
});