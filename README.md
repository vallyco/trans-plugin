# Text Selection Translator

A Chrome extension that translates selected text to Chinese and shows dictionary meanings for single words.

## Features

- Select text on any page to show a small dot after the selection
- Click the dot to translate the selection
- Single word selection shows multiple dictionary meanings
- Multi-word selection shows full text translation
- Popup appears centered beneath the selected text
- Works on any website

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in upper-right corner)
4. Click "Load unpacked" and select this directory

## Configuration (Youdao OpenAPI)

For stable translation in China, configure Youdao OpenAPI credentials:

1. Create an app in Youdao AI Platform and obtain `appKey` and `appSecret`
2. Open `chrome://extensions`, find this extension, click "Details"
3. Open "Extension options"
4. Fill in `App Key` and `App Secret`, then save

Without credentials, the extension falls back to web endpoints, which may be unstable.

## Usage

1. Select a word or sentence on any webpage
2. Click the dot shown after the selection
3. The popup appears under the selected text
4. Click elsewhere to dismiss the popup

## How It Works

- Content script detects selection and renders the dot and popup
- Background service worker calls Youdao OpenAPI or fallback endpoints
- Popup shows dictionary meanings for single words or translations for sentences

## Files

- `manifest.json`: Extension configuration and permissions
- `content.js`: Selection handling and popup UI
- `background.js`: Translation/dictionary requests
- `styles.css`: Dot and popup styling
- `options.html`: Options page UI
- `options.js`: Options page logic

## Privacy

This extension does not collect or store personal data. Credentials are stored locally via `chrome.storage.local`.

## License

MIT
