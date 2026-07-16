import { useState, useCallback } from 'react';
import type { AIExplanation } from '../types';
import { generateAIExplanation } from '../services/networkService';

export function useAIExplanation() {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openExplanation = useCallback(async () => {
    setIsOpen(true);
    if (explanation) return; // already loaded
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIExplanation();
      setExplanation(result);
    } catch {
      setError('Failed to generate AI explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [explanation]);

  const closeExplanation = useCallback(() => {
    setIsOpen(false);
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIExplanation();
      setExplanation(result);
    } catch {
      setError('Failed to generate AI explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isOpen,
    explanation,
    isLoading,
    error,
    openExplanation,
    closeExplanation,
    refresh,
  };
}
