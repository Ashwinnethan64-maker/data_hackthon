import { Send, Mic, Sparkles } from 'lucide-react';
import { Button } from '../../../components/Button';
import clsx from 'clsx';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  onRecord?: () => void;
}

export function ChatInput({ value, onChange, onSubmit, disabled, isRecording, onRecord }: ChatInputProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <label className="block text-sm font-medium text-slate-350 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Ask the investigation assistant
        </span>
        {onRecord && (
          <button
            onClick={onRecord}
            type="button"
            className={clsx(
              "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold border transition-all",
              isRecording
                ? "bg-red-500/20 border-red-500/35 text-red-400 animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            )}
          >
            <Mic className="w-3.5 h-3.5" />
            {isRecording ? 'Listening...' : 'Voice Command'}
          </button>
        )}
      </label>
      <textarea
        className="mt-3 min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan/60"
        placeholder="Show burglary cases in Bengaluru"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
      />
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Press Enter to send or Shift+Enter for newline.</p>
        <Button disabled={disabled} onClick={onSubmit} type="button">
          <Send className="h-4 w-4" />
          Send to AI
        </Button>
      </div>
    </div>
  );
}
