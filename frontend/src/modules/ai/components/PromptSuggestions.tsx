import { Badge } from '../../../components/Badge';

interface PromptSuggestionsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSuggestions({ prompts, onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          className="snap-start shrink-0 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
          onClick={() => onSelectPrompt(prompt)}
          type="button"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
