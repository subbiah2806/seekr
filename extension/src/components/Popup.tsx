/**
 * Main Popup Component for Seekr Extension
 * Handles job posting extraction, API calls, and resume generation
 */

import { useState } from 'react';
import { Button } from '@subbiah/reusable/components/ui/button.tsx';
import { CardTitle } from '@subbiah/reusable/components/ui/card.tsx';
import { Badge } from '@subbiah/reusable/components/ui/badge.tsx';
import { DownloadButtons } from './DownloadButtons';
import { fetchTailorResume } from '../utils/api';
import type { TailorResumeResponse, MessageType } from '../types';
import { Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const APP_STATES = {
  IDLE: 'idle',
  EXTRACTING_TEXT: 'extracting_text',
  TAILORING_RESUME: 'tailoring_resume',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

type AppState = (typeof APP_STATES)[keyof typeof APP_STATES];

export function Popup() {
  const [appState, setAppState] = useState<AppState>(APP_STATES.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<TailorResumeResponse | null>(null);

  /**
   * Extract text from current tab using content script
   */
  const extractPageText = async (): Promise<string> => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      throw new Error('No active tab found');
    }

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab.id!,
        { type: 'EXTRACT_PAGE_TEXT' },
        (response: { type: MessageType; text?: string; error?: string }) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (response.error) {
            reject(new Error(response.error));
            return;
          }

          if (!response.text) {
            reject(new Error('No text extracted from page'));
            return;
          }

          resolve(response.text);
        }
      );
    });
  };

  /**
   * Main handler for tailoring resume
   */
  const handleTailorResume = async (): Promise<void> => {
    setError(null);
    setResumeData(null);

    try {
      // Step 1: Extract page text
      setAppState(APP_STATES.EXTRACTING_TEXT);
      const pageText = await extractPageText();

      // Step 2: Call API to tailor resume
      setAppState(APP_STATES.TAILORING_RESUME);
      const response = await fetchTailorResume(pageText);

      // Step 3: Show success state
      setResumeData(response);
      setAppState(APP_STATES.SUCCESS);
    } catch (err) {
      console.error('Error tailoring resume:', err);

      let errorMessage = 'An unexpected error occurred';

      if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setAppState(APP_STATES.ERROR);
    }
  };

  /**
   * Reset to initial state
   */
  const handleReset = (): void => {
    setAppState(APP_STATES.IDLE);
    setError(null);
    setResumeData(null);
  };

  const isLoading =
    appState === APP_STATES.EXTRACTING_TEXT || appState === APP_STATES.TAILORING_RESUME;
  const isSuccess = appState === APP_STATES.SUCCESS;
  const isError = appState === APP_STATES.ERROR;

  return (
    <div className="p-4">
      <div className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Seekr</CardTitle>
        </div>
        AI-powered resume tailoring for job applications
      </div>

      <div className="space-y-4">
        {/* Idle State */}
        {appState === APP_STATES.IDLE && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Click the button below to extract the job posting from this page and generate a
              tailored resume.
            </p>
            <Button
              onClick={handleTailorResume}
              className="flex w-full items-center justify-center"
              size="default"
              variant={'outline'}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Tailor Resume for This Job
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-center text-sm font-medium">
              {appState === APP_STATES.EXTRACTING_TEXT
                ? 'Extracting job posting...'
                : 'Tailoring your resume...'}
            </p>
            <p className="text-center text-xs text-muted-foreground">This may take a few moments</p>
          </div>
        )}

        {/* Error State */}
        {isError && error && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-xs text-destructive/90">{error}</p>
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" className="w-full" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {/* Success State */}
        {isSuccess && resumeData && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border border-success/50 bg-success/10 p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-foreground">Resume Tailored Successfully!</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {resumeData.company_name}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {resumeData.position}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Download your resume:</p>
              <DownloadButtons
                resumeJson={resumeData.resume_json}
                companyName={resumeData.company_name}
                position={resumeData.position}
              />
            </div>

            <Button onClick={handleReset} variant="ghost" className="w-full" size="sm">
              Tailor Another Resume
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
