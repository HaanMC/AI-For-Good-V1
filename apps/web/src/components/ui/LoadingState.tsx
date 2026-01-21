import React from 'react';
import { XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { LoadingDots } from './LoadingSpinner';
import Button from './Button';

interface LoadingStateProps {
  /** Đang loading hay không */
  isLoading: boolean;
  /** Progress message hiện tại */
  progress?: string;
  /** Mô tả thêm về tiến trình */
  description?: string;
  /** Ước tính thời gian */
  estimatedTime?: string;
  /** Handler khi click Hủy */
  onCancel?: () => void;
  /** Error message nếu có */
  error?: string | null;
  /** Handler khi click Thử lại */
  onRetry?: () => void;
  /** Handler khi click Đóng error */
  onDismissError?: () => void;
  /** Children khi không loading và không có error */
  children?: React.ReactNode;
}

/**
 * Component hiển thị loading state với cancel, progress, và error handling
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  progress,
  description,
  estimatedTime,
  onCancel,
  error,
  onRetry,
  onDismissError,
  children,
}) => {
  // Hiển thị error nếu có
  if (error) {
    return (
      <div
        className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl space-y-3"
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 dark:text-red-300 font-medium">
              Đã xảy ra lỗi
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Thử lại
            </Button>
          )}
          {onDismissError && (
            <Button
              onClick={onDismissError}
              variant="ghost"
              size="sm"
            >
              Đóng
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Hiển thị loading nếu đang loading
  if (isLoading) {
    return (
      <div
        className="py-8 text-center space-y-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <LoadingDots />
        <div>
          {progress && (
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
              {progress}
            </p>
          )}
          {description && (
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              {description}
            </p>
          )}
          {estimatedTime && (
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
              {estimatedTime}
            </p>
          )}
        </div>
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            Hủy
          </Button>
        )}
      </div>
    );
  }

  // Hiển thị children nếu không loading và không có error
  return <>{children}</>;
};

export default LoadingState;
