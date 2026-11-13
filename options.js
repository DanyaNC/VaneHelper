// options.js - Settings page.
// The Notion token is a GLOBAL setting. Each feature can declare its own
// settings (e.g. the reverse-stories feature needs a database id); those are
// stored under featureSettings[<featureId>].

const notionTokenInput = document.getElementById('notion-token');
const featureSettingsContainer = document.getElementById('feature-settings');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsStatus = document.getElementById('settings-status');

// Build the per-feature settings UI from each feature's `settings` array.
// Returns a map: featureId -> { settingKey: inputElement }.
function buildFeatureSettings(features) {
  const inputs = {};

  features.forEach((feature) => {
    const declared = feature.settings || [];
    if (!declared.length) return;

    inputs[feature.id] = {};

    const section = document.createElement('section');
    section.className = 'card panel feature-section';

    const heading = document.createElement('h2');
    heading.textContent = feature.label || feature.id;
    section.appendChild(heading);

    declared.forEach((setting) => {
      const group = document.createElement('div');
      group.className = 'field-group';

      const label = document.createElement('label');
      label.setAttribute('for', `${feature.id}-${setting.key}`);
      label.textContent = setting.label || setting.key;

      const input = document.createElement('input');
      input.className = 'field';
      input.type = setting.type || 'text';
      input.id = `${feature.id}-${setting.key}`;
      if (setting.placeholder) input.placeholder = setting.placeholder;

      group.appendChild(label);
      group.appendChild(input);

      if (setting.hint) {
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.textContent = setting.hint;
        group.appendChild(hint);
      }

      section.appendChild(group);
      inputs[feature.id][setting.key] = input;
    });

    featureSettingsContainer.appendChild(section);
  });

  return inputs;
}

const featureInputs = buildFeatureSettings(window.FEATURES || []);

// Load saved settings.
chrome.storage.local.get(['notionToken', 'featureSettings'], (data) => {
  if (data.notionToken) notionTokenInput.value = data.notionToken;

  const storedFeatureSettings = data.featureSettings || {};
  Object.keys(featureInputs).forEach((featureId) => {
    const stored = storedFeatureSettings[featureId] || {};
    Object.keys(featureInputs[featureId]).forEach((key) => {
      if (stored[key] != null) featureInputs[featureId][key].value = stored[key];
    });
  });
});

// Save settings.
saveSettingsBtn.addEventListener('click', () => {
  const featureSettings = {};
  Object.keys(featureInputs).forEach((featureId) => {
    featureSettings[featureId] = {};
    Object.keys(featureInputs[featureId]).forEach((key) => {
      featureSettings[featureId][key] = featureInputs[featureId][key].value.trim();
    });
  });

  chrome.storage.local.set({
    notionToken: notionTokenInput.value.trim(),
    featureSettings
  }, () => {
    settingsStatus.textContent = 'Settings saved';
    settingsStatus.classList.add('visible', 'success');
    settingsStatus.classList.remove('error');
    setTimeout(() => {
      settingsStatus.classList.remove('visible');
    }, 2000);
  });
});
