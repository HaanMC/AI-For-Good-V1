import React from 'react';
import {
  Target,
  Flame,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Play,
  FileText,
  ChevronRight,
  Sparkles,
  Clock,
  Award,
  BookMarked,
  Lightbulb
} from 'lucide-react';
import { UserProfile, ExamHistory } from '../../types';
import { Button, Badge, Avatar } from '../ui';

interface DashboardProps {
  profile: UserProfile | null;
  onStartLearning: () => void;
  onViewAllCourses: () => void;
  onTakeQuiz: () => void;
  userName?: string;
}

// Mock data for demonstration - in production, this would come from props/context
const mockBooks = [
  {
    id: '1',
    title: 'Truyện Kiều',
    author: 'Nguyễn Du',
    category: 'Văn học cổ điển',
    progress: 45,
    currentPage: 142,
    totalPages: 315,
    chapter: 'Hồi 4',
    quote: '"Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau..."',
    cover: '📚'
  },
  {
    id: '2',
    title: 'Thơ ca Việt Nam',
    author: 'Nhiều tác giả',
    category: 'Thơ & Vần điệu',
    progress: 25,
    chapter: 'Module 2',
    cover: '📖'
  },
  {
    id: '3',
    title: 'Chí Phèo',
    author: 'Nam Cao',
    category: 'Văn học hiện đại',
    progress: 0,
    chapter: 'Chưa bắt đầu',
    cover: '📕'
  }
];

const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onStartLearning,
  onViewAllCourses,
  onTakeQuiz,
  userName
}) => {
  const displayName = profile?.name || userName || 'Học sinh';
  const examHistory = profile?.examHistory || [];

  // Calculate stats
  const totalExams = examHistory.length;
  const avgScore = totalExams > 0
    ? Math.round(examHistory.reduce((sum, e) => sum + e.score, 0) / totalExams * 10)
    : 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Calculate streak (mock data)
  const studyStreak = 12;
  const weeklyGoal = 80;
  const booksCompleted = totalExams > 0 ? Math.min(5, Math.floor(totalExams / 2)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {displayName}.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Sẵn sàng khám phá Văn học thế kỷ 19?
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Cấp độ hiện tại:</span>
            <Badge variant="default" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1">
              HỌC SINH III
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Weekly Goal */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Mục tiêu tuần</span>
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {weeklyGoal}%
            </div>
            <div className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
              <TrendingUp className="w-4 h-4" />
              <span>+15% so với tuần trước</span>
            </div>
            <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${weeklyGoal}%` }}
              />
            </div>
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
            <div className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Kỷ lục cá nhân!</span>
            </div>
          </div>

          {/* Books Completed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Tác phẩm hoàn thành</span>
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl">
                <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {booksCompleted}
            </div>
            <div className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400">
              <span>Tổng số từ: 452k</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tiếp tục học</h2>
              <button
                onClick={onViewAllCourses}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
              >
                Xem tất cả
              </button>
            </div>

            {/* Featured Book Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Book Cover */}
                <div className="flex-shrink-0">
                  <div className="w-36 h-48 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/40 dark:to-primary-800/40 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className="text-6xl relative z-10">{mockBooks[0].cover}</span>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-xs font-medium py-2 text-center">
                      {mockBooks[0].progress}% Đã đọc
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {mockBooks[0].title}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 text-sm">
                        {mockBooks[0].author} • {mockBooks[0].category}
                      </p>
                    </div>
                    <Badge variant="default" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {mockBooks[0].chapter}
                    </Badge>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm italic mb-4 border-l-2 border-primary-300 pl-3">
                    {mockBooks[0].quote}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-primary-600 dark:text-primary-400">Tiến độ</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Trang {mockBooks[0].currentPage} / {mockBooks[0].totalPages}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                        style={{ width: `${mockBooks[0].progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={onStartLearning}
                      leftIcon={<Play className="w-4 h-4" />}
                      className="bg-primary-500 hover:bg-primary-600 text-white"
                    >
                      Tiếp tục đọc
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={onTakeQuiz}
                      leftIcon={<FileText className="w-4 h-4" />}
                    >
                      Làm bài kiểm tra
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Books */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockBooks.slice(1).map((book) => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                >
                  <div className="w-16 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{book.cover}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                      {book.title}
                    </h4>
                    <p className="text-xs text-primary-600 dark:text-primary-400">
                      {book.chapter}
                    </p>
                    <div className="mt-2">
                      {book.progress > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-primary-600 dark:text-primary-400">{book.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa bắt đầu</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reading Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Hoạt động đọc</h3>
                <span className="text-sm text-primary-600 dark:text-primary-400">Tuần này</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day, i) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">{day}</div>
                    <div
                      className={`w-full aspect-square rounded-lg ${
                        i < 5
                          ? 'bg-primary-500'
                          : i === 5
                            ? 'bg-primary-200 dark:bg-primary-800'
                            : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - AI Suggestions */}
          <div className="space-y-6">
            {/* AI Suggestions Card */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Gợi ý từ AI</span>
              </div>

              <p className="text-primary-100 text-sm mb-4">
                Vì em thích Truyện Kiều...
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                <div className="flex gap-3">
                  <div className="w-14 h-20 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Lục Vân Tiên</h4>
                    <p className="text-sm text-primary-100">Nguyễn Đình Chiểu</p>
                    <button className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors">
                      Xem trước
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-primary-100 italic">
                "Khám phá chủ đề tương tự về đạo đức và số phận con người."
              </p>
            </div>

            {/* Daily Concept */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <Badge variant="default" className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs mb-3">
                KHÁI NIỆM HÔM NAY
              </Badge>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Dòng ý thức
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Một phương pháp kể chuyện nhằm miêu tả "vô vàn suy nghĩ và cảm xúc thoáng qua trong tâm trí" của người kể.
              </p>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary-500 rounded-full" />
                <span className="text-slate-500 dark:text-slate-400">Nổi tiếng trong:</span>
                <span className="text-slate-900 dark:text-white font-medium">Ulysses</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">Truy cập nhanh</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 dark:text-white">Ôn tập Flashcard</span>
                    <p className="text-xs text-slate-500">12 thẻ cần ôn</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900 dark:text-white">Thử thách hôm nay</span>
                    <p className="text-xs text-slate-500">Phân tích thơ</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
