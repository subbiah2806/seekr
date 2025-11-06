/**
 * Content script for Seekr extension
 * Runs on all pages to extract job posting text
 */

import type { ChromeMessage } from '../types';
import { MessageType } from '../types';

console.log('Seekr content script loaded');

/**
 * Extract clean text from the current page
 * Removes extra whitespace and returns normalized text
 */
function extractPageText(): string {
  const bodyText = document.body.innerText;

  // Clean up text: normalize whitespace, remove excessive newlines
  const cleanedText = bodyText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');

  return cleanedText;
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: { type: string; text?: string; error?: string }) => void
  ) => {
    console.log('Content script received message:', message);

    if (message.type === MessageType.EXTRACT_PAGE_TEXT) {
      try {
        const pageText = extractPageText();

        if (!pageText || pageText.trim().length === 0) {
          sendResponse({
            type: MessageType.PAGE_TEXT_EXTRACTED,
            error: 'No text found on this page',
          });
          return;
        }

        sendResponse({
          type: MessageType.PAGE_TEXT_EXTRACTED,
          text: pageText,
        });
      } catch (error) {
        console.error('Error extracting page text:', error);
        sendResponse({
          type: MessageType.PAGE_TEXT_EXTRACTED,
          error: error instanceof Error ? error.message : 'Failed to extract page text',
        });
      }
    }

    return true; // Keep message channel open for async response
  }
);

export {};
