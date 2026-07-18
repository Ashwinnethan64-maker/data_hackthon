import { useEffect, useRef, useState } from 'react';
import { conversationThreads, mockResponses } from '../data/mockInvestigationData';
import { generateAiResponse } from '../services/aiService';
import type { AiConversationThread, AiMessage, AiResponse, AiContext, Language } from '../types';

const defaultSuggestedPrompts = [
  'Show cybercrime cases in Bengaluru Urban',
  'List open cases in Mysuru district',
  'Show critical and high-priority FIRs',
  'Find cases with pending arrests',
  'Summarize drug trafficking cases',
  'Find extortion cases in Bengaluru',
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
  const [threads, setThreads] = useState<AiConversationThread[]>(conversationThreads);
  const [selectedThreadId, setSelectedThreadId] = useState(conversationThreads[0]?.id ?? '');

  const [language, setLanguage] = useState<Language>('en');
  const [context, setContext] = useState<AiContext>({});
  const [isRecording, setIsRecording] = useState(false);
  const [activeSpeechMessageId, setActiveSpeechMessageId] = useState<string | null>(null);

  const [messagesByThread, setMessagesByThread] = useState<Record<string, AiMessage[]>>(() =>
    conversationThreads.reduce<Record<string, AiMessage[]>>((acc, thread) => {
      // System greeting
      const system = buildSystemMessage('en');
      // User query (the thread's original query)
      const userMsg: AiMessage = {
        id: createMessageId('user'),
        role: 'user',
        content: thread.lastQuery,
        timestamp: 'Now',
        language: 'en',
      };
      // Assistant mock response for this thread
      const response = mockResponses[thread.id] ?? FALLBACK_RESPONSE;
      const assistantMsg: AiMessage = {
        id: createMessageId('assistant'),
        role: 'assistant',
        content: response.summary,
        timestamp: 'Now',
        response,
        language: 'en',
      };
      acc[thread.id] = [system, userMsg, assistantMsg];
      return acc;
    }, {}),
  );

  const [query, setQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeResponse, setActiveResponse] = useState<AiResponse>(mockResponses[selectedThreadId] ?? FALLBACK_RESPONSE);
  const abortRef = useRef<AbortController | null>(null);

  // When the selected thread changes, clear the input field and show the latest response for that thread
  useEffect(() => {
    // Clear any lingering query so the input box stays empty
    setQuery('');
    // Load the most recent assistant response for the newly‑selected thread
    const threadMessages = messagesByThread[selectedThreadId] ?? [];
    const lastAssistant = threadMessages
      .filter((msg) => msg.role === 'assistant')
      .pop();
    if (lastAssistant && lastAssistant.response) {
      setActiveResponse(lastAssistant.response);
    } else {
      setActiveResponse(FALLBACK_RESPONSE);
    }
  }, [selectedThreadId, messagesByThread]);

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

    // Determine current thread ID, creating a new thread if needed
    let currentThreadId = selectedThreadId;
    if (!currentThreadId) {
      const newThreadId = createMessageId('thread');
      const newThread = {
        id: newThreadId,
        title: trimmedQuery,
        lastQuery: trimmedQuery,
        updatedAt: 'Just now',
        pinned: false,
        saved: false,
      } as any; // cast to match AiConversationThread shape
      setThreads((prev) => [...prev, newThread]);
      setSelectedThreadId(newThreadId);
      // Initialize messages for the new thread with a system message
      const systemMsg = buildSystemMessage(language);
      setMessagesByThread((prev) => ({
        ...prev,
        [newThreadId]: [systemMsg],
      }));
      currentThreadId = newThreadId;
    }

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

    // Gather existing messages for the thread (include system welcome if new).
    const threadMessages =
      messagesByThread[currentThreadId] && messagesByThread[currentThreadId].length > 0
        ? messagesByThread[currentThreadId]
        : [buildSystemMessage(language)];

    setMessagesByThread((prev) => ({
      ...prev,
      [currentThreadId]: [...threadMessages, userMessage, streamingMessage],
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
          [currentThreadId]: (prev[currentThreadId] ?? []).map((m) =>
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
          [currentThreadId]: (prev[currentThreadId] ?? []).map((m) =>
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

  const startSpeechToText = () => {
    // @ts-ignore - SpeechRecognition is not fully typed
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    // If supported, try to use real speech recognition
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'kn' ? 'kn-IN' : 'en-US';
        recognition.interimResults = true; // Show results as they speak!
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
          setQuery('');
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setQuery(finalTranscript || interimTranscript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          simulateTypingDictation(); // Fallback to animation if error (e.g. no mic permission)
        };

        recognition.onend = () => {
          setIsRecording(false);
          // Only send if we got a query
          setQuery((currentQuery) => {
            if (currentQuery.trim()) {
              setTimeout(() => sendQuery(currentQuery), 500);
            }
            return currentQuery;
          });
        };

        recognition.start();
        return;
      } catch (e) {
        console.error('Failed to start SpeechRecognition', e);
      }
    }

    // Fallback: Realistic typing animation of the demo query
    simulateTypingDictation();
  };

  const simulateTypingDictation = () => {
    setIsRecording(true);
    setQuery('');
    
    const demoQuery = language === 'kn'
      ? 'ಬೆಂಗಳೂರಿನಲ್ಲಿ ಸೈಬರ್ ಅಪರಾಧ ಪ್ರಕರಣಗಳನ್ನು ತೋರಿಸಿ'
      : 'Show cybercrime cases in Bengaluru Urban';
      
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      currentIndex++;
      setQuery(demoQuery.substring(0, currentIndex));
      
      if (currentIndex >= demoQuery.length) {
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsRecording(false);
          sendQuery(demoQuery);
        }, 800);
      }
    }, 50); // Types a character every 50ms for realistic speed
  };

  const simulateTextToSpeech = (messageId: string, content: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = language === 'kn' ? 'kn-IN' : 'en-US';
    
    utterance.onstart = () => {
      setActiveSpeechMessageId(messageId);
    };
    
    utterance.onend = () => {
      setActiveSpeechMessageId(null);
    };

    utterance.onerror = () => {
      setActiveSpeechMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };



  return {
    threads,
    selectedThreadId,
    setSelectedThreadId,
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
    startSpeechToText,
    activeSpeechMessageId,
    simulateTextToSpeech,
    // expose setter for internal updates
    setActiveResponse,
  };
}
