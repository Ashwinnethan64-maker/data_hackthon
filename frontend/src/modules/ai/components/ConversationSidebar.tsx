import { Bookmark, History, Search, Pin } from 'lucide-react';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { cn } from '../../../utils/cn';
import type { AiConversationThread } from '../types';

interface ConversationSidebarProps {
  threads: AiConversationThread[];
  selectedThreadId: string;
  onSelectThread: (threadId: string) => void;
}

export function ConversationSidebar({
  threads,
  selectedThreadId,
  onSelectThread,
}: ConversationSidebarProps) {
  return (
    <Card className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <History className="h-4 w-4 text-cyan" />
          <span>Active Threads & Searches</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Threads */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent Conversations</p>
          <div className="space-y-1.5">
            {threads.map((thread) => {
              const isActive = selectedThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  className={cn(
                    'w-full rounded-xl border px-3 py-2 text-left transition text-xs',
                    isActive
                      ? 'border-cyan/40 bg-cyan/10'
                      : 'border-white/5 bg-white/5 hover:border-white/25 hover:bg-white/10',
                  )}
                  onClick={() => onSelectThread(thread.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-white truncate">{thread.title}</p>
                    {thread.pinned && <Pin className="h-3 w-3 text-cyan shrink-0" />}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400 truncate">{thread.lastQuery}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
