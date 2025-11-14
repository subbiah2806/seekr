/**
 * useChat Hook
 * Custom hook for chat functionality using TanStack Query
 */

import { useMutation } from '@tanstack/react-query';
import type { ChatRequest, ChatResponse, ChatMessage, ResumeData } from '../types/chat';
import { API_BASE_URL } from '../config/api';

/**
 * Send chat message to backend API
 */
async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to send message' }));
    throw new Error(errorData.message || `HTTP error ${response.status}`);
  }

  return response.json();
}

/**
 * Options for useChat hook
 */
interface UseChatOptions {
  onResumeUpdate?: (resume: ResumeData) => void;
  onSuccess?: (message: string, resume: ResumeData) => void;
  onAiResponse?: (response: string, resume: ResumeData) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for chat API integration
 */
export function useChat(options: UseChatOptions = {}) {
  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data: ChatResponse) => {
      // Call onResumeUpdate callback with generated resume
      if (options.onResumeUpdate) {
        options.onResumeUpdate(data.resume_json);
      }

      // Call onAiResponse callback if AI provided a response (suggestions/questions)
      // Pass both the response text AND the updated resume
      if (options.onAiResponse && data.response) {
        options.onAiResponse(data.response, data.resume_json);
      }

      // Call onSuccess callback with success message and updated resume
      if (options.onSuccess) {
        options.onSuccess(data.message, data.resume_json);
      }
    },
    onError: (error: Error) => {
      // Call onError callback
      if (options.onError) {
        options.onError(error);
      }
    },
  });

  /**
   * Send a chat message
   * @param messages - Array of chat messages (each message includes resume field)
   * @param fileContent - Optional file content to send with message
   */
  const sendMessage = (
    messages: ChatMessage[],
    fileContent?: string
  ) => {
    const payload: ChatRequest = {
      messages,
      file_content: fileContent,
    };

    mutation.mutate(payload);
  };

  return {
    sendMessage,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
