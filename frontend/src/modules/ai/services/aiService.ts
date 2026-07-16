import type { AiResponse } from '../types';
import { apiRequest } from '../../../utils/api';

export function generateAiResponse(query: string, messages: any[], context = {}, lang = 'en'): Promise<AiResponse & { updatedContext: any }> {
  return apiRequest<AiResponse & { updatedContext: any }>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query, messages, context, language: lang })
  });
}
