import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Bot,
  Sliders,
  Bell,
  Shield,
  Sparkles,
  Search,
  ChevronRight,
  Camera,
  X,
  Check,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Button, Badge, Avatar, Input, Toggle } from '../ui';
import { UserProfile } from '../../types';

interface SettingsPageProps {
  profile: UserProfile | null;
  onSaveProfile: (profile: Partial<UserProfile>) => void;
  onDeleteAccount?: () => void;
  userName?: string;
}

type SettingsTab = 'profile' | 'subscription' | 'ai-config' | 'preferences' | 'notifications' | 'privacy';

const SettingsPage: React.FC<SettingsPageProps> = ({
  profile,
  onSaveProfile,
  onDeleteAccount,
  userName
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: 'hocsinh@truonghoc.edu.vn',
    bio: profile?.goals || '',
    readingLevel: 'university',
    analysisDepth: 'deep',
    favoriteGenres: ['Sci-Fi', 'Victorian'] as string[],
    dailyReminders: true,
    bookRecommendations: false
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Hồ sơ chung', icon: User, section: 'TÀI KHOẢN' },
    { id: 'subscription' as SettingsTab, label: 'Gói đăng ký', icon: CreditCard, section: 'TÀI KHOẢN' },
    { id: 'ai-config' as SettingsTab, label: 'Cấu hình AI', icon: Bot, section: 'HỌC TẬP' },
    { id: 'preferences' as SettingsTab, label: 'Tùy chọn', icon: Sliders, section: 'HỌC TẬP' },
    { id: 'notifications' as SettingsTab, label: 'Thông báo', icon: Bell, section: 'HỆ THỐNG' },
    { id: 'privacy' as SettingsTab, label: 'Quyền riêng tư', icon: Shield, section: 'HỆ THỐNG' },
  ];

  const genres = ['Sci-Fi', 'Victorian', 'Poetry', 'Modernist', 'Romantic', 'Realist'];

  const handleToggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleSave = () => {
    onSaveProfile({
      name: formData.name,
      goals: formData.bio
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar name={formData.name || userName} size="xl" />
                  <button className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {formData.name || 'Học sinh'}
                  </h2>
                  <p className="text-primary-600 dark:text-primary-400 font-medium">
                    Thành viên Premium
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Thành viên từ tháng 9, 2023
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default" className="bg-slate-100 dark:bg-slate-700">Học sinh</Badge>
                    <Badge variant="default" className="bg-slate-100 dark:bg-slate-700">Chuyên Văn</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin cá nhân</h3>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Họ và tên
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Địa chỉ email
                  </label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Giới thiệu bản thân
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Đam mê văn học Victoria và phân tích thơ ca hiện đại."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
                <p className="text-xs text-slate-400 text-right mt-1">0/150 ký tự</p>
              </div>
            </div>

            {/* AI Learning Preferences */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tùy chọn học AI</h3>
                </div>
                <Badge variant="primary" className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400">
                  BETA
                </Badge>
              </div>

              {/* Reading Level Slider */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Mức độ đọc
                  </label>
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Đại học / Học thuật
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  defaultValue="3"
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Cơ bản</span>
                  <span>Trung cấp</span>
                  <span>Nâng cao</span>
                  <span>Học thuật</span>
                </div>
              </div>

              {/* Analysis Depth */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Độ sâu phân tích
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setFormData({ ...formData, analysisDepth: 'surface' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.analysisDepth === 'surface'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <h4 className="font-medium text-slate-900 dark:text-white">Tóm tắt nhanh</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Tổng quan ngắn gọn về cốt truyện và nhân vật.
                    </p>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, analysisDepth: 'deep' })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.analysisDepth === 'deep'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary-500 rounded-full" />
                      <h4 className="font-medium text-slate-900 dark:text-white">Phân tích sâu</h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Khám phá chủ đề, biểu tượng và bối cảnh.
                    </p>
                  </button>
                </div>
              </div>

              {/* Favorite Genres */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Thể loại yêu thích
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleToggleGenre(genre)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                        formData.favoriteGenres.includes(genre)
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border-2 border-primary-500'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-2 border-transparent hover:border-slate-300'
                      }`}
                    >
                      {genre}
                      {formData.favoriteGenres.includes(genre) && <X className="w-4 h-4" />}
                    </button>
                  ))}
                  <button className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-500 transition-colors">
                    + Thêm thể loại
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thông báo</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Nhắc nhở học tập hàng ngày</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nhận thông báo lúc 8:00 sáng mỗi ngày.</p>
                  </div>
                  <Toggle
                    checked={formData.dailyReminders}
                    onChange={(checked) => setFormData({ ...formData, dailyReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Gợi ý sách mới</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tổng hợp hàng tuần dựa trên lịch sử đọc.</p>
                  </div>
                  <Toggle
                    checked={formData.bookRecommendations}
                    onChange={(checked) => setFormData({ ...formData, bookRecommendations: checked })}
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/50">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Vùng nguy hiểm</h3>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-200 dark:border-rose-800">
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">Xóa tài khoản</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sau khi xóa tài khoản, không thể khôi phục. Hãy cân nhắc kỹ.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Xóa tài khoản
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 dark:text-slate-400">Tính năng đang được phát triển...</p>
          </div>
        );
    }
  };

  // Group tabs by section
  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.section]) {
      acc[tab.section] = [];
    }
    acc[tab.section].push(tab);
    return acc;
  }, {} as Record<string, typeof tabs>);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white">LitAssistant</span>
            </div>

            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm tác giả, sách..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Bảng điều khiển
              </button>
              <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Thư viện
              </button>
              <button className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Phân tích
              </button>
              <Avatar name={formData.name || userName} size="sm" />
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-6">
              {Object.entries(groupedTabs).map(([section, sectionTabs]) => (
                <div key={section}>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-3">
                    {section}
                  </p>
                  <div className="space-y-1">
                    {sectionTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            isActive
                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            {/* AI Suggestion */}
            <div className="mt-8 p-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Gợi ý từ AI</span>
              </div>
              <p className="text-sm text-primary-100 mb-3">
                Em đang đọc nhiều Shakespeare. Bạn muốn bật hỗ trợ "Tiếng Anh cổ điển" không?
              </p>
              <button className="text-sm text-white font-medium hover:underline">
                Bật ngay
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cài đặt hồ sơ</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Quản lý thông tin cá nhân và tùy chọn học AI của bạn
              </p>
            </div>

            {renderContent()}

            {/* Save Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button variant="secondary">
                Hủy bỏ
              </Button>
              <Button
                onClick={handleSave}
                leftIcon={<Check className="w-4 h-4" />}
                className="bg-primary-500 hover:bg-primary-600"
              >
                Lưu thay đổi
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Xác nhận xóa</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Bạn có chắc muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Hủy bỏ
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onDeleteAccount?.();
                  setShowDeleteConfirm(false);
                }}
              >
                Xóa vĩnh viễn
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
