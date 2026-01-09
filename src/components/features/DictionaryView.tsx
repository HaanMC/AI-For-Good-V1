import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, BookOpen, Quote, Lightbulb, History, X, Bookmark, ChevronRight } from 'lucide-react';
import { DictionaryEntry } from '../../types';
import { Badge, EmptyState } from '../ui';
import { LoadingDots } from '../ui/LoadingSpinner';
import { lookupDictionaryTerm, searchTerms } from '../../../services/geminiService';

interface DictionaryViewProps {
  onTermLookup?: (term: string) => void;
}

const categories = [
  { name: 'Biện pháp tu từ', count: 24, color: 'bg-primary-500' },
  { name: 'Thể loại văn học', count: 18, color: 'bg-blue-500' },
  { name: 'Thuật ngữ phân tích', count: 32, color: 'bg-purple-500' },
  { name: 'Phong cách ngôn ngữ', count: 15, color: 'bg-green-500' },
];

const popularTags = ['Ẩn dụ', 'Hoán dụ', 'Luận điểm', 'Thơ Đường luật', 'Nhân hóa', 'So sánh'];

const DictionaryView: React.FC<DictionaryViewProps> = ({ onTermLookup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('dictionary_recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Save recent searches
  const saveRecentSearch = useCallback((term: string) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(t => t !== term)].slice(0, 10);
      localStorage.setItem('dictionary_recent_searches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle search
  const handleSearch = useCallback(async (term?: string) => {
    const searchValue = term || searchTerm.trim();
    if (!searchValue) return;

    setIsLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const entry = await lookupDictionaryTerm(searchValue);
      setResult(entry);
      saveRecentSearch(searchValue);
      onTermLookup?.(searchValue);
    } catch (err) {
      console.error('Dictionary lookup error:', err);
      setError('Không thể tra cứu thuật ngữ. Vui lòng thử lại.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, saveRecentSearch, onTermLookup]);

  // Handle input change with suggestions
  const handleInputChange = useCallback(async (value: string) => {
    setSearchTerm(value);

    if (value.trim().length >= 2) {
      try {
        const results = await searchTerms(value.trim());
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-full bg-surface-main dark:bg-slate-950 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Từ Điển Văn Học
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Tra cứu nhanh hơn 500+ thuật ngữ, khái niệm văn học
          </p>
        </div>

        {/* Main Search Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Tìm kiếm thuật ngữ
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Nhập thuật ngữ văn học (VD: ẩn dụ, nhân hóa...)"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="
                      absolute z-20 top-full left-0 right-0 mt-1
                      bg-white dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700
                      rounded-xl shadow-lg
                      max-h-60 overflow-y-auto
                    "
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="
                          w-full px-4 py-3 text-left
                          text-slate-700 dark:text-slate-200
                          hover:bg-slate-100 dark:hover:bg-slate-700
                          transition-colors
                          flex items-center gap-2
                          first:rounded-t-xl last:rounded-b-xl
                        "
                      >
                        <Search className="w-4 h-4 text-slate-400" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading || !searchTerm.trim()}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-primary"
              >
                {isLoading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </div>
          </div>

          {/* Popular Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Phổ biến:</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSuggestionClick(tag)}
                className="px-3 py-1 text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Categories */}
          <div className="space-y-4">
            {/* Categories Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Phân loại</h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleSuggestionClick(cat.name)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{cat.count}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Alphabet Filter */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-card border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Theo bảng chữ cái</h3>
              <div className="flex flex-wrap gap-1">
                {['A', 'B', 'C', 'D', 'E', 'G', 'H', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y'].map((letter) => (
                  <button
                    key={letter}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${letter === 'A'
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'
                      }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Result or Empty State */}
          <div className="lg:col-span-2">
            {/* Loading State */}
            {isLoading && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col items-center py-8">
                  <LoadingDots />
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Đang tra cứu "{searchTerm}"...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card border border-red-200 dark:border-red-900">
                <div className="flex items-center gap-3 text-red-500">
                  <X className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </div>
            )}

            {/* Result Card */}
            {result && !isLoading && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in">
                {/* Left Accent Bar + Content */}
                <div className="flex">
                  {/* Orange accent bar */}
                  <div className="w-1.5 bg-primary-500" />

                  {/* Content */}
                  <div className="flex-1 p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge variant="primary" size="sm" className="mb-2">
                          Biện pháp tu từ
                        </Badge>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                          {result.term}
                        </h2>
                      </div>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <Bookmark className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>

                    {/* Definition */}
                    <div className="mb-6">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        <BookOpen className="w-4 h-4" />
                        Định nghĩa
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {result.definition}
                      </p>
                    </div>

                    {/* Example */}
                    <div className="mb-6">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        <Quote className="w-4 h-4" />
                        Ví dụ minh họa
                      </h3>
                      <blockquote className="
                        pl-4 border-l-4 border-primary-400
                        bg-slate-50 dark:bg-slate-700/50
                        p-4 rounded-r-xl
                        text-slate-700 dark:text-slate-300
                        italic
                      ">
                        {result.example}
                      </blockquote>
                    </div>

                    {/* Literary Context */}
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        <Lightbulb className="w-4 h-4" />
                        Phân tích
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {result.literaryContext}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!result && !isLoading && !error && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-card border border-slate-200 dark:border-slate-700">
                <EmptyState
                  icon={<BookOpen className="w-12 h-12 text-primary-400" />}
                  title="Khám phá thuật ngữ văn học"
                  description="Nhập từ khóa để tra cứu định nghĩa, ngữ cảnh sử dụng và ví dụ minh họa từ tác phẩm văn học."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DictionaryView;
