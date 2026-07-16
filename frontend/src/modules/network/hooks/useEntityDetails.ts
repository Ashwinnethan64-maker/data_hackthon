import { useState, useEffect, useCallback } from 'react';
import type { EntityDetails } from '../types';
import { getEntityDetails } from '../services/networkService';

export function useEntityDetails(selectedNodeId: string | null) {
  const [details, setDetails] = useState<EntityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDetails = useCallback(async (nodeId: string | null) => {
    if (!nodeId) {
      setDetails(null);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getEntityDetails(nodeId);
      setDetails(result);
    } catch (e) {
      setDetails(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDetails(selectedNodeId);
  }, [selectedNodeId, loadDetails]);

  return { details, isLoading };
}
