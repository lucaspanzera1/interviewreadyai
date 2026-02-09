import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    VideoCameraIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    CheckIcon,
    LightBulbIcon,
    TrashIcon
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

const VideoTimer: React.FC<{ startTime: number, maxDuration?: number, isRecording?: boolean }> = ({ startTime, maxDuration = 180, isRecording = true }) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
        const timer = setInterval(() => {
            const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
            setElapsed(currentElapsed);

            if (currentElapsed >= maxDuration) {
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [startTime, maxDuration]);

    const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const secs = (elapsed % 60).toString().padStart(2, '0');

    const isWarning = elapsed > maxDuration * 0.8;
    const isOvertime = elapsed >= maxDuration;

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur-md border border-white/10 ${isOvertime ? 'bg-red-500/80 text-white' :
            isWarning ? 'bg-amber-500/80 text-white' :
                'bg-black/50 text-white'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'animate-pulse bg-red-500' : 'bg-slate-400'}`} />
            <span className="font-mono text-sm font-bold tracking-widest">
                {mins}:{secs}
            </span>
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
    const [showTips, setShowTips] = useState(false);

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

        requestPermissions();

        return () => {
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

                const newRecordings = [...recordings];
                newRecordings[currentQuestion] = blob;
                setRecordings(newRecordings);

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
            setVideoState(prev => ({ ...prev, recordedBlob: null })); // Reset state for new question

            // Wait for render cycle to update ref
            setTimeout(() => {
                const nextRecording = recordings[currentQuestion + 1];
                if (nextRecording && previewRef.current) {
                    previewRef.current.src = URL.createObjectURL(nextRecording);
                    setVideoState(prev => ({ ...prev, recordedBlob: nextRecording }));
                }
            }, 0);
        }
    };

    const prevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setVideoState(prev => ({ ...prev, recordedBlob: null }));

            setTimeout(() => {
                const prevRecording = recordings[currentQuestion - 1];
                if (prevRecording && previewRef.current) {
                    previewRef.current.src = URL.createObjectURL(prevRecording);
                    setVideoState(prev => ({ ...prev, recordedBlob: prevRecording }));
                }
            }, 0);
        }
    };

    const finishInterview = () => {
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
            const validRecordings = recordings.filter(rec => rec !== null);
            if (validRecordings.length === 0) {
                showToast('Nenhuma gravação encontrada', 'error');
                return;
            }

            const formData = new FormData();

            validRecordings.forEach((recording) => {
                if (recording) {
                    const questionIndex = recordings.indexOf(recording);
                    formData.append('videos', recording, `question_${questionIndex}.webm`);
                }
            });

            formData.append('actualDuration', Math.floor((Date.now() - recordingStartTime) / 1000 / 60).toString());
            formData.append('difficultyRating', difficultyRating.toString());
            formData.append('feedback', feedback);

            const attemptResult = await apiClient.uploadVideoAttempt(interviewId, formData);

            if (attemptResult.attemptId) {
                showToast('Simulação enviada! Análise será processada.', 'success');
                localStorage.setItem('currentAttemptId', attemptResult.attemptId);
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
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    const currentQ = interview.questions[currentQuestion];
    const currentRecording = recordings[currentQuestion];
    const maxDuration = currentQ?.maxDuration || 180;

    if (showResults) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <PageTitle title="Resultados da Simulação" />

                <div className="max-w-xl w-full bg-slate-800 rounded-3xl shadow-2xl p-8 border border-slate-700 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-900/10">
                            <CheckIcon className="w-10 h-10 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Gravação Concluída!
                        </h1>
                        <p className="text-slate-400">
                            Você gravou {recordings.filter(r => r).length} de {interview.questions.length} vídeo-respostas.
                        </p>
                    </div>

                    <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-4 text-center">Como foi a experiência?</h3>
                        <div className="flex justify-center gap-3 mb-2">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <button
                                    key={rating}
                                    onClick={() => setDifficultyRating(rating)}
                                    className={`w-12 h-12 rounded-xl text-lg font-bold transition-all ${difficultyRating === rating
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {rating}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Algum comentário sobre a simulação? (Opcional)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-300 placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24 text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={submitInterview}
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-primary-600/20 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enviando Vídeos...
                                </span>
                            ) : (
                                'Enviar para Análise de IA'
                            )}
                        </button>
                        <button
                            onClick={() => setShowResults(false)}
                            className="w-full py-4 bg-transparent hover:bg-slate-700 text-slate-400 hover:text-white font-semibold rounded-xl transition-colors"
                        >
                            Voltar e revisar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 text-white overflow-hidden flex flex-col">
            <PageTitle title={`Gravação - ${interview.jobTitle}`} />

            {/* Top Bar */}
            <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start pointer-events-none">
                <div className="pointer-events-auto bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/5 flex items-center gap-3">
                    <button onClick={() => navigate('/my-interviews')} className="hover:text-primary-400 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-white/20"></div>
                    <span className="text-sm font-medium text-slate-200">{interview.jobTitle}</span>
                </div>

                {videoState.isRecording && (
                    <div className="pointer-events-auto">
                        <VideoTimer startTime={recordingStartTime} maxDuration={maxDuration} />
                    </div>
                )}
            </header>

            {/* Main Video Area */}
            <main className="flex-1 relative flex items-center justify-center bg-black">
                {!hasPermission ? (
                    <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800">
                        <VideoCameraIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Acesso à Câmera Necessário</h3>
                        <p className="text-slate-400 mb-6">Por favor, permita o acesso à câmera e microfone para continuar.</p>
                        <button
                            onClick={requestPermissions}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-medium transition-colors"
                        >
                            Permitir Acesso
                        </button>
                    </div>
                ) : (
                    <div className="relative w-full h-full max-w-7xl mx-auto aspect-video">
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
                                playsInline
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        )}

                        {/* Question Overlay (Teleprompter style) */}
                        <div className="absolute bottom-32 left-0 right-0 px-4 sm:px-8 pointer-events-none">
                            <div className="max-w-4xl mx-auto bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl pointer-events-auto">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary-400">
                                        Pergunta {currentQuestion + 1} de {interview.questions.length}
                                    </span>
                                    <button
                                        onClick={() => setShowTips(!showTips)}
                                        className="text-slate-400 hover:text-amber-400 transition-colors"
                                    >
                                        <LightBulbIcon className="w-6 h-6" />
                                    </button>
                                </div>
                                <h2 className="text-xl md:text-3xl font-bold text-white leading-tight shadow-black drop-shadow-md">
                                    {currentQ.question}
                                </h2>

                                {showTips && currentQ.tips && (
                                    <div className="mt-4 p-4 bg-amber-900/40 border border-amber-500/30 rounded-xl text-amber-100 text-sm animate-fade-in">
                                        <p>{currentQ.tips}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Controls Bar */}
            <div className="h-24 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-6 sm:px-12 z-30">
                <div className="flex-1 flex items-center gap-4">
                    <button
                        onClick={prevQuestion}
                        disabled={currentQuestion === 0}
                        className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl disabled:opacity-30 transition-all"
                    >
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    {currentRecording && (
                        <button
                            onClick={deleteRecording}
                            className="p-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
                        >
                            <TrashIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Descartar</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 flex justify-center">
                    {!videoState.isRecording ? (
                        <button
                            onClick={startRecording}
                            className={`group relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-white/20 hover:border-red-500/50 hover:scale-105 transition-all duration-300 ${currentRecording ? 'bg-slate-700' : 'bg-red-600'
                                }`}
                        >
                            {currentRecording ? (
                                <div className="text-white font-bold text-xs uppercase text-center">
                                    <span className="block text-[10px] text-slate-400">Regravar</span>
                                    <VideoCameraIcon className="w-6 h-6 mx-auto mt-0.5" />
                                </div>
                            ) : (
                                <div className="w-6 h-6 bg-white rounded-sm group-hover:rounded-full transition-all duration-300" />
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="group relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-red-500/50 bg-slate-800 hover:scale-105 transition-all duration-300"
                        >
                            <div className="w-6 h-6 bg-red-500 rounded-sm" />
                        </button>
                    )}
                </div>

                <div className="flex-1 flex items-center justify-end gap-4">
                    <div className="hidden sm:flex items-center gap-1">
                        {recordings.map((rec, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i === currentQuestion ? 'bg-primary-500 scale-125' : rec ? 'bg-green-500' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                    {currentQuestion === interview.questions.length - 1 ? (
                        <button
                            onClick={finishInterview}
                            className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
                        >
                            Finalizar
                        </button>
                    ) : (
                        <button
                            onClick={nextQuestion}
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl shadow-lg shadow-primary-900/20 transition-all hover:translate-y-[-2px] active:translate-y-0 flex items-center gap-2"
                        >
                            Próxima
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewVideoRecorderPage;