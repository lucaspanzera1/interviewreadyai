import { useState } from 'react';
import { apiClient, CompleteOnboardingData } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const NICHOS = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'educacao', label: 'Educação' },
  { value: 'recursos_humanos', label: 'Recursos Humanos' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'saude', label: 'Saúde' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'outro', label: 'Outro' },
];

const CAREER_TIMES = [
  { value: '0-1', label: '0-1 ano' },
  { value: '1-3', label: '1-3 anos' },
  { value: '3-5', label: '3-5 anos' },
  { value: '5-10', label: '5-10 anos' },
  { value: '10+', label: '10+ anos' },
];

const TECH_STACK_OPTIONS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
  'AWS', 'Azure', 'GCP', 'Git', 'Linux', 'Figma', 'Adobe XD'
];

const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CompleteOnboardingData>({
    careerTime: '',
    niche: '',
    techStack: [],
    bio: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    hasCompletedOnboarding: true,
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTechStackToggle = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack?.includes(tech)
        ? prev.techStack.filter((t) => t !== tech)
        : [...(prev.techStack || []), tech]
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const result = await apiClient.completeOnboarding(formData);
      showToast(result.message || 'Perfil profissional criado com sucesso!', 'success');
      onComplete();
    } catch (error) {
      showToast('Erro ao salvar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${i + 1 === currentStep
            ? 'w-8 bg-primary-600 dark:bg-primary-500'
            : i + 1 < currentStep
              ? 'w-2 bg-primary-200 dark:bg-primary-900'
              : 'w-2 bg-slate-200 dark:bg-slate-700'
            }`}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentStep === 1 && "Bem-vindo(a) a bordo! 🚀"}
              {currentStep === 2 && "Qual seu foco?"}
              {currentStep === 3 && "Suas ferramentas"}
              {currentStep === 4 && "Toque final"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {currentStep === 1 && "Vamos personalizar sua experiência."}
              {currentStep === 2 && "Para sugerirmos as melhores vagas."}
              {currentStep === 3 && "O que você domina ou está aprendendo."}
              {currentStep === 4 && "Onde te encontrar?"}
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-2">
          <StepIndicator />

          <div className="animate-fadeIn">
            {currentStep === 1 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Tempo de experiência na área tech
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {CAREER_TIMES.map((option) => {
                    const isSelected = formData.careerTime === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFormData(prev => ({ ...prev, careerTime: option.value }))}
                        className={`group relative flex items-center p-4 cursor-pointer border rounded-xl transition-all duration-200 text-left
                          ${isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 ring-1 ring-primary-500'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                          }`}
                      >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 transition-colors
                          ${isSelected
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-slate-700 dark:text-slate-200'}`}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Selecione sua área de atuação principal
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {NICHOS.map((area) => {
                    const isSelected = formData.niche === area.value;
                    return (
                      <button
                        key={area.value}
                        onClick={() => setFormData(prev => ({ ...prev, niche: area.value }))}
                        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 text-center gap-3
                          ${isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                          }`}
                      >
                        <span className={`font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}>
                          {area.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">
                  Selecione as tecnologias que você utiliza
                </label>
                <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto content-start">
                  {TECH_STACK_OPTIONS.map((tech) => {
                    const isSelected = formData.techStack?.includes(tech);
                    return (
                      <button
                        key={tech}
                        onClick={() => handleTechStackToggle(tech)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                          ${isSelected
                            ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30 transform scale-105'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                      >
                        {tech}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Onde você está?
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: São Paulo, SP"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      placeholder="linkedin.com/in/..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      GitHub
                    </label>
                    <input
                      type="url"
                      value={formData.githubUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                      placeholder="github.com/..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Bio curta
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Resuma sua jornada profissional..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <button
            onClick={handleSkip}
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            Pular configuração
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Voltar
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.careerTime) ||
                  (currentStep === 2 && !formData.niche) ||
                  (currentStep === 3 && (formData.techStack?.length || 0) === 0)
                }
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
              >
                {loading ? 'Salvando...' : 'Concluir Perfil'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;