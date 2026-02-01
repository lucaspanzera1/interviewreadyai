import React, { useState } from 'react';
import {
    XMarkIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    SparklesIcon,
    BoltIcon,
    ChartBarIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface OnboardingGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const steps = [
    {
        title: "Bem-vindo ao TreinaVaga",
        description: "Sua plataforma definitiva para preparação técnica e evolução de carreira. Vamos fazer um tour rápido?",
        icon: SparklesIcon,
        color: "from-primary-500 to-indigo-600",
        image: "welcome"
    },
    {
        title: "Simulados Inteligentes",
        description: "Pratique com quizzes gerados por IA personalizados para sua senioridade ou explore nossa biblioteca comunitária.",
        icon: BoltIcon,
        color: "from-amber-400 to-orange-500",
        image: "quizzes"
    },
    {
        title: "Sistema de Tokens",
        description: "Ganhe tokens completando desafios e mantendo sua ofensiva. Use-os para gerar simulados avançados e mentorias.",
        icon: CurrencyDollarIcon,
        color: "from-emerald-400 to-teal-500",
        image: "tokens"
    },
    {
        title: "Métricas e Evolução",
        description: "Acompanhe seu progresso detalhado. Identifique pontos fracos e compare seu desempenho no ranking global.",
        icon: ChartBarIcon,
        color: "from-purple-500 to-pink-500",
        image: "metrics"
    }
];

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
            setTimeout(() => setCurrentStep(0), 300); // Reset after closing
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const stepData = steps[currentStep];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-white/20 ring-1 ring-black/5">

                {/* Header Content with Gradient Background */}
                <div className={`relative h-48 bg-gradient-to-br ${stepData.color} p-8 flex flex-col justify-center items-center text-center transition-colors duration-500`}>
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 rounded-full bg-white blur-3xl" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 rounded-full bg-black blur-3xl" />
                    </div>

                    <div className="relative z-10 bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-lg ring-1 ring-white/30 mb-2 transform transition-all duration-500 hover:scale-105">
                        {currentStep === 0 ? (
                            <img src="/logo.png" alt="TreinaVaga" className="w-12 h-12 object-contain" />
                        ) : (
                            <stepData.icon className="w-10 h-10 text-white" />
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-8 pb-6">
                    <div className="min-h-[120px] text-center">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-all">
                            {stepData.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {stepData.description}
                        </p>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center space-x-2 my-6">
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep
                                    ? 'w-8 bg-primary-600 dark:bg-primary-500'
                                    : 'w-2 bg-slate-200 dark:bg-slate-700'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-colors ${currentStep === 0
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                        >
                            <ChevronLeftIcon className="w-4 h-4" />
                            Anterior
                        </button>

                        <button
                            onClick={handleNext}
                            className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transform active:scale-95 transition-all"
                        >
                            {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                            {currentStep !== steps.length - 1 && <ChevronRightIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingGuide;
