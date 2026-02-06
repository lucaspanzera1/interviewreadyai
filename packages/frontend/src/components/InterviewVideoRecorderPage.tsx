import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    VideoCameraIcon,
    StopIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    LightBulbIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import { apiClient, InterviewQuestion } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface VideoRecorderState {
    isRecording: boolean;
    isPaused: boolean;
    recordedBlob: Blob | null;
    duration: number;
    mediaRecorder: MediaRecorder | null;
    stream: MediaStream | null;
}

const VideoTimer: React.FC<{ startTime: number, maxDuration?: number }> = ({ startTime, maxDuration = 180 }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
        const timer = setInterval(() => {
            const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(currentElapsed);

            // Para automaticamente quando atingir o máximo
            if (currentElapsed >= maxDuration) {
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, maxDuration]);

    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');
    const maxMins = Math.floor(maxDuration / 60).toString().padStart(2, '0');
    const maxSecs = (maxDuration % 60).toString().padStart(2, '0');

    const isWarning = elapsed > maxDuration * 0.8;
    const isOvertime = elapsed >= maxDuration;

    return (
        <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full border backdrop-blur-sm flex items-center gap-2 shadow-sm min-w-[120px] justify-center ${
            isOvertime
                ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : isWarning
                ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                : 'text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${
                isOvertime ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-green-500'
            }`} />
            {mins}:{secs} / {maxMins}:{maxSecs}
        </div>
    );
};

const InterviewVideoRecorderPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const previewRef = useRef<HTMLVideoElement>(null);

    const [interview, setInterview] = useState<{
        questions: InterviewQuestion[];
        jobTitle?: string;
        companyName?: string;
        _id?: string;
        estimatedDuration?: number;
        preparationTips?: string[];
    } | null>(null);

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [recordings, setRecordings] = useState<(Blob | null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [interviewId, setInterviewId] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [difficultyRating, setDifficultyRating] = useState<number>(3);
    const [feedback, setFeedback] = useState<string>('');

    const [videoState, setVideoState] = useState<VideoRecorderState>({
        isRecording: false,
        isPaused: false,
        recordedBlob: null,
        duration: 0,
        mediaRecorder: null,
        stream: null
    });

    const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
    const [hasPermission, setHasPermission] = useState<boolean>(false);

    useEffect(() => {
        const storedInterview = localStorage.getItem('generatedInterview');
        const storedInterviewId = localStorage.getItem('currentInterviewId');

        if (storedInterview) {
            const parsedData = JSON.parse(storedInterview);
            setInterview(parsedData);
            setRecordings(new Array(parsedData.questions.length).fill(null));
        } else {
            showToast('Nenhuma simulação encontrada. Redirecionando...', 'error');
            navigate('/my-interviews');
        }

        if (storedInterviewId) {
            setInterviewId(storedInterviewId);
        }

        // Solicitar permissões de câmera e microfone
        requestPermissions();

        return () => {
            // Limpar streams ao desmontar o componente
            if (videoState.stream) {
                videoState.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate, showToast]);

    const requestPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                },
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            setVideoState(prev => ({ ...prev, stream }));
            setHasPermission(true);
        } catch (error) {
            console.error('Erro ao acessar câmera/microfone:', error);
            showToast('Permissão de câmera/microfone necessária para gravar vídeos', 'error');
            setHasPermission(false);
        }
    };

    const startRecording = useCallback(async () => {
        if (!videoState.stream) {
            await requestPermissions();
            return;
        }

        try {
            const mediaRecorder = new MediaRecorder(videoState.stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                setVideoState(prev => ({
                    ...prev,
                    recordedBlob: blob,
                    isRecording: false,
                    mediaRecorder: null
                }));

                // Salvar gravação na lista
                const newRecordings = [...recordings];
                newRecordings[currentQuestion] = blob;
                setRecordings(newRecordings);

                // Mostrar preview
                if (previewRef.current) {
                    previewRef.current.src = URL.createObjectURL(blob);
                }
            };

            mediaRecorder.start();
            setVideoState(prev => ({
                ...prev,
                isRecording: true,
                mediaRecorder,
                recordedBlob: null
            }));

            setRecordingStartTime(Date.now());

        } catch (error) {
            console.error('Erro ao iniciar gravação:', error);
            showToast('Erro ao iniciar gravação', 'error');
        }
    }, [videoState.stream, recordings, currentQuestion, showToast]);

    const stopRecording = useCallback(() => {
        if (videoState.mediaRecorder && videoState.isRecording) {
            videoState.mediaRecorder.stop();
        }
    }, [videoState.mediaRecorder, videoState.isRecording]);

    const deleteRecording = () => {
        const newRecordings = [...recordings];
        newRecordings[currentQuestion] = null;
        setRecordings(newRecordings);

        setVideoState(prev => ({
            ...prev,
            recordedBlob: null
        }));

        if (previewRef.current) {
            previewRef.current.src = '';
        }
    };

    const nextQuestion = () => {
        if (interview && currentQuestion < interview.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);

            // Atualizar preview para a gravação da próxima pergunta
            const nextRecording = recordings[currentQuestion + 1];
            if (nextRecording && previewRef.current) {
                previewRef.current.src = URL.createObjectURL(nextRecording);
            } else if (previewRef.current) {
                previewRef.current.src = '';
            }
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);

            // Atualizar preview para a gravação da pergunta anterior
            const prevRecording = recordings[currentQuestion - 1];
            if (prevRecording && previewRef.current) {
                previewRef.current.src = URL.createObjectURL(prevRecording);
            } else if (previewRef.current) {
                previewRef.current.src = '';
            }
        }
    };

    const finishInterview = () => {
        // Verificar se pelo menos uma gravação foi feita
        const hasRecordings = recordings.some(rec => rec !== null);
        if (!hasRecordings) {
            showToast('Grave pelo menos uma resposta antes de finalizar', 'error');
            return;
        }
        setShowResults(true);
    };

    const submitInterview = async () => {
        if (!interview || !interviewId) return;

        setIsSubmitting(true);
        try {
            // Encontrar a primeira gravação válida para enviar
            const firstRecording = recordings.find(rec => rec !== null);
            if (!firstRecording) {
                showToast('Nenhuma gravação encontrada', 'error');
                return;
            }

            const formData = new FormData();
            formData.append('video', firstRecording, 'interview-recording.webm');
            formData.append('actualDuration', Math.floor((Date.now() - recordingStartTime) / 1000 / 60).toString());
            formData.append('difficultyRating', difficultyRating.toString());
            formData.append('feedback', feedback);

            const attemptResult = await apiClient.uploadVideoAttempt(interviewId, formData);

            if (attemptResult.attemptId) {
                showToast('Simulação enviada! Análise será processada.', 'success');

                // Salvar ID da tentativa para acompanhar análise
                localStorage.setItem('currentAttemptId', attemptResult.attemptId);

                // Redirecionar para página de análise
                navigate(`/interview-analysis/${attemptResult.attemptId}`);
            }
        } catch (error) {
            console.error('Erro ao submeter simulação:', error);
            showToast('Erro ao enviar simulação. Tente novamente.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!interview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const currentQ = interview.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / interview.questions.length) * 100;
    const currentRecording = recordings[currentQuestion];
    const maxDuration = currentQ?.maxDuration || 180; // 3 minutos padrão

    if (showResults) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <PageTitle
                    title="Resultados da Simulação"
                />

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/30">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">
                            Simulação Finalizada! 🎉
                        </h2>

                        <div className="space-y-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📹 Gravações Realizadas</h3>
                                <p className="text-blue-700 dark:text-blue-300">
                                    {recordings.filter(r => r !== null).length} de {interview.questions.length} perguntas gravadas
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Como foi a dificuldade da simulação? (1-5)
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                onClick={() => setDifficultyRating(rating)}
                                                className={`w-12 h-12 rounded-full font-bold transition-all ${
                                                    difficultyRating === rating
                                                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-600'
                                                }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <span>Muito fácil</span>
                                        <span>Muito difícil</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Feedback adicional (opcional)
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Como foi sua experiência? Sugestões?"
                                        className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowResults(false)}
                                    className="flex-1 py-3 px-6 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={submitInterview}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Enviando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="w-5 h-5" />
                                            Enviar para Análise
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            <PageTitle
                title={`Simulação: ${interview.jobTitle || 'Entrevista'}`}
            />

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-full h-2 backdrop-blur-sm border border-white/20 dark:border-slate-700/30">
                    <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Área de Vídeo */}
                    <div className="space-y-4">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white">📹 Gravação</h3>
                                {videoState.isRecording && (
                                    <VideoTimer startTime={recordingStartTime} maxDuration={maxDuration} />
                                )}
                            </div>

                            {!hasPermission ? (
                                <div className="aspect-video bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                                    <div className="text-center p-6">
                                        <VideoCameraIcon className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                                        <p className="text-slate-600 dark:text-slate-400 mb-4">Permitir acesso à câmera e microfone</p>
                                        <button
                                            onClick={requestPermissions}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Permitir Acesso
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Camera Preview / Recorded Video */}
                                    <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
                                        {currentRecording ? (
                                            <video
                                                ref={previewRef}
                                                className="w-full h-full object-cover"
                                                controls
                                                src={URL.createObjectURL(currentRecording)}
                                            />
                                        ) : (
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                muted
                                                className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
                                            />
                                        )}

                                        {videoState.isRecording && (
                                            <div className="absolute top-4 left-4">
                                                <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                    GRAVANDO
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recording Controls */}
                                    <div className="flex gap-3 justify-center">
                                        {!videoState.isRecording ? (
                                            <>
                                                <button
                                                    onClick={startRecording}
                                                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                                                >
                                                    <VideoCameraIcon className="w-5 h-5" />
                                                    {currentRecording ? 'Gravar Novamente' : 'Iniciar Gravação'}
                                                </button>
                                                {currentRecording && (
                                                    <button
                                                        onClick={deleteRecording}
                                                        className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                                    >
                                                        Excluir
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={stopRecording}
                                                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors"
                                            >
                                                <StopIcon className="w-5 h-5" />
                                                Parar Gravação
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Question Area */}
                    <div className="space-y-6">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                                    {currentQuestion + 1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            currentQ.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                            'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                            {currentQ.difficulty === 'easy' ? 'Fácil' : currentQ.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            {currentQ.type === 'technical' ? 'Técnica' :
                                             currentQ.type === 'behavioral' ? 'Comportamental' :
                                             currentQ.type === 'situational' ? 'Situacional' : 'Empresa'}
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                            Máx: {Math.floor(maxDuration / 60)}:{(maxDuration % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed">
                                        {currentQ.question}
                                    </h3>
                                </div>
                            </div>

                            {currentQ.tips && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 border-l-4 border-blue-400">
                                    <div className="flex items-start gap-2">
                                        <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm mb-1">Dica</h4>
                                            <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">{currentQ.tips}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentQ.keywords && currentQ.keywords.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm mb-2 flex items-center gap-2">
                                        <DocumentIcon className="w-4 h-4" />
                                        Palavras-chave importantes
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {currentQ.keywords.map((keyword, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-lg font-medium"
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={prevQuestion}
                                        disabled={currentQuestion === 0}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ArrowLeftIcon className="w-4 h-4" />
                                        Anterior
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {recordings.map((rec, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-3 h-3 rounded-full ${
                                                    idx === currentQuestion
                                                        ? 'bg-blue-600 ring-2 ring-blue-200 dark:ring-blue-400'
                                                        : rec
                                                        ? 'bg-green-500'
                                                        : 'bg-slate-300 dark:bg-slate-600'
                                                }`}
                                            />
                                        ))}
                                    </div>

                                    {currentQuestion < interview.questions.length - 1 ? (
                                        <button
                                            onClick={nextQuestion}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Próxima
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={finishInterview}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                                        >
                                            Finalizar
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewVideoRecorderPage;