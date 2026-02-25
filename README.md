# Text Translation Chrome Extension

A Chrome extension that allows users to select text on any webpage and instantly see its translation.

## Features

- Select any text on a webpage to see a green dot appear below
- Click the green dot to translate the selected text
- Automatic language detection
- Clean, minimal popup interface
- Works on any website

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" (toggle in upper-right corner)
4. Click "Load unpacked" and select this directory
5. The extension icon should now appear in your browser toolbar

## Usage

1. Navigate to any webpage
2. Select text by clicking and dragging over it
3. A green dot will appear below the selected text
4. Click the green dot to translate the text
5. The translation will appear in a popup near the dot
6. Click anywhere on the page to dismiss the popup

## How It Works

The extension uses:
- Content scripts to detect text selection on webpages
- Google Translate API for translation services
- A floating DOM element to display translations
- An interactive green dot that triggers translation on click

## Files

- `manifest.json`: Extension configuration and permissions
- `content.js`: Main logic for detecting selection and handling translations
- `styles.css`: Styling for the translation popup and green dot
- `popup.html`: Browser action popup interface
- `popup.js`: Popup interface logic

## Development & Git Workflow

When making changes to the extension, follow this workflow:

### 1. Make code changes
Edit the relevant files (e.g., `content.js`, `styles.css`, etc.)

### 2. Reload extension in Chrome
- Open `chrome://extensions`
- Click the reload button on this extension
- Refresh the webpage to test changes

## Privacy

This extension does not collect or store any personal data. All translations are processed through Google's public translation API.

## License

MIT