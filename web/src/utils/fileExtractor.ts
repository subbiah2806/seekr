import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker path for pdfjs - use CDN to ensure version match
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs`;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIN_TEXT_LENGTH = 50;

export const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
} as const;

export type AcceptedFileType = keyof typeof ACCEPTED_FILE_TYPES;

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * File extraction result interface
 */
export interface ExtractionResult {
  text: string;
  filename: string;
  fileType: string;
  fileSize: number;
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => ('str' in item ? item.str : '')).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to extract text from PDF: ${errorMessage}. Please ensure the file is not encrypted or corrupted.`
    );
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value) {
      throw new Error('No text content found in document');
    }

    return result.value.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to extract text from DOCX: ${errorMessage}`);
  }
}

/**
 * Extract text from TXT file
 */
async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to read text file: ${errorMessage}`);
  }
}

/**
 * Validate file before extraction
 */
export function validateFile(file: File): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File must be smaller than ${MAX_FILE_SIZE_MB}MB` };
  }

  // Check if file is empty
  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check file type
  const isValidType = Object.keys(ACCEPTED_FILE_TYPES).includes(file.type);
  if (!isValidType) {
    return { valid: false, error: 'File must be PDF, DOCX, or TXT format' };
  }

  return { valid: true };
}

/**
 * Validate extracted text
 */
export function validateExtractedText(text: string): ValidationResult {
  if (!text || text.length < MIN_TEXT_LENGTH) {
    return {
      valid: false,
      error: `File appears to be empty or too short. Please ensure your file contains at least ${MIN_TEXT_LENGTH} characters of readable text.`,
    };
  }

  return { valid: true };
}

/**
 * Extract text from file based on type
 */
export async function extractTextFromFile(file: File): Promise<ExtractionResult> {
  // Validate file first
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  let text: string;

  // Extract text based on file type
  switch (file.type) {
    case 'application/pdf':
      text = await extractTextFromPDF(file);
      break;
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      text = await extractTextFromDOCX(file);
      break;
    case 'text/plain':
      text = await extractTextFromTXT(file);
      break;
    default:
      throw new Error('Unsupported file type');
  }

  // Validate extracted text
  const textValidation = validateExtractedText(text);
  if (!textValidation.valid) {
    throw new Error(textValidation.error);
  }

  return {
    text,
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1]}` : '';
}
