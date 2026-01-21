import React from 'react';
import {
  BookOpen,
  Sparkles,
  GraduationCap,
  PenTool,
  BookA,
  Users,
  Brain,
  ArrowRight
} from 'lucide-react';

interface WelcomeScreenProps {
  onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-stone-50 via-accent/5 to-stone-100 dark:from-stone-950 dark:via-accent/10 dark:to-stone-900 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="max-w-4xl w-full my-8">
        {/* Main Card */}
        <div className="bg-white/80 dark:bg-stone-800/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-700">
          {/* Header Section with Gradient */}
          <div className="relative p-8 md:p-12 bg-gradient-to-r from-accent/90 to-accent text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTIwIDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDIwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <BookOpen className="w-12 h-12 md:w-16 md:h-16" />
                </div>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-serif mb-4">
                Chào mừng đến với<br className="md:hidden" /> AI Văn Học
              </h1>
              <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Trợ lý học tập thông minh giúp em chinh phục môn Ngữ Văn lớp 10
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="p-6 md:p-10 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Feature 1 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Học Cá Nhân Hóa</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">AI phân tích điểm mạnh, yếu để tạo lộ trình riêng cho em</p>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Luyện Thi Thông Minh</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Tạo đề thi chuẩn, chấm tự động và phản hồi chi tiết</p>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <PenTool className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Phát Triển Kỹ Năng Viết</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Hướng dẫn viết văn, phân tích và cải thiện bài luận</p>
                  </div>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <BookA className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Từ Điển Văn Học</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Tra cứu thuật ngữ, biện pháp tu từ nhanh chóng</p>
                  </div>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Đóng Vai Nhân Vật</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Trò chuyện với nhân vật văn học để hiểu sâu tác phẩm</p>
                  </div>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group p-5 md:p-6 bg-stone-50 dark:bg-stone-700/50 rounded-2xl border border-stone-200 dark:border-stone-600 hover:border-accent/50 dark:hover:border-accent/50 transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl group-hover:scale-110 transition-transform">
                    <Brain className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2 text-sm md:text-base">Flashcard & Mindmap</h3>
                    <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">Ghi nhớ kiến thức hiệu quả với công cụ trực quan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center space-y-6">
              <button
                onClick={onContinue}
                className="group inline-flex items-center gap-3 bg-accent text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg hover:bg-accent/90 transition-all shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/40 hover:-translate-y-1"
              >
                Bắt Đầu Ngay
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Footer Note */}
              <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
                <p className="text-xs md:text-sm text-stone-400 dark:text-stone-500 italic flex items-center justify-center gap-2 flex-wrap">
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span>made by An with love</span>
                  <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
