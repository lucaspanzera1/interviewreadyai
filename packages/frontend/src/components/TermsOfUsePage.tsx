import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShieldExclamationIcon, CheckCircleIcon, DocumentTextIcon, UserIcon, NoSymbolIcon, ScaleIcon, ExclamationTriangleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import PageTitle from './PageTitle';

const TermsOfUsePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            icon: CheckCircleIcon,
            title: "1. Aceitação dos Termos",
            content: "Ao acessar e usar a plataforma TreinaVagaAI, você concorda em cumprir e ficar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve usar nossos serviços. O uso contínuo da plataforma confirma sua aceitação destes termos e quaisquer alterações futuras."
        },
        {
            icon: DocumentTextIcon,
            title: "2. Descrição do Serviço",
            content: "O TreinaVagaAI é uma plataforma avançada de educação e treinamento profissional que utiliza inteligência artificial para gerar quizzes, simulados e feedback personalizado, visando preparar usuários para processos seletivos e evolução de carreira.",
        },
        {
            icon: UserIcon,
            title: "3. Conta do Usuário",
            content: "Para acessar recursos exclusivos, a criação de uma conta é obrigatória. Você é o único responsável pela segurança e confidencialidade de suas credenciais de acesso, bem como por todas as atividades que ocorrem sob sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado.",
            fullWidth: true
        },
        {
            icon: NoSymbolIcon,
            title: "4. Uso Aceitável",
            content: "Você se compromete a utilizar a plataforma de maneira ética e legal. É estritamente proibido:",
            list: [
                "Tentar violar ou contornar a segurança do sistema ou rede.",
                "Utilizar bots, scrapers ou scripts automatizados para coletar dados.",
                "Praticar qualquer ato de assédio, abuso ou discriminação.",
                "Publicar conteúdo que viole direitos de propriedade intelectual."
            ]
        },
        {
            icon: ScaleIcon,
            title: "5. Propriedade Intelectual",
            content: "Todo o conteúdo, design, código, gráficos e funcionalidades da TreinaVagaAI são de propriedade exclusiva da plataforma e seus licenciadores, protegidos por leis de direitos autorais e propriedade intelectual. O uso não autorizado é proibido."
        },
        {
            icon: ExclamationTriangleIcon,
            title: "6. Isenção de Garantias",
            content: "O serviço é fornecido 'no estado em que se encontra', sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que o serviço será ininterrupto, livre de erros ou totalmente seguro. O uso é de sua inteira responsabilidade."
        },
        {
            icon: DocumentTextIcon,
            title: "7. Alterações nos Termos",
            content: "Reservamo-nos o direito de revisar e modificar estes termos a qualquer momento, sem aviso prévio. Recomendamos que você revise esta página periodicamente para estar ciente de quaisquer alterações."
        },
        {
            icon: ChatBubbleLeftRightIcon,
            title: "8. Contato",
            content: "Em caso de dúvidas sobre estes Termos de Uso, entre em contato conosco através dos canais de suporte disponíveis na plataforma ou pelo nosso email de atendimento."
        }
    ];

    return (
        <>
            <PageTitle title="Termos de Uso - TreinaVagaAI" />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
                {/* Background Gradients */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary-100/40 via-purple-50/20 to-transparent dark:from-primary-900/10 dark:via-slate-900/50 dark:to-transparent opacity-70"></div>
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    {/* Header Section */}
                    <div className="mb-12">
                        <button
                            onClick={() => navigate(-1)}
                            className="group inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors duration-200"
                        >
                            <div className="p-2 rounded-full bg-white/80 dark:bg-slate-900/80 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 group-hover:ring-primary-500/50 dark:group-hover:ring-primary-500/50 mr-3 transition-all duration-200 backdrop-blur-sm">
                                <ArrowLeftIcon className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" />
                            </div>
                            <span className="font-medium tracking-wide text-sm">Voltar</span>
                        </button>

                        <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between border-b border-slate-200 dark:border-slate-800 pb-8">
                            <div>
                                <div className="inline-flex items-center justify-center p-3 mb-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-800">
                                    <ShieldExclamationIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">
                                    Termos de Uso
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                                    Regras e diretrizes para o uso da plataforma TreinaVagaAI.
                                </p>
                            </div>
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/50">
                                <span className="w-2 h-2 rounded-full bg-primary-500 mr-2 animate-pulse"></span>
                                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
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
                                className={`bg-white dark:bg-slate-900/50 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900/50 transition-all duration-300 ${section.list || section.fullWidth ? 'md:col-span-2' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                        <section.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                                            {section.title}
                                        </h3>
                                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {section.content}
                                        </p>

                                        {section.list && (
                                            <ul className="mt-4 space-y-2">
                                                {section.list.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-start text-slate-600 dark:text-slate-400">
                                                        <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full flex-shrink-0"></span>
                                                        {item}
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

export default TermsOfUsePage;
