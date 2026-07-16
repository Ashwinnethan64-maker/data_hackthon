import { Badge } from '../../../components/Badge';

interface PromptSuggestionsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSuggestions({ prompts, onSelectPrompt }: PromptSuggestionsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">Suggested Prompts</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 transition hover:border-cyan/40 hover:bg-cyan/10 hover:text-white"
            onClick={() => onSelectPrompt(prompt)}
            type="button"
          >
            {prompt}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">Evidence-backed</Badge>
        <Badge variant="neutral">Investigation mode</Badge>
      </div>
    </div>
  );
}
