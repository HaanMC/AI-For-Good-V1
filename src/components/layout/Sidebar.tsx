import React from 'react';
import {
  BookOpen,
  MessageSquare,
  GraduationCap,
  BookA,
  PenTool,
  Users,
  Layers,
  Brain,
  Sun,
  Moon,
  X,
  Contrast
} from 'lucide-react';
import { AppMode } from '../../types';

interface SidebarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isOpen: boolean;
  onToggle: () => void;
  userName?: string;
  isDarkMode: boolean;
  isHighContrast: boolean;
  onToggleTheme: () => void;
  onToggleHighContrast: () => void;
  onShowHistory: () => void;
  chatHistoryCount?: number;
}

interface NavItem {
  mode: AppMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const mainNavItems: NavItem[] = [
  { mode: AppMode.StudyChat, label: 'Trợ Lý Học Tập', icon: MessageSquare, description: 'Hỏi đáp, giải thích bài học, phân tích văn bản' },
  { mode: AppMode.Roleplay, label: 'Hóa Thân Nhân Vật', icon: Users, description: 'Trò chuyện với nhân vật trong tác phẩm' },
  { mode: AppMode.ExamGenerator, label: 'Luyện Thi Giả Lập', icon: GraduationCap, description: 'Tạo đề thi, đếm giờ, AI chấm điểm chi tiết' },
  { mode: AppMode.WritingWorkshop, label: 'Phòng Luyện Viết', icon: PenTool, description: 'Phân tích, chấm rubric, cải thiện bài văn' },
  { mode: AppMode.Dictionary, label: 'Từ Điển Văn Học', icon: BookA, description: 'Tra cứu thuật ngữ, biện pháp tu từ' },
  { mode: AppMode.Flashcard, label: 'Flashcards', icon: Layers, description: 'Thẻ ghi nhớ theo chủ đề (AI tạo)' },
  { mode: AppMode.Mindmap, label: 'Mindmap', icon: Brain, description: 'Sơ đồ tư duy tác phẩm, tác giả' },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onModeChange,
  isOpen,
  onToggle,
  isDarkMode,
  isHighContrast,
  onToggleTheme,
  onToggleHighContrast,
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-full z-50
          w-[280px] bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-500 rounded-xl shadow-primary">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                  AI Hỗ Trợ Học Tập Môn
                </h1>
                <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">
                  Ngữ Văn
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Dự Án AI For Good
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Đóng menu"
              title="Đóng menu"
            >
              <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav
          className="flex-1 overflow-y-auto p-3 space-y-1"
          aria-label="Điều hướng chính"
        >
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentMode === item.mode;

            return (
              <button
                key={item.mode}
                onClick={() => {
                  onModeChange(item.mode);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`
                  relative w-full flex items-start gap-3 px-3 py-3 rounded-xl
                  text-left transition-all duration-200 group
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-200 dark:ring-primary-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
                title={item.description}
              >
                <Icon
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <span className={`font-medium text-sm block ${isActive ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.label}
                  </span>
                  {item.description && (
                    <p className={`text-xs mt-0.5 leading-snug ${isActive ? 'text-primary-600/70 dark:text-primary-400/70' : 'text-slate-500 dark:text-slate-400'}`}>
                      {item.description}
                    </p>
                  )}
                </div>
                {/* Visual indicator for active state */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section - Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p
            id="theme-toggle-label"
            className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider font-medium"
          >
            Giao diện
          </p>

          {/* Main Theme Toggle */}
          <div
            className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1"
            role="group"
            aria-labelledby="theme-toggle-label"
          >
            <button
              onClick={() => isDarkMode && onToggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                !isDarkMode
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-pressed={!isDarkMode}
              aria-label="Chế độ tối"
              title="Chuyển sang chế độ tối"
            >
              <Moon className="w-4 h-4" aria-hidden="true" />
              <span>Tối</span>
            </button>
            <button
              onClick={() => !isDarkMode && onToggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${
                isDarkMode
                  ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              aria-pressed={isDarkMode}
              aria-label="Chế độ sáng"
              title="Chuyển sang chế độ sáng"
            >
              <Sun className="w-4 h-4" aria-hidden="true" />
              <span>Sáng</span>
            </button>
          </div>

          {/* High Contrast Toggle - Only in some views */}
          {isHighContrast !== undefined && (
            <button
              onClick={onToggleHighContrast}
              className={`
                mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all
                focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                ${isHighContrast
                  ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
              aria-pressed={isHighContrast}
              aria-label={isHighContrast ? 'Tắt chế độ tương phản cao' : 'Bật chế độ tương phản cao'}
              title={isHighContrast ? 'Tắt chế độ tương phản cao' : 'Bật chế độ tương phản cao'}
            >
              <Contrast className="w-4 h-4" aria-hidden="true" />
              <span>Tương phản</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
