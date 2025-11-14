/**
 * API Configuration
 * Centralized API configuration using environment variables
 */

// Get API base URL from environment variable - REQUIRED
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error(
    '❌ Error: VITE_API_BASE_URL environment variable is not set\n' +
      '   This should be passed from Makefile via command line'
  );
}

export const API_BASE_URL = apiBaseUrl;
