import { useEffect, useRef, useState } from 'react';
import { conversationThreads, recentQueries, savedSearches } from '../data/mockInvestigationData';
import { generateAiResponse } from '../services/aiService';
import type { AiConversationThread, AiMessage, AiResponse, AiContext, Language } from '../types';

const defaultSuggestedPrompts = [
  'Show burglary cases in Bengaluru',
  'Find repeat offenders',
  'Summarize FIR',
  'Show crime hotspots',
  'Explain criminal network',
  'Find similar cases',
  'Generate investigation report',
];

const FALLBACK_RESPONSE: AiResponse = {
  summary: 'AI-CIOS is ready. Please send a query to begin investigation.',
  evidence: [],
  confidence: 0,
  relatedCases: [],
  investigationTimeline: [],
  suggestedQuestions: [],
  recommendedActions: [],
  applicableActs: [],
};

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function buildSystemMessage(lang: Language): AiMessage {
  return {
    id: createMessageId('system'),
    role: 'system',
    content: lang === 'kn'
      ? 'AI-CIOS ಅಪರಾಧ ತನಿಖೆಗೆ ಸಿದ್ಧವಾಗಿದೆ.'
      : 'AI-CIOS is ready to investigate the selected case set.',
    timestamp: 'Now',
    language: lang,
  };
}

export function useAiInvestigator() {
  const [threads] = useState<AiConversationThread[]>(conversationThreads);
  const [selectedThreadId, setSelectedThreadId] = useState(conversationThreads[0]?.id ?? '');

  const [language, setLanguage] = useState<Language>('en');
  const [context, setContext] = useState<AiContext>({});
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeechMessageId, setActiveSpeechMessageId] = useState<string | null>(null);

  // Initialize thread messages — each thread starts with just the system greeting
  const [messagesByThread, setMessagesByThread] = useState<Record<string, AiMessage[]>>(() =>
    conversationThreads.reduce<Record<string, AiMessage[]>>((acc, thread) => {
      acc[thread.id] = [buildSystemMessage('en')];
      return acc;
    }, {}),
  );

  const [query, setQuery] = useState('Show burglary cases in Bengaluru');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeResponse, setActiveResponse] = useState<AiResponse>(FALLBACK_RESPONSE);
  const abortRef = useRef<AbortController | null>(null);

  // When selected thread changes, update query to last query of that thread
  useEffect(() => {
    const activeThread = threads.find((t) => t.id === selectedThreadId) ?? threads[0];
    if (activeThread) {
      setQuery(activeThread.lastQuery);
    }
  }, [selectedThreadId, threads]);

  // Abort any in-flight request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const messages = messagesByThread[selectedThreadId] ?? [];

  const sendQuery = (nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();
    if (!trimmedQuery || isStreaming) return;

    setQuery(trimmedQuery);
    setIsStreaming(true);

    const userMessage: AiMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: trimmedQuery,
      timestamp: 'Now',
      language,
    };

    const streamingId = createMessageId('assistant-stream');
    const streamingMessage: AiMessage = {
      id: streamingId,
      role: 'assistant',
      content: language === 'kn'
        ? 'ದಾಖಲೆಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ ಮತ್ತು ಪುರಾವೆ ಆಧಾರಿತ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನಿರ್ಮಿಸಲಾಗುತ್ತಿದೆ...'
        : 'Analyzing records and building evidence-backed response...',
      timestamp: 'Now',
      isStreaming: true,
      language,
    };

    const threadMessages = messagesByThread[selectedThreadId] ?? [];

    setMessagesByThread((prev) => ({
      ...prev,
      [selectedThreadId]: [...threadMessages, userMessage, streamingMessage],
    }));

    generateAiResponse(trimmedQuery, threadMessages, context, language)
      .then(({ updatedContext, summary, ...rest }) => {
        const finalResponse: AiResponse = { summary, ...rest };
        setContext(updatedContext ?? {});
        setActiveResponse(finalResponse);

        const finalMessage: AiMessage = {
          id: createMessageId('assistant'),
          role: 'assistant',
          content: summary,
          timestamp: 'Now',
          response: finalResponse,
          language,
        };

        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThreadId]: (prev[selectedThreadId] ?? []).map((m) =>
            m.isStreaming ? finalMessage : m,
          ),
        }));
      })
      .catch((err) => {
        console.error('AI query failed:', err);
        // Replace streaming indicator with error message
        const errMessage: AiMessage = {
          id: createMessageId('assistant-err'),
          role: 'assistant',
          content: 'Unable to reach AI service. Check your network or API status.',
          timestamp: 'Now',
          language,
        };
        setMessagesByThread((prev) => ({
          ...prev,
          [selectedThreadId]: (prev[selectedThreadId] ?? []).map((m) =>
            m.isStreaming ? errMessage : m,
          ),
        }));
      })
      .finally(() => {
        setIsStreaming(false);
      });
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'kn' : 'en';
    setLanguage(nextLang);
    setMessagesByThread((prev) => ({
      ...prev,
      [selectedThreadId]: [buildSystemMessage(nextLang)],
    }));
  };

  const simulateSpeechToText = () => {
    setIsRecording(true);
    const demoQuery = language === 'kn'
      ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕನ್ನಗಳ್ಳತನ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ'
      : 'Show burglary cases in Bengaluru';
    setQuery(demoQuery);
    setTimeout(() => {
      setIsRecording(false);
      sendQuery(demoQuery);
    }, 2000);
  };

  const simulateTextToSpeech = (messageId: string, _content: string) => {
    setActiveSpeechMessageId(messageId);
    setTimeout(() => {
      setActiveSpeechMessageId(null);
    }, 3000);
  };

  return {
    threads,
    selectedThreadId,
    setSelectedThreadId,
    savedSearches,
    recentQueries,
    promptChips: defaultSuggestedPrompts,
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
  };
}
