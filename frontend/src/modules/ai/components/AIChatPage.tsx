import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ConversationHeader } from './ConversationHeader';
import { ConversationSidebar } from './ConversationSidebar';
import { PromptSuggestions } from './PromptSuggestions';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { EvidencePanel } from './EvidencePanel';
import { RelatedCases } from './RelatedCases';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { useAiInvestigator } from '../hooks/useAiInvestigator';
import { ExportDialog } from './ExportDialog';
import { Globe, Download, Volume2, Mic } from 'lucide-react';
import clsx from 'clsx';

export function AIChatPage() {
  const {
    threads,
    selectedThreadId,
    setSelectedThreadId,
    savedSearches,
    recentQueries,
    promptChips,
    messages,
    query,
    setQuery,
    isStreaming,
    activeResponse,
    sendQuery,
    language,
    toggleLanguage,
    isRecording,
    simulateSpeechToText,
    activeSpeechMessageId,
    simulateTextToSpeech
  } = useAiInvestigator();

  const [isExportOpen, setIsExportOpen] = useState(false);

  const activeThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ConversationHeader
          subtitle="An evidence-backed investigation workspace for natural-language case analysis."
          title={activeThread?.title ?? 'Conversational Investigation Workspace'}
          updatedAt={activeThread?.updatedAt ?? 'Now'}
        />
        
        {/* Top Control Bar (Language Toggle & Export Button) */}
        <div className="flex items-center gap-2">
          {/* Multi-language selector */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-350 hover:text-white transition-all"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'ENGLISH' : 'ಕನ್ನಡ (KANNADA)'}</span>
          </button>

          {/* Export button */}
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-350 hover:text-white transition-all"
            title="Export Thread"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <ConversationSidebar
          onSelectThread={setSelectedThreadId}
          recentQueries={recentQueries}
          savedSearches={savedSearches}
          selectedThreadId={selectedThreadId}
          threads={threads}
        />

        <div className="space-y-4">
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Conversation Timeline</p>
                <p className="mt-1 text-sm text-slate-400">Streaming responses appear in investigation order.</p>
              </div>
              <div className="flex items-center gap-2">
                <ConfidenceBadge value={activeResponse.confidence} />
                <Badge variant="info">Explainable AI</Badge>
              </div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onTtsPlay={simulateTextToSpeech}
                    activeSpeechMessageId={activeSpeechMessageId}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Card>

          <PromptSuggestions onSelectPrompt={(prompt) => sendQuery(prompt)} prompts={promptChips} />

          <ChatInput
            disabled={isStreaming}
            onChange={setQuery}
            onSubmit={() => sendQuery(query)}
            value={query}
            isRecording={isRecording}
            onRecord={simulateSpeechToText}
          />

          <div>
            <Card>
              <div className="flex items-center gap-2.5">
                <div className={clsx(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  isStreaming ? "bg-cyan animate-ping" : "bg-slate-600"
                )} />
                <p className="text-xs text-slate-400">
                  {isStreaming 
                    ? 'Analyzing case history databases, cross-referencing districts and building intelligence response...' 
                    : 'System Status: Active and synchronized with Karnataka Police records.'}
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <EvidencePanel response={activeResponse} />
          <RelatedCases cases={activeResponse.relatedCases} />

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-white">Confidence Score</p>
              <p className="mt-2 text-3xl font-bold text-white font-mono">{activeResponse.confidence}%</p>
              <p className="mt-1 text-sm text-slate-400">Based on evidence coverage and query specificity.</p>
            </div>
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Applicable Acts</p>
              <div className="flex flex-wrap gap-1.5">
                {activeResponse.applicableActs.map((act) => (
                  <Badge key={act} variant="info">
                    {act}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="text-sm font-semibold text-white">Investigation Timeline</p>
            <div className="space-y-3">
              {activeResponse.investigationTimeline.map((step) => (
                <div key={step.title} className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{step.time}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <p className="text-sm font-semibold text-white">Suggested Next Actions</p>
            <div className="flex flex-wrap gap-2">
              {activeResponse.recommendedActions.map((action) => (
                <Badge key={action} variant="neutral">
                  {action}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="secondary" type="button" className="w-full justify-center text-xs">
                Open related case
              </Button>
              <Button onClick={() => setIsExportOpen(true)} type="button" className="w-full justify-center text-xs">
                Generate report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        messages={messages}
      />
    </div>
  );
}
