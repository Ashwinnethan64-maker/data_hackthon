import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { PromptSuggestions } from './PromptSuggestions';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { EvidencePanel } from './EvidencePanel';
import { RelatedCases } from './RelatedCases';
import { Card } from '../../../components/Card';
import { Badge } from '../../../components/Badge';
import { useAiInvestigator } from '../hooks/useAiInvestigator';
import { ExportDialog } from './ExportDialog';
import { Globe, Download, Layers, List, Plus } from 'lucide-react';
import clsx from 'clsx';
import { SharedModal } from './SharedModal';
import type { AiMessage } from '../types';

export function AIChatPage() {
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const {
    threads,
    selectedThreadId,
    setSelectedThreadId,
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
    simulateTextToSpeech,
  } = useAiInvestigator();

  const [isExportOpen, setIsExportOpen] = useState(false);

  const activeThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden h-full">
      {/* Mobile top buttons */}
      <div className="flex w-full gap-2 p-2 lg:hidden">
        <button
          onClick={() => setShowEvidenceModal(true)}
          className="flex-1 flex justify-center items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-all px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
          title="Open Evidence & Related Panels"
        >
          <Layers className="w-3 h-3" />
          <span>EVIDENCE</span>
        </button>
        <button
          onClick={() => setShowConversationModal(true)}
          className="flex-1 flex justify-center items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-all px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
          title="Open Conversations Sidebar"
        >
          <List className="w-3 h-3" />
          <span>THREADS</span>
        </button>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_360px] flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Integrated Chat & Input Window */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <Card className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 pb-2 shrink-0">
                <div className="flex items-center gap-2 w-full truncate mb-1">
                <span className="text-xs font-bold text-white uppercase truncate">
                  {activeThread?.title ?? 'Investigation Feed'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Mobile buttons moved to top */}
                {/* Language toggle */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-all px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
                  title="Toggle Language"
                >
                  <Globe className="w-3 h-3 text-cyan" />
                  <span>{language === 'en' ? 'EN' : 'KN'}</span>
                </button>

                {/* New conversation button */}
                <button
                  onClick={() => {
                    setSelectedThreadId('');
                    setQuery('');
                  }}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-all px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
                  title="New Conversation"
                >
                  <Plus className="w-3 h-3" />
                  <span>NEW</span>
                </button>
                {/* Export button */}
                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-all px-2 py-1 bg-white/5 border border-white/5 rounded-lg"
                  title="Export Thread"
                >
                  <Download className="w-3 h-3" />
                  <span>EXPORT</span>
                </button>
              </div>
            </div>

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* Determine messages to display */}
              {(() => {
                const defaultAgentMessage: AiMessage = {
                  id: 'assistant-initial',
                  role: 'assistant',
                  content: language === 'en'
                    ? 'AI-CIOS is ready. Please send a query to begin investigation.'
                    : 'AI-CIOS ಸಿದ್ಧವಿದೆ. ಪ್ರಾರಂಭ ಮಾಡಲು ಪ್ರಶ್ನೆ ಹಾಕಿ.',
                  timestamp: 'Now',
                  language,
                };
                const msgs = messages && messages.length > 0 ? messages : [defaultAgentMessage];
                return (
                  <AnimatePresence initial={false}>
                    {msgs.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        onTtsPlay={simulateTextToSpeech}
                        activeSpeechMessageId={activeSpeechMessageId}
                      />
                    ))}
                  </AnimatePresence>
                );
              })()}

            </div>

            {/* Prompt suggestions line inside card (only shown for initial message context) */}
            {messages.length <= 1 && (
              <PromptSuggestions onSelectPrompt={(prompt) => sendQuery(prompt)} prompts={promptChips} />
            )}

            {/* Input fields */}
            <div className="shrink-0 pt-2 border-t border-white/5 space-y-2">
              <ChatInput
                disabled={isStreaming}
                onChange={setQuery}
                onSubmit={() => sendQuery(query)}
                value={query}
                isRecording={isRecording}
                onRecord={simulateSpeechToText}
              />
              <div className="flex items-center gap-2">
                <div className={clsx(
                  "h-1.5 w-1.5 rounded-full shrink-0",
                  isStreaming ? "bg-cyan animate-ping" : "bg-slate-650"
                )} />
                <p className="text-[9px] text-slate-450">
                  {isStreaming 
                    ? 'Cross-referencing database districts and constructing intelligence response...' 
                    : 'System Status: Synchronized with Datastore.'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Split Vertically */}
        <div className="hidden lg:flex flex-col space-y-4 h-full overflow-hidden">
          {/* Top Panel: Current conversation indicators */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <EvidencePanel response={activeResponse} />
            <RelatedCases cases={activeResponse.relatedCases} />
          </div>

          {/* Bottom Panel: Sidebar thread list — fits content, max 50% of column */}
          <div className="shrink-0 max-h-[50%] overflow-y-auto border-t border-white/5 pt-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <ConversationSidebar
              onSelectThread={setSelectedThreadId}
              selectedThreadId={selectedThreadId}
              threads={threads}
            />
          </div>
        </div>
      </div>

      {/* Mobile Modals */}
        {showEvidenceModal && (
          <SharedModal isOpen={showEvidenceModal} onClose={() => setShowEvidenceModal(false)} title="Evidence">
            <EvidencePanel response={activeResponse} />
            <RelatedCases cases={activeResponse.relatedCases} />
          </SharedModal>
        )}
        {showConversationModal && (
          <SharedModal isOpen={showConversationModal} onClose={() => setShowConversationModal(false)} title="Conversations">
            <ConversationSidebar
              onSelectThread={setSelectedThreadId}
              selectedThreadId={selectedThreadId}
              threads={threads}
            />
          </SharedModal>
        )}

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        messages={messages}
      />
    </div>
  );
}
