// content.js - Handles text selection and translation display

// Global variables to manage the translation UI
let translateButton = null;
let translationDiv = null;
let selectedTextRange = null;
let isTranslating = false; // Track if we're currently in a translation process
let isPopupVisible = false; // Track if popup is currently visible
let buttonClicked = false; // Track if the button was just clicked

// Debug helper
function debugLog(message, ...optionalParams) {
  // Convert all parameters to strings to ensure they are logged
  const paramsStr = optionalParams.map(param => {
    if (param === null) return 'null';
    if (param === undefined) return 'undefined';
    if (typeof param === 'object') return JSON.stringify(param);
    return String(param);
  }).join(' ');

  if (paramsStr) {
    console.log('[Translation Plugin]', message, paramsStr);
  } else {
    console.log('[Translation Plugin]', message);
  }
}

// Function to get selected text range
function getSelectedRange() {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    debugLog('No selection range found');
    return null;
  }

  const range = selection.getRangeAt(0);
  debugLog('Selection range found');
  return range.cloneRange();
}

// Function to get selected text (without logging to avoid duplication)
function getSelectedText() {
  const text = window.getSelection().toString().trim();
  return text;
}

// Calculate position for the button at the bottom center of the selection
function getPositionForSelection(range) {
  try {
    const rects = range.getClientRects(); // Use getClientRects() which is more reliable for selections

    if (!rects || rects.length === 0) {
      debugLog('No client rectangles found for selection');
      return null;
    }

    // Get the last rectangle (bottom-most) for better positioning
    const lastRect = rects[rects.length - 1];
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    debugLog('Selection rectangles:', JSON.stringify(Array.from(rects).slice(0, 1))); // Just log first rect to avoid spam

    // Calculate position at the bottom center of the last rect
    const x = Math.max(0, lastRect.left + scrollLeft + lastRect.width / 2);
    const y = Math.max(0, lastRect.bottom + scrollTop + 10); // 10px below the selection

    debugLog('Calculated position for button:', JSON.stringify({x, y}));
    return {x, y};
  } catch (e) {
    debugLog('Error calculating position:', e.message);
    // Return center of screen as fallback
    return {x: window.innerWidth / 2, y: window.innerHeight / 2};
  }
}

// Function to show translation button at the bottom of selection
function showTranslateButton(x, y) {
  debugLog('showTranslateButton called - buttonClicked status:', buttonClicked.toString());

  try {
    // Remove existing button if present
    if (translateButton && document.body.contains(translateButton)) {
      document.body.removeChild(translateButton);
      debugLog('Removed existing button');
    }

    // Create a new translate button
    translateButton = document.createElement('div');
    translateButton.id = 'translate-button';
    translateButton.innerHTML = '<span style="font-size: 10px; pointer-events: none;">T</span>';
    translateButton.title = 'Click to translate';

    // Style the button to look like a green dot
    translateButton.style.position = 'fixed';
    translateButton.style.zIndex = '1000000';
    translateButton.style.backgroundColor = '#4CAF50';
    translateButton.style.color = 'white';
    translateButton.style.borderRadius = '50%';
    translateButton.style.width = '24px';
    translateButton.style.height = '24px';
    translateButton.style.display = 'flex';
    translateButton.style.alignItems = 'center';
    translateButton.style.justifyContent = 'center';
    translateButton.style.cursor = 'pointer';
    translateButton.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    translateButton.style.textAlign = 'center';
    translateButton.style.lineHeight = '1';
    translateButton.style.fontFamily = 'Arial, sans-serif';
    translateButton.style.userSelect = 'none';
    translateButton.style.overflow = 'hidden';
    translateButton.style.fontSize = '12px';
    translateButton.style.pointerEvents = 'auto';

    // Ensure the button stays within viewport bounds
    const boundedX = Math.max(12, Math.min(x - 12, window.innerWidth - 24));
    const boundedY = Math.max(0, y);

    debugLog('Setting button position:', JSON.stringify({boundedX, boundedY}));

    // Adjust position to center horizontally
    translateButton.style.left = `${boundedX}px`;
    translateButton.style.top = `${boundedY}px`;

    // Add click event to trigger translation
    translateButton.addEventListener('click', handleTranslationButtonClick);

    // Append to document body
    document.body.appendChild(translateButton);
    debugLog('Added translation button to page');
  } catch (e) {
    debugLog('Error creating translation button:', e.message);
  }
}

// Function to handle button click - immediately hide button then start translation
function handleTranslationButtonClick() {
  debugLog('Button clicked, hiding button immediately');

  // Mark that button was clicked to prevent recreation
  buttonClicked = true;

  // Immediately hide the button
  if (translateButton && document.body.contains(translateButton)) {
    document.body.removeChild(translateButton);
    translateButton = null;
    debugLog('Button hidden immediately after click');
  }

  // Set popup visibility immediately to prevent mouseup from showing button again
  isPopupVisible = true;

  // Then start the translation process
  setTimeout(() => {
    handleTranslation();
  }, 0); // Use setTimeout to ensure it runs after current event
}

// Function to hide the translate button
function hideTranslateButton() {
  if (translateButton && document.body.contains(translateButton)) {
    document.body.removeChild(translateButton);
    debugLog('Removed translation button');
    translateButton = null;
  }
}

// Function to handle translation process
async function handleTranslation() {
  // Set translating flag to prevent other interactions during translation
  isTranslating = true;
  buttonClicked = true; // Also set button clicked flag to prevent recreation

  debugLog('handleTranslation started');

  const selectedText = getSelectedText();
  if (!selectedText) {
    debugLog('No selected text to translate');
    isTranslating = false;
    return;
  }

  debugLog('Starting translation for text:', `"${selectedText}"`);

  // Use the stored selection range to position the popup near the selected text
  let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 }; // fallback to center

  if (selectedTextRange) {
    const pos = getPositionForSelection(selectedTextRange);
    if (pos && pos.x !== undefined && pos.y !== undefined) {
      position = { x: pos.x - 150, y: pos.y }; // Adjust x to center the popup under selection
      debugLog('Position calculated from selection:', JSON.stringify(position));
    }
  }

  debugLog('About to call showTranslationPopup with "Translating..."');
  showTranslationPopup('Translating...', position.x, position.y);
  debugLog('After showTranslationPopup call - translationDiv is null?', (translationDiv === null).toString());
  debugLog('After showTranslationPopup call - translationDiv exists in DOM?', (translationDiv && document.body.contains(translationDiv)).toString());

  // Perform the translation
  const translation = await translateText(selectedText);
  debugLog('Translation completed:', `"${translation}"`);

  // Update the existing popup with the translation
  if (translationDiv) {
    debugLog('Attempting to update popup content');
    const contentDiv = translationDiv.querySelector('.translation-content .translation-text');
    if (contentDiv) {
      debugLog('Found translation text element, updating content');
      contentDiv.textContent = translation;
      debugLog('Updated translation popup with:', `"${translation}"`);
    } else {
      debugLog('Could not find translation text element');
    }
  } else {
    debugLog('No translationDiv to update');
  }

  // Reset translating flag after translation completes
  isTranslating = false;
  debugLog('handleTranslation finished');
}

// Function to translate text with multiple fallback methods
async function translateText(text, targetLang = 'zh') {
  if (!text) return '';

  debugLog('Translating text:', `"${text}"`);

  // Primary API: Google Translate (may be blocked in some regions)
  let translation = await callGoogleTranslate(text, targetLang);

  // If Google Translate fails, try alternative methods
  if (!translation || translation.includes('Translation failed') || translation.includes('ERR_') || translation.includes('timed out')) {
    debugLog('Google Translate failed, trying fallback methods');

    // Alternative: Try with shorter text if original is too long
    if (text.length > 50) {
      const shortenedText = text.substring(0, 50) + '...';
      translation = await callGoogleTranslate(shortenedText, targetLang);
    }

    // If still failing, return a meaningful message
    if (!translation || translation.includes('Translation failed') || translation.includes('ERR_') || translation.includes('timed out')) {
      debugLog('All translation attempts failed');
      return `当前无法翻译: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`;
    }
  }

  debugLog('Translation successful:', `"${translation}"`);
  return translation;
}

// Function to call Google Translate API with timeout
async function callGoogleTranslate(text, targetLang) {
  try {
    debugLog('Attempting to call Google Translate API');

    // Using free Google Translate API endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    debugLog('Request URL:', url);

    // Using a different approach for timeout since fetch doesn't have a built-in timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      debugLog('Translation request timed out');
      controller.abort()
    }, 8000); // 8-second timeout

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      debugLog(`HTTP error received: ${response.status} ${response.statusText}`);
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    debugLog('Received response from Google Translate API');

    const data = await response.json();
    debugLog('Raw response data:', JSON.stringify(data)); // Log raw response to see structure

    // Different possible structures of Google Translate response
    let result = '';

    if (data && Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      // Typical structure: [[["translated text","original text",null,null,confidence],...]]
      result = '';
      for (let i = 0; i < data[0].length; i++) {
        if (Array.isArray(data[0][i]) && data[0][i][0]) {
          result += data[0][i][0];
        }
      }

      if (!result) {
        // Alternative structure: sometimes the text is in data[0][0][0]
        if (data[0][0] && typeof data[0][0][0] === 'string') {
          result = data[0][0][0];
        }
      }
    } else if (typeof data === 'string') {
      // Sometimes it might be just a string
      result = data;
    }

    result = result.trim();
    debugLog('Successfully parsed translation result:', `"${result}"`);
    return result || text; // Return original text if no translation found
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Google Translate request timed out');
      debugLog('Translation request timed out');
      return `Translation request timed out`;
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error or CORS issue:', error);
      debugLog('Network error or CORS issue:', error.message);
      return `Network error: ${error.message}`;
    } else {
      console.error('Google Translate error:', error);
      debugLog('Google Translate error:', error.message);
      return `Translation failed: ${error.message}`;
    }
  }
}

// Function to show translation popup
function showTranslationPopup(translation, x, y) {
  try {
    debugLog('showTranslationPopup called with translation:', `"${translation}"`);

    // Check if there's an existing popup to update
    if (translationDiv && document.body.contains(translationDiv)) {
      // Update existing popup instead of creating a new one
      const textElement = translationDiv.querySelector('.translation-text');
      if (textElement) {
        textElement.textContent = translation;
        debugLog('Existing translation popup updated with:', `"${translation}"`);
      }

      // Position the popup if coordinates provided
      if (x !== undefined && y !== undefined) {
        const popupWidth = 300;
        const popupHeight = 150;

        // Ensure popup stays within viewport bounds
        const adjustedX = Math.min(Math.max(10, x), window.innerWidth - popupWidth - 10);
        const adjustedY = Math.min(Math.max(10, y), window.innerHeight - popupHeight - 10);

        translationDiv.style.left = `${adjustedX}px`;
        translationDiv.style.top = `${adjustedY}px`;
      }
      return; // We've updated the existing popup, so return
    }

    // If no existing popup, create a new one
    translationDiv = document.createElement('div');
    translationDiv.id = 'text-translation-popup';
    translationDiv.innerHTML = `
      <div class="translation-header">
        <span class="translation-source-lang">Translation</span>
        <button class="close-btn">&times;</button>
      </div>
      <div class="translation-content">
        <div class="original-text" title="Original text">${getSelectedText()}</div>
        <div class="translation-divider">↓</div>
        <div class="translation-text">${translation}</div>
      </div>
    `;

    debugLog('New translation div created with content:', `"${translation}"`);

    // Add the popup to the DOM first
    document.body.appendChild(translationDiv);
    debugLog('Translation popup added to document body');

    // Position the popup near the button with boundary checks
    const popupWidth = 300;
    const popupHeight = 150;

    // Use the specified coordinates or fall back to center
    let adjustedX = x || window.innerWidth / 2 - popupWidth / 2;
    let adjustedY = y || window.innerHeight / 2 - popupHeight / 2;

    // Ensure popup stays within viewport bounds
    adjustedX = Math.min(Math.max(10, adjustedX), window.innerWidth - popupWidth - 10);
    adjustedY = Math.min(Math.max(10, adjustedY), window.innerHeight - popupHeight - 10);

    translationDiv.style.left = `${adjustedX}px`;
    translationDiv.style.top = `${adjustedY}px`;

    debugLog(`Translation popup positioned at (${adjustedX}, ${adjustedY})`);

    // Add event listener to close button
    const closeButton = translationDiv.querySelector('.close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', hideTranslationPopup);
      debugLog('Close button event listener added');
    }

    debugLog('Added translation popup to page with translation:', `"${translation}"`);
  } catch (error) {
    debugLog('Error showing translation popup:', error.message);
  }
}

// Function to hide translation popup
function hideTranslationPopup() {
  if (translationDiv && document.body.contains(translationDiv)) {
    document.body.removeChild(translationDiv);
    debugLog('Removed translation popup');
    translationDiv = null;
    isPopupVisible = false; // Reset popup visibility flag
    buttonClicked = false; // Reset button clicked flag to allow new selections
  } else {
    debugLog('hideTranslationPopup called, but no translation popup to remove');
  }
}

// Mouse up event handler to detect text selection and show the translate button
document.addEventListener('mouseup', function(event) {
  debugLog('Mouse up event - buttonClicked status:', buttonClicked.toString());

  // Skip if we're currently translating
  if (isTranslating) {
    debugLog('Skipping mouseup: currently translating');
    return;
  }

  // Skip if translation popup is already showing
  if (isPopupVisible) {
    debugLog('Skipping mouseup: popup is visible');
    return;
  }

  // Skip if button was just clicked (to prevent re-creating button after deletion)
  if (buttonClicked) {
    debugLog('Skipping mouseup: button was just clicked');
    return;
  }

  // Use a small delay to ensure selection has been registered
  setTimeout(() => {
    debugLog('Mouse up event detected');

    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    debugLog('Selected text:', `"${selectedText}"`); // Now prints the selected text with quotes
    debugLog('Selection range count:', selection.rangeCount.toString());

    if (selection.rangeCount > 0 && selectedText.length > 0) {
      debugLog('Valid text selection found, proceeding...');

      // Store the current selection range
      selectedTextRange = getSelectedRange();

      if (selectedTextRange) {
        // Get position for the button at the bottom of the selection
        const pos = getPositionForSelection(selectedTextRange);

        if (pos && pos.x !== undefined && pos.y !== undefined) {
          // Show the translate button
          debugLog('Showing button at position:', JSON.stringify(pos));
          showTranslateButton(pos.x, pos.y);
        } else {
          debugLog('Could not calculate position for the button');

          // As a fallback, show the button at the mouse position
          showTranslateButton(event.clientX, event.clientY);
        }
      } else {
        debugLog('Could not get selection range');
      }
    } else {
      debugLog('No text selection, hiding UI elements');
      // Hide the button if there's no selection
      hideTranslateButton();
      if (translationDiv) {
        hideTranslationPopup();
      }
    }
  }, 50); // Slightly longer delay to ensure selection is properly captured
}, true); // Use capture phase

// Click anywhere to hide the translation popup or the button
document.addEventListener('click', function(event) {
  // Don't hide if we're currently translating
  if (isTranslating) {
    return;
  }

  // Don't hide if clicking on the button or translation popup
  if (translateButton && translateButton.contains(event.target)) {
    return;
  }

  if (translationDiv && translationDiv.contains(event.target)) {
    return;
  }

  // Hide both the button and popup if clicking elsewhere
  if (translateButton) {
    hideTranslateButton();
  }

  if (translationDiv) {
    hideTranslationPopup();
  }
});

// Handle selection changes (e.g. user presses ESC or selects something different)
document.addEventListener('keyup', function(event) {
  if (event.key === 'Escape') {
    hideTranslateButton();
    if (translationDiv) {
      hideTranslationPopup();
    }
  }
});

debugLog('Translation plugin loaded successfully');