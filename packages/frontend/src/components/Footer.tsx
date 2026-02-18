import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../contexts/ThemeContext';


const Footer: React.FC = () => {
    const { theme } = useTheme();
    const { t } = useTranslation('footer');
    const currentYear = new Date().getFullYear();
    // Using default if env isn't loaded for some reason, though it should be
    const appVersion = import.meta.env.VITE_APP_VERSION || 'Beta';
    const logoSrc = theme.includes('orange') ? '/logo-orange.png' : '/logo.png';

    const mainNavItems = [
        { name: t('navigation.home'), path: '/' },
        { name: t('navigation.myQuizzes'), path: '/my-quizzes' },
        { name: t('navigation.create'), path: '/create-quiz' },
        { name: t('navigation.explore'), path: '/free-quizzes' },
        { name: t('navigation.evolution'), path: '/desempenho' },
        { name: t('navigation.tokens'), path: '/tokens' },
    ];

    return (
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl relative overflow-hidden transition-colors duration-300">
            {/* Background Decorations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-50"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-12">
                    {/* Brand Section - Wider */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
                            <img src={logoSrc} alt="TreinaVaga" className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
                                {t('brandName')}<span className="text-primary-600 dark:text-primary-400">{t('brandHighlight')}</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                            {t('platformDescription')}
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <SocialLink href="https://github.com/lucaspanzera1" label="GitHub">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </SocialLink>
                            <SocialLink href="https://x.com/lucaspanzera1" label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </SocialLink>
                            <SocialLink href="https://www.linkedin.com/in/lucas-panzera/" label="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                            </SocialLink>
                            <SocialLink href="https://wa.me/5531997313160" label="WhatsApp">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" clipRule="evenodd" />
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </SocialLink>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8 lg:mt-0">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t('product.title')}</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('product.website')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/pricing"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('product.plans')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/features"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('product.features')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/roadmap"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('product.roadmap')}</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t('navigation.title')}</h4>
                            <ul className="space-y-3">
                                {mainNavItems.map((item) => (
                                    <FooterLink key={item.path} to={item.path}>{item.name}</FooterLink>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">{t('legal.title')}</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/terms"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('legal.terms')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/privacy"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">{t('legal.privacy')}</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/faq"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">FAQ</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                        {t('copyright', { year: currentYear })}
                    </p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <span className="relative flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                v{appVersion}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-600">
                            {t('poweredBy')} <span className="font-semibold text-slate-500 dark:text-slate-500">Stelestial Software</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Helper Components for cleaner code
const SocialLink: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => (
    <a
        href={href}
        aria-label={label}
        className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all duration-200"
    >
        {children}
    </a>
);

const FooterLink: React.FC<{ to: string; children: React.ReactNode; disabled?: boolean }> = ({ to, children, disabled }) => {
    if (disabled) {
        return (
            <li>
                <span className="text-slate-400 dark:text-slate-600 text-sm cursor-not-allowed flex items-center gap-2">
                    {children}
                </span>
            </li>
        );
    }
    return (
        <li>
            <Link
                to={to}
                className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
            >
                <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">{children}</span>
            </Link>
        </li>
    );
};

export default Footer;
