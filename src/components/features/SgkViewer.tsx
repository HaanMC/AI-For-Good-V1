/**
 * SGK Viewer Component
 * PDF viewer for textbooks with book selection and quick search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Search,
  X,
  AlertCircle,
  Loader2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { getBooks, getSgkStatus, checkPdfExists, type SgkBook } from '../../sgk';
import { quickSearchSgk } from '../../ai/sgkAiService';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface SgkViewerProps {
  className?: string;
}

interface BookStatus {
  book: SgkBook;
  pdfAvailable: boolean;
}

const SgkViewer: React.FC<SgkViewerProps> = ({ className = '' }) => {
  // State
  const [books, setBooks] = useState<BookStatus[]>([]);
  const [selectedBook, setSelectedBook] = useState<SgkBook | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Load books on mount
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const sgkStatus = getSgkStatus();

    if (sgkStatus === 'error' || sgkStatus === 'idle') {
      setError('Chưa có SGK được tải. Vui lòng kiểm tra thư mục /public/sgk/');
      setLoading(false);
      return;
    }

    const bookList = getBooks();
    const statusList: BookStatus[] = [];

    for (const book of bookList) {
      const pdfAvailable = await checkPdfExists(book);
      statusList.push({ book, pdfAvailable });
    }

    setBooks(statusList);
    setLoading(false);
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  };

  const onDocumentLoadError = (err: Error) => {
    console.error('[SgkViewer] PDF load error:', err);
    setError('Không thể tải PDF. File có thể chưa được upload hoặc bị lỗi.');
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const result = quickSearchSgk(searchQuery, 8);
    setSearchResults(result.results || []);
    setIsSearching(false);
  }, [searchQuery]);

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectBookFromSearch = (bookId: string) => {
    const bookStatus = books.find(b => b.book.id === bookId);
    if (bookStatus && bookStatus.pdfAvailable) {
      setSelectedBook(bookStatus.book);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const getPdfUrl = (book: SgkBook): string => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const pdfPath = book.pdf.startsWith('/') ? book.pdf.slice(1) : book.pdf;
    return `${baseUrl}${pdfPath}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Đang tải danh sách SGK...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !selectedBook) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Chưa có SGK</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      {/* Header with search and book selector */}
      <div className="bg-white border-b p-4 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Sách Giáo Khoa (PDF)</h2>
        </div>

        {/* Search box */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                placeholder="Tìm kiếm trong SGK (tên tác phẩm, tác giả...)"
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Tìm
            </button>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
              <div className="p-2 border-b bg-gray-50 flex justify-between items-center">
                <span className="text-sm text-gray-600">Kết quả tìm kiếm</span>
                <button
                  onClick={() => setSearchResults([])}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => selectBookFromSearch(result.bookId)}
                >
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{result.heading}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{result.snippet}</p>
                      <p className="text-xs text-blue-600 mt-1">📖 {result.bookId.replace('ngu-van-10-', '').replace(/-/g, ' ')}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Book selector */}
        <div className="flex flex-wrap gap-2">
          {books.map(({ book, pdfAvailable }) => (
            <button
              key={book.id}
              onClick={() => pdfAvailable && setSelectedBook(book)}
              disabled={!pdfAvailable}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedBook?.id === book.id
                  ? 'bg-blue-600 text-white'
                  : pdfAvailable
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {book.title.replace('Ngữ Văn 10 - ', '')}
              {!pdfAvailable && ' (Chưa có)'}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Viewer */}
      {selectedBook ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* PDF Controls */}
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Trang trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Trang {pageNumber} / {numPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Trang sau"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={scale >= 2.5}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Phóng to"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedBook(null)}
                className="ml-4 p-1.5 rounded hover:bg-gray-100 text-gray-500"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PDF Document */}
          <div className="flex-1 overflow-auto bg-gray-200 flex justify-center p-4">
            <Document
              file={getPdfUrl(selectedBook)}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-gray-600">Không thể tải PDF</p>
                  <p className="text-sm text-gray-500 mt-2">Chưa có PDF cho quyển này</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        /* No book selected - show instructions */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Chọn một quyển sách</h3>
            <p className="text-gray-500">
              Chọn một quyển SGK ở trên để xem nội dung, hoặc tìm kiếm để tìm nội dung cụ thể.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SgkViewer;
