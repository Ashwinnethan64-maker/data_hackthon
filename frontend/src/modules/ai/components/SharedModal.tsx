import React from 'react';

interface SharedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SharedModal({ isOpen, onClose, title, children }: SharedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-4 relative max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-white text-2xl">✕</button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-2rem)] space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
