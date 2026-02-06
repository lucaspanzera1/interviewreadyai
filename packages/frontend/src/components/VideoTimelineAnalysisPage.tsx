import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageTitle from './PageTitle';
import {
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

interface VideoFeedbackMoment {
    timestamp: number;
    type: 'positive' | 'improvement' | 'neutral' | 'warning';
    category: 'verbal' | 'non-verbal' | 'content' | 'technical';
    message: string;
    severity: 'low' | 'medium' | 'high';
    suggestion?: string;
}

interface VideoAnalysisResult {
    overall_score: number;
    duration: number;
    moments: VideoFeedbackMoment[];
    summary: {
        strengths: string[];
        improvements: string[];
        keyPoints: string[];
    };
    metrics: {
        speech_clarity: number;
        confidence_level: number;
        engagement: number;
        technical_accuracy: number;
    };
}

interface AnalysisData {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    hasVideo: boolean;
    videoPath?: string;
    analysis?: VideoAnalysisResult;
    completedAt?: string;
}

const VideoTimelineAnalysisPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const { /* showToast */ } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedMoment, setSelectedMoment] = useState<VideoFeedbackMoment | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    useEffect(() => {
        if (attemptId) {
            fetchAnalysis();

            // Polling para verificar se análise foi concluída
            const interval = setInterval(() => {
                if (analysisData?.status === 'pending' || analysisData?.status === 'processing') {
                    fetchAnalysis();
                }
            }, 5000); // Check every 5 seconds

            return () => clearInterval(interval);
        }
    }, [attemptId]);

    const fetchAnalysis = async () => {
        if (!attemptId) {
            setError('ID da tentativa não encontrado');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.getVideoAnalysis(attemptId);
            setAnalysisData(response);
            setError(null);
        } catch (error) {
            console.error('Error fetching analysis:', error);
            setError('Erro ao carregar análise');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const jumpToMoment = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getMomentIcon = (type: string) => {
        switch (type) {
            case 'positive':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
            case 'improvement':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getMomentColor = (type: string) => {
        switch (type) {
            case 'positive':
                return 'border-green-500 bg-green-50 dark:bg-green-900/20';
            case 'warning':
                return 'border-red-500 bg-red-50 dark:bg-red-900/20';
            case 'improvement':
                return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
            default:
                return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
        if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
        return 'bg-red-100 dark:bg-red-900/20';
    };

    const filteredMoments = analysisData?.analysis?.moments ?
        analysisData.analysis.moments.filter(moment =>
            activeFilter === 'all' || moment.category === activeFilter || moment.type === activeFilter
        ) : [];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Carregando análise...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    if (analysisData?.status === 'pending' || analysisData?.status === 'processing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
                <PageTitle
                    title="Processando Análise"
                />

                <div className="max-w-2xl mx-auto px-4 py-8">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 dark:border-slate-700/30 text-center">
                        <div className="mb-6">
                            <ArrowPathIcon className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
                            <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
                                {analysisData?.status === 'pending' ? 'Na fila de processamento' : 'Analisando vídeo...'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Nossa IA está analisando sua performance. Isso pode levar alguns minutos.
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">O que estamos analisando:</h3>
                            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1 text-left">
                                <li>• Clareza da comunicação</li>
                                <li>• Confiança e postura</li>
                                <li>• Conteúdo das respostas</li>
                                <li>• Precisão técnica</li>
                            </ul>
                        </div>

                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        >
                            Voltar às Simulações
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysisData?.analysis) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 dark:text-red-400 mb-4">Análise não disponível</p>
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        );
    }

    const analysis = analysisData.analysis;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
            <PageTitle
                title="Análise da Simulação"
            />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    {/* Video Player */}
                    <div className="xl:col-span-3 space-y-6">
                        {analysisData.hasVideo && analysisData.videoPath && (
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">📹 Sua Simulação</h3>

                                <div className="aspect-video bg-black rounded-xl overflow-hidden">
                                    <video
                                        ref={videoRef}
                                        src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${analysisData.videoPath}`}
                                        className="w-full h-full"
                                        onTimeUpdate={handleTimeUpdate}
                                        onPlay={handlePlay}
                                        onPause={handlePause}
                                        controls
                                    />
                                </div>

                                {/* Custom Controls */}
                                <div className="flex items-center justify-between mt-4">
                                    <button
                                        onClick={togglePlayPause}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                        {isPlaying ? 'Pausar' : 'Reproduzir'}
                                    </button>

                                    <div className="text-sm text-slate-600 dark:text-slate-400">
                                        {formatTime(currentTime)} / {formatTime(analysis.duration)}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-800 dark:text-white">📊 Timeline de Feedback</h3>
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="positive">Positivos</option>
                                    <option value="improvement">Melhorias</option>
                                    <option value="warning">Alertas</option>
                                    <option value="verbal">Verbal</option>
                                    <option value="non-verbal">Não-verbal</option>
                                    <option value="content">Conteúdo</option>
                                    <option value="technical">Técnico</option>
                                </select>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredMoments.map((moment, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSelectedMoment(moment);
                                            jumpToMoment(moment.timestamp);
                                        }}
                                        className={`p-4 rounded-xl border-l-4 cursor-pointer transition-all hover:shadow-md ${
                                            getMomentColor(moment.type)
                                        } ${
                                            selectedMoment === moment ? 'ring-2 ring-blue-500' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getMomentIcon(moment.type)}
                                                <span className="font-semibold text-sm text-slate-800 dark:text-white">
                                                    {formatTime(moment.timestamp)}
                                                </span>
                                                <span className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                                                    {moment.category}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                    moment.severity === 'high' ? 'bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    moment.severity === 'medium' ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                    {moment.severity}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
                                            {moment.message}
                                        </p>
                                        {moment.suggestion && (
                                            <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                                                💡 {moment.suggestion}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Overall Score */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <ChartBarIcon className="w-5 h-5" />
                                Pontuação Geral
                            </h3>

                            <div className="text-center">
                                <div className={`text-5xl font-bold mb-2 ${getScoreColor(analysis.overall_score)}`}>
                                    {analysis.overall_score}
                                </div>
                                <div className={`px-4 py-2 rounded-full text-sm font-medium ${getScoreBg(analysis.overall_score)} ${getScoreColor(analysis.overall_score)}`}>
                                    {analysis.overall_score >= 80 ? 'Excelente' :
                                     analysis.overall_score >= 60 ? 'Bom' : 'Precisa Melhorar'}
                                </div>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">📈 Métricas Detalhadas</h3>

                            <div className="space-y-4">
                                {[
                                    { key: 'speech_clarity', label: 'Clareza da Fala', icon: '🗣️' },
                                    { key: 'confidence_level', label: 'Nível de Confiança', icon: '💪' },
                                    { key: 'engagement', label: 'Engajamento', icon: '✨' },
                                    { key: 'technical_accuracy', label: 'Precisão Técnica', icon: '🎯' }
                                ].map(({ key, label, icon }) => {
                                    const value = analysis.metrics[key as keyof typeof analysis.metrics];
                                    return (
                                        <div key={key} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <span>{icon}</span>
                                                    {label}
                                                </span>
                                                <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                                                    {value}%
                                                </span>
                                            </div>
                                            <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        value >= 80 ? 'bg-green-500' :
                                                        value >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${value}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-slate-700/30">
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-4">📋 Resumo da Análise</h3>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Pontos Fortes
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.summary.strengths.map((strength, index) => (
                                            <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                <span className="text-green-500 mt-0.5">•</span>
                                                {strength}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-yellow-700 dark:text-yellow-400 mb-2 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Áreas para Melhorar
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.summary.improvements.map((improvement, index) => (
                                            <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                <span className="text-yellow-500 mt-0.5">•</span>
                                                {improvement}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
                                        <InformationCircleIcon className="w-4 h-4" />
                                        Pontos-Chave
                                    </h4>
                                    <ul className="space-y-1">
                                        {analysis.summary.keyPoints.map((point, index) => (
                                            <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                                <span className="text-blue-500 mt-0.5">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                        >
                            Voltar às Simulações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoTimelineAnalysisPage;