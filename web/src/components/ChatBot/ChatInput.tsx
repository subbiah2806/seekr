/**
 * ChatInput Component
 * Input component for sending chat messages
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import { Send, X, FileText } from 'lucide-react';
import { Textarea } from '@subbiah/reusable/components/ui/textarea';
import { Button } from '@subbiah/reusable/components/ui/button';

interface AttachedFile {
  name: string;
  content: string;
}

interface ChatInputProps {
  onSendMessage: (message: string, fileContent?: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  attachedFile?: AttachedFile | null;
  onFileRemove?: () => void;
}

const MAX_ROWS = 6;
const MIN_ROWS = 1;
const DEFAULT_PLACEHOLDER = 'Type your message or attach a file... (Enter to send, Shift+Enter for new line)';
const MAX_CHARACTER_LIMIT = 4000;

/**
 * ChatInput component for user message input
 */
export function ChatInput({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = DEFAULT_PLACEHOLDER,
  attachedFile = null,
  onFileRemove,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [rows, setRows] = useState(MIN_ROWS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content
   */
  const adjustTextareaHeight = useCallback((): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';

    // Calculate number of rows
    const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
    const newRows = Math.min(
      MAX_ROWS,
      Math.max(MIN_ROWS, Math.floor(textarea.scrollHeight / lineHeight))
    );

    setRows(newRows);
  }, []);

  /**
   * Handle input change
   */
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const newValue = event.target.value;

    // Enforce character limit
    if (newValue.length <= MAX_CHARACTER_LIMIT) {
      setValue(newValue);
    }
  };

  /**
   * Handle message send
   */
  const handleSend = useCallback((): void => {
    const trimmedValue = value.trim();

    // Allow send if either there's text or an attached file
    if ((!trimmedValue && !attachedFile) || isLoading || disabled) {
      return;
    }

    onSendMessage(trimmedValue, attachedFile?.content);
    setValue('');
    setRows(MIN_ROWS);
  }, [value, isLoading, disabled, attachedFile, onSendMessage]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    // Enter to send (Shift+Enter for new line)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  /**
   * Auto-resize on value change
   */
  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  /**
   * Focus textarea on mount
   */
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const isDisabled = disabled || isLoading;
  const canSend = (value.trim().length > 0 || attachedFile !== null) && !isDisabled;
  const characterCount = value.length;
  const showCharacterCount = characterCount > MAX_CHARACTER_LIMIT * 0.8;

  return (
    <div className="flex flex-col gap-2">
      {/* Attached File Chip */}
      {attachedFile && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2">
          <FileText className="h-4 w-4 text-primary" />
          <span className="flex-1 text-sm text-foreground">{attachedFile.name}</span>
          {onFileRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onFileRemove}
              className="h-5 w-5 hover:bg-destructive/10"
              aria-label="Remove attached file"
            >
              <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          )}
        </div>
      )}

      {/* Character Count Indicator */}
      {showCharacterCount && (
        <div className="flex justify-end px-1">
          <span
            className={`text-xs ${
              characterCount >= MAX_CHARACTER_LIMIT
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {characterCount} / {MAX_CHARACTER_LIMIT}
          </span>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={rows}
          className="min-h-[60px] resize-none bg-background border-input"
          aria-label="Chat message input"
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className="min-h-[60px] min-w-[60px] self-end bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 disabled:bg-muted disabled:text-muted-foreground"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default ChatInput;
