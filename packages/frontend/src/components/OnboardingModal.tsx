import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, CompleteOnboardingData } from '../lib/api';
import { useToast } from '../contexts/ToastContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getNicheIcon } from '../utils/nicheIcons';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const NICHOS = [
  { value: 'tecnologia' },
  { value: 'educacao' },
  { value: 'recursos_humanos' },
  { value: 'financeiro' },
  { value: 'saude' },
  { value: 'vendas' },
  { value: 'marketing' },
  { value: 'juridico' },
  { value: 'engenharia' },
  { value: 'design' },
  { value: 'produto' },
  { value: 'outro' },
];

const CAREER_TIMES = [
  { value: '0-1' },
  { value: '1-3' },
  { value: '3-5' },
  { value: '5-10' },
  { value: '10+' },
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
  const { t } = useTranslation('onboarding');
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

  const isTech = formData.niche === 'tecnologia';
  const effectiveTotalSteps = isTech ? 4 : 3;

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(isTech ? 3 : 4);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 4) {
      setCurrentStep(isTech ? 3 : 2);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(1);
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
      showToast(result.message || t('modal.profileCreatedSuccess'), 'success');
      onComplete();
    } catch (error) {
      showToast(t('modal.errorSaving'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const getActiveStepIndex = () => {
    if (currentStep <= 2) return currentStep - 1;
    if (currentStep === 4) return isTech ? 3 : 2;
    return 2; // currentStep === 3
  };

  if (!isOpen) return null;

  const activeIndex = getActiveStepIndex();

  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: effectiveTotalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${i === activeIndex
            ? 'w-8 bg-primary-600 dark:bg-primary-500'
            : i < activeIndex
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
              {currentStep === 1 && t('modal.stepFocusTitle')}
              {currentStep === 2 && t('modal.stepCareerTimeTitle')}
              {currentStep === 3 && t('modal.stepToolsTitle')}
              {currentStep === 4 && t('modal.stepFinalTitle')}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {currentStep === 1 && t('modal.stepFocusDesc')}
              {currentStep === 2 && t('modal.stepCareerTimeDesc')}
              {currentStep === 3 && t('modal.stepToolsDesc')}
              {currentStep === 4 && t('modal.stepFinalWhereDesc')}
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
                  {t('modal.selectMainArea')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {NICHOS.map((area) => {
                    const isSelected = formData.niche === area.value;
                    return (
                      <button
                        key={area.value}
                        onClick={() => setFormData(prev => ({ ...prev, niche: area.value }))}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 text-center gap-2
                          ${isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                          }`}
                      >
                        {getNicheIcon(area.value, isSelected ? "w-8 h-8 text-primary-600 mb-2" : "w-8 h-8 text-slate-400 mb-2")}
                        <span className={`font-semibold text-sm ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}>
                          {t(`modal.nicheOptions.${area.value}`)}
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
                  {isTech ? t('modal.techExperience') : t('modal.professionalExperience')}
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
                          {t(`modal.careerTimeOptions.${option.value}`)}
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
                  {t('modal.selectTechnologies')}
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
                    {t('modal.whereAreYou')}
                  </label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={t('modal.locationPlaceholder')}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white transition-all"
                  />
                </div>

                <div className={`grid ${isTech ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-4`}>
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
                  {isTech && (
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
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('modal.shortBio')}
                  </label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder={t('modal.bioPlaceholder')}
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
            {t('modal.skipSetup')}
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {t('modal.back')}
              </button>
            )}

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !formData.niche) ||
                  (currentStep === 2 && !formData.careerTime) ||
                  (currentStep === 3 && (formData.techStack?.length || 0) === 0)
                }
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {t('modal.continue')}
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-medium shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-2"
              >
                {loading ? t('modal.saving') : t('modal.completeProfile')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingModal;