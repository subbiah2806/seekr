/**
 * API utility functions for Seekr extension
 */

import type { TailorResumeResponse, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:8000';
const TAILOR_RESUME_ENDPOINT = '/api/tailor-resume';

/**
 * Fetch tailored resume from backend API
 * @param requirement - Job posting text/requirement
 * @returns Promise<TailorResumeResponse>
 * @throws ApiError on network or API errors
 */
export async function fetchTailorResume(requirement: string): Promise<TailorResumeResponse> {
  if (!requirement || requirement.trim().length === 0) {
    const error: ApiError = {
      message: 'Job posting text cannot be empty',
      status: 400,
    };
    throw error;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${TAILOR_RESUME_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requirement }),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If response body is not JSON, use default message
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      throw error;
    }

    const data: TailorResumeResponse = await response.json();

    // Validate response structure
    if (!data.company_name || !data.position || !data.resume_json) {
      const error: ApiError = {
        message: 'Invalid response from API: missing required fields',
        status: 500,
      };
      throw error;
    }

    return data;
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error && typeof error === 'object' && 'message' in error && 'status' in error) {
      throw error;
    }

    // Handle network errors
    const apiError: ApiError = {
      message:
        error instanceof Error
          ? `Network error: ${error.message}`
          : 'Unknown error occurred while fetching tailored resume',
      details: error,
    };
    throw apiError;
  }
}

/**
 * Check if backend API is reachable
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
