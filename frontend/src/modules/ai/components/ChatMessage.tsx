import { motion } from 'framer-motion';
import { Badge } from '../../../components/Badge';
import { Card } from '../../../components/Card';
import type { AiMessage } from '../types';
import { AIResponseCard } from './AIResponseCard';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '../../../utils/cn';
import { Volume2, VolumeX, Globe } from 'lucide-react';

interface ChatMessageProps {
  message: AiMessage;
  onTtsPlay?: (messageId: string, content: string) => void;
  activeSpeechMessageId?: string | null;
}

export function ChatMessage({ message, onTtsPlay, activeSpeechMessageId }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSpeaking = activeSpeechMessageId === message.id;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.25 }}
    >
      <div className={cn('max-w-[90%] space-y-3', isUser ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2">
          <Badge variant={isUser ? 'info' : 'neutral'}>{isUser ? 'Officer' : 'AI Investigator'}</Badge>
          <span className="text-xs text-slate-500">{message.timestamp}</span>
          
          {/* TTS simulation button */}
          {!isUser && !message.isStreaming && onTtsPlay && (
            <button
              onClick={() => onTtsPlay(message.id, message.content)}
              className={cn(
                "p-1 rounded hover:bg-slate-800 transition-colors",
                isSpeaking ? "text-cyan-400" : "text-slate-500 hover:text-slate-355"
              )}
              title="Speak Answer"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {message.language && (
            <span className="text-[10px] text-slate-500 uppercase flex items-center gap-0.5 font-mono">
              <Globe className="w-3 h-3 text-slate-600" />
              {message.language}
            </span>
          )}
        </div>
        {message.isStreaming ? (
          <TypingIndicator />
        ) : isUser ? (
          <Card className="bg-cyan/10">
            <p className="text-sm leading-6 text-slate-100">{message.content}</p>
          </Card>
        ) : message.response ? (
          <AIResponseCard response={message.response} />
        ) : (
          <Card>
            <p className="text-sm leading-6 text-slate-100">{message.content}</p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
