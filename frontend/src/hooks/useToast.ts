import { useState, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

let toastListeners: Array<(toasts: ToastMessage[]) => void> = [];
let memoryToasts: ToastMessage[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...memoryToasts]));
}

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
  const newToast: ToastMessage = { id, type: 'success', duration: 3500, ...toast };
  
  memoryToasts = [...memoryToasts, newToast];
  notifyListeners();

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, newToast.duration);
  }
}

export function dismissToast(id: string) {
  memoryToasts = memoryToasts.filter(t => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>(memoryToasts);

  const subscribe = useCallback(() => {
    const listener = (updated: ToastMessage[]) => setToasts(updated);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  return { toasts, showToast, dismissToast, subscribe };
}
