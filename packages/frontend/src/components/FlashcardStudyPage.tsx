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
            const message = error.response?.data?.message || 'Erro ao carregar flashcard.';
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
                `Sessão de estudo concluída! Você estudou ${session.length} cards em ${Math.floor(totalSessionTime / 60)}min.`,
                'success'
            );

            navigate('/my-flashcards');
        } catch (error: any) {
            console.error('Error recording study session:', error);
            showToast('Erro ao salvar progresso do estudo.', 'error');
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
            <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!flashcard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
                <ExclamationTriangleIcon className="w-24 h-24 text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Flashcard não encontrado
                </h2>
                <button
                    onClick={() => navigate('/my-flashcards')}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                    Voltar aos Meus Flashcards
                </button>
            </div>
        );
    }

    const currentCard = flashcard.cards[currentCardIndex];
    const progress = Math.round(((currentCardIndex) / flashcard.cards.length) * 100);

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
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
                .grid-stack {
                    display: grid;
                    grid-template-areas: "stack";
                }
                .grid-stack > * {
                    grid-area: stack;
                }
            `}</style>

            <PageTitle title={`Estudando: ${flashcard.titulo} - TreinaVagaAI`} />

            {/* Header */}
            <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigate('/my-flashcards')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Voltar</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {currentCardIndex + 1} / {flashcard.cards.length}
                            </span>
                            <button
                                onClick={() => setShowInfoModal(true)}
                                className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                title="Ajuda sobre o sistema"
                            >
                                <InformationCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-600 transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 w-full max-w-5xl mx-auto" ref={containerRef}>

                {/* 3D Card Container */}
                <div className="w-full max-w-3xl perspective-1000 my-8">
                    <div
                        className={`relative w-full transition-transform duration-500 transform-style-3d cursor-pointer grid-stack ${showAnswer ? 'rotate-y-180' : ''
                            }`}
                        onClick={handleFlipCard}
                    >
                        {/* FRONT FACE (Question) */}
                        <div className="backface-hidden w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 md:p-12 flex flex-col items-center justify-center min-h-[400px]">
                            <div className="w-full max-w-2xl text-center space-y-8">
                                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase">
                                    Pergunta
                                </span>
                                <h3 className="text-2xl md:text-3xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                                    {currentCard.question}
                                </h3>
                                <div className="pt-8 text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 text-sm animate-pulse">
                                    <ArrowPathIcon className="w-4 h-4" />
                                    <span>Toque ou Pressione Espaço para virar</span>
                                </div>
                            </div>
                        </div>

                        {/* BACK FACE (Answer) */}
                        <div className="backface-hidden w-full h-full bg-slate-50 dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-12 rotate-y-180 flex flex-col min-h-[400px]">
                            <div className="w-full max-w-2xl mx-auto space-y-6">
                                <div className="flex items-center justify-center mb-4">
                                    <span className="inline-block px-4 py-1.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold tracking-wider uppercase">
                                        Resposta
                                    </span>
                                </div>

                                <div className="text-lg md:text-xl text-slate-700 dark:text-slate-200 leading-relaxed text-center">
                                    {currentCard.answer}
                                </div>

                                {currentCard.explanation && (
                                    <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                                        <div className="flex items-start gap-3">
                                            <LightBulbIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-500 mb-2 uppercase">
                                                    Explicação
                                                </h4>
                                                <p className="text-slate-700 dark:text-slate-300 text-base">
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

                {/* Controls Area (Bottom) - Only Show when Answer is Revealed */}
                <div className={`w-full max-w-xl transition-all duration-500 transform ${showAnswer ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
                    }`}>
                    {showAnswer && (
                        <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('HARD');
                                    }}
                                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800/50"
                                >
                                    <div className="w-10 h-10 mb-2 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                        <HandThumbDownIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-red-600 dark:group-hover:text-red-400">Difícil</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tecla 1</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('NORMAL');
                                    }}
                                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all border border-transparent hover:border-yellow-200 dark:hover:border-yellow-800/50"
                                >
                                    <div className="w-10 h-10 mb-2 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
                                        <ArrowPathIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-yellow-600 dark:group-hover:text-yellow-400">Normal</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tecla 2</span>
                                </button>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('EASY');
                                    }}
                                    className="group relative flex flex-col items-center justify-center p-4 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all border border-transparent hover:border-green-200 dark:hover:border-green-800/50"
                                >
                                    <div className="w-10 h-10 mb-2 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                                        <HandThumbUpIcon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-400">Fácil</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tecla 3</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Additional Actions */}
                <div className="absolute top-24 right-4 md:right-8 flex flex-col gap-2">
                    <button
                        onClick={() => setShowHistoryModal(true)}
                        className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Ver histórico deste card"
                    >
                        <ClockIcon className="w-6 h-6" />
                    </button>
                    {/* Add more tools here if needed */}
                </div>
            </main>

            {/* Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <InformationCircleIcon className="w-6 h-6 text-primary-600" />
                                Como Funciona
                            </h2>
                        </div>
                        <div className="p-6 space-y-4 text-slate-600 dark:text-slate-300">
                            <p>
                                Este sistema utiliza <strong>Repetição Espaçada</strong> para otimizar sua memória.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 mt-2 bg-red-500 rounded-full flex-shrink-0" />
                                    <span><strong>Difícil (1):</strong> Você errou ou demorou muito. O card voltará em breve.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 mt-2 bg-yellow-500 rounded-full flex-shrink-0" />
                                    <span><strong>Normal (2):</strong> Você lembrou, mas com algum esforço. Intervalo padrão.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="w-2 h-2 mt-2 bg-green-500 rounded-full flex-shrink-0" />
                                    <span><strong>Fácil (3):</strong> Você lembrou instantaneamente. O intervalo aumentará.</span>
                                </li>
                            </ul>
                            <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-xl text-sm">
                                <p className="font-semibold mb-1">Dica de Atalhos:</p>
                                <p>Espaço: Virar card</p>
                                <p>1, 2, 3: Avaliar dificuldade</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all transform active:scale-95"
                            >
                                Entendi
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