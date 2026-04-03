# Project Context: Simple Image Uncrop Utility

## Overview
This project is a purely static, client-side web utility that allows users to "uncrop" or extend the canvas of an uploaded image using pure background colors. It is designed to be highly performant, privacy-first (no server uploads), and deeply optimized for mobile devices.

## Tech Stack & Constraints
- **Language:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Dependencies:** ZERO. No React, Vue, Tailwind, or build tools (Webpack/Vite). 
- **Architecture:** Single-file application (`index.html`). 
- **Rule:** Do NOT introduce any external libraries, frameworks, or build pipelines. The app must remain runnable by simply double-clicking the HTML file.

## Core Mechanics
1. **Canvas API:** The core engine. Images are drawn to a `<canvas>` using `ctx.drawImage()`.
2. **FileReader API:** Used to load images directly from the user's local filesystem into the browser memory via `readAsDataURL`.
3. **EyeDropper API:** Uses the native `window.EyeDropper` to pick colors. Fails gracefully on unsupported mobile browsers by instructing users to use the native OS color picker attached to the `<input type="color">`.

## Key Architectural Decisions & "Hacks" (Do Not Remove)
Future contributors/AIs must preserve the following mechanics, as they solve specific UI/UX bugs:

- **The "Infinite Canvas" Wrapper:** - *Problem:* CSS `transform: scale()` shrinks visual size but leaves a massive invisible bounding box, causing native scrollbars to go wild.
  - *Solution:* The app uses a 6000x6000px `.scroll-area`. The actual canvas is wrapped in `#zoomWrapper` and placed at coordinate (3000, 3000). JavaScript manually controls the scroll position (`scrollTo`) to keep the camera centered.
- **Pointer Events for Dragging:** - *Implementation:* The 8-way drag handles use `pointerdown`, `pointermove`, and `pointerup`. 
  - *Reasoning:* This ensures 1:1 parity between desktop mouse clicks and mobile touch screens. `mousedown`/`touchstart` are intentionally avoided.
- **Touch Action None:** - *Implementation:* `.handle { touch-action: none; }`
  - *Reasoning:* Prevents iOS/Android from interpreting a canvas drag as a page swipe/scroll.
- **Mobile Font-Size Hack:** - *Implementation:* `input[type="number"] { font-size: 16px; }`
  - *Reasoning:* If font sizes on inputs are less than 16px, iOS Safari forcefully zooms the entire webpage camera in when a user taps the input, ruining the canvas zoom math. 
- **Ultra-Compact Mobile Layout:**
  - *Implementation:* On screens `< 768px`, the `.toolbar` abandons flex-wrap and becomes a strict vertical column with nested CSS Grids. Labels are placed directly *above* inputs (using `flex-direction: column` on `.input-pair`) to fit 4 inputs horizontally without requiring a scrollbar.
  - *Reasoning:* Prevents the "vanishing bottom padding" bug inherent to WebKit mobile browsers when using `overflow-y: auto` on flex containers.
- **Dynamic Viewport Height:**
  - *Implementation:* `body { height: 100dvh; }`
  - *Reasoning:* Accounts for the mobile browser URL bar expanding/collapsing.

## State Management & Undo/Redo
- **History Stack:** Uses a simple array (`history`) capped at 30 states to prevent memory leaks on mobile devices.
- **State Object:** Captures Canvas Width (`cw`), Canvas Height (`ch`), Image X (`ix`), Image Y (`iy`), and current Fill Color (`color`).
- **Save Triggers:** State is saved ONLY on `pointerup` (end of a drag), `change` on inputs (loss of focus), or button clicks. It is intentionally NOT saved on `input` events to prevent flooding the history stack.
- **Shortcuts:** Listens for `Cmd+Z` / `Ctrl+Z` (Undo) and `Cmd+Shift+Z` / `Ctrl+Y` (Redo).

## Future Feature Guidelines
If adding new features, they must adhere to the single-file constraint. UI additions must be tested against the narrow `320px` width of an iPhone SE to ensure the 4-column mobile layout does not break.