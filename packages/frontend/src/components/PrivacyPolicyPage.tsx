import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, LockClosedIcon, FingerPrintIcon, CircleStackIcon, ShareIcon, ShieldCheckIcon, UserIcon, EyeIcon } from '@heroicons/react/24/outline';
import PageTitle from './PageTitle';

const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('privacy');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sectionConfigs = [
        { key: 'introduction', icon: EyeIcon, fullWidth: true },
        { key: 'informationCollection', icon: FingerPrintIcon, hasList: true },
        { key: 'useOfInformation', icon: CircleStackIcon, hasList: true },
        { key: 'sharing', icon: ShareIcon },
        { key: 'dataSecurity', icon: ShieldCheckIcon },
        { key: 'yourRights', icon: UserIcon },
        { key: 'cookies', icon: LockClosedIcon },
    ];

    const sections = sectionConfigs.map(({ key, icon, fullWidth, hasList }) => ({
        icon,
        title: t(`sections.${key}.title`),
        content: t(`sections.${key}.content`),
        fullWidth,
        ...(hasList ? { list: t(`sections.${key}.list`, { returnObjects: true }) as string[] } : {}),
    }));

    return (
        <>
            <PageTitle title="Política de Privacidade - TreinaVagaAI" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
                {/* Background Gradients */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-100/40 via-purple-50/20 to-transparent dark:from-blue-900/10 dark:via-slate-900/50 dark:to-transparent opacity-70"></div>
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    {/* Header Section */}
                    <div className="mb-12">
                        <button
                            onClick={() => navigate(-1)}
                            className="group inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors duration-200"
                        >
                            <div className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 group-hover:ring-blue-500/50 dark:group-hover:ring-blue-500/50 mr-3 transition-all duration-200 backdrop-blur-sm">
                                <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
                            </div>
                            <span className="font-medium tracking-wide text-sm">Voltar</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
                            <div>
                                <div className="inline-flex items-center justify-center p-3 mb-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-800">
                                    <LockClosedIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                    Política de Privacidade
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Transparência sobre como tratamos seus dados pessoais.
                                </p>
                            </div>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Atualizado em {new Date().toLocaleDateString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section: any, index) => (
                            <div
                                key={index}
                                className={`bg-white dark:bg-slate-900/50 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-300 ${section.list || section.fullWidth ? 'md:col-span-2' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                                            {section.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {section.content}
                                        </p>

                                        {section.list && (
                                            <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {section.list.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                                        <span className="mr-3 w-1.5 h-full bg-blue-400 rounded-full flex-shrink-0 block"></span>
                                                        <span className="text-sm">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-12 text-center border-t border-slate-200 dark:border-slate-800 pt-8">
                        <p className="text-slate-500 dark:text-slate-500">
                            © {new Date().getFullYear()} TreinaVagaAI. Todos os direitos reservados.
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PrivacyPolicyPage;
