import { useAuth } from '../contexts/AuthContext';
import OnboardingModal from './OnboardingModal';

function OnboardingProvider() {
  const { showOnboarding, completeOnboarding } = useAuth();

  return (
    <OnboardingModal
      isOpen={showOnboarding}
      onComplete={completeOnboarding}
    />
  );
}

export default OnboardingProvider;