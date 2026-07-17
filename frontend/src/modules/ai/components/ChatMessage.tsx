import { motion } from 'framer-motion';
import { Badge } from '../../../components/Badge';
import type { AiMessage } from '../types';
import { TypingIndicator } from './TypingIndicator';
import { cn } from '../../../utils/cn';
import { Volume2, VolumeX, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
      <div className={cn('max-w-[85%] space-y-1.5', isUser ? 'items-end' : 'items-start')}>
        <div className="flex items-center gap-2">
          <Badge variant={isUser ? 'info' : 'neutral'} className="text-[9px] px-1.5 py-0.5">{isUser ? 'Officer' : 'AI Investigator'}</Badge>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
          
          {/* TTS simulation button */}
          {!isUser && !message.isStreaming && onTtsPlay && (
            <button
              onClick={() => onTtsPlay(message.id, message.content)}
              className={cn(
                "p-0.5 rounded hover:bg-slate-800 transition-colors",
                isSpeaking ? "text-cyan-400" : "text-slate-500 hover:text-slate-355"
              )}
              title="Speak Answer"
            >
              {isSpeaking ? <VolumeX className="w-3 h-3 animate-pulse" /> : <Volume2 className="w-3 h-3" />}
            </button>
          )}

          {message.language && (
            <span className="text-[9px] text-slate-500 uppercase flex items-center gap-0.5 font-mono">
              <Globe className="w-2.5 h-2.5 text-slate-600" />
              {message.language}
            </span>
          )}
        </div>
        {message.isStreaming ? (
          <TypingIndicator />
        ) : isUser ? (
          <div className="rounded-xl bg-cyan/10 px-3 py-2.5 border border-cyan/20">
            <p className="text-sm leading-relaxed text-slate-100">{message.content}</p>
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 px-3 py-2.5 border border-white/5">
            <div className="text-sm leading-relaxed text-slate-200 space-y-1.5">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-lg font-bold text-white mt-3 mb-1.5" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mt-2.5 mb-1.5" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-sm font-bold text-white mt-2 mb-1" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 my-0.5 space-y-0.5" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-0.5 space-y-0.5" {...props} />,
                  li: ({node, ...props}) => <li className="text-slate-200 text-sm leading-relaxed" {...props} />,
                  p: ({node, ...props}) => <p className="text-sm leading-relaxed text-slate-200 min-h-[1em]" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-slate-300" {...props} />
                }}
              >
                {message.response ? message.response.summary : message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

