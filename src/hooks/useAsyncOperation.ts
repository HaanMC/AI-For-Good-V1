import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  progress?: string;
}

export interface AsyncOperationOptions {
  /** Timeout in milliseconds (default: 30000 = 30 seconds) */
  timeout?: number;
  /** Message to show when operation times out */
  timeoutMessage?: string;
  /** Progress messages to cycle through during loading */
  progressMessages?: string[];
  /** Interval for cycling progress messages (ms) */
  progressInterval?: number;
}

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_TIMEOUT_MESSAGE = 'Yêu cầu mất quá lâu. Vui lòng thử lại.';

/**
 * Hook để quản lý async operations với timeout, cancellation, và error handling
 */
export function useAsyncOperation<T>(options: AsyncOperationOptions = {}) {
  const {
    timeout = DEFAULT_TIMEOUT,
    timeoutMessage = DEFAULT_TIMEOUT_MESSAGE,
    progressMessages = [],
    progressInterval = 3000,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    progress: undefined,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const progressIndexRef = useRef(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, []);

  // Start progress message cycling
  const startProgressCycle = useCallback(() => {
    if (progressMessages.length === 0) return;

    progressIndexRef.current = 0;
    setState(prev => ({ ...prev, progress: progressMessages[0] }));

    progressIntervalRef.current = setInterval(() => {
      progressIndexRef.current = (progressIndexRef.current + 1) % progressMessages.length;
      if (isMountedRef.current) {
        setState(prev => ({ ...prev, progress: progressMessages[progressIndexRef.current] }));
      }
    }, progressInterval);
  }, [progressMessages, progressInterval]);

  // Stop progress message cycling
  const stopProgressCycle = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cancel the current operation
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    stopProgressCycle();
    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        progress: undefined,
      }));
    }
  }, [stopProgressCycle]);

  // Execute an async operation
  const execute = useCallback(async (
    operation: (signal?: AbortSignal) => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    // Cancel any existing operation
    cancel();

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Set loading state
    setState({
      data: null,
      isLoading: true,
      error: null,
      progress: progressMessages[0] || undefined,
    });

    startProgressCycle();

    // Set timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutIdRef.current = setTimeout(() => {
        reject(new Error('TIMEOUT'));
      }, timeout);
    });

    try {
      // Race between operation and timeout
      const result = await Promise.race([
        operation(signal),
        timeoutPromise,
      ]);

      // Clear timeout since operation completed
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      stopProgressCycle();

      if (isMountedRef.current) {
        setState({
          data: result,
          isLoading: false,
          error: null,
          progress: undefined,
        });
      }

      onSuccess?.(result);
      return result;

    } catch (err: any) {
      // Clear timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      stopProgressCycle();

      // Don't update state if aborted intentionally
      if (err?.name === 'AbortError' || signal.aborted) {
        return null;
      }

      // Determine error message
      let errorMessage: string;
      if (err?.message === 'TIMEOUT') {
        errorMessage = timeoutMessage;
      } else if (err?.message?.includes('QUOTA_EXCEEDED') || err?.message?.includes('quota')) {
        errorMessage = 'Đã hết quota API. Vui lòng kiểm tra quota hoặc proxy Gemini.';
      } else if (err?.message?.includes('VITE_GEMINI_PROXY_URL')) {
        errorMessage = 'Gemini proxy chưa được cấu hình. Vui lòng kiểm tra VITE_GEMINI_PROXY_URL.';
      } else if (err?.message?.includes('network') || err?.message?.includes('fetch') || err?.message?.includes('Failed to fetch')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      } else if (err?.message) {
        // Use the error message but make it user-friendly
        errorMessage = err.message.includes('API') || err.message.includes('AI')
          ? err.message
          : 'Đã xảy ra lỗi. Vui lòng thử lại.';
      } else {
        errorMessage = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
      }

      if (isMountedRef.current) {
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
          progress: undefined,
        });
      }

      onError?.(errorMessage);
      return null;
    }
  }, [cancel, startProgressCycle, stopProgressCycle, timeout, timeoutMessage, progressMessages]);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      isLoading: false,
      error: null,
      progress: undefined,
    });
  }, [cancel]);

  // Clear error only
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    execute,
    cancel,
    reset,
    clearError,
  };
}

export default useAsyncOperation;
