import React from 'react';
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  PenTool,
  BookA,
  Users,
  Brain,
  ArrowRight,
  MessageSquare,
  Layers
} from 'lucide-react';
import { Button } from '../ui';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'Học Cá Nhân Hóa',
    description: 'AI phân tích điểm mạnh, yếu để tạo lộ trình riêng cho em. Học tập hiệu quả hơn mỗi ngày.',
    color: 'bg-primary-500'
  },
  {
    icon: GraduationCap,
    title: 'Luyện Thi Thông Minh',
    description: 'Tạo đề thi chuẩn, chấm tự động và phản hồi chi tiết giúp em hiểu sâu vấn đề.',
    color: 'bg-accent-500'
  },
  {
    icon: PenTool,
    title: 'Phát Triển Kỹ Năng Viết',
    description: 'Hướng dẫn viết văn, phân tích và cải thiện bài luận với gợi ý thời gian thực.',
    color: 'bg-amber-500'
  },
  {
    icon: BookA,
    title: 'Từ Điển Văn Học',
    description: 'Tra cứu thuật ngữ, biện pháp tu từ nhanh chóng và chính xác.',
    color: 'bg-rose-500'
  },
  {
    icon: Users,
    title: 'Đóng Vai Nhân Vật',
    description: 'Trò chuyện với nhân vật văn học để hiểu sâu tác phẩm qua góc nhìn người trong cuộc.',
    color: 'bg-purple-500'
  },
  {
    icon: Brain,
    title: 'Flashcard & Mindmap',
    description: 'Ghi nhớ kiến thức hiệu quả với công cụ trực quan, sinh động.',
    color: 'bg-cyan-500'
  }
];

const sideNavItems = [
  { icon: MessageSquare, label: 'Trợ Lý Học Tập', desc: 'Hỏi đáp, giải thích bài học, phân tích văn bản' },
  { icon: Users, label: 'Hóa Thân Nhân Vật', desc: 'Trò chuyện với nhân vật trong tác phẩm' },
  { icon: GraduationCap, label: 'Luyện Thi Giả Lập', desc: 'Tạo đề thi, đếm giờ, AI chấm điểm chi tiết' },
  { icon: PenTool, label: 'Phòng Luyện Viết', desc: 'Phân tích, chấm rubric, cải thiện bài văn' },
  { icon: BookA, label: 'Từ Điển Văn Học', desc: 'Tra cứu thuật ngữ, biện pháp tu từ' },
  { icon: Layers, label: 'Flashcards', desc: 'Thẻ ghi nhớ theo chủ đề (AI tạo)' },
  { icon: Brain, label: 'Mindmap', desc: 'Sơ đồ tư duy tác phẩm, tác giả' },
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 flex bg-white dark:bg-slate-900 animate-fade-in">
      {/* Left Sidebar Navigation */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Logo */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-accent-500 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white">
                AI Hỗ Trợ Học Tập
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Môn Ngữ Văn
              </p>
              <p className="text-xs text-accent-500 font-medium">
                Dự Án AI For Good
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sideNavItems.map((item, index) => {
            const Icon = item.icon;
            const isFirst = index === 0;
            return (
              <div
                key={index}
                className={`
                  flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer
                  ${isFirst
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${isFirst ? 'text-primary-600' : 'text-slate-400'}`} />
                <div>
                  <p className={`font-medium text-sm ${isFirst ? 'text-primary-700 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Giao diện</p>
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white dark:bg-transparent shadow-sm dark:shadow-none text-sm font-medium text-slate-700 dark:text-slate-400">
              <span className="w-4 h-4">☀️</span>
              <span>Tối</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-300">
              <span className="w-4 h-4">🌙</span>
              <span>Tương phản</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Header with Mode Toggle */}
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button className="px-4 py-2 rounded-full bg-accent-500 text-white text-sm font-medium shadow-sm">
              Suy nghĩ nhanh
            </button>
            <button className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-300 text-sm font-medium flex items-center gap-1.5">
              <span>💎</span>
              <span>Suy nghĩ sâu</span>
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative mx-4 lg:mx-8 rounded-3xl overflow-hidden bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#dots)" />
            </svg>
          </div>

          <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <BookOpen className="w-10 h-10 md:w-12 md:h-12" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif mb-4 leading-tight">
              Chào mừng đến với
              <br />
              <span className="italic">AI Văn Học</span>
            </h1>
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Trợ lý học tập thông minh giúp em chinh phục môn Ngữ Văn lớp 10.
              <br className="hidden md:block" />
              Khám phá văn học theo cách hoàn toàn mới.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="
                    group p-6 bg-white dark:bg-slate-800 rounded-2xl
                    border border-slate-200 dark:border-slate-700
                    hover:border-primary-300 dark:hover:border-primary-600
                    hover:shadow-lg hover:-translate-y-1
                    transition-all duration-300
                  "
                >
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-4
                    ${feature.color} text-white
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mt-12">
            <button
              onClick={onContinue}
              className="
                group flex items-center gap-3 px-8 py-4
                bg-primary-500 hover:bg-primary-600
                text-white font-semibold text-lg rounded-xl
                shadow-primary hover:shadow-primary-lg
                transition-all duration-300
              "
            >
              Bắt Đầu Ngay
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-400 dark:text-slate-500 italic flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>made by An with love</span>
              <Sparkles className="w-4 h-4" />
            </p>
          </div>
        </div>
      </main>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 hover:bg-primary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center">
        <ArrowRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default WelcomeScreen;
