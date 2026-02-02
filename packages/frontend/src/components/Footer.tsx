import React from 'react';
import { Link } from 'react-router-dom';


const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    // Using default if env isn't loaded for some reason, though it should be
    const appVersion = import.meta.env.VITE_APP_VERSION || 'Beta';

    const mainNavItems = [
        { name: 'Início', path: '/' },
        { name: 'Meus Quizzes', path: '/my-quizzes' },
        { name: 'Criar', path: '/create-quiz' },
        { name: 'Explorar', path: '/free-quizzes' },
        { name: 'Evolução', path: '/desempenho' },
        { name: 'Tokens', path: '/tokens' },
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
                            <img src="/logo.png" alt="TreinaVaga" className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white">
                                TreinaVaga<span className="text-primary-600 dark:text-primary-400">AI</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
                            A plataforma utiliza IA para ler os requisitos da vaga e gerar um Quiz de preparação para garantir que você não "trave" na hora do papo com o recrutador.
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-4">
                            <SocialLink href="https://github.com/lucaspanzera1" label="GitHub">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                            </SocialLink>
                            <SocialLink href="https://x.com/lucaspanzera1" label="Twitter">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                            </SocialLink>
                            <SocialLink href="#https://www.linkedin.com/in/lucas-panzera/" label="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                            </SocialLink>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 mt-8 lg:mt-0">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Produto</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a
                                        href="https://www.treinavaga.tech/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-medium transition-colors duration-200 flex items-center gap-1 group"
                                    >
                                        <span className="w-0 group-hover:w-1.5 h-1.5 bg-primary-500 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"></span>
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">Website</span>
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
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">Planos</span>
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
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">Funcionalidades</span>
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
                                        <span className="transform group-hover:translate-x-1 transition-transform duration-200">Roadmap</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Navegação</h4>
                            <ul className="space-y-3">
                                {mainNavItems.map((item) => (
                                    <FooterLink key={item.path} to={item.path}>{item.name}</FooterLink>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">Legal</h4>
                            <ul className="space-y-3">
                                <FooterLink to="/terms">Termos de Uso</FooterLink>
                                <FooterLink to="/privacy">Política de Privacidade</FooterLink>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                        © {currentYear} TreinaVagaAI Inc.
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
                            Powered By <span className="font-semibold text-slate-500 dark:text-slate-500">Stelestial Software</span>
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
