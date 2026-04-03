# Simple Image Uncrop Utility 🖼️

[![Live Demo](https://img.shields.io/badge/Live_Demo-Available-success?style=for-the-badge)](https://image-uncrop.github.io)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-blue?style=for-the-badge)](#)

A lightweight, purely static web utility designed to easily "uncrop" or extend the canvas of an image using pure background colors. It runs entirely in your browser, ensuring your images never leave your device. 

**Try it out live: [image-uncrop.github.io](https://image-uncrop.github.io)**

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

Because this project has zero dependencies and requires no build pipeline, local development is as simple as it gets:

1. Clone the repository:
   `git clone https://github.com/garily/image-uncrop.github.io.git`
2. Open the directory.
3. Double-click `index.html` to open it in any modern web browser.

## 📝 Browser Support

* **Chrome / Edge / Opera:** Full support (including the native Eyedropper API).
* **Safari / Firefox:** Full support for core features (Eyedropper API falls back to standard OS color picker).
* **Mobile (iOS/Android):** Full support with touch-optimized pointer events.

## 👤 Author

Built by **[Gary Li](https://github.com/garily)**.