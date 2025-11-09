/**
 * ChatInterface Component
 * Main container for the resume chatbot interface
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { MessageSquare, AlertCircle, Trash2, Loader2, Upload } from 'lucide-react';
import { DropzoneOptions, FileRejection, useDropzone } from 'react-dropzone';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { extractTextFromFile } from '../../utils/fileExtractor';
import type { ChatMessage as ChatMessageType, ResumeData } from '../../types/chat';
import { Card } from '@subbiah/reusable/components/ui/card';
import { Button } from '@subbiah/reusable/components/ui/button';
import DataFetchWrapper from '@subbiah/reusable/components/DataFetchWrapper';

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInterfaceProps {
  onResumeUpdate: (resume: ResumeData) => void;
  initialFileContent?: string;
  initialResume?: ResumeData | null;
  className?: string;
  isLoadingResume?: boolean;
}

const DEFAULT_TITLE = 'Resume Assistant';
const DEFAULT_WELCOME_MESSAGE =
  "Hi! I'm your AI resume assistant. Upload your resume or job description, or just start chatting to create or optimize your resume.";

/**
 * ChatInterface - Main chat container component for resume chatbot
 */
export function ChatInterface({
  onResumeUpdate,
  initialFileContent,
  initialResume,
  className = '',
  isLoadingResume = false,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(initialResume || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialFile = useRef(false);
  const aiResponseReceived = useRef(false);

  const { sendMessage, isLoading, error: apiError, reset } = useChat({
    onResumeUpdate: (resume) => {
      setCurrentResume(resume); // Update local resume state
      onResumeUpdate(resume);
      // Reset AI response flag before callbacks
      aiResponseReceived.current = false;
    },
    onAiResponse: (response, updatedResume) => {
      console.log('[ChatInterface] Received AI response:', {
        response: response.substring(0, 50) + '...',
        hasResume: !!updatedResume,
        resumeKeys: updatedResume ? Object.keys(updatedResume) : [],
        firstName: updatedResume?.firstName,
        experienceCount: updatedResume?.experience?.length,
      });

      // Add AI response (suggestions/questions) to messages when present
      // Use the updated resume from the callback, not the stale state
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
          resume: updatedResume, // Include updated resume state in assistant message
        },
      ]);
      setError(null);
      aiResponseReceived.current = true;
    },
    onSuccess: (message, updatedResume) => {
      // Fallback: Add system message if no AI response was provided
      // This maintains backward compatibility with the deprecated 'message' field
      if (!aiResponseReceived.current && message) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: message,
            resume: updatedResume, // Include updated resume state in assistant message
          },
        ]);
      }
      setError(null);
    },
    onError: (err) => {
      setError(err.message || 'Failed to send message. Please try again.');
      aiResponseReceived.current = false;
    },
  });

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /**
   * Scroll to bottom on new messages
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Update currentResume when initialResume changes
   * (handles async loading of saved resume from usersettings)
   */
  useEffect(() => {
    if (initialResume) {
      setCurrentResume(initialResume);
    }
  }, [initialResume]);

  /**
   * Process initial file content if provided
   */
  useEffect(() => {
    if (initialFileContent && !hasProcessedInitialFile.current) {
      hasProcessedInitialFile.current = true;
      const initialMessage: ChatMessageType = {
        role: 'user',
        content: 'I uploaded a file. Please analyze it and help me with my resume.',
        resume: currentResume, // Include resume state in message
      };
      setMessages([initialMessage]);
      sendMessage([initialMessage], initialFileContent);
    }
  }, [initialFileContent, currentResume, sendMessage]);

  /**
   * Handle file drop using react-dropzone
   */
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    try {
      const result = await extractTextFromFile(file);
      setAttachedFile({
        name: result.filename,
        content: result.text,
      });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process file';
      setError(errorMessage);
    }
  }, []);

  /**
   * Handle file rejection
   */
  const onDropRejected = useCallback((fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a PDF, DOCX, or TXT file.');
      } else {
        setError(rejection.errors[0]?.message || 'Failed to upload file');
      }
    }
  }, []);

  /**
   * Configure react-dropzone
   */
  const dropzoneOptions: DropzoneOptions = {
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  /**
   * Handle message send
   */
  const handleSendMessage = useCallback(
    (content: string, fileContent?: string): void => {
      const trimmedContent = content.trim();
      const hasFileAttached = fileContent || attachedFile?.content;

      // Allow send if either there's text or a file is attached
      if ((!trimmedContent && !hasFileAttached) || isLoading) {
        return;
      }

      // Clear any previous errors when sending a new message
      setError(null);

      // Use default message if file is attached but no text provided
      const messageContent =
        trimmedContent || 'I uploaded a file. Please analyze it and help me with my resume.';

      // Add user message to chat with current resume state
      const userMessage: ChatMessageType = {
        role: 'user',
        content: messageContent,
        resume: currentResume, // Include resume state in message
      };

      console.log('[ChatInterface] Sending user message:', {
        content: userMessage.content.substring(0, 50) + '...',
        hasResume: !!userMessage.resume,
        resumeKeys: userMessage.resume ? Object.keys(userMessage.resume) : [],
        firstName: userMessage.resume?.firstName,
        experienceCount: userMessage.resume?.experience?.length,
      });

      setMessages((prev) => [...prev, userMessage]);

      // Send all messages to API with file content if attached
      const allMessages = [...messages, userMessage];
      const contentToSend = hasFileAttached;

      sendMessage(allMessages, contentToSend);

      // Clear attached file after sending
      setAttachedFile(null);
    },
    [messages, isLoading, attachedFile, currentResume, sendMessage]
  );

  /**
   * Handle file remove
   */
  const handleFileRemove = useCallback(() => {
    setAttachedFile(null);
  }, []);

  /**
   * Handle clear chat
   */
  const handleClearChat = useCallback((): void => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      setError(null);
      setAttachedFile(null);
      reset();
      hasProcessedInitialFile.current = false;
    }
  }, [reset]);

  /**
   * Clear error message
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  /**
   * Handle suggested prompt click
   */
  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      handleSendMessage(prompt);
    },
    [handleSendMessage]
  );

  const hasMessages = messages.length > 0;

  return (
    <Card
      {...getRootProps()}
      className={`flex h-full flex-col bg-card relative ${className}`}
      role="region"
      aria-label="Chat interface"
    >
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-12 w-12 text-primary" />
            <p className="text-lg font-semibold text-primary">Drop file here to attach</p>
            <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT</p>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-row items-center justify-between border-b border-border px-6 py-4 min-h-[65px]">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
          <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
          {DEFAULT_TITLE}
        </h2>

        {/* Clear Chat Button */}
        {hasMessages && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label="Clear all chat messages"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="ml-2 hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <DataFetchWrapper
          isLoading={isLoadingResume}
          loadingMessage="Loading..."
          className="flex-1 flex flex-col"
        >
          <>
            {/* Messages Container */}
            <div
              className={`flex-1 space-y-4 ${hasMessages ? 'px-6 pt-6 pb-6' : ''}`}
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-relevant="additions"
            >
          {/* Empty State / Welcome Message */}
          {!hasMessages && (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-6 px-4">
              <div className="space-y-2 max-w-3xl w-full">
                <h3 className="flex items-center justify-center gap-2 text-base font-semibold text-foreground">
                  <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
                  {currentResume ? 'Polish Your Resume' : 'Build Your Resume'}
                </h3>

                {currentResume ? (
                  /* Resume exists - show improvement message */
                  <div className="text-center space-y-3">
                    <p className="text-sm text-foreground">
                      Your resume is ready! Let's make it shine ✨
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ask me to refine any section, tailor it for specific roles, optimize for ATS, or explore new ways to showcase your experience
                    </p>
                  </div>
                ) : (
                  /* No resume - show creation guide */
                  <>
                    <p className="text-xs text-muted-foreground text-center">
                      Provide the following information to create your professional resume or you can upload a resume file instead we can parse these things from your existing resume
                    </p>

                    {/* Information Required List - Compact Layout */}
                    <div className="space-y-2 text-left text-xs">
                      <div>
                        <h4 className="font-semibold text-foreground mb-0.5 text-xs">Personal Information</h4>
                        <p className="text-muted-foreground">
                          First & last name • Email & mobile • Location • LinkedIn • GitHub • Visa status • Remote preference
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-0.5 text-xs">Professional Summary</h4>
                        <p className="text-muted-foreground">
                          Brief professional summary highlighting your expertise
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-0.5 text-xs">Skills</h4>
                        <p className="text-muted-foreground">
                          List of skills organized by category (Frontend, Backend, DevOps, etc.)
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-0.5 text-xs">Professional Experience</h4>
                        <p className="text-muted-foreground">
                          Company name & location • Position/role • Employment dates • Achievements & responsibilities • Project descriptions
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-foreground mb-0.5 text-xs">Education</h4>
                        <p className="text-muted-foreground">
                          College/University name & location • Major/Degree • Dates attended
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Suggested Prompts - Only show if resume exists */}
              {currentResume && (
                <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Suggested prompts">
                  {[
                    'Help me create a resume for a software engineer role',
                    'Optimize my resume for ATS systems',
                    'What skills should I highlight?',
                  ].map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="text-xs"
                      aria-label={`Send prompt: ${prompt}`}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages List */}
          {hasMessages &&
            messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} message={message} />
            ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}

          {/* Error Display */}
          {(error || apiError) && (
            <div
              className="flex items-start gap-2 rounded-lg border border-destructive bg-destructive/10 p-3"
              role="alert"
              aria-live="assertive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-destructive">Error</p>
                <p className="text-xs text-destructive/90">
                  {error || apiError?.message || 'An error occurred'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-auto p-0 text-xs text-destructive hover:text-destructive/90"
                  aria-label="Dismiss error message"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Scroll Anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-card px-6 pb-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            attachedFile={attachedFile}
            onFileRemove={handleFileRemove}
          />
        </div>
      </>
        </DataFetchWrapper>
      </div>
    </Card>
  );
}

export default ChatInterface;
