/**
 * ChatMessage Component
 * Displays individual chat messages with user/assistant variants
 */

import { memo, useCallback, useState } from 'react';
import { User, Bot, Copy, Check } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../../types/chat';
import { Button } from '@subbiah/reusable/components/ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
}

const USER_MESSAGE_BG = 'bg-primary/10';
const ASSISTANT_MESSAGE_BG = 'bg-muted';
const COPY_TIMEOUT_MS = 2000;

/**
 * ChatMessage component renders individual messages
 * Optimized with React.memo and useCallback for performance
 */
export const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const isUser = message.role === 'user';

  /**
   * Copy message content to clipboard
   */
  const handleCopyMessage = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), COPY_TIMEOUT_MS);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  }, [message.content]);

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
        aria-label={isUser ? 'User avatar' : 'Assistant avatar'}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} flex-1`}>
        <div
          className={`group relative max-w-[85%] rounded-lg px-4 py-2 ${
            isUser ? USER_MESSAGE_BG : ASSISTANT_MESSAGE_BG
          }`}
        >
          {/* Message Text */}
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Copy Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyMessage}
            className="absolute -right-2 -top-2 z-10 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 bg-background border border-border"
            aria-label={isCopied ? 'Copied!' : 'Copy message'}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
