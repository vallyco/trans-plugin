```instructions
# Copilot Instructions for trans-plugin

This repository is a small Chrome extension (Manifest V3) that detects selected text on any webpage and shows a translation popup using the public Google Translate endpoint. Below are focused, actionable facts and examples to help an AI coding agent be productive immediately.

1) Big picture
- Purpose: content script (`content.js`) runs on all pages, detects text selection, renders a green translate button (`#translate-button`) and a translation popup (`#text-translation-popup`). `popup.html`/`popup.js` are minimal and provide the browser-action popup.
- Data flow: user selection -> `mouseup` handler (capture phase) -> selection range -> `translate` button click -> `translateText()` -> `callGoogleTranslate()` fetch -> parsed response -> update `.translation-text` inside the popup.

2) Key files to edit or inspect
- `manifest.json` (MV3, `content_scripts` inject `content.js`, `styles.css`, host permission for `https://translate.googleapis.com/*`).
- `content.js` (core behavior: selection detection, UI creation, fetch + parsing, timeouts, debug logging).
- `styles.css` (visual styles for `#translate-button` and `#text-translation-popup`).
- `popup.html` / `popup.js` (extension action UI; minimal).

3) Important implementation details and conventions
- UI element ids/classes: `translate-button`, `text-translation-popup`, `.translation-text`, `.close-btn`. Update these strings consistently when changing UI code or CSS.
- Positioning: the code uses `range.getClientRects()` and positions the button under the last rect; the popup assumes a width of 300 and height of 150 when calculating bounds. Keep these numbers in mind when changing layout.
- Flags & flow control: `isTranslating`, `isPopupVisible`, and `buttonClicked` are used to avoid duplicate UI creation and races. Respect/set these flags when modifying translation lifecycle.
- Networking: uses `https://translate.googleapis.com/translate_a/single` with an 8s AbortController timeout. The response is parsed as nested arrays; code aggregates text across `data[0]` entries. When adding alternative APIs, preserve parsing fallbacks.
- Debugging: use `debugLog()` which prefixes logs with `[Translation Plugin]`. Agent changes should maintain this helper or mirror its format.
- Event listeners: `document` handlers used are `mouseup` (capture phase), `click`, and `keyup` (Escape to close). Be careful with `true` capture on `mouseup`—it was intentional to detect selection early.
- z-index and containment: UI uses `position: fixed` and high `z-index` (~1000000). Avoid lower z-index that could cause overlay issues.

4) Developer workflows
- No build/install step. To test locally: open `chrome://extensions`, enable Developer mode, click "Load unpacked" and point to the repository folder.
- After edits to `content.js`/`styles.css`, reload the extension on `chrome://extensions` and refresh the target page. Use DevTools Console to view logs prefixed with `[Translation Plugin]`.
- Network debugging: translation requests go to `translate.googleapis.com`—use DevTools Network tab to inspect responses and CORS issues.

5) Safe edit patterns & examples
- Example: to update popup text, modify `content.js` at the `showTranslationPopup()` function—update `.translation-text` rather than recreating the whole DOM to preserve listeners.
- Example: when changing timeout or retry logic, update both `callGoogleTranslate()` timeout and fallback checks in `translateText()` (they rely on searching the returned string for failure markers like `Translation failed` or `ERR_`).

6) What not to change lightly
- `manifest.json` permissions and `host_permissions`—removing `translate.googleapis.com` will break runtime translation requests.
- The `mouseup` handler capture flag (`true`)—changing to bubbling may miss selection timing and break placement logic.

7) Tests and CI
- There are no automated tests or build scripts in the repo. Prefer small, manual changes and validate in Chrome DevTools.

8) Example quick tasks for an AI agent
- Add a short debounce to the `mouseup` selection logic to reduce flicker (modify the 50ms `setTimeout`).
- Add a small retry mechanism on `callGoogleTranslate()` that waits 500ms and retries once on network failures.
- Improve accessibility: add `aria-label` to `#translate-button` and ensure the popup can be closed via keyboard.

If anything in this file is unclear or you'd like more examples (e.g., exact DOM snippets to edit or a suggested retry implementation), tell me which area to expand.

---
Quick reference (concrete values)
- Popup assumed size: width=300px, height=150px — used for boundary math in `showTranslationPopup()`.
- Translate button z-index: `1000000`; popup z-index: `10000`.
- Network timeout: 8000ms (AbortController) in `callGoogleTranslate()`.
- Selection delay: `setTimeout(..., 50)` inside `mouseup` handler (capture phase).

Developer steps to test changes

```bash
# Load/unload extension (manual steps)
# 1. Open chrome://extensions
# 2. Enable Developer mode
# 3. Click "Load unpacked" and select this repo folder
# 4. Edit files, then click reload for this extension and refresh the target page
```

Small code-edit patterns the agent should follow
- When updating popup text: modify `.translation-text` in `showTranslationPopup()` instead of rebuilding the element (preserves listeners).
- Preserve `debugLog()` or mirror its `[Translation Plugin]` prefix for all console traces.
- Keep `mouseup` listener with `capture=true` — changing to bubbling breaks timing/positioning.

Suggested low-effort improvements (ask if you want one implemented)
- Add a single retry with 500ms delay in `callGoogleTranslate()` for transient network issues.
- Add `aria-label="Translate selection"` to `#translate-button` and make the button focusable for keyboard users.
- Extract magic numbers (popup size, timeouts, z-index) to top-level constants in `content.js` for easier tuning.

If you'd like, I can implement one of the suggested improvements and add a short test plan for manual verification.

```