import React, { useState, useCallback } from 'react';
import { UserCircle2, Save, Plus, X, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { Modal, Input, Textarea, Button, Badge } from '../ui';
import { GRADE_10_WEAKNESS_OPTIONS } from '../../../grade10-literature-knowledge';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSave: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
  isEditing?: boolean;
}

interface FormErrors {
  name?: string;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProfile,
  isEditing = false
}) => {
  const [name, setName] = useState(initialProfile?.name || '');
  const [goals, setGoals] = useState(initialProfile?.goals || '');
  const [weaknesses, setWeaknesses] = useState<string[]>(initialProfile?.weaknesses || []);
  const [customWeakness, setCustomWeakness] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  // Xử lý đóng modal với confirm nếu cần
  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  // Clear error khi user bắt đầu nhập
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  }, [errors.name]);

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
    // Validate
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Bạn chưa nhập họ và tên';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors và save
    setErrors({});
    onSave({
      ...initialProfile,
      name: name.trim(),
      weaknesses,
      goals: goals.trim()
    } as UserProfile);
  };

  // Get custom weaknesses (ones not in predefined list)
  const customWeaknesses = weaknesses.filter(w => !GRADE_10_WEAKNESS_OPTIONS.includes(w));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Cập Nhật Hồ Sơ Học Tập' : 'Thiết Lập Hồ Sơ Cá Nhân'}
      description="AI sẽ cá nhân hóa lộ trình dựa trên thông tin này."
      size="lg"
      headerIcon={<UserCircle2 className="w-6 h-6" />}
      showCloseButton={true}
      closeOnOverlayClick={true}
      closeOnEscape={true}
    >
      <div className="space-y-5">
        {/* Name Input */}
        <div>
          <Input
            label="Họ và tên"
            value={name}
            onChange={handleNameChange}
            placeholder="VD: Nguyễn Văn A"
            error={errors.name}
            required
            aria-required="true"
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <div className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{errors.name}</span>
            </div>
          )}
        </div>

        {/* Weaknesses Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
            Điểm cần cải thiện
            <span className="font-normal text-stone-400 lowercase ml-1">
              (Chọn nhiều hoặc tự viết)
            </span>
          </label>

          {/* Predefined Options */}
          <div className="flex flex-wrap gap-2 mb-3">
            {GRADE_10_WEAKNESS_OPTIONS.map(opt => (
              <button
                key={opt}
                onClick={() => toggleWeakness(opt)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all border
                  ${weaknesses.includes(opt)
                    ? 'bg-accent text-white border-accent shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-600 hover:border-stone-400'
                  }
                `}
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
              className="
                flex-1 px-3 py-2.5 text-sm
                border border-stone-300 dark:border-stone-600 rounded-xl
                focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none
                bg-white dark:bg-stone-700
                text-stone-800 dark:text-stone-100
                placeholder-stone-400
              "
            />
            <Button
              onClick={addCustomWeakness}
              disabled={!customWeakness.trim()}
              variant="success"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Thêm
            </Button>
          </div>

          {/* Custom Weaknesses Display */}
          {customWeaknesses.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium">
                Điểm yếu tự thêm:
              </p>
              <div className="flex flex-wrap gap-2">
                {customWeaknesses.map(w => (
                  <Badge
                    key={w}
                    variant="info"
                    removable
                    onRemove={() => removeWeakness(w)}
                  >
                    {w}
                  </Badge>
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

        {/* Goals Input */}
        <Textarea
          label="Mục tiêu học tập"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="VD: Đạt 8.5 điểm thi cuối kỳ, Thi đỗ chuyên Văn..."
          textareaSize="sm"
        />

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSave}
            fullWidth
            size="lg"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isEditing ? 'Lưu Thay Đổi' : 'Bắt Đầu Hành Trình'}
          </Button>

          {/* Nút "Để sau" cho người dùng mới */}
          {!isEditing && onClose && (
            <Button
              onClick={handleClose}
              fullWidth
              size="lg"
              variant="ghost"
            >
              Để sau
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
