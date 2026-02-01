import React from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language }) => {
  return (
    <pre className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-x-auto my-4 text-sm">
      {language && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono">
          {language}
        </div>
      )}
      <code className="text-slate-900 dark:text-slate-100 font-mono leading-relaxed">
        {children.trim()}
      </code>
    </pre>
  );
};

interface FormattedTextProps {
  text: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  // Função para parsear texto com formatação básica
  const parseText = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex para encontrar blocos de código ```language\ncode\n```
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(input)) !== null) {
      // Adiciona texto antes do bloco de código
      if (match.index > lastIndex) {
        const beforeText = input.slice(lastIndex, match.index);
        parts.push(parseInlineCode(beforeText));
      }

      // Adiciona o bloco de código
      const language = match[1] || 'javascript';
      const code = match[2];
      parts.push(
        <CodeBlock key={match.index} language={language}>
          {code}
        </CodeBlock>
      );

      lastIndex = match.index + match[0].length;
    }

    // Adiciona texto restante
    if (lastIndex < input.length) {
      const remainingText = input.slice(lastIndex);
      parts.push(parseInlineCode(remainingText));
    }

    return parts.length > 0 ? parts : [parseInlineCode(input)];
  };

  // Função para parsear código inline `code`
  const parseInlineCode = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Regex para código inline `code`
    const inlineCodeRegex = /`([^`]+)`/g;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Adiciona texto antes do código inline
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      // Adiciona o código inline
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded text-sm font-mono"
        >
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    // Adiciona texto restante
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  return (
    <div className={`text-sm leading-relaxed ${className}`}>
      {parseText(text)}
    </div>
  );
};

export default FormattedText;