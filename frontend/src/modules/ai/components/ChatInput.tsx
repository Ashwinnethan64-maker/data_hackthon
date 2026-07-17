import { Send, Mic } from 'lucide-react';
import clsx from 'clsx';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  onRecord?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  isRecording,
  onRecord,
}: ChatInputProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/70 p-1.5 focus-within:ring-1 focus-within:ring-cyan/60">
      {onRecord && (
        <button
          onClick={onRecord}
          type="button"
          className={clsx(
            'p-2 rounded-lg transition-all shrink-0',
            isRecording
              ? 'bg-red-500/20 text-red-400 animate-pulse'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
          )}
          title="Voice Command"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}
      <textarea
        rows={1}
        className="flex-1 h-[32px] min-h-[32px] max-h-[100px] w-full resize-none bg-transparent py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none scrollbar-none"
        placeholder="Ask the investigation assistant..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <button
        disabled={disabled || !value.trim()}
        onClick={onSubmit}
        type="button"
        className="p-2 rounded-lg bg-cyan/20 text-cyan hover:bg-cyan/30 disabled:opacity-50 disabled:hover:bg-cyan/20 transition-all shrink-0"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
