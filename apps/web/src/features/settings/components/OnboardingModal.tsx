import React, { useState } from 'react';
import { Plus, Save, UserCircle2, X } from 'lucide-react';
import { UserProfile } from '../../../types';
import { GRADE_10_WEAKNESS_OPTIONS } from '../../../shared/knowledge/grade10-literature-knowledge';

interface OnboardingModalProps {
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile;
}

// ĐIỂM YẾU CỦA HỌC SINH - Import từ knowledge file (CHUẨN CHƯƠNG TRÌNH LỚP 10 - 2018)
const WEAKNESS_OPTIONS = GRADE_10_WEAKNESS_OPTIONS;

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onSave, initialProfile }) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [goals, setGoals] = useState(initialProfile?.goals || '');
  const [weaknesses, setWeaknesses] = useState<string[]>(initialProfile?.weaknesses || []);
  const [customWeakness, setCustomWeakness] = useState('');

  const toggleWeakness = (w: string) => {
    if (weaknesses.includes(w)) {
      setWeaknesses(prev => prev.filter(item => item !== w));
    } else {
      setWeaknesses(prev => [...prev, w]);
    }
  };

  const addCustomWeakness = () => {
    const trimmed = customWeakness.trim();
    if (trimmed && !weaknesses.includes(trimmed)) {
      setWeaknesses(prev => [...prev, trimmed]);
      setCustomWeakness('');
    }
  };

  const removeWeakness = (w: string) => {
    setWeaknesses(prev => prev.filter(item => item !== w));
  };

  const handleSave = () => {
    if (!name.trim()) return alert('Vui lòng nhập tên của em!');
    onSave({ name, weaknesses, goals });
  };

  // Get custom weaknesses (ones not in WEAKNESS_OPTIONS)
  const customWeaknesses = weaknesses.filter(w => !WEAKNESS_OPTIONS.includes(w));

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 dark:border-stone-700 max-h-[90vh] flex flex-col">
        <div className="p-6 bg-paper dark:bg-stone-900 border-b border-[#e5e0d8] dark:border-stone-700 flex items-center gap-4 flex-shrink-0">
          <div className="p-3 bg-accent/10 rounded-full text-accent">
            <UserCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-serif text-stone-800 dark:text-stone-100">
              {initialProfile ? 'Cập Nhật Hồ Sơ Học Tập' : 'Thiết Lập Hồ Sơ Cá Nhân'}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
              AI sẽ cá nhân hóa lộ trình dựa trên thông tin này.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full p-3 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 font-medium placeholder-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
              Điểm cần cải thiện <span className="font-normal text-stone-400 lowercase">(Chọn nhiều hoặc tự viết)</span>
            </label>

            {/* Predefined Options */}
            <div className="flex flex-wrap gap-2 mb-3">
              {WEAKNESS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => toggleWeakness(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${weaknesses.includes(opt) ? 'bg-accent text-white border-accent shadow-sm' : 'bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-stone-400'}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Custom Weakness Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={customWeakness}
                onChange={(e) => setCustomWeakness(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomWeakness()}
                placeholder="Hoặc tự viết điểm yếu của em..."
                className="flex-1 p-2.5 text-sm border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-accent/20 outline-none bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 placeholder-stone-400"
              />
              <button
                onClick={addCustomWeakness}
                disabled={!customWeakness.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm
              </button>
            </div>

            {/* Custom Weaknesses Display */}
            {customWeaknesses.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">Điểm yếu tự thêm:</p>
                <div className="flex flex-wrap gap-2">
                  {customWeaknesses.map(w => (
                    <span
                      key={w}
                      className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800 flex items-center gap-2"
                    >
                      {w}
                      <button
                        onClick={() => removeWeakness(w)}
                        className="p-0.5 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Count */}
            {weaknesses.length > 0 && (
              <p className="text-xs text-accent font-medium mt-2">
                Đã chọn {weaknesses.length} điểm yếu
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">Mục tiêu học tập</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="VD: Đạt 8.5 điểm thi cuối kỳ, Thi đỗ chuyên Văn..."
              className="w-full p-3 border border-stone-300 dark:border-stone-600 rounded-xl focus:ring-2 focus:ring-accent/20 outline-none h-24 resize-none bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 font-medium placeholder-stone-400"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-accent text-white py-3.5 rounded-xl font-bold hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {initialProfile ? 'Lưu Thay Đổi' : 'Bắt Đầu Hành Trình'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
