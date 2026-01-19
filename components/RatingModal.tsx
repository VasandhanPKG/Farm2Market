
import React, { useState } from 'react';
import { Language, translations } from '../translations';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment: string) => void;
  targetName: string;
  language: Language;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, onSubmit, targetName, language }) => {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h3 className="text-xl font-bold">{t.ratingTitle}</h3>
          <p className="text-emerald-100 text-sm mt-1">{targetName}</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-4xl transition-all ${
                  star <= (hover || score) ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-slate-300'
                }`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setScore(star)}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all mb-6"
            rows={3}
            placeholder={t.commentPlaceholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              disabled={score === 0}
              onClick={() => {
                onSubmit(score, comment);
                onClose();
              }}
              className="flex-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              {t.submitRating}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
