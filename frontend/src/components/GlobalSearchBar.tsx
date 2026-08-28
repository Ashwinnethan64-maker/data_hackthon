import { useState, useEffect, useRef } from 'react';
import { Search, FileText, User, ShieldAlert, Cpu, FileSpreadsheet, Loader2, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import { useDebounce } from '../hooks/useDebounce';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'Case' | 'Person' | 'Intelligence' | 'Report';
  path: string;
  status?: string;
  priority?: string;
  role?: string;
}

interface SearchResponse {
  cases: SearchResultItem[];
  people: SearchResultItem[];
  intelligence: SearchResultItem[];
  reports: SearchResultItem[];
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const debouncedQuery = useDebounce(query, 250);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categorized search results
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;
    setIsLoading(true);

    apiRequest<SearchResponse>(`/system/global-search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((data) => {
        if (isCurrent) {
          setResults(data);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      })
      .catch((err) => {
        console.error('Global search error:', err);
        if (isCurrent) setResults({ cases: [], people: [], intelligence: [], reports: [] });
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery]);

  // Flattened list for keyboard navigation
  const flatItems: SearchResultItem[] = [
    ...(results?.cases || []),
    ...(results?.people || []),
    ...(results?.intelligence || []),
    ...(results?.reports || [])
  ];

  const handleSelect = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || flatItems.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        navigate(`/cases?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
        handleSelect(flatItems[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/cases?search=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const hasResults = flatItems.length > 0;
  const showEmpty = isOpen && debouncedQuery.trim() && !isLoading && !hasResults;

  return (
    <div ref={containerRef} className="relative w-full md:max-w-xl">
      {/* Search Input Box */}
      <div className="flex w-full items-center gap-2 md:gap-3 rounded-xl md:rounded-2xl border border-white/10 bg-white/5 px-3 py-2 md:px-4 md:py-2.5 text-slate-300 shadow-inner shadow-black/10 transition-all focus-within:border-cyan/50 focus-within:bg-white/10">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim()) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label="Search incidents, IPs, techniques"
          className="w-full min-w-0 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
          placeholder="Search incidents, IPs, techniques..."
        />

        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-cyan shrink-0" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
              setIsOpen(false);
            }}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10 rounded">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Categorized Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-[1050] max-h-[480px] overflow-y-auto rounded-2xl border border-white/10 bg-navy/95 p-3 shadow-2xl backdrop-blur-2xl divide-y divide-white/5">
          {isLoading && !results && (
            <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-cyan" />
              <span className="text-xs">Searching intelligence repository...</span>
            </div>
          )}

          {showEmpty && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShieldAlert className="h-8 w-8 text-slate-500 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-300">No records found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                No matching incidents, suspects, or threat intelligence for "{debouncedQuery}".
              </p>
            </div>
          )}

          {results && hasResults && (
            <div className="space-y-3">
              {/* Cases / FIRs */}
              {results.cases.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan">
                    <FileText className="h-3.5 w-3.5" />
                    <span>Incidents & FIR Cases ({results.cases.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.cases.map((item) => {
                      const itemIndex = flatItems.indexOf(item);
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected ? 'bg-police/30 border border-cyan/40 text-white' : 'hover:bg-white/5 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate text-white">{item.title}</span>
                              {item.priority && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                    item.priority === 'Critical'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* People / Suspects / Victims */}
              {results.people.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    <User className="h-3.5 w-3.5" />
                    <span>Persons of Interest ({results.people.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.people.map((item) => {
                      const itemIndex = flatItems.indexOf(item);
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected ? 'bg-police/30 border border-purple-500/40 text-white' : 'hover:bg-white/5 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold truncate text-white">{item.title}</span>
                              {item.role && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {item.role}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Intelligence & MITRE */}
              {results.intelligence.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    <Cpu className="h-3.5 w-3.5" />
                    <span>Threat Intel & Techniques ({results.intelligence.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.intelligence.map((item) => {
                      const itemIndex = flatItems.indexOf(item);
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected ? 'bg-police/30 border border-amber-500/40 text-white' : 'hover:bg-white/5 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-white">{item.title}</span>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reports */}
              {results.reports.length > 0 && (
                <div className="pt-2 first:pt-0">
                  <div className="flex items-center gap-1.5 px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Intelligence Reports ({results.reports.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.reports.map((item) => {
                      const itemIndex = flatItems.indexOf(item);
                      const isSelected = selectedIndex === itemIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            isSelected ? 'bg-police/30 border border-emerald-500/40 text-white' : 'hover:bg-white/5 text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-white">{item.title}</span>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Footer hint */}
          <div className="pt-2 mt-2 flex items-center justify-between text-[11px] text-slate-500 px-2">
            <span>Use ↑↓ keys to navigate</span>
            <span className="flex items-center gap-1">
              Select <CornerDownLeft className="h-3 w-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
