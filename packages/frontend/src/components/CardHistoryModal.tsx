import React, { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

interface CardHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  flashcardId: string;
  cardIndex: number;
  question: string;
}

interface ReviewHistory {
  reviewedAt: string;
  difficulty: 'EASY' | 'NORMAL' | 'HARD';
  intervalBefore: number;
  intervalAfter: number;
  easeFactor: number;
}

interface CardHistoryData {
  cardIndex: number;
  history: ReviewHistory[];
  currentStats: {
    timesStudied: number;
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReviewAt?: string;
  };
}

const CardHistoryModal: React.FC<CardHistoryModalProps> = ({
  isOpen,
  onClose,
  flashcardId,
  cardIndex,
  question
}) => {
  const { showToast } = useToast();
  const { t } = useTranslation('flashcard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CardHistoryData | null>(null);

  useEffect(() => {
    if (isOpen && flashcardId && cardIndex >= 0) {
      loadHistory();
    }
  }, [isOpen, flashcardId, cardIndex]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCardHistory(flashcardId, cardIndex);
      setData(response);
    } catch (error: any) {
      console.error('Error loading card history:', error);
      showToast(t('cardHistory.errorLoading'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'NORMAL':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'HARD':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'text-slate-600 bg-slate-100 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const formatDifficulty = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return t('study.easy');
      case 'NORMAL':
        return t('study.normal');
      case 'HARD':
        return t('study.hard');
      default:
        return difficulty;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatInterval = (days: number) => {
    if (days === 1) return t('intervals.day');
    if (days < 7) return t('intervals.days', { count: days });
    const weeks = Math.round(days / 7);
    if (days < 30) return t(weeks === 1 ? 'intervals.week' : 'intervals.weeks', { count: weeks });
    const months = Math.round(days / 30);
    if (days < 365) return t(months === 1 ? 'intervals.month' : 'intervals.months', { count: months });
    const years = Math.round(days / 365);
    return t(years === 1 ? 'intervals.year' : 'intervals.years', { count: years });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('cardHistory.title')}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Card {cardIndex + 1}: {question.substring(0, 50)}...
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Current Stats */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  {t('cardHistory.currentStats')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{data.currentStats.timesStudied}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('cardHistory.timesStudied')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{data.currentStats.repetitions}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('cardHistory.repetitions')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{data.currentStats.easeFactor.toFixed(1)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('cardHistory.easeFactor')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{formatInterval(data.currentStats.interval)}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{t('cardHistory.nextInterval')}</div>
                  </div>
                </div>
                {data.currentStats.nextReviewAt && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <CalendarIcon className="w-4 h-4" />
                      {t('cardHistory.nextReview')} {formatDate(data.currentStats.nextReviewAt)}
                    </div>
                  </div>
                )}
              </div>

              {/* History */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <ClockIcon className="w-5 h-5" />
                  {t('cardHistory.reviewHistory')} ({data.history.length})
                </h3>

                {data.history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    {t('cardHistory.noReviews')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.history.map((review, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatDate(review.reviewedAt)}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(review.difficulty)}`}>
                            {formatDifficulty(review.difficulty)}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">{t('cardHistory.intervalBefore')}</div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {formatInterval(review.intervalBefore)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">{t('cardHistory.intervalAfter')}</div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {formatInterval(review.intervalAfter)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">{t('cardHistory.easeFactor')}</div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {review.easeFactor.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              {t('cardHistory.errorLoadingData')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardHistoryModal;