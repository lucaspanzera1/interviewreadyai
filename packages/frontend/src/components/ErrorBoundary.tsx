import { Component, ErrorInfo, ReactNode } from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary para capturar e exibir erros da aplicação
 */
class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t('boundary.title')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                {t('boundary.detailedDescription')}
              </p>

              {/* Error Details (only in development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                    {t('boundary.errorDetailsLabel')}
                  </h3>
                  <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="btn-primary w-full"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {t('boundary.tryAgain')}
                </button>

                <button
                  onClick={this.handleReload}
                  className="btn-secondary w-full"
                >
                  {t('boundary.reloadPage')}
                </button>
              </div>

              {/* Support Info */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('boundary.supportMessage')}
                </p>
                <a
                  href="mailto:suporte@treinavagaai.com"
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
                >
                  lucassouzapanzera@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = withTranslation('errors')(ErrorBoundaryBase);
export default ErrorBoundary;