import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    PlayIcon,
    PauseIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    SpeakerWaveIcon,
    VideoCameraIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

// --- Types ---

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

// --- Utility Components ---

const TechBadge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
        green: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        red: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
        yellow: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        purple: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    };

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-mono border ${colors[color] || colors.blue}`}>
            {children}
        </span>
    );
};

const RadialProgress = ({ value, label, icon: Icon, color = 'blue' }: { value: number, label: string, icon: any, color?: string }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const colors: Record<string, string> = {
        blue: 'text-blue-600 dark:text-blue-500',
        green: 'text-emerald-600 dark:text-emerald-500',
        yellow: 'text-amber-600 dark:text-amber-500',
        purple: 'text-purple-600 dark:text-purple-500',
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 relative group hover:border-gray-300 dark:hover:border-slate-700 transition-all shadow-sm dark:shadow-none">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="transform -rotate-90 w-24 h-24">
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-gray-200 dark:text-slate-800"
                    />
                    <circle
                        cx="48"
                        cy="48"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={`${colors[color]} transition-all duration-1000 ease-out`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center opacity-70 dark:opacity-50 group-hover:opacity-100 transition-opacity">
                    <Icon className={`w-8 h-8 ${colors[color]}`} />
                </div>
            </div>
            <div className="mt-2 text-center">
                <div className="text-2xl font-bold font-mono text-gray-800 dark:text-white">{value}%</div>
                <div className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wider">{label}</div>
            </div>
        </div>
    );
};

// --- Main Component ---

const VideoTimelineAnalysisPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const { /* showToast */ } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        if (attemptId) {
            fetchAnalysis();
        }
    }, [attemptId]);

    // Polling logic
    useEffect(() => {
        if (!attemptId) return;
        const interval = setInterval(() => {
            if (analysisData?.status === 'pending' || analysisData?.status === 'processing') {
                fetchAnalysis();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [attemptId, analysisData?.status]);

    const fetchAnalysis = async () => {
        if (!attemptId) {
            setError('ID da tentativa não encontrado');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.getVideoAnalysis(attemptId);
            setAnalysisData(response);
            if (response.analysis) {
                setDuration(response.analysis.duration);
            }
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
            if (!duration) setDuration(videoRef.current.duration);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const jumpToMoment = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || !duration) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        const newTime = percentage * duration;

        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const filteredMoments = analysisData?.analysis?.moments ?
        analysisData.analysis.moments.filter(moment =>
            activeFilter === 'all' || moment.category === activeFilter || moment.type === activeFilter
        ).sort((a, b) => a.timestamp - b.timestamp) : [];

    // --- Render States ---

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center font-mono transition-colors duration-300">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin"></div>
                    <div className="text-blue-600 dark:text-blue-400 animate-pulse font-medium">INITIATING ANALYSIS PROTOCOL...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center font-mono transition-colors duration-300">
                <div className="text-center p-8 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-900/10 rounded-lg max-w-md shadow-lg dark:shadow-none">
                    <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl text-red-600 dark:text-red-400 mb-2">SYSTEM ERROR</h2>
                    <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/my-interviews')}
                        className="px-6 py-2 bg-white dark:bg-red-500/10 hover:bg-gray-50 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/50 rounded transition-colors"
                    >
                        RETURN TO DASHBOARD
                    </button>
                </div>
            </div>
        );
    }

    if (analysisData?.status === 'pending' || analysisData?.status === 'processing') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-mono flex flex-col items-center justify-center p-4 transition-colors duration-300">
                <div className="max-w-xl w-full bg-white dark:bg-slate-900/50 backdrop-blur-md border border-gray-200 dark:border-slate-800 rounded-2xl p-8 relative overflow-hidden shadow-xl dark:shadow-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-loading-bar"></div>
                    <div className="text-center">
                        <CpuChipIcon className="w-16 h-16 text-blue-600 dark:text-blue-500 mx-auto mb-6 animate-pulse" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            ANALYZING BIOMETRICS & CONTENT
                        </h2>
                        <p className="text-gray-600 dark:text-slate-400 mb-8">
                            Our AI is processing your video feed to extract behavioral metrics.
                            <br />Status: <span className="text-blue-600 dark:text-blue-400 uppercase font-medium">{analysisData?.status}</span>
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-left text-sm text-gray-600 dark:text-slate-500 mb-8">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                                Audio Spectrum Analysis
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping delay-100"></span>
                                Facial Micro-expressions
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping delay-200"></span>
                                Semantic Content Review
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping delay-300"></span>
                                Engagement Scoring
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="text-gray-500 hover:text-gray-800 dark:text-slate-500 dark:hover:text-white transition-colors text-sm flex items-center justify-center gap-2 mx-auto"
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const analysis = analysisData?.analysis;
    if (!analysis) return null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-300 font-sans selection:bg-blue-500/30 transition-colors duration-300">
            {/* Header / Nav */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur fixed top-0 w-full z-50 transition-colors duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-sm font-mono text-gray-500 dark:text-slate-500 uppercase tracking-widest leading-none">Analysis Protocol</h1>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 leading-none mt-1">
                                <span>SESSION #{attemptId?.substring(0, 8).toUpperCase()}</span>
                                <TechBadge color="green">COMPLETED</TechBadge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="text-right hidden md:block">
                            <div className="text-[10px] text-gray-500 dark:text-slate-500 font-mono uppercase tracking-wider">Overall Perf.</div>
                            <div className={`text-xl font-bold font-mono ${analysis.overall_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : analysis.overall_score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {analysis.overall_score}/100
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-20 pb-4 px-4 max-w-[1600px] mx-auto h-screen flex flex-col items-stretch">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full pb-4">

                    {/* Left Column: Video & Timeline (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
                        {/* Video Player Container */}
                        <div className="relative bg-black rounded-xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200 dark:border-slate-800 group flex-grow min-h-0">
                            {analysisData?.hasVideo && analysisData.videoPath ? (
                                <video
                                    ref={videoRef}
                                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${analysisData.videoPath}`}
                                    className="w-full h-full object-contain bg-gray-50 dark:bg-black"
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={togglePlayPause}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-600 bg-gray-100 dark:bg-slate-900">
                                    <div className="text-center">
                                        <VideoCameraIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>No Video Signal</p>
                                    </div>
                                </div>
                            )}

                            {/* Video Overlay Controls */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-t from-gray-900/90 dark:from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6 transition-opacity duration-300 ${isPlaying && !showControls ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
                                onMouseEnter={() => setShowControls(true)}
                                onMouseLeave={() => isPlaying && setShowControls(false)}
                            >
                                <div className="flex items-center justify-center absolute inset-0 pointer-events-none">
                                    {!isPlaying && (
                                        <div className="w-20 h-20 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/30 dark:border-white/20 shadow-lg pointer-events-auto cursor-pointer hover:bg-white/30 dark:hover:bg-white/20 transition-all group/play" onClick={togglePlayPause}>
                                            <PlayIcon className="w-10 h-10 text-white ml-2 group-hover/play:scale-110 transition-transform" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pointer-events-auto">
                                    {/* Timeline Scrubber */}
                                    <div
                                        className="h-8 relative group/timeline cursor-pointer"
                                        ref={timelineRef}
                                        onClick={handleTimelineClick}
                                    >
                                        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-gray-400/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full relative"
                                                style={{ width: `${(currentTime / duration) * 100}%` }}
                                            >
                                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-blue-500/50 scale-0 group-hover/timeline:scale-100 transition-transform border-2 border-blue-500 z-20" />
                                            </div>
                                        </div>

                                        {/* Moment Markers on Timeline */}
                                        {analysis.moments.map((moment, idx) => (
                                            <div
                                                key={idx}
                                                className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10 hover:scale-150 transition-transform ${moment.type === 'positive' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                                    moment.type === 'warning' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' :
                                                        moment.type === 'improvement' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                                                    }`}
                                                style={{ left: `${(moment.timestamp / duration) * 100}%` }}
                                                title={`${moment.type}: ${moment.message}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    jumpToMoment(moment.timestamp);
                                                }}
                                            />
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between font-mono text-xs tracking-wider uppercase text-gray-300 dark:text-slate-400">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlayPause} className="hover:text-white transition-colors">
                                                {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                            </button>
                                            <div className="flex gap-1">
                                                <span className="text-white">{formatTime(currentTime)}</span>
                                                <span className="text-gray-400 dark:text-slate-600">/</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-none h-40">
                            {[
                                { key: 'speech_clarity', label: 'Clarity', icon: SpeakerWaveIcon, color: 'blue' },
                                { key: 'confidence_level', label: 'Confidence', icon: ChartBarIcon, color: 'green' },
                                { key: 'engagement', label: 'Engagement', icon: CpuChipIcon, color: 'purple' },
                                { key: 'technical_accuracy', label: 'Accuracy', icon: CheckCircleIcon, color: 'yellow' }
                            ].map((m) => {
                                const metrics = analysis.metrics || {};
                                const value = metrics[m.key as keyof typeof metrics] || 0;
                                return (
                                    <RadialProgress
                                        key={m.key}
                                        value={value}
                                        label={m.label}
                                        icon={m.icon}
                                        color={m.color}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Analysis Details (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col h-full gap-4 min-h-0">
                        {/* Tab/Filter System */}
                        <div className="grid grid-cols-4 p-1 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 flex-none shadow-sm dark:shadow-none transition-colors duration-300">
                            {[
                                { btn: 'all', icon: ChartBarIcon },
                                { btn: 'positive', icon: CheckCircleIcon },
                                { btn: 'improvement', icon: ArrowPathIcon },
                                { btn: 'warning', icon: ExclamationTriangleIcon }
                            ].map(filter => (
                                <button
                                    key={filter.btn}
                                    onClick={() => setActiveFilter(filter.btn)}
                                    className={`flex items-center justify-center py-2.5 rounded-lg transition-all ${activeFilter === filter.btn
                                        ? 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm dark:shadow-lg'
                                        : 'text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    title={filter.btn}
                                >
                                    <filter.icon className={`w-5 h-5 ${activeFilter === filter.btn
                                        ? filter.btn === 'positive' ? 'text-emerald-500'
                                            : filter.btn === 'warning' ? 'text-rose-500'
                                                : filter.btn === 'improvement' ? 'text-amber-500'
                                                    : 'text-blue-500'
                                        : ''
                                        }`} />
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Feedback Stream */}
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-0 bg-white/50 dark:bg-slate-900/20 rounded-xl border border-gray-200 dark:border-slate-800/50 p-2 transition-colors duration-300">
                            {filteredMoments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 font-mono text-xs border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-xl opacity-50">
                                    <CpuChipIcon className="w-8 h-8 mb-2" />
                                    NO DATA POINTS FOUND
                                </div>
                            ) : (
                                filteredMoments.map((moment, idx) => {
                                    const isActive = Math.abs(currentTime - moment.timestamp) < 2; // Active window

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                jumpToMoment(moment.timestamp);
                                            }}
                                            id={`moment-${moment.timestamp}`}
                                            className={`p-4 rounded-xl border transition-all cursor-pointer group relative overflow-hidden ${isActive
                                                ? 'bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-500/50 shadow-md dark:shadow-lg dark:shadow-blue-500/10 scale-[1.02]'
                                                : 'bg-white/50 dark:bg-slate-900/40 border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800/60'
                                                }`}
                                        >
                                            {isActive && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500" />
                                            )}

                                            <div className="flex justify-between items-start mb-2 pl-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500'}`}>
                                                        {formatTime(moment.timestamp)}
                                                    </span>
                                                    <TechBadge color={
                                                        moment.type === 'positive' ? 'green' :
                                                            moment.type === 'warning' ? 'red' :
                                                                moment.type === 'improvement' ? 'yellow' : 'blue'
                                                    }>{moment.category}</TechBadge>
                                                </div>
                                                {moment.type === 'positive' && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                                {moment.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />}
                                                {moment.type === 'improvement' && <ArrowPathIcon className="w-5 h-5 text-amber-500" />}
                                                {moment.type === 'neutral' && <InformationCircleIcon className="w-5 h-5 text-blue-500" />}
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-slate-300 font-light leading-relaxed pl-2">
                                                {moment.message}
                                            </p>

                                            {moment.suggestion && (
                                                <div className="mt-3 ml-2 text-xs bg-gray-50 dark:bg-slate-950/50 p-3 rounded border border-gray-100 dark:border-slate-800/50 text-gray-500 dark:text-slate-400 flex gap-2">
                                                    <span className="text-amber-500">💡</span>
                                                    {moment.suggestion}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Summary Card */}
                        <div className="card-glass border-gray-200 dark:border-slate-800 flex-none space-y-3">
                            {/* Strengths */}
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <CheckCircleIcon className="w-3 h-3" /> Strengths
                                </h4>
                                <ul className="space-y-1">
                                    {analysis.summary.strengths.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-xs text-emerald-700/80 dark:text-emerald-400/80 truncate">• {s}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Improvements */}
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg p-3">
                                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ArrowPathIcon className="w-3 h-3" /> Focus Areas
                                </h4>
                                <ul className="space-y-1">
                                    {analysis.summary.improvements.slice(0, 2).map((s, i) => (
                                        <li key={i} className="text-xs text-amber-700/80 dark:text-amber-400/80 truncate">• {s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; /* slate-300 */
                    border-radius: 4px;
                }
                /* Dark mode scrollbar */
                @media (prefers-color-scheme: dark) {
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #334155; /* slate-700 */
                    }
                }
                /* Manual dark mode class support if parent has .dark */
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #334155;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; /* slate-400 */
                }
                @media (prefers-color-scheme: dark) {
                     .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                         background: #475569; /* slate-600 */
                     }
                }
                 .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                     background: #475569;
                 }

                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 1.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default VideoTimelineAnalysisPage;