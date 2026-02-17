import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// PT-BR
import commonPtBR from './locales/pt-BR/common.json';
import homePtBR from './locales/pt-BR/home.json';
import authPtBR from './locales/pt-BR/auth.json';
import quizPtBR from './locales/pt-BR/quiz.json';
import interviewPtBR from './locales/pt-BR/interview.json';
import flashcardPtBR from './locales/pt-BR/flashcard.json';
import profilePtBR from './locales/pt-BR/profile.json';
import settingsPtBR from './locales/pt-BR/settings.json';
import tokensPtBR from './locales/pt-BR/tokens.json';
import adminPtBR from './locales/pt-BR/admin.json';
import socialPtBR from './locales/pt-BR/social.json';
import onboardingPtBR from './locales/pt-BR/onboarding.json';
import rewardsPtBR from './locales/pt-BR/rewards.json';
import errorsPtBR from './locales/pt-BR/errors.json';
import searchPtBR from './locales/pt-BR/search.json';
import footerPtBR from './locales/pt-BR/footer.json';
import heatmapPtBR from './locales/pt-BR/heatmap.json';
import termsPtBR from './locales/pt-BR/terms.json';
import privacyPtBR from './locales/pt-BR/privacy.json';

// EN
import commonEn from './locales/en/common.json';
import homeEn from './locales/en/home.json';
import authEn from './locales/en/auth.json';
import quizEn from './locales/en/quiz.json';
import interviewEn from './locales/en/interview.json';
import flashcardEn from './locales/en/flashcard.json';
import profileEn from './locales/en/profile.json';
import settingsEn from './locales/en/settings.json';
import tokensEn from './locales/en/tokens.json';
import adminEn from './locales/en/admin.json';
import socialEn from './locales/en/social.json';
import onboardingEn from './locales/en/onboarding.json';
import rewardsEn from './locales/en/rewards.json';
import errorsEn from './locales/en/errors.json';
import searchEn from './locales/en/search.json';
import footerEn from './locales/en/footer.json';
import heatmapEn from './locales/en/heatmap.json';
import termsEn from './locales/en/terms.json';
import privacyEn from './locales/en/privacy.json';

const namespaces = [
  'common', 'home', 'auth', 'quiz', 'interview', 'flashcard',
  'profile', 'settings', 'tokens', 'admin', 'social',
  'onboarding', 'rewards', 'errors', 'search', 'footer', 'heatmap',
  'terms', 'privacy',
] as const;

const resources = {
  'pt-BR': {
    common: commonPtBR,
    home: homePtBR,
    auth: authPtBR,
    quiz: quizPtBR,
    interview: interviewPtBR,
    flashcard: flashcardPtBR,
    profile: profilePtBR,
    settings: settingsPtBR,
    tokens: tokensPtBR,
    admin: adminPtBR,
    social: socialPtBR,
    onboarding: onboardingPtBR,
    rewards: rewardsPtBR,
    errors: errorsPtBR,
    search: searchPtBR,
    footer: footerPtBR,
    heatmap: heatmapPtBR,
    terms: termsPtBR,
    privacy: privacyPtBR,
  },
  en: {
    common: commonEn,
    home: homeEn,
    auth: authEn,
    quiz: quizEn,
    interview: interviewEn,
    flashcard: flashcardEn,
    profile: profileEn,
    settings: settingsEn,
    tokens: tokensEn,
    admin: adminEn,
    social: socialEn,
    onboarding: onboardingEn,
    rewards: rewardsEn,
    errors: errorsEn,
    search: searchEn,
    footer: footerEn,
    heatmap: heatmapEn,
    terms: termsEn,
    privacy: privacyEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    ns: [...namespaces],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
