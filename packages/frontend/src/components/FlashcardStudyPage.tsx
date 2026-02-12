import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import CardHistoryModal from './CardHistoryModal';
import { ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, CheckIcon, XMarkIcon, ExclamationTriangleIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
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
    
    const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [studySession, setStudySession] = useState<Array<{
        cardIndex: number;
        difficulty: 'EASY' | 'NORMAL' | 'HARD';
        studyTime?: number;
    }>>([]);
    const [sessionStartTime] = useState<number>(Date.now());
    const [cardStartTime, setCardStartTime] = useState<number>(Date.now());
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    useEffect(() => {
        if (id) {
            loadFlashcard();
        }
    }, [id]);

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
        
        // Adicionar à sessão de estudo
        const newStudySession = [...studySession, {
            cardIndex: currentCardIndex,
            difficulty,
            studyTime: cardStudyTime
        }];
        setStudySession(newStudySession);

        // Próximo card ou finalizar
        if (currentCardIndex < flashcard.cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
            setShowAnswer(false);
            setCardStartTime(Date.now());
        } else {
            // Finalizar sessão
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!flashcard) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <ExclamationTriangleIcon className="w-24 h-24 text-slate-400 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    Flashcard não encontrado
                </h2>
                <button
                    onClick={() => navigate('/my-flashcards')}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                    Voltar aos Meus Flashcards
                </button>
            </div>
        );
    }

    const currentCard = flashcard.cards[currentCardIndex];
    
    return (
        <div className="flex flex-col min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900">
            <PageTitle title={`Estudando: ${flashcard.titulo} - TreinaVagaAI`} />
            
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/my-flashcards')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        Voltar
                    </button>
                    
                    <div className="text-center">
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                            {flashcard.titulo}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Card {currentCardIndex + 1} de {flashcard.cards.length}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            Progresso
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                            {Math.round(((currentCardIndex) / flashcard.cards.length) * 100)}%
                        </div>
                    </div>
                    <button
                        onClick={() => setShowInfoModal(true)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Sobre o sistema de repetição espaçada"
                    >
                        <InformationCircleIcon className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Progress bar */}
                <div className="max-w-4xl mx-auto mt-4">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentCardIndex) / flashcard.cards.length) * 100}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Card Area */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div 
                        className={`relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-500 ${
                            showAnswer ? 'min-h-96' : 'min-h-80'
                        }`}
                        onClick={handleFlipCard}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="p-8 text-center">
                            {!showAnswer ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2">
                                            PERGUNTA
                                        </div>
                                    </div>
                                    <div className="text-xl font-medium text-slate-900 dark:text-white leading-relaxed">
                                        {currentCard.question}
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                                        <ArrowPathIcon className="w-5 h-5" />
                                        <span>Clique para ver a resposta</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                                            RESPOSTA
                                        </div>
                                    </div>
                                    <div className="text-lg text-slate-900 dark:text-white leading-relaxed mb-4">
                                        {currentCard.answer}
                                    </div>
                                    {currentCard.explanation && (
                                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                                                EXPLICAÇÃO ADICIONAL
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300">
                                                {currentCard.explanation}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Card controls */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowHistoryModal(true);
                                }}
                                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                title="Ver histórico do card"
                            >
                                <ClockIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                <ArrowPathIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Buttons - Only show when answer is revealed */}
                    {showAnswer && (
                        <div className="mt-8 space-y-4">
                            <p className="text-center text-slate-600 dark:text-slate-400 font-medium">
                                Como você avalia a dificuldade desta pergunta?
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('HARD');
                                    }}
                                    className="flex flex-col items-center justify-center gap-2 py-4 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all hover:scale-105"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                    <span>Difícil</span>
                                    <span className="text-xs opacity-90">Revisar amanhã</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('NORMAL');
                                    }}
                                    className="flex flex-col items-center justify-center gap-2 py-4 px-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-all hover:scale-105"
                                >
                                    <ArrowPathIcon className="w-6 h-6" />
                                    <span>Normal</span>
                                    <span className="text-xs opacity-90">Intervalo padrão</span>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDifficultyChoice('EASY');
                                    }}
                                    className="flex flex-col items-center justify-center gap-2 py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all hover:scale-105"
                                >
                                    <CheckIcon className="w-6 h-6" />
                                    <span>Fácil</span>
                                    <span className="text-xs opacity-90">Revisar mais tarde</span>
                                </button>
                            </div>
                            <p className="text-sm text-center text-slate-500 dark:text-slate-400">
                                O sistema de repetição espaçada ajustará automaticamente quando este card aparecerá novamente
                            </p>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handlePreviousCard}
                            disabled={currentCardIndex === 0}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            Anterior
                        </button>

                        <button
                            onClick={handleNextCard}
                            disabled={currentCardIndex === flashcard.cards.length - 1}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Próximo
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </main>

            {/* Info Modal */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Sistema de Repetição Espaçada
                            </h2>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                                <p>
                                    <strong>Como funciona:</strong> O sistema usa o algoritmo SM-2 (similar ao Anki) para otimizar seu aprendizado.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span><strong>Difícil:</strong> Reinicia o ciclo, revisar em 1 dia</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span><strong>Normal:</strong> Mantém o ritmo padrão</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span><strong>Fácil:</strong> Aumenta o intervalo significativamente</span>
                                    </div>
                                </div>
                                <p>
                                    <strong>Fator de Facilidade:</strong> Ajusta automaticamente baseado no seu desempenho (mínimo 1.3).
                                </p>
                                <p>
                                    <strong>Histórico:</strong> Clique no ícone de relógio para ver o progresso detalhado de cada card.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInfoModal(false)}
                                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
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