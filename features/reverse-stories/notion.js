// features/youtube-to-notion/notion.js
// Notion API helper specific to the "video -> Notion" feature.

// Creates a Notion page from a YouTube video (title, thumbnail cover, embed).
async function addVideoToNotion({ title, thumbnail, videoUrl, notionToken, databaseId }) {
  const body = {
    parent: { database_id: databaseId },
    properties: {
      // Assumes a database with a title property named "Name".
      // Change the key if your title property has a different name.
      Name: {
        title: [{ text: { content: title } }]
      }
    },
    // Use the video thumbnail as the page cover image.
    cover: {
      type: 'external',
      external: { url: thumbnail }
    },
    children: [
      {
        // Embed the YouTube video in the page body.
        object: 'block',
        type: 'embed',
        embed: { url: videoUrl }
      }
    ]
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson.message || JSON.stringify(errJson);
    } catch (e) {
      detail = res.statusText;
    }
    throw new Error(`Notion API ${res.status}: ${detail}`);
  }

  return res.json();
}
