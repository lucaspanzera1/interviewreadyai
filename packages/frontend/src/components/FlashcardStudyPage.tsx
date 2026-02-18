import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import CardHistoryModal from './CardHistoryModal';
import {
    ArrowLeftIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    InformationCircleIcon,
    LightBulbIcon,
    HandThumbUpIcon,
    HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { useTranslation } from 'react-i18next';

interface FlashcardItem {
    question: string;
    answer: string;
    explanation?: string;
    tags?: string[];
}

interface Flashcard {
    _id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    nivel: string;
    quantidade_cards: number;
    cards: FlashcardItem[];
    vaga_titulo?: string;
    vaga_empresa?: string;
    vaga_localizacao?: string;
}

const FlashcardStudyPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { t } = useTranslation('flashcard');

    // State
    const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [studySession, setStudySession] = useState<Array<{
        cardIndex: number;
        difficulty: 'EASY' | 'NORMAL' | 'HARD';
        studyTime?: number;
    }>>([]);

    // Timers
    const [sessionStartTime] = useState<number>(Date.now());
    const [cardStartTime, setCardStartTime] = useState<number>(Date.now());

    // Modals
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Refs for focus management
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (id) {
            loadFlashcard();
        }
    }, [id]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input (though none here usually) or if modals are open
            if (showHistoryModal || showInfoModal || loading || !flashcard) return;

            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault(); // Prevent scrolling
                if (!showAnswer) {
                    handleFlipCard();
                }
            } else if (showAnswer) {
                switch (e.key) {
                    case '1':
                        handleDifficultyChoice('HARD');
                        break;
                    case '2':
                        handleDifficultyChoice('NORMAL');
                        break;
                    case '3':
                        handleDifficultyChoice('EASY');
                        break;
                    default:
                        break;
                }
            } else {
                // Optional: Arrow keys for navigation if desired (not typical for rigorous SRS but useful for browsing)
                if (e.key === 'ArrowRight') handleNextCard();
                if (e.key === 'ArrowLeft') handlePreviousCard();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAnswer, loading, flashcard, showHistoryModal, showInfoModal, currentCardIndex, studySession]); // Dependencies for closure variables

    const loadFlashcard = async () => {
        if (!id) return;

        try {
            setLoading(true);
            const [flashcardResponse] = await Promise.all([
                apiClient.getFlashcardForStudy(id)
            ]);
            setFlashcard(flashcardResponse.flashcard);
        } catch (error: any) {
            console.error('Error loading flashcard:', error);
            const message = error.response?.data?.message || t('study.errorLoading');
            showToast(message, 'error');
            navigate('/my-flashcards');
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyChoice = async (difficulty: 'EASY' | 'NORMAL' | 'HARD') => {
        if (!flashcard) return;

        const cardStudyTime = Math.floor((Date.now() - cardStartTime) / 1000);

        // Add to session
        const newStudySession = [...studySession, {
            cardIndex: currentCardIndex,
            difficulty,
            studyTime: cardStudyTime
        }];
        setStudySession(newStudySession);

        // Move to next or finish
        if (currentCardIndex < flashcard.cards.length - 1) {
            // Small delay for animation feel if desired, but instant is clearer for power users
            setCurrentCardIndex(currentCardIndex + 1);
            setShowAnswer(false);
            setCardStartTime(Date.now());
        } else {
            await finishStudySession(newStudySession);
        }
    };

    const finishStudySession = async (session: Array<{
        cardIndex: number;
        difficulty: 'EASY' | 'NORMAL' | 'HARD';
        studyTime?: number;
    }>) => {
        if (!id) return;

        try {
            const totalSessionTime = Math.floor((Date.now() - sessionStartTime) / 1000);

            await apiClient.recordStudySession(id, {
                cards: session,
                totalSessionTime
            });

            showToast(
                t('study.sessionComplete', { cards: session.length, time: Math.floor(totalSessionTime / 60) }),
                'success'
            );

            navigate('/my-flashcards');
        } catch (error: any) {
            console.error('Error recording study session:', error);
            showToast(t('study.errorSavingProgress'), 'error');
        }
    };

    const handleFlipCard = () => {
        setShowAnswer(!showAnswer);
    };

    const handlePreviousCard = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
            setShowAnswer(false);
            setCardStartTime(Date.now());
        }
    };

    const handleNextCard = () => {
        if (flashcard && currentCardIndex < flashcard.cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setShowAnswer(false);
            setCardStartTime(Date.now());
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[100dvh] bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!flashcard) {
        return (
            <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-50 dark:bg-slate-900 p-4">
                <ExclamationTriangleIcon className="w-24 h-24 text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {t('study.notFound')}
                </h2>
                <button
                    onClick={() => navigate('/my-flashcards')}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    {t('study.backToMyFlashcards')}
                </button>
            </div>
        );
    }

    const currentCard = flashcard.cards[currentCardIndex];
    const progress = Math.round(((currentCardIndex) / flashcard.cards.length) * 100);

    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative">
            <style>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                .backface-hidden {
                    backface-visibility: hidden;
                }
                .rotate-y-180 {
                    transform: rotateY(180deg);
                }
                .rotate-y-0 {
                    transform: rotateY(0deg);
                }
                /* Custom Scrollbar for Card Content */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 20px;
                }
            `}</style>

            <PageTitle title={t('study.pageTitle', { title: flashcard.titulo })} />

            {/* Header Compacto */}
            <header className="shrink-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 safe-top">
                <div className="max-w-3xl mx-auto w-full flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/my-flashcards')}
                        className="p-2 -ml-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label={t('study.back')}
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>

                    <div className="flex-1 max-w-xs mx-auto">
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 px-1">
                            <span>{t('study.progress')}</span>
                            <span>{currentCardIndex + 1} / {flashcard.cards.length}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-600 transition-all duration-300 ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-1 -mr-2">
                        <button
                            onClick={() => setShowHistoryModal(true)}
                            className="p-2 rounded-full text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ClockIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setShowInfoModal(true)}
                            className="p-2 rounded-full text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <InformationCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Area - Card */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto relative overflow-hidden" ref={containerRef}>
                <div className="w-full h-full flex flex-col justify-center perspective-1000 max-h-[75vh]">
                    <div
                        className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${showAnswer ? 'rotate-y-180' : 'rotate-y-0'}`}
                        onClick={handleFlipCard}
                    >
                        {/* FRONT FACE (Question) */}
                        <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                            <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center overflow-y-auto custom-scrollbar">
                                <span className="inline-block px-3 py-1 mb-6 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold tracking-wider uppercase shrink-0">
                                    {t('study.question')}
                                </span>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed max-w-2xl">
                                    {currentCard.question}
                                </h3>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 text-center shrink-0">
                                <span className="text-xs font-medium text-slate-400 animate-pulse flex items-center justify-center gap-2">
                                    <ArrowPathIcon className="w-3.5 h-3.5" />
                                    {t('study.tapToFlip')}
                                </span>
                            </div>
                        </div>

                        {/* BACK FACE (Answer) */}
                        <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 rotate-y-180 flex flex-col overflow-hidden">
                            <div className="flex-1 p-6 sm:p-10 flex flex-col text-center overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-center mb-6 shrink-0">
                                    <span className="inline-block px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold tracking-wider uppercase">
                                        {t('study.answer')}
                                    </span>
                                </div>

                                <div className="text-lg sm:text-xl text-slate-700 dark:text-slate-200 leading-relaxed mb-6">
                                    {currentCard.answer}
                                </div>

                                {currentCard.explanation && (
                                    <div className="mt-auto mx-auto w-full max-w-lg p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30 text-left shrink-0">
                                        <div className="flex gap-3">
                                            <LightBulbIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase mb-1">{t('study.explanation')}</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    {currentCard.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Controls - Fixed/Safe Area */}
            {showAnswer && (
                <div className="shrink-0 p-4 pb-8 sm:pb-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-all duration-300 z-30 animate-slide-up shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <div className="max-w-xl mx-auto grid grid-cols-3 gap-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDifficultyChoice('HARD');
                            }}
                            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 active:scale-95 transition-all border border-transparent active:border-red-200 dark:active:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                            <div className="mb-1 text-red-500 dark:text-red-400">
                                <HandThumbDownIcon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-red-700 dark:text-red-400">{t('study.hard')}</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDifficultyChoice('NORMAL');
                            }}
                            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 active:scale-95 transition-all border border-transparent active:border-amber-200 dark:active:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/20"
                        >
                            <div className="mb-1 text-amber-500 dark:text-amber-400">
                                <ClockIcon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{t('study.normal')}</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDifficultyChoice('EASY');
                            }}
                            className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-green-50 dark:bg-green-900/10 active:scale-95 transition-all border border-transparent active:border-green-200 dark:active:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/20"
                        >
                            <div className="mb-1 text-green-500 dark:text-green-400">
                                <HandThumbUpIcon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">{t('study.easy')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-up">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <InformationCircleIcon className="w-5 h-5 text-primary-600" />
                                {t('study.srsSystem')}
                            </h2>
                        </div>
                        <div className="p-5 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                            <p>{t('study.srsExplanation')}</p>
                            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                                        <HandThumbDownIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{t('study.hard')}</div>
                                        <div className="text-xs">{t('study.repeatSoon')} {`(< 1min)`}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                        <ClockIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{t('study.normal')}</div>
                                        <div className="text-xs">{t('study.repeatTomorrow')}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
                                        <HandThumbUpIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">{t('study.easy')}</div>
                                        <div className="text-xs">{t('study.repeatIn3Days')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm"
                            >
                                {t('study.understood')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {flashcard && (
                <CardHistoryModal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    flashcardId={flashcard._id}
                    cardIndex={currentCardIndex}
                    question={currentCard.question}
                />
            )}
        </div>
    );
};

export default FlashcardStudyPage;