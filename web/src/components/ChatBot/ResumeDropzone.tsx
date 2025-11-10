import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@subbiah/reusable/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@subbiah/reusable/components/ui/card';
import { extractTextFromFile, formatFileSize } from '@/utils/fileExtractor';

interface ResumeDropzoneProps {
  onFileExtracted: (text: string, filename: string) => void;
  disabled?: boolean;
  className?: string;
}

type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

export function ResumeDropzone({ onFileExtracted, disabled, className }: ResumeDropzoneProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setUploadState('idle');
    setError(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      try {
        setUploadState('uploading');
        setError(null);

        // Extract text from file
        const result = await extractTextFromFile(file);

        // Set file info
        setFileInfo({
          name: result.filename,
          size: result.fileSize,
          type: result.fileType,
        });

        // Notify parent component
        onFileExtracted(result.text, result.filename);

        setUploadState('success');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
        setError(errorMessage);
        setUploadState('error');
      }
    },
    [onFileExtracted]
  );

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await processFile(file);
    },
    [processFile]
  );

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled || uploadState === 'uploading') return;

      setUploadState('dragging');
    },
    [disabled, uploadState]
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      // Only reset if leaving the dropzone entirely (not just child elements)
      if (event.currentTarget === dropzoneRef.current) {
        if (uploadState === 'dragging') {
          setUploadState('idle');
        }
      }
    },
    [uploadState]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled || uploadState === 'uploading') return;

      const files = event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];
      await processFile(file);
    },
    [disabled, uploadState, processFile]
  );

  const handleBrowseClick = useCallback(() => {
    if (disabled || uploadState === 'uploading') return;
    fileInputRef.current?.click();
  }, [disabled, uploadState]);

  const isProcessing = uploadState === 'uploading';
  const isDragging = uploadState === 'dragging';
  const isSuccess = uploadState === 'success';
  const isError = uploadState === 'error';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-foreground">Upload Resume</CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload your resume to analyze and improve it with AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={disabled || isProcessing}
          className="hidden"
          id="resume-upload"
          aria-label="Upload resume file"
        />

        {/* Dropzone */}
        <div
          ref={dropzoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleBrowseClick();
            }
          }}
          className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border bg-muted hover:border-primary/50'
          } ${disabled || isProcessing ? 'cursor-not-allowed opacity-60' : ''} ${isSuccess ? 'border-success bg-success/10' : ''} ${isError ? 'border-destructive bg-destructive/10' : ''} `}
          aria-disabled={disabled || isProcessing}
        >
          {/* Icon and state-based content */}
          {isProcessing && (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Processing file...</p>
            </div>
          )}

          {isSuccess && fileInfo && (
            <div className="flex flex-col items-center space-y-3">
              <CheckCircle className="h-12 w-12 text-success" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">File uploaded successfully</p>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{fileInfo.name}</span>
                  <span>•</span>
                  <span>{formatFileSize(fileInfo.size)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetState();
                }}
                className="mt-2"
              >
                Upload Another File
              </Button>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center space-y-3">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-sm font-medium text-destructive">Upload failed</p>
              {error && <p className="max-w-md text-xs text-destructive">{error}</p>}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetState();
                }}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {!isProcessing && !isSuccess && !isError && (
            <div className="flex flex-col items-center space-y-3">
              <Upload
                className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {isDragging ? 'Drop file here' : 'Drag & drop your resume here'}
                </p>
                <p className="text-xs text-muted-foreground">or</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  disabled={disabled}
                >
                  Browse Files
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* File requirements */}
        {!isSuccess && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium">Accepted formats:</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>PDF files (.pdf)</li>
              <li>Word documents (.docx)</li>
              <li>Text files (.txt)</li>
            </ul>
            <p className="mt-2 font-medium">Requirements:</p>
            <ul className="list-inside list-disc space-y-0.5">
              <li>Maximum file size: 5MB</li>
              <li>Text-based files work best (not scanned images)</li>
              <li>Ensure the file contains readable text content</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
