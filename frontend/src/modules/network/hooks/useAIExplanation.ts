import { useState, useCallback } from 'react';
import type { AIExplanation, NetworkFilterOptions } from '../types';
import { generateAIExplanation } from '../services/networkService';

export function useAIExplanation() {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openExplanation = useCallback(async (filters?: NetworkFilterOptions) => {
    setIsOpen(true);
    if (explanation) return; // already loaded
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIExplanation(filters);
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

  const refresh = useCallback(async (filters?: NetworkFilterOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateAIExplanation(filters);
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
