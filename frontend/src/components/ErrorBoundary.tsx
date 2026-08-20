import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AI-CIOS Uncaught error in React tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
          <div className="rounded-2xl border border-red-500/20 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl max-w-md w-full">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">AI-CIOS Module Load Error</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              AI-CIOS failed to render this view. Please try refreshing or returning to the dashboard.
            </p>
            {this.state.error && (
              <div className="mb-6 rounded-lg bg-black/40 p-3 text-left border border-white/5 overflow-x-auto">
                <p className="font-mono text-[11px] text-red-400 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-police px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-police/20 hover:bg-police-light transition-all"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry & Reload
              </button>
              <button
                onClick={() => window.location.href = '/app/'}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
