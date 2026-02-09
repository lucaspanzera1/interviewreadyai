import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ChartBarIcon,
    ChevronLeftIcon,
    SpeakerWaveIcon,
    VideoCameraIcon,
    CpuChipIcon,
    LightBulbIcon,
    ListBulletIcon,
    ClockIcon,
    ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { PlayIcon as PlayIconSolid, PauseIcon as PauseIconSolid } from '@heroicons/react/24/solid';
import { apiClient } from '../lib/api';


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
    videoPaths?: string[];
    analysis?: VideoAnalysisResult;
    completedAt?: string;
}

// --- Utility Components ---

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const TechBadge = ({ children, color = 'blue', className }: { children: React.ReactNode, color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple', className?: string }) => {
    const styles = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
        red: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
        yellow: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
        purple: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20',
    };

    return (
        <span className={cn(`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${styles[color]}`, className)}>
            {children}
        </span>
    );
};

const AnimatedCircularProgress = ({ value, label, icon: Icon, color }: { value: number, label: string, icon: any, color: 'blue' | 'green' | 'purple' | 'yellow' }) => {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    const colorMap = {
        blue: { stroke: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-600 dark:text-blue-400' },
        green: { stroke: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', text: 'text-emerald-600 dark:text-emerald-400' },
        purple: { stroke: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10', text: 'text-indigo-600 dark:text-indigo-400' },
        yellow: { stroke: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-600 dark:text-amber-400' },
    };

    const c = colorMap[color];

    return (
        <div className={cn("group relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300",
            "bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-black/20")}>

            <div className="relative w-24 h-24">
                {/* Background Ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="48" cy="48" r={radius}
                        className="text-slate-100 dark:text-slate-800"
                        strokeWidth="8" fill="transparent" stroke="currentColor"
                    />
                    {/* Interactive Ring */}
                    <circle
                        cx="48" cy="48" r={radius}
                        className={cn("transition-all duration-1000 ease-out", c.stroke)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        stroke="currentColor"
                    />
                </svg>

                {/* Center Icon/Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Icon className={cn("w-6 h-6 mb-1 opacity-50 group-hover:opacity-100 transition-opacity duration-300", c.text)} />
                    <span className={cn("text-xl font-bold font-mono", c.text)}>{value}</span>
                </div>
            </div>

            <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
};

// --- Main Component ---

const VideoTimelineAnalysisPage: React.FC = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    // UI States
    const [activeTab, setActiveTab] = useState<'feed' | 'summary' | 'videos'>('feed');
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [isHoveringVideo, setIsHoveringVideo] = useState(false);

    const token = localStorage.getItem('access_token');
    const currentVideoPath = analysisData?.videoPaths?.[currentVideoIndex] || analysisData?.videoPath;

    useEffect(() => {
        if (attemptId) fetchAnalysis();
    }, [attemptId]);

    useEffect(() => {
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
    }, [currentVideoIndex]);

    useEffect(() => {
        if (!attemptId) return;
        const interval = setInterval(() => {
            if (analysisData?.status === 'pending' || analysisData?.status === 'processing') {
                fetchAnalysis();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [attemptId, analysisData?.status]);

    // Auto-scroll feedback feed
    useEffect(() => {
        if (activeTab === 'feed' && isPlaying && scrollContainerRef.current) {
            const activeElement = document.getElementById(`moment-card-active`);
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentTime, activeTab, isPlaying]);

    const fetchAnalysis = async () => {
        if (!attemptId) {
            setError('Attempt ID missing');
            setLoading(false);
            return;
        }
        try {
            const response = await apiClient.getVideoAnalysis(attemptId);
            setAnalysisData(response);
            if (response.analysis) setDuration(response.analysis.duration);
            setError(null);
        } catch (error) {
            console.error(error);
            setError('Unable to retrieve analysis data');
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

    const togglePlayPause = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play();
            setIsPlaying(true);
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

    const handleTimelineSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || !duration) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const newTime = percentage * duration;

        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Data Processing
    const analysis = analysisData?.analysis;
    const moments = useMemo(() => {
        if (!analysis?.moments) return [];
        return analysis.moments
            .filter(m => activeFilter === 'all' || m.type === activeFilter)
            .sort((a, b) => a.timestamp - b.timestamp);
    }, [analysis, activeFilter]);

    // Render Logic
    if (loading) return <LoadingScreen />;
    if (error) return <ErrorScreen error={error} onBack={() => navigate('/my-interviews')} />;
    if (analysisData?.status === 'pending' || analysisData?.status === 'processing') return <ProcessingScreen status={analysisData.status} />;
    if (!analysis) return null;

    const currentMoment = moments.find(m => Math.abs(currentTime - m.timestamp) < 2);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* --- Top Navigation Bar --- */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
                <div className="max-w-[1920px] mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/my-interviews')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                                <ChevronLeftIcon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-sm hidden sm:block">Back</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Analysis Report</h1>
                            <p className="text-xs text-slate-500 font-mono">ID: {attemptId?.substring(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 rounded-lg px-4 py-2 border border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Score</span>
                            <span className={cn(
                                "text-lg font-bold font-mono",
                                analysis.overall_score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                                    analysis.overall_score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                            )}>
                                {analysis.overall_score}<span className="text-sm text-slate-400">/100</span>
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- Main Dashboard Content --- */}
            <main className="pt-24 pb-8 px-6 max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-screen">

                {/* Left Column: Video Player & Metrics (Span 8) */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-8rem)] min-h-[600px]">

                    {/* Video Player Card */}
                    <div
                        className="relative flex-1 bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 group"
                        onMouseEnter={() => setIsHoveringVideo(true)}
                        onMouseLeave={() => setIsHoveringVideo(false)}
                    >
                        {analysisData.hasVideo && currentVideoPath ? (
                            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
                                <video
                                    ref={videoRef}
                                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/interview/video/${currentVideoPath.replace('/uploads/videos/', '')}${token ? `?token=${token}` : ''}`}
                                    className="w-full h-full max-h-full object-contain"
                                    onTimeUpdate={handleTimeUpdate}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onClick={togglePlayPause}
                                    crossOrigin="use-credentials"
                                    preload="metadata"
                                    onError={(e) => {
                                        console.error('[VideoPlayer] Error loading video:', e);
                                        console.log('[VideoPlayer] Video source:', e.currentTarget.src);
                                    }}
                                    onLoadStart={() => console.log('[VideoPlayer] Started loading video')}
                                    onCanPlay={() => console.log('[VideoPlayer] Video can play')}
                                />

                                {/* Overlay Gradient - Only shows when hovering or paused */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 pointer-events-none",
                                    isHoveringVideo || !isPlaying ? 'opacity-100' : 'opacity-0'
                                )} />

                                {/* Center Play Button */}
                                {!isPlaying && (
                                    <button
                                        onClick={togglePlayPause}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white transition-all transform hover:scale-110 shadow-xl group/btn"
                                    >
                                        <PlayIconSolid className="w-8 h-8 ml-1 group-hover/btn:text-indigo-300 transition-colors" />
                                    </button>
                                )}

                                {/* Bottom Controls Bar */}
                                <div className={cn(
                                    "absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 transform",
                                    isHoveringVideo || !isPlaying ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                )}>
                                    {/* Timeline Slider */}
                                    <div
                                        className="relative h-2 w-full bg-white/20 rounded-full cursor-pointer mb-4 group/timeline"
                                        ref={timelineRef}
                                        onClick={handleTimelineSeek}
                                    >
                                        {/* Progress Bar */}
                                        <div
                                            className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        >
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg scale-0 group-hover/timeline:scale-100 transition-transform" />
                                        </div>

                                        {/* Markers */}
                                        {moments.map((m, i) => (
                                            <div
                                                key={i}
                                                className={cn(
                                                    "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full transform transition-all hover:scale-150 cursor-pointer",
                                                    m.type === 'positive' ? 'bg-emerald-400' :
                                                        m.type === 'improvement' ? 'bg-amber-400' :
                                                            m.type === 'warning' ? 'bg-rose-400' : 'bg-blue-400'
                                                )}
                                                style={{ left: `${(m.timestamp / duration) * 100}%` }}
                                                onClick={(e) => { e.stopPropagation(); jumpToMoment(m.timestamp); }}
                                                title={m.message}
                                            />
                                        ))}
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex items-center justify-between pointer-events-auto">
                                        <div className="flex items-center gap-4">
                                            <button onClick={togglePlayPause} className="text-white hover:text-indigo-400 transition-colors">
                                                {isPlaying ? <PauseIconSolid className="w-6 h-6" /> : <PlayIconSolid className="w-6 h-6" />}
                                            </button>
                                            <div className="text-sm font-mono text-white/80">
                                                <span>{formatTime(currentTime)}</span>
                                                <span className="mx-2 text-white/40">/</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>

                                        {/* Current Analysis Pop-up (over video) */}
                                        {currentMoment && (
                                            <div className="hidden md:flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 animate-fade-in-up">
                                                <div className={cn("w-2 h-2 rounded-full",
                                                    currentMoment.type === 'positive' ? 'bg-emerald-500' :
                                                        currentMoment.type === 'improvement' ? 'bg-amber-500' : 'bg-blue-500'
                                                )} />
                                                <span className="text-sm text-white/90 max-w-[300px] truncate">{currentMoment.message}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {/* Could add fullscreen or playback speed here */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400">
                                <div className="text-center">
                                    <VideoCameraIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                                    <p>No Video Source Available</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics Strip */}
                    <div className="h-40 grid grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
                        <AnimatedCircularProgress value={analysis.metrics?.speech_clarity || 0} label="Clarity" icon={SpeakerWaveIcon} color="blue" />
                        <AnimatedCircularProgress value={analysis.metrics?.confidence_level || 0} label="Confidence" icon={ChartBarIcon} color="green" />
                        <AnimatedCircularProgress value={analysis.metrics?.engagement || 0} label="Engagement" icon={CpuChipIcon} color="purple" />
                        <AnimatedCircularProgress value={analysis.metrics?.technical_accuracy || 0} label="Accuracy" icon={CheckCircleIcon} color="yellow" />
                    </div>
                </div>

                {/* Right Column: Interactive Sidebar (Span 4) */}
                <div className="lg:col-span-4 flex flex-col h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveTab('feed')}
                            className={cn("flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2",
                                activeTab === 'feed'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <ListBulletIcon className="w-4 h-4" /> Feedback
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={cn("flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2",
                                activeTab === 'summary'
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                            )}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <LightBulbIcon className="w-4 h-4" /> Insights
                            </div>
                        </button>
                        {analysisData.videoPaths && analysisData.videoPaths.length > 1 && (
                            <button
                                onClick={() => setActiveTab('videos')}
                                className={cn("flex-1 py-4 text-sm font-semibold uppercase tracking-wider transition-colors border-b-2",
                                    activeTab === 'videos'
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                )}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <VideoCameraIcon className="w-4 h-4" /> Clips ({analysisData.videoPaths.length})
                                </div>
                            </button>
                        )}
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50">
                        {/* Feed Tab */}
                        {activeTab === 'feed' && (
                            <div className="h-full flex flex-col">
                                {/* Filters */}
                                <div className="p-3 grid grid-cols-4 gap-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    {[
                                        { id: 'all', icon: ChartBarIcon, label: 'All' },
                                        { id: 'positive', icon: CheckCircleIcon, label: 'Good' },
                                        { id: 'improvement', icon: ArrowPathIcon, label: 'Fix' },
                                        { id: 'warning', icon: ExclamationTriangleIcon, label: 'Alert' }
                                    ].map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setActiveFilter(f.id)}
                                            className={cn("flex flex-col items-center justify-center py-2 rounded-lg text-xs font-medium transition-all",
                                                activeFilter === f.id
                                                    ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/20'
                                                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            )}
                                        >
                                            <f.icon className={cn("w-4 h-4 mb-1",
                                                activeFilter === f.id ? 'text-indigo-500' : 'text-slate-400'
                                            )} />
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {moments.length === 0 ? (
                                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-center">
                                            <InformationCircleIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <p className="text-sm">No moments found for this filter.</p>
                                        </div>
                                    ) : (
                                        moments.map((moment, idx) => {
                                            const isActive = Math.abs(currentTime - moment.timestamp) < 2;
                                            return (
                                                <div
                                                    key={idx}
                                                    id={isActive ? "moment-card-active" : undefined}
                                                    onClick={() => jumpToMoment(moment.timestamp)}
                                                    className={cn(
                                                        "relative p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                                                        isActive
                                                            ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105 z-10'
                                                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md'
                                                    )}
                                                >
                                                    {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full" />}

                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                                                                <ClockIcon className="w-3 h-3" />
                                                                {formatTime(moment.timestamp)}
                                                            </div>
                                                            <TechBadge color={
                                                                moment.type === 'positive' ? 'green' :
                                                                    moment.type === 'warning' ? 'red' :
                                                                        moment.type === 'improvement' ? 'yellow' : 'blue'
                                                            }>{moment.category}</TechBadge>
                                                        </div>
                                                        {moment.type === 'positive' && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                                                        {moment.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" />}
                                                        {moment.type === 'improvement' && <ArrowPathIcon className="w-5 h-5 text-amber-500" />}
                                                    </div>

                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {moment.message}
                                                    </p>

                                                    {moment.suggestion && (
                                                        <div className="mt-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-200/80 flex gap-2 items-start">
                                                            <LightBulbIcon className="w-4 h-4 shrink-0 mt-0.5" />
                                                            <span>{moment.suggestion}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div className="h-8" /> {/* Spacer */}
                                </div>
                            </div>
                        )}

                        {/* Summary Tab */}
                        {activeTab === 'summary' && (
                            <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5" /> Key Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {analysis.summary.strengths.map((s, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-800" />

                                <div>
                                    <h3 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ArrowPathIcon className="w-5 h-5" /> Areas for Growth
                                    </h3>
                                    <ul className="space-y-3">
                                        {analysis.summary.improvements.map((s, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                                                {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {analysis.summary.keyPoints && analysis.summary.keyPoints.length > 0 && (
                                    <>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800" />
                                        <div>
                                            <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <CpuChipIcon className="w-5 h-5" /> Analysis Notes
                                            </h3>
                                            <ul className="space-y-3">
                                                {analysis.summary.keyPoints.map((s, i) => (
                                                    <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0" />
                                                        {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Videos Tab */}
                        {activeTab === 'videos' && analysisData.videoPaths && (
                            <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {analysisData.videoPaths.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setCurrentVideoIndex(index);
                                            setCurrentTime(0);
                                            setIsPlaying(false);
                                        }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all hover:shadow-md",
                                            index === currentVideoIndex
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-500/50 ring-1 ring-blue-500/20'
                                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-14 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
                                                <VideoCameraIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white">Video Segment {index + 1}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Question {index + 1}</p>
                                            </div>
                                            {index === currentVideoIndex && (
                                                <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* --- Global Styles for Animations & Scrollbars --- */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { 
                    background: #cbd5e1; 
                    border-radius: 10px; 
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
                
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

// --- Helper Screens ---

const LoadingScreen = () => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <CpuChipIcon className="absolute inset-0 m-auto w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Initializing Analysis Engine</h2>
        <p className="text-slate-500 dark:text-slate-400">Decryption and biometric processing in progress...</p>
    </div>
);

const ProcessingScreen = ({ status }: { status: string }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient-x"></div>

            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowsPointingOutIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analyzing Interview</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                Our AI is currently processing your video content. This usually takes 1-2 minutes.
            </p>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Status</span>
                    <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/10 px-2 py-1 rounded uppercase">{status}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-2/3 animate-loading-bar"></div>
                </div>
            </div>

            <button
                onClick={() => window.location.href = '/my-interviews'}
                className="mt-8 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                Return to Dashboard
            </button>
        </div>
        <style>{`
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

const ErrorScreen = ({ error, onBack }: { error: string, onBack: () => void }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-red-100 dark:border-red-900/30 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Analysis Failed</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
            <button
                onClick={onBack}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
                Return to Dashboard
            </button>
        </div>
    </div>
);

export default VideoTimelineAnalysisPage;