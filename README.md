# Simple Image Uncrop Utility 🖼️

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge)](https://image-uncrop.github.io)
[![Single File](https://img.shields.io/badge/App-Single_HTML_File-blue?style=for-the-badge)](#)
[![Zero Dependencies](https://img.shields.io/badge/Runtime_Dependencies-0-blue?style=for-the-badge)](#)
[![Works Offline](https://img.shields.io/badge/Works-Offline-informational?style=for-the-badge)](#)

A lightweight, purely static web utility designed to easily "uncrop" or extend the canvas of an image using pure background colors. It runs entirely in your browser, ensuring your images never leave your device.

> **Single file. No install. Works offline.** The entire app is one `index.html` file — no build step, no dependencies, no server. Save the file to your device and open it in any browser, even without an internet connection.

**Try it out live: [garily.github.io/image-uncrop](https://garily.github.io/image-uncrop)**

## ✨ Features

* **🔒 Privacy-First:** 100% client-side rendering. Your images are never uploaded to any server.
* **📱 Fully Responsive:** Carefully optimized UI that works flawlessly on desktop browsers and mobile devices (down to the size of an iPhone SE).
* **🎯 Precision Controls:** Extend your image by dragging 8-point magnetic handles, or by typing exact pixel dimensions for Width, Height, Top, Bottom, Left, and Right margins.
* **💧 Native Eyedropper:** Instantly pick a background extension color from anywhere on your screen or original image.
* **↩️ Undo / Redo:** A robust 30-step history stack (`Cmd+Z` / `Ctrl+Z`) so you can experiment without fear.
* **⚡ Zero Dependencies:** Built with pure HTML, CSS, and Vanilla JavaScript. No React, no Vue, no build steps required.

## 🚀 How to Use

1. Click **Choose File** to upload an image from your device.
2. Use the **drag handles** or the **text inputs** (Width/Height/Margins) to extend the canvas.
3. Select a fill color using the color picker or the **Eyedropper (💧)** tool.
4. Click **Save Image** to instantly download your newly uncropped image, dynamically named with its new dimensions.

## 🛠️ Local Development

The entire app is a single `index.html` file with no runtime dependencies and no build pipeline. To use or develop it locally:

1. Clone the repository:
   `git clone https://github.com/garily/image-uncrop.github.io.git`
2. Double-click `index.html` to open it in any modern web browser.

That's it. No `npm install`, no build step, no server required. You can also just **save the `index.html` file from the live demo** and open it directly — it works fully offline.

## 🧪 Testing

The app is tested with [Playwright](https://playwright.dev/) — the only dev dependency, never bundled into the deployed `index.html`.

**Run tests locally:**
```bash
npm install
npx playwright install chromium
npx playwright test
```

The test suite (`tests/app.spec.js`) covers 38 cases across:
- i18n auto-detection and manual language switching
- Help modal open/close and translation
- Image loading and canvas dimensions
- Margin, width, and height inputs
- Center Image button
- Undo / Redo (keyboard shortcuts)
- Zoom slider
- Color picker
- Save button filename

**CI:** Tests run automatically on every push and pull request via GitHub Actions (`.github/workflows/test.yml`). A Playwright HTML report is uploaded as an artifact on failure.

## 📝 Browser Support

* **Chrome / Edge / Opera:** Full support (including the native web Eyedropper API).
* **Safari / Firefox:** Full support for core features (Use the color square to access the native OS eyedropper tool).
* **Mobile (iOS/Android):** Full support with touch-optimized pointer events.

## 👤 Author

Built by **[Gary Li](https://github.com/garily)**.