// popup.js - Renders the feature tiles and dispatches their actions.

const grid = document.getElementById('grid');
const statusEl = document.getElementById('status');
const settingsLink = document.getElementById('settings-link');

let busy = false;

function setStatus(text, isError = false) {
  statusEl.textContent = text || '';
  statusEl.classList.toggle('error', isError);
  statusEl.classList.toggle('success', !!text && !isError);
}

function setBusy(value) {
  busy = value;
  grid.querySelectorAll('.tile').forEach((t) => { t.disabled = value; });
}

// Build a tile element for a feature definition.
function createTile(feature) {
  const tile = document.createElement('button');
  tile.className = 'tile';
  tile.type = 'button';
  tile.title = feature.label;
  tile.innerHTML =
    `<span class="icon" aria-hidden="true">${feature.icon}</span>` +
    `<span class="label"></span>`;
  tile.querySelector('.label').textContent = feature.label;

  tile.addEventListener('click', async () => {
    if (busy) return;
    setBusy(true);
    setStatus('');
    try {
      await feature.run({ setStatus, setBusy });
    } catch (err) {
      console.error(`[${feature.id}]`, err);
      setStatus('Error: ' + err.message, true);
    } finally {
      setBusy(false);
    }
  });

  return tile;
}

// Render every registered feature. The grid (and popup height) grows automatically.
function render() {
  const features = window.FEATURES || [];
  grid.innerHTML = '';
  features.forEach((f) => grid.appendChild(createTile(f)));
}

settingsLink.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

render();
