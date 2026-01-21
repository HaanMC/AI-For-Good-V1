import React from 'react';
import { Menu, Settings, Zap, Brain, RefreshCw } from 'lucide-react';
import { AppMode } from '../../types';
import { Avatar } from '../ui';

interface HeaderProps {
  currentMode: AppMode;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isFastMode: boolean;
  onToggleFastMode: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  showModeToggle?: boolean;
  hidden?: boolean;
  userName?: string;
}

const getModeInfo = (mode: AppMode): { title: string; breadcrumb?: string } => {
  switch (mode) {
    case AppMode.StudyChat:
      return { title: 'Trợ Lý Học Tập', breadcrumb: 'Trợ Lý Học Tập' };
    case AppMode.Roleplay:
      return { title: 'Hóa Thân Nhân Vật', breadcrumb: 'Hóa Thân Nhân Vật' };
    case AppMode.ExamGenerator:
      return { title: 'Luyện Thi Giả Lập', breadcrumb: 'Luyện Thi Giả Lập' };
    case AppMode.WritingWorkshop:
      return { title: 'Phòng Luyện Viết', breadcrumb: 'Phòng Luyện Viết' };
    case AppMode.Dictionary:
      return { title: 'Từ Điển Văn Học', breadcrumb: 'Từ Điển Văn Học' };
    case AppMode.Flashcard:
      return { title: 'Flashcards', breadcrumb: 'Flashcards' };
    case AppMode.Mindmap:
      return { title: 'Mindmap', breadcrumb: 'Mindmap' };
    case AppMode.StudyPlan:
      return { title: 'Lịch Học', breadcrumb: 'Lịch Học' };
    case AppMode.StudentProfile:
      return { title: 'Hồ Sơ Học Tập' };
    case AppMode.Settings:
      return { title: 'Cài Đặt' };
    default:
      return { title: 'AI Văn Học' };
  }
};

const Header: React.FC<HeaderProps> = ({
  currentMode,
  isSidebarOpen,
  onToggleSidebar,
  isFastMode,
  onToggleFastMode,
  onRefresh,
  isLoading = false,
  showModeToggle = true,
  hidden = false,
  userName
}) => {
  if (hidden) return null;

  const modeInfo = getModeInfo(currentMode);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      {/* Left Side - Menu & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* Breadcrumb */}
        {modeInfo.breadcrumb && (
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {modeInfo.breadcrumb}
            </span>
          </div>
        )}
      </div>

      {/* Right Side - Mode Toggle & Actions */}
      <div className="flex items-center gap-3">
        {/* Fast/Deep Mode Toggle */}
        {showModeToggle && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => !isFastMode && onToggleFastMode()}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${isFastMode
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tốc độ nhanh</span>
            </button>
            <button
              onClick={() => isFastMode && onToggleFastMode()}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${!isFastMode
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }
              `}
            >
              <Brain className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Suy nghĩ sâu</span>
            </button>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Settings Icon */}
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        {/* User Avatar */}
        <Avatar name={userName} size="sm" />
      </div>
    </header>
  );
};

export default Header;
