/**
 * Data schemas and TypeScript types for storage
 */

export interface TailoredResume {
  id?: number;
  companyName: string;
  position: string;
  resumeJson: Record<string, any>;
  createdAt?: string;
}

export interface StorageData {
  tailoredResumes?: TailoredResume[];
  settings?: {
    apiUrl?: string;
    theme?: 'light' | 'dark' | 'system';
  };
  version?: string;
}

// Default storage data
export const DEFAULT_STORAGE_DATA: StorageData = {
  tailoredResumes: [],
  settings: {
    apiUrl: 'http://localhost:8000',
    theme: 'system',
  },
  version: '1.0',
};
