import { Bookmark, History, Search, Pin } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { cn } from '../../../utils/cn';
import type { AiConversationThread } from '../types';

interface ConversationSidebarProps {
  threads: AiConversationThread[];
  selectedThreadId: string;
  onSelectThread: (threadId: string) => void;
  savedSearches: string[];
  recentQueries: string[];
}

export function ConversationSidebar({
  threads,
  selectedThreadId,
  onSelectThread,
  savedSearches,
  recentQueries,
}: ConversationSidebarProps) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <History className="h-4 w-4 text-cyan" />
          Conversation History
        </div>
        <div className="mt-4 space-y-2">
          {threads.map((thread) => {
            const isActive = selectedThreadId === thread.id;

            return (
              <button
                key={thread.id}
                className={cn(
                  'w-full rounded-2xl border px-4 py-3 text-left transition',
                  isActive
                    ? 'border-cyan/40 bg-cyan/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                )}
                onClick={() => onSelectThread(thread.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{thread.title}</p>
                    <p className="mt-1 text-xs text-slate-400">{thread.lastQuery}</p>
                  </div>
                  {thread.pinned ? <Pin className="h-4 w-4 text-cyan" /> : null}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>{thread.updatedAt}</span>
                  {thread.saved ? <Badge variant="info">Saved</Badge> : null}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Bookmark className="h-4 w-4 text-cyan" />
          Pinned Investigations
        </div>
        <p className="mt-3 text-sm text-slate-400">Track important investigations and return to them quickly.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {['Bengaluru Burglary Cluster', 'Cybercrime Spike', 'Repeat Offender Watch'].map((item) => (
            <Badge key={item} variant="neutral">
              {item}
            </Badge>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Search className="h-4 w-4 text-cyan" />
          Saved Searches
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {savedSearches.map((item) => (
            <div key={item} className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
              {item}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <History className="h-4 w-4 text-cyan" />
          Recent Queries
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {recentQueries.map((item) => (
            <div key={item} className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
