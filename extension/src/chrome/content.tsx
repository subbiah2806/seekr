/// <reference types="chrome" />
/**
 * Content script for Seekr extension
 * Renders in Shadow DOM for complete style isolation
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SeekerExtension } from '../components/SeekerExtension';

console.log('Seekr content script loaded');

// Create a container div for Shadow DOM
const container = document.createElement('div');
container.id = 'seekr-extension-root';
document.body.appendChild(container);

// Attach Shadow DOM for complete style isolation
const shadowRoot = container.attachShadow({ mode: 'open' });

// Create a div inside Shadow DOM for React to render into
const shadowContainer = document.createElement('div');
shadowContainer.id = 'seekr-shadow-container';
shadowRoot.appendChild(shadowContainer);

// Inject CSS into Shadow DOM using link tags
function injectStyles() {
  // Get the CSS file URLs from the manifest
  const cssFiles = chrome.runtime.getManifest().content_scripts?.[0]?.css || [];

  for (const cssFile of cssFiles) {
    // Create link element for CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL(cssFile);
    shadowRoot.appendChild(link);

    console.log('✅ CSS link added to Shadow DOM:', cssFile);
  }
}

// Inject styles and render React
injectStyles();

// Render React app inside Shadow DOM
const root = createRoot(shadowContainer);
root.render(
  <StrictMode>
    <SeekerExtension />
  </StrictMode>
);

export {};
