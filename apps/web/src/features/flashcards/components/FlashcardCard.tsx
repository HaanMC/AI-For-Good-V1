import React, { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Flashcard } from '../../../types';

interface FlashcardCardProps {
  card: Flashcard;
}

const normalizeFlashcardText = (text?: string) =>
  (text || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .trim();

const FlashcardCard: React.FC<FlashcardCardProps> = ({ card }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  } as const;

  return (
    <div
      className="flashcard-item"
      data-category={card.category}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="relative min-h-[20rem] cursor-pointer perspective-1000">
        <div
          className={`absolute inset-0 transition-all duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden bg-white dark:bg-stone-800 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-700 p-6 flex flex-col justify-between overflow-y-auto"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  {normalizeFlashcardText(card.category)}
                </span>
                {card.difficulty && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      difficultyColors[card.difficulty]
                    }`}
                  >
                    {card.difficulty === 'easy'
                      ? 'Dễ'
                      : card.difficulty === 'medium'
                        ? 'Trung bình'
                        : 'Khó'}
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-stone-800 dark:text-stone-100 leading-relaxed">
                {normalizeFlashcardText(card.front)}
              </p>
            </div>
            <div className="flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Click để xem đáp án
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-accent/10 to-accent/5 dark:from-accent/20 dark:to-accent/10 rounded-2xl shadow-lg border-2 border-accent/50 p-6 flex flex-col justify-between overflow-y-auto"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-accent uppercase tracking-wider">Đáp án</span>
                <CheckCircle2 className="w-5 h-5 text-accent" />
              </div>
              <p className="text-base text-stone-700 dark:text-stone-200 leading-relaxed">
                {normalizeFlashcardText(card.back)}
              </p>
            </div>
            <div className="flex items-center justify-center text-accent text-sm mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Click để quay lại câu hỏi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardCard;
