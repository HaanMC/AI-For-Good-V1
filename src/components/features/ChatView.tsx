import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Message, Sender, UploadedFile } from '../../types';
import { ChatMessage, ChatInput } from '../shared';
import { EmptyState } from '../ui';
import { MessageSquare, Sparkles, Paperclip, Mic, Copy, Send } from 'lucide-react';
import { sendMessageToGemini, extractTextFromImage } from '../../../services/geminiService';
import { checkContentSafety, createSupportiveResponse } from '../../../utils/contentSafetyFilter';
import { showToast } from '../../../utils/toast';

interface ChatViewProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userName?: string;
  weaknesses?: string[];
  isFastMode: boolean;
  onSaveSession?: (messages: Message[]) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  userName,
  weaknesses = [],
  isFastMode,
  onSaveSession
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() && files.length === 0) return;

    // Check content safety first
    const safetyCheck = checkContentSafety(inputMessage);
    if (safetyCheck.riskLevel !== 'none' && safetyCheck.riskLevel !== 'low') {
      // Show supportive response for concerning content
      const supportiveMsg = createSupportiveResponse(safetyCheck);
      const botMessage: Message = {
        id: `bot_${Date.now()}`,
        text: supportiveMsg,
        sender: Sender.Bot,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
      setInputMessage('');
      return;
    }

    // Create user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputMessage,
      sender: Sender.User,
      timestamp: Date.now(),
      files: files.length > 0 ? [...files] : undefined
    };

    // Add loading message
    const loadingMessage: Message = {
      id: `loading_${Date.now()}`,
      text: '',
      sender: Sender.Bot,
      timestamp: Date.now(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setFiles([]);
    setIsLoading(true);

    try {
      // Extract text from images if any
      let imageTexts: string[] = [];
      for (const file of userMessage.files || []) {
        if (file.mimeType.startsWith('image/')) {
          try {
            const extractedText = await extractTextFromImage(file.data, file.mimeType);
            if (extractedText) {
              imageTexts.push(extractedText);
            }
          } catch (err) {
            console.error('OCR error:', err);
          }
        }
      }

      // Build context with image texts
      let fullMessage = userMessage.text;
      if (imageTexts.length > 0) {
        fullMessage += `\n\n[Nội dung từ ảnh đính kèm]:\n${imageTexts.join('\n\n')}`;
      }

      // Get AI response
      const response = await sendMessageToGemini(
        fullMessage,
        messages.filter(m => !m.isLoading),
        weaknesses,
        isFastMode ? false : true // Use extended thinking for deep mode
      );

      // Replace loading with actual response
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `bot_${Date.now()}`,
            text: response,
            sender: Sender.Bot,
            timestamp: Date.now()
          }
        ];
      });

      // Save session
      onSaveSession?.(messages);
    } catch (error) {
      console.error('Chat error:', error);
      const apiKeyNotice =
        'API key expired/invalid. Update the GitHub secret API_KEY and redeploy.\n' +
        'API key hết hạn/không hợp lệ. Hãy cập nhật GitHub secret API_KEY và redeploy.';
      const isApiKeyInvalid = Boolean((error as { apiKeyInvalid?: boolean })?.apiKeyInvalid);

      if (isApiKeyInvalid) {
        showToast(apiKeyNotice);
      } else {
        showToast("Couldn't reach AI. Try again.");
      }
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isLoading);
        return [
          ...filtered,
          {
            id: `error_${Date.now()}`,
            text: isApiKeyInvalid
              ? apiKeyNotice
              : 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
            sender: Sender.Bot,
            timestamp: Date.now()
          }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, files, messages, weaknesses, isFastMode, setMessages, onSaveSession]);

  // Handle file selection
  const handleFileSelect = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
  };

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-surface-main dark:bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={<MessageSquare className="w-12 h-12 text-primary-400" />}
              title="Bắt đầu cuộc trò chuyện"
              description="Hãy đặt câu hỏi về văn học, yêu cầu phân tích tác phẩm, hoặc nhờ giải thích khái niệm."
            />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === Sender.User ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === Sender.User ? (
                  // User message - Orange bubble
                  <div className="max-w-[80%] lg:max-w-[60%]">
                    <div className="bg-primary-500 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                ) : (
                  // AI message - White card with orange accents
                  <div className="max-w-[85%] lg:max-w-[70%]">
                    <div className="flex items-start gap-3">
                      {/* AI Avatar */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>

                      {/* Message Content */}
                      <div className="flex-1">
                        {message.isLoading ? (
                          <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                              <span className="text-sm text-slate-500">Đang suy nghĩ...</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-md px-4 py-4 shadow-sm border border-slate-200 dark:border-slate-700">
                            {/* Render markdown-like content */}
                            <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
                              {message.text.split('\n').map((line, idx) => {
                                // Handle headers
                                if (line.startsWith('### ')) {
                                  return <h4 key={idx} className="text-primary-600 font-bold mt-4 mb-2 text-base">{line.replace('### ', '')}</h4>;
                                }
                                if (line.startsWith('## ')) {
                                  return <h3 key={idx} className="text-primary-600 font-bold mt-4 mb-2 text-lg">{line.replace('## ', '')}</h3>;
                                }
                                // Handle bold text
                                if (line.includes('**')) {
                                  const parts = line.split(/\*\*(.*?)\*\*/g);
                                  return (
                                    <p key={idx} className="mb-2">
                                      {parts.map((part, i) =>
                                        i % 2 === 1 ? <strong key={i} className="text-primary-600">{part}</strong> : part
                                      )}
                                    </p>
                                  );
                                }
                                // Handle list items
                                if (line.startsWith('- ') || line.startsWith('• ')) {
                                  return <li key={idx} className="ml-4 mb-1">{line.replace(/^[-•]\s/, '')}</li>;
                                }
                                // Handle blockquotes
                                if (line.startsWith('>')) {
                                  return (
                                    <blockquote key={idx} className="border-l-4 border-primary-400 bg-slate-50 dark:bg-slate-700/50 pl-4 py-2 my-2 italic text-slate-600 dark:text-slate-300 rounded-r-lg">
                                      {line.replace('> ', '')}
                                    </blockquote>
                                  );
                                }
                                // Regular paragraph
                                if (line.trim()) {
                                  return <p key={idx} className="mb-2 text-slate-700 dark:text-slate-300">{line}</p>;
                                }
                                return null;
                              })}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <Copy className="w-4 h-4 text-slate-400" />
                              </button>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggestions (show when no messages or few messages) */}
      {messages.length <= 1 && (
        <div className="px-4 lg:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            Gợi ý câu hỏi:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'Phân tích nhân vật Thúy Kiều',
              'Giải thích biện pháp tu từ ẩn dụ',
              'So sánh thơ Đường và thơ lục bát',
              'Hướng dẫn viết nghị luận xã hội'
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                className="
                  px-3 py-1.5 text-xs font-medium
                  bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400
                  rounded-full
                  hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors
                  flex items-center gap-1
                "
              >
                <Sparkles className="w-3 h-3" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
            {/* Left icons */}
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Paperclip className="w-5 h-5 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Mic className="w-5 h-5 text-slate-500" />
              </button>
              <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <Copy className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Input */}
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Đặt câu hỏi về văn bản, tác giả, hoặc yêu cầu phân tích..."
                rows={1}
                className="w-full bg-transparent border-none outline-none resize-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm"
                style={{ minHeight: '24px', maxHeight: '120px' }}
              />
            </div>

            {/* Send button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && files.length === 0}
              className={`
                p-3 rounded-xl transition-all
                ${inputMessage.trim() || files.length > 0
                  ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-primary'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Nhấn Enter để gửi • AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
