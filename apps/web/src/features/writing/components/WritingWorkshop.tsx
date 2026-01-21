import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  Link2,
  Image,
  Undo,
  Redo,
  ChevronDown,
  Sparkles,
  Check,
  AlertCircle,
  ChevronRight,
  Type,
  LayoutGrid,
  Palette,
  Quote,
  Download,
  Save,
  Scan,
  Zap
} from 'lucide-react';
import { Button, Badge, Avatar } from '../../../components/ui';
import { WritingFeedback, WritingRubric } from '../../../types';

interface WritingWorkshopProps {
  onAnalyze: (text: string) => void;
  feedback: WritingFeedback | null;
  isLoading: boolean;
  userName?: string;
}

interface AIIssue {
  type: 'warning' | 'info' | 'success';
  label: string;
  message: string;
}

const WritingWorkshop: React.FC<WritingWorkshopProps> = ({
  onAnalyze,
  feedback,
  isLoading,
  userName
}) => {
  const [content, setContent] = useState(`Phê Bình Truyện Kiều

Truyện Kiều, tác phẩm bất hủ của Nguyễn Du, được coi như một bản cáo trạng gay gắt về xã hội phong kiến Việt Nam thế kỷ XVIII-XIX. Qua bi kịch của nàng Kiều, Nguyễn Du đã phơi bày những mâu thuẫn sâu sắc của thời đại.

Một trong những biểu tượng ấn tượng nhất trong tác phẩm là ánh trăng cuối bến Tiền Đường. Với Thúy Kiều, ánh trăng ấy đại diện cho niềm hy vọng bất diệt và ước mơ về một tương lai tốt đẹp hơn với Kim Trọng. Tuy nhiên, khi câu chuyện tiến triển, ánh trăng từ biểu tượng của hy vọng dần trở thành hiện thân của sự bất khả trong việc níu giữ quá khứ.

Nguyễn Du sử dụng nhân vật Từ Hải để đại diện cho "tiền bạc cũ" - kiêu ngạo, quyền lực và cuối cùng là hủy diệt. Ngược lại, "tiền bạc mới" của Thúy Kiều lại hào nhoáng và tuyệt vọng, phơi bày những cấu trúc giai cấp cứng nhắc mà ngay cả sự giàu có cũng không thể phá vỡ.

Thung lũng tro tàn, một vùng đất công nghiệp hoang tàn, tương phản rõ rệt với vẻ lộng lẫy của chốn lầu xanh, đóng vai trò như lời nhắc nhở về sự mục ruỗng đạo đức đang âm ỉ bên dưới bề mặt hào nhoáng của thời đại.`);

  const [aiAssistEnabled, setAiAssistEnabled] = useState(true);

  // Mock AI analysis data
  const mockScore = 87;
  const mockGradeLevel = 11;

  const grammarIssues: AIIssue[] = [
    {
      type: 'warning',
      label: 'BỊ ĐỘNG',
      message: '"Thung lũng tro tàn... được Nick Carraway ghé thăm." Cân nhắc viết lại ở thể chủ động...'
    },
    {
      type: 'info',
      label: 'RÕ RÀNG',
      message: 'Câu này hơi dài. Cân nhắc tách thành hai câu.'
    }
  ];

  const sections = [
    { name: 'Ngữ pháp & Văn phong', issues: 2, expanded: true },
    { name: 'Cấu trúc', status: 'Mạch đoạn tốt', expanded: false },
    { name: 'Chiều sâu chủ đề', status: 'Đang phân tích "Giấc mơ Việt Nam"', expanded: false },
    { name: 'Trích dẫn', status: 'Chưa phát hiện trích dẫn', expanded: false }
  ];

  const handleAnalyze = () => {
    onAnalyze(content);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Type className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">LitAssistant</span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Bảng điều khiển
            </button>
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Thư viện
            </button>
            <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              Cài đặt
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Xuất file
          </Button>
          <Button
            size="sm"
            leftIcon={<Save className="w-4 h-4" />}
            className="bg-primary-500 hover:bg-primary-600"
          >
            Lưu bản nháp
          </Button>
          <Avatar name={userName} size="sm" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
          {/* Toolbar */}
          <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Undo className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Redo className="w-4 h-4 text-slate-500" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

            <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300">
              Văn bản thường
              <ChevronDown className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Bold className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Italic className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Underline className="w-4 h-4 text-slate-500" />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <AlignLeft className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Link2 className="w-4 h-4 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Image className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex-1" />

            <button
              onClick={() => setAiAssistEnabled(!aiAssistEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                aiAssistEnabled
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assist {aiAssistEnabled ? 'Bật' : 'Tắt'}
            </button>
          </div>

          {/* Editor Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-3xl mx-auto">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[600px] bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-serif"
                placeholder="Bắt đầu viết bài văn của bạn..."
              />
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="w-80 lg:w-96 flex flex-col bg-white dark:bg-slate-800 overflow-hidden">
          {/* AI Panel Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white">Phân Tích AI</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">Trực tiếp</span>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">ĐIỂM SỐ</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{mockScore}</span>
                  <span className="text-sm text-slate-500">/100</span>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">CẤP ĐỘ</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{mockGradeLevel}</span>
                  <span className="text-sm text-slate-500">th</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Sections */}
          <div className="flex-1 overflow-y-auto">
            {/* Grammar & Style Section */}
            <div className="border-b border-slate-200 dark:border-slate-700">
              <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Type className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-900 dark:text-white">Ngữ pháp & Văn phong</p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Tìm thấy 2 vấn đề</p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400" />
              </button>

              {/* Issues List */}
              <div className="px-4 pb-4 space-y-3">
                {grammarIssues.map((issue, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={issue.type === 'warning' ? 'warning' : 'primary'}
                        size="sm"
                        className="uppercase text-xs"
                      >
                        {issue.label}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {issue.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Other Sections */}
            {sections.slice(1).map((section, index) => (
              <button
                key={index}
                className="w-full flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                  {index === 0 && <LayoutGrid className="w-5 h-5 text-slate-500" />}
                  {index === 1 && <Palette className="w-5 h-5 text-slate-500" />}
                  {index === 2 && <Quote className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-900 dark:text-white">{section.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{section.status}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Deep Scan Button */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full bg-primary-500 hover:bg-primary-600"
              leftIcon={isLoading ? <Zap className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
            >
              {isLoading ? 'Đang phân tích...' : 'Phân tích sâu'}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">
              Gợi ý của AI có thể chưa chính xác. Vui lòng kiểm tra lại.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritingWorkshop;
