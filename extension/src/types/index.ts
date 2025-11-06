/**
 * Type definitions for Seekr Chrome Extension
 */

// Resume JSON structure from @subbiah/reusable
export interface ResumeJson {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  github?: string;
  linkedin?: string;
  website?: string;
  visaStatus?: string;
  preferredLocations?: string[];
  summary: string;
  skills: Record<string, string[]>;
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  company: string;
  location: string;
  position: string;
  startDate: string;
  endDate: string;
  achievements: string[];
  companyDescription?: string;
}

export interface Education {
  institution: string;
  degree: string;
  dates: string;
}

// API Response from backend
export interface TailorResumeResponse {
  company_name: string;
  position: string;
  resume_json: ResumeJson;
}

// Chrome Extension Message Types
export enum MessageType {
  EXTRACT_PAGE_TEXT = 'EXTRACT_PAGE_TEXT',
  PAGE_TEXT_EXTRACTED = 'PAGE_TEXT_EXTRACTED',
}

export interface ExtractPageTextMessage {
  type: MessageType.EXTRACT_PAGE_TEXT;
}

export interface PageTextExtractedMessage {
  type: MessageType.PAGE_TEXT_EXTRACTED;
  text: string;
}

export type ChromeMessage = ExtractPageTextMessage | PageTextExtractedMessage;

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}
