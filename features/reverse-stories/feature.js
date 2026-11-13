// features/reverse-stories/feature.js
// Feature: add the current YouTube video to Notion as a page with a cover
// image (the video thumbnail) and an embedded player.
//
// All data/logic specific to this feature lives in this folder.

const ReverseStories = {
  id: 'reverse-stories',
  label: 'Reverse Stories',

  // Icon shown on the popup tile (image lives next to this file).
  // Rendered inside the tile's icon slot; the tile itself is chrome-free.
  icon: `<img src="features/reverse-stories/icon.webp" alt="">`,

  // Per-feature settings this feature needs (surfaced on the options page).
  // The Notion token is global; the database id is specific to this feature.
  settings: [
    {
      key: 'databaseId',
      label: 'Notion Database ID',
      type: 'text',
      placeholder: '32-character database ID',
      hint: 'Share the target database with your integration, then copy its ID from the database URL.'
    }
  ],

  run: async ({ setStatus }) => {
    setStatus('Extracting video data...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !/youtube\.com|youtu\.be/.test(tab.url || '')) {
      throw new Error('Open a YouTube video page first.');
    }

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const title = document.title.split('|')[0].trim();
        const url = window.location.href;
        const videoIdMatch = url.match(/[?&]v=([\w-]{11})/) ||
          url.match(/youtu\.be\/([\w-]{11})/) ||
          url.match(/youtube\.com\/shorts\/([\w-]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : '';
        const thumbnail = videoId
          ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
          : '';
        return { title, thumbnail, videoUrl: url };
      }
    });

    const data = injectionResults && injectionResults[0] && injectionResults[0].result;
    if (!data || !data.thumbnail) {
      throw new Error('Could not find a video on this page.');
    }

    // Global token + this feature's database id.
    const stored = await chrome.storage.local.get(['notionToken', 'featureSettings']);
    const notionToken = stored.notionToken;
    const databaseId = (stored.featureSettings || {})['reverse-stories']?.databaseId;

    if (!notionToken) {
      throw new Error('Set your Notion token in Settings.');
    }
    if (!databaseId) {
      throw new Error('Set this feature\u2019s database ID in Settings.');
    }

    setStatus('Adding to Notion...');
    const response = await chrome.runtime.sendMessage({
      action: 'addToNotion',
      title: data.title,
      thumbnail: data.thumbnail,
      videoUrl: data.videoUrl,
      notionToken,
      databaseId
    });

    if (!response || !response.success) {
      throw new Error((response && response.error) || 'Failed to add to Notion.');
    }
    setStatus('Added to Notion successfully!');
  }
};

// Register with the global registry (no ES modules in MV3 popups).
window.__VANE_FEATURES__ = window.__VANE_FEATURES__ || [];
window.__VANE_FEATURES__.push(ReverseStories);
