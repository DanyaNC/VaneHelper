// features/registry.js
// Central list of features. Each feature lives in its own folder under
// features/<id>/ and pushes itself onto window.__VANE_FEATURES__ when its
// feature.js is loaded.
//
// To add a new feature:
//   1. Create features/<id>/feature.js (and any other files it needs).
//   2. Add its script tag(s) to popup.html (before registry.js) and, if it
//      needs per-feature settings, to options.html.
//
// The popup grid renders whatever ends up in window.FEATURES. Tiles are
// chrome-free: the icon is the focal point and the label is secondary, so
// an `icon` should be a square glyph (inline SVG or a square image).

// Order matters: feature scripts register themselves here first.
window.FEATURES = window.__VANE_FEATURES__ || [];
