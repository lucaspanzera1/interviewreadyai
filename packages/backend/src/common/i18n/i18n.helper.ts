import { messages, TranslationKey } from './messages';

export type SupportedLanguage = 'pt-BR' | 'en';
export { TranslationKey };

/**
 * Translates a message key to the specified language.
 * Supports interpolation with {{variable}} syntax.
 *
 * @param key - The translation key
 * @param lang - The target language (defaults to 'pt-BR')
 * @param params - Optional interpolation parameters
 * @returns The translated string
 */
export function t(
  key: TranslationKey,
  lang: SupportedLanguage = 'pt-BR',
  params?: Record<string, string | number>,
): string {
  const effectiveLang = lang in messages['pt-BR'] ? lang : 'pt-BR';
  const dict = messages[effectiveLang] || messages['pt-BR'];
  let text = dict[key] || messages['pt-BR'][key] || key;

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    }
  }

  return text;
}
