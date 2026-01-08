import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Target,
  Clock,
  Flame,
  Sparkles,
  BookOpen,
  PenTool,
  CheckCircle2,
  AlertTriangle,
  Calendar as CalendarIcon,
  LogOut
} from 'lucide-react';
import { Button, Badge, Avatar } from '../ui';
import { UserProfile, StudyPlan } from '../../types';

interface StudyScheduleProps {
  profile: UserProfile | null;
  studyPlan: StudyPlan | null;
  onGeneratePlan: () => void;
  onSyncCalendar?: () => void;
  onAddSession?: () => void;
  isLoading: boolean;
  userName?: string;
}

interface ScheduleTask {
  id: string;
  time: string;
  title: string;
  type: 'reading' | 'writing' | 'review' | 'quiz';
  duration: string;
  completed: boolean;
  dueLabel?: string;
}

const StudySchedule: React.FC<StudyScheduleProps> = ({
  profile,
  studyPlan,
  onGeneratePlan,
  onSyncCalendar,
  onAddSession,
  isLoading,
  userName
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data for demonstration
  const weeklyGoal = { current: 4, target: 5 };
  const assignmentsDue = 2;
  const studyStreak = 12;

  const todaysTasks: ScheduleTask[] = [
    {
      id: '1',
      time: '10:00 SA',
      title: 'Đọc Truyện Kiều - Hồi 4',
      type: 'reading',
      duration: '45 phút',
      completed: false
    },
    {
      id: '2',
      time: '02:00 CH',
      title: 'Viết bài: Biểu tượng trong văn học',
      type: 'writing',
      duration: '60 phút',
      completed: false,
      dueLabel: 'Hạn ngày mai'
    },
    {
      id: '3',
      time: '09:00 SA',
      title: 'Ôn tập Flashcards',
      type: 'review',
      duration: '15 phút',
      completed: true
    }
  ];

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const days = getDaysInMonth(currentMonth);

  // Mock calendar events
  const calendarEvents: Record<number, { type: string; color: string }[]> = {
    5: [
      { type: 'reading', color: 'bg-primary-500' },
      { type: 'essay', color: 'bg-rose-500' }
    ],
    8: [{ type: 'progress', color: 'bg-amber-500' }],
    11: [{ type: 'quiz', color: 'bg-purple-500' }]
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'reading':
        return <BookOpen className="w-4 h-4" />;
      case 'writing':
        return <PenTool className="w-4 h-4" />;
      case 'review':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'reading':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'writing':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400';
      case 'review':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Avatar name={userName} size="md" />
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">
                LitAssistant AI
              </h1>
              <p className="text-xs text-primary-600 dark:text-primary-400">
                Gói Premium
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Target className="w-5 h-5" />
            <span className="font-medium">Bảng điều khiển</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Khóa học</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Trợ lý Chat</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
            <CalendarIcon className="w-5 h-5" />
            <span className="font-medium">Lịch học tập</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <Target className="w-5 h-5" />
            <span className="font-medium">Cài đặt</span>
          </button>
        </nav>

        {/* AI Suggestion Card */}
        <div className="p-4">
          <div className="p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Gợi ý từ AI</span>
            </div>
            <p className="text-sm text-primary-100 mb-3">
              Em tập trung tốt nhất lúc 10 giờ sáng. Dời "Viết bài văn" sang sáng mai để hiệu quả hơn?
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors">
                Áp dụng
              </button>
              <button className="flex-1 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                Bỏ qua
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Lịch Học Tập
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Quản lý thời gian học và theo dõi deadline bài tập.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onSyncCalendar}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Đồng bộ lịch
            </Button>
            <Button
              onClick={onAddSession}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-primary-500 hover:bg-primary-600"
            >
              Thêm buổi học
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Weekly Goal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Mục tiêu tuần</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {weeklyGoal.current}/{weeklyGoal.target} Giờ
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                  style={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
                />
              </div>
              <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">+20%</span>
            </div>
          </div>

          {/* Assignments Due */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Bài tập cần nộp</span>
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {assignmentsDue} Đang chờ
            </div>
            <p className="text-sm text-rose-600 dark:text-rose-400">
              Hạn tiếp theo: 24 giờ nữa
            </p>
          </div>

          {/* Study Streak */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Chuỗi học tập</span>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {studyStreak} Ngày
            </div>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              +2 ngày so với TB
            </p>
          </div>
        </div>

        {/* Calendar and Today's Plan */}
        <div className="grid grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-500" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map((day) => (
                <div key={day} className="py-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => {
                const isToday = day === new Date().getDate() &&
                  currentMonth.getMonth() === new Date().getMonth() &&
                  currentMonth.getFullYear() === new Date().getFullYear();
                const events = day ? calendarEvents[day] || [] : [];

                return (
                  <div
                    key={index}
                    className={`
                      aspect-square p-2 rounded-xl transition-colors cursor-pointer
                      ${day ? 'hover:bg-slate-50 dark:hover:bg-slate-700' : ''}
                      ${isToday ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500' : ''}
                    `}
                  >
                    {day && (
                      <>
                        <span className={`
                          text-sm font-medium
                          ${isToday ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}
                        `}>
                          {day}
                        </span>
                        {events.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {events.slice(0, 2).map((event, i) => (
                              <div
                                key={i}
                                className={`h-1.5 rounded-full ${event.color}`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Plan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Kế hoạch hôm nay</h2>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">
                Xem tất cả
              </button>
            </div>

            <div className="space-y-4">
              {todaysTasks.map((task) => (
                <div
                  key={task.id}
                  className={`
                    flex items-start gap-3 p-4 rounded-xl border transition-colors
                    ${task.completed
                      ? 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                    }
                  `}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {task.time.split(' ')[0]}
                    </span>
                    <span className="text-xs text-slate-500">
                      {task.time.split(' ')[1]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-slate-900 dark:text-white ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getTaskTypeColor(task.type)} size="sm">
                        {getTaskTypeIcon(task.type)}
                        <span className="ml-1 capitalize">
                          {task.type === 'reading' ? 'Đọc' : task.type === 'writing' ? 'Viết' : 'Ôn tập'}
                        </span>
                      </Badge>
                      <span className="text-xs text-slate-500">{task.duration}</span>
                    </div>
                    {task.dueLabel && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {task.dueLabel}
                      </p>
                    )}
                  </div>

                  <button className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                    ${task.completed
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
                    }
                  `}>
                    {task.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>

            {/* Generate Plan Button */}
            {!studyPlan && (
              <Button
                onClick={onGeneratePlan}
                disabled={isLoading}
                className="w-full mt-6 bg-primary-500 hover:bg-primary-600"
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {isLoading ? 'Đang tạo kế hoạch...' : 'Tạo kế hoạch 7 ngày'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudySchedule;
