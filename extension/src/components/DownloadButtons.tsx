/**
 * DownloadButtons Component
 * Provides PDF and DOCX download functionality for tailored resume
 */

import { useState } from 'react';
import { Button } from '@subbiah/reusable/components/ui/button.tsx';
import { generateResumeDocx, generateResumePdf } from '@subbiah/reusable/lib/generateResume.ts';
import type { ResumeJson } from '../types';
import { FileText, Download } from 'lucide-react';

interface DownloadButtonsProps {
  resumeJson: ResumeJson;
  companyName: string;
  position: string;
}

const DOWNLOAD_STATES = {
  IDLE: 'idle',
  DOWNLOADING_PDF: 'downloading_pdf',
  DOWNLOADING_DOCX: 'downloading_docx',
  ERROR: 'error',
} as const;

type DownloadState = (typeof DOWNLOAD_STATES)[keyof typeof DOWNLOAD_STATES];

export function DownloadButtons({ resumeJson, companyName, position }: DownloadButtonsProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>(DOWNLOAD_STATES.IDLE);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate filename based on company and position
   */
  const generateFilename = (format: 'pdf' | 'docx'): string => {
    const sanitizedCompany = companyName.replace(/[^a-z0-9]/gi, '_');
    const sanitizedPosition = position.replace(/[^a-z0-9]/gi, '_');
    return `${resumeJson.firstName}_${resumeJson.lastName}_Resume_${sanitizedCompany}_${sanitizedPosition}.${format}`;
  };

  /**
   * Trigger browser download for blob
   */
  const downloadBlob = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Handle PDF download
   */
  const handleDownloadPdf = async (): Promise<void> => {
    setDownloadState(DOWNLOAD_STATES.DOWNLOADING_PDF);
    setError(null);

    try {
      const blob = await generateResumePdf(resumeJson);
      const filename = generateFilename('pdf');
      downloadBlob(blob, filename);
      setDownloadState(DOWNLOAD_STATES.IDLE);
    } catch (err) {
      console.error('Error generating PDF:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      setDownloadState(DOWNLOAD_STATES.ERROR);
    }
  };

  /**
   * Handle DOCX download
   */
  const handleDownloadDocx = async (): Promise<void> => {
    setDownloadState(DOWNLOAD_STATES.DOWNLOADING_DOCX);
    setError(null);

    try {
      const blob = await generateResumeDocx(resumeJson);
      const filename = generateFilename('docx');
      downloadBlob(blob, filename);
      setDownloadState(DOWNLOAD_STATES.IDLE);
    } catch (err) {
      console.error('Error generating DOCX:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate DOCX';
      setError(errorMessage);
      setDownloadState(DOWNLOAD_STATES.ERROR);
    }
  };

  const isPdfDownloading = downloadState === DOWNLOAD_STATES.DOWNLOADING_PDF;
  const isDocxDownloading = downloadState === DOWNLOAD_STATES.DOWNLOADING_DOCX;
  const isDownloading = isPdfDownloading || isDocxDownloading;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          variant="default"
          size="sm"
          className="w-full"
        >
          <FileText className="mr-2 h-4 w-4" />
          {isPdfDownloading ? 'Generating...' : 'Download PDF'}
        </Button>

        <Button
          onClick={handleDownloadDocx}
          disabled={isDownloading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {isDocxDownloading ? 'Generating...' : 'Download DOCX'}
        </Button>
      </div>

      {error && (
        <div
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
