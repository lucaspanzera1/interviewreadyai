import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const GlobalTutorial: React.FC = () => {
    const { user, isAuthenticated, showOnboarding } = useAuth();
    const { theme, resolvedTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated || !user) return;
        if (showOnboarding) return; // Esperar o modal de onboarding fechar se existir

        // So roda apenas para usuarios que completaram onboarding 
        if (!user.hasCompletedOnboarding) return;

        const hasSeenTutorialKey = `has_seen_tutorial_${user.id}`;
        const hasSeenTutorial = localStorage.getItem(hasSeenTutorialKey);

        if (hasSeenTutorial) return;

        // Se estivermos aqui, o tutorial precisa rodar
        const stepsConf = [
            {
                path: '/',
                id: '#tour-welcome',
                popover: {
                    title: '🌟 Bem-vindo ao TreinaVaga!',
                    description: 'Vamos fazer um tour rápido de introdução. O TreinaVagaAI ajuda você a conquistar oportunidades com preparação guiada por Inteligência Artificial. Ganhe tokens, melhore seu desempenho e saia na frente!',
                    nextBtnText: 'Vamos lá'
                }
            },
            {
                path: '/create-quiz',
                id: '#tour-create-quiz-page',
                popover: {
                    title: '📝 Simulados Inteligentes',
                    description: 'Treine seus conhecimentos técnicos! Gere testes personalizados colando o link de uma vaga (LinkedIn, Gupy, etc.) ou digitando um tema específico. Avalie seus pontos exatos de melhoria.',
                    nextBtnText: 'Próximo'
                }
            },
            {
                path: '/create-interview',
                id: '#tour-create-interview-page',
                popover: {
                    title: '💼 Simulador de Entrevista',
                    description: 'A prática leva à perfeição! Nossa IA vai conduzir uma entrevista simulada conversando e analisando suas respostas para te dar feedbacks valiosos de como impressionar os recrutadores.',
                    nextBtnText: 'Próximo'
                }
            },
            {
                path: '/create-flashcard',
                id: '#tour-create-flashcard-page',
                popover: {
                    title: '🧠 Flashcards & Memorização',
                    description: 'Não esqueça o que aprendeu. Crie decks dinâmicos para revisão espaçada (SRS). Transforme requisitos complexos de vagas em cartões fáceis de memorizar. Pronto para evoluir na sua carreira?',
                    doneBtnText: 'Concluir Tour'
                }
            }
        ];

        const currentStepIndex = stepsConf.findIndex(s => s.path === location.pathname);

        // Se a rota n for nenhuma das do tutorial, finalizar e marcar como visto ou jogar de volta para a HOME!
        if (currentStepIndex === -1 && location.pathname !== '/') {
            return;
        }

        // Se estiver na rota inicial do tour (home), pular para ela
        if (location.pathname === '/' && currentStepIndex === -1 && !localStorage.getItem(hasSeenTutorialKey)) {
            // ... (not possible as currentStepIndex seria 0)
        }

        const startDriver = () => {
            const stepConf = stepsConf[currentStepIndex];
            if (!stepConf) return;

            const element = document.querySelector(stepConf.id);
            if (!element) {
                // Tentar novamente com polling
                setTimeout(startDriver, 300);
                return;
            }

            const isLastStep = currentStepIndex === stepsConf.length - 1;

            const d = driver({
                popoverClass: `driver-theme-${resolvedTheme} ${theme.includes('orange') ? 'driver-color-orange' : 'driver-color-purple'}`,
                showProgress: false,
                allowClose: true,
                nextBtnText: 'Próximo &rarr;',
                prevBtnText: '&larr; Anterior',
                doneBtnText: 'Concluir',
                onDestroyStarted: () => {
                    if (!d.hasNextStep() || isLastStep) {
                        d.destroy();
                        localStorage.setItem(hasSeenTutorialKey, 'true');
                        navigate('/');
                    } else {
                        // Closed midway
                        d.destroy();
                        localStorage.setItem(hasSeenTutorialKey, 'true');
                        navigate('/');
                    }
                },
                steps: [
                    {
                        element: stepConf.id,
                        popover: {
                            ...stepConf.popover,
                            onNextClick: () => {
                                if (isLastStep) {
                                    d.destroy();
                                    localStorage.setItem(hasSeenTutorialKey, 'true');
                                    navigate('/');
                                } else {
                                    d.destroy();
                                    const nextStep = stepsConf[currentStepIndex + 1];
                                    navigate(nextStep.path);
                                }
                            }
                        }
                    }
                ]
            });

            d.drive();
        };

        // Pequeno atraso para a página renderizar
        const timeout = setTimeout(startDriver, 500);
        return () => clearTimeout(timeout);

    }, [isAuthenticated, user, location.pathname, navigate, showOnboarding]);

    return null;
};
