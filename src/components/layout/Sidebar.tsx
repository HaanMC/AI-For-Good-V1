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
  Calendar,
  UserCircle2,
  Settings2,
  Sun,
  Moon,
  History,
  X,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { AppMode } from '../../types';
import { IconButton, Avatar, Badge } from '../ui';

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
  { mode: AppMode.StudyChat, label: 'Trợ Lý Học Tập', icon: MessageSquare, description: 'Hỏi đáp AI' },
  { mode: AppMode.ExamGenerator, label: 'Luyện Thi', icon: GraduationCap, description: 'Tạo đề & chấm điểm' },
  { mode: AppMode.WritingWorkshop, label: 'Phòng Viết', icon: PenTool, description: 'Phân tích bài văn' },
  { mode: AppMode.Dictionary, label: 'Từ Điển', icon: BookA, description: 'Thuật ngữ văn học' },
  { mode: AppMode.Roleplay, label: 'Nhập Vai', icon: Users, description: 'Đóng vai nhân vật' },
  { mode: AppMode.Flashcard, label: 'Flashcard', icon: Layers, description: 'Thẻ ghi nhớ' },
  { mode: AppMode.Mindmap, label: 'Mindmap', icon: Brain, description: 'Sơ đồ tư duy' },
  { mode: AppMode.StudyPlan, label: 'Lịch Học', icon: Calendar, description: 'Kế hoạch 7 ngày' },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onModeChange,
  isOpen,
  onToggle,
  userName,
  isDarkMode,
  isHighContrast,
  onToggleTheme,
  onToggleHighContrast,
  onShowHistory,
  chatHistoryCount = 0
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
          w-72 bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header / Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-500 rounded-xl shadow-primary">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">
                  LitAI
                </h1>
                <p className="text-xs text-primary-600 dark:text-primary-400">
                  Trợ lý học văn
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* User Profile Quick Access */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onModeChange(AppMode.StudentProfile)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl transition-all
              ${currentMode === AppMode.StudentProfile
                ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
            <Avatar name={userName} size="sm" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                {userName || 'Học sinh'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hồ sơ học tập
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
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
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    text-left transition-all duration-200 group
                    ${isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-white/20'
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-primary-600 dark:text-primary-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {item.label}
                    </span>
                    {item.description && (
                      <p className={`text-xs truncate ${isActive ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Chat History */}
          <button
            onClick={onShowHistory}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left text-sm font-medium">Lịch sử chat</span>
            {chatHistoryCount > 0 && (
              <Badge variant="primary" size="sm">{chatHistoryCount}</Badge>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => onModeChange(AppMode.Settings)}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors
              ${currentMode === AppMode.Settings
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
            `}
          >
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Settings2 className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left text-sm font-medium">Cài đặt</span>
          </button>

          {/* Theme Toggle */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 px-1 uppercase tracking-wider">Giao diện</p>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                onClick={() => isDarkMode && onToggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  !isDarkMode
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Sáng</span>
              </button>
              <button
                onClick={() => !isDarkMode && onToggleTheme()}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  isDarkMode
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Tối</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
