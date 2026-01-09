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
  Zap,
  Send
} from 'lucide-react';
import { AppMode } from '../../types';

interface WelcomeScreenProps {
  onContinue: () => void;
  onModeChange?: (mode: AppMode) => void;
  isFastMode?: boolean;
  onToggleFastMode?: () => void;
}

const features = [
  {
    icon: Sparkles,
    title: 'Học Cá Nhân Hóa',
    description: 'AI phân tích điểm mạnh, yếu để tạo lộ trình riêng cho em.',
    color: 'bg-primary-500'
  },
  {
    icon: GraduationCap,
    title: 'Luyện Thi Thông Minh',
    description: 'Tạo đề thi chuẩn, chấm tự động và phản hồi chi tiết.',
    color: 'bg-primary-500'
  },
  {
    icon: PenTool,
    title: 'Phát Triển Kỹ Năng Viết',
    description: 'Hướng dẫn viết văn, phân tích và cải thiện bài luận.',
    color: 'bg-primary-500'
  },
  {
    icon: BookA,
    title: 'Từ Điển Văn Học',
    description: 'Tra cứu thuật ngữ, biện pháp tu từ nhanh chóng.',
    color: 'bg-primary-500'
  },
  {
    icon: Users,
    title: 'Đóng Vai Nhân Vật',
    description: 'Trò chuyện với nhân vật văn học để hiểu sâu tác phẩm.',
    color: 'bg-primary-500'
  },
  {
    icon: Brain,
    title: 'Flashcard & Mindmap',
    description: 'Ghi nhớ kiến thức hiệu quả với công cụ trực quan.',
    color: 'bg-primary-500'
  }
];

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onContinue,
  isFastMode = true,
  onToggleFastMode
}) => {
  return (
    <div className="min-h-full bg-surface-main dark:bg-slate-950">
      {/* Header with Mode Toggle */}
      <div className="sticky top-0 z-10 flex justify-end p-4 bg-surface-main/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => !isFastMode && onToggleFastMode?.()}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${isFastMode
                ? 'bg-primary-500 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }
            `}
          >
            <Zap className="w-4 h-4" />
            <span>Tốc độ nhanh</span>
          </button>
          <button
            onClick={() => isFastMode && onToggleFastMode?.()}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${!isFastMode
                ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
              }
            `}
          >
            <Brain className="w-4 h-4" />
            <span>Suy nghĩ sâu</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative mx-4 lg:mx-8 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600">
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
            Trợ lý học tập thông minh giúp em chinh phục môn Ngữ Văn lớp 10
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
      </div>

      {/* Floating Send Button */}
      <button
        onClick={onContinue}
        className="fixed bottom-6 right-6 w-14 h-14 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-primary-500 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center border border-slate-200 dark:border-slate-700"
      >
        <Send className="w-6 h-6" />
      </button>
    </div>
  );
};

export default WelcomeScreen;
