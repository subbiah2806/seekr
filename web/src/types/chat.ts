/**
 * Chat Types
 * TypeScript types for chat interface and API integration
 */

import type {
  ResumeData,
  Experience,
  Education,
} from '@subbiah/reusable/lib/generateResume/index';

/**
 * Chat message role - either user or AI assistant
 */
export type ChatRole = 'user' | 'assistant';

/**
 * Re-export types from component library for convenience
 */
export type { ResumeData, Experience as ExperienceItem, Education as EducationItem };

/**
 * Individual chat message
 */
export interface ChatMessage {
  role: ChatRole;
  content: string;
  /**
   * Resume context for this message
   * Both user and assistant messages include the resume state
   */
  resume?: ResumeData | null;
}

/**
 * Chat request payload for backend API
 */
export interface ChatRequest {
  messages: ChatMessage[];
  file_content?: string;
}

/**
 * Chat response from backend API
 */
export interface ChatResponse {
  resume_json: ResumeData;
  /**
   * Optional AI response with suggestions, questions, or feedback
   * Only populated when AI has something to communicate to the user
   */
  response?: string | null;
  /**
   * System message about operation status
   * @deprecated Use `response` field for AI messages
   */
  message: string;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}
