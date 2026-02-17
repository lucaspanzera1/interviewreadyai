import React from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface PaymentLoadingModalProps {
    isOpen: boolean;
}

const PaymentLoadingModal: React.FC<PaymentLoadingModalProps> = ({ isOpen }) => {
    const { t } = useTranslation('tokens');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md mx-4 border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Animated Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Outer spinning ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/50 animate-spin"
                            style={{ borderTopColor: 'transparent' }}></div>

                        {/* Inner icon */}
                        <div className="relative w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center">
                            <CreditCardIcon className="w-10 h-10 text-primary-500 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {t('payment.loadingModal.title')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {t('payment.loadingModal.description')}
                    </p>
                </div>

                {/* Loading dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>{t('payment.loadingModal.secure')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentLoadingModal;
