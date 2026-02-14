import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const components: Components = {
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith('language-');
    if (isBlock) {
      return (
        <pre className="my-2 overflow-x-auto rounded bg-gray-800 p-3 text-sm text-gray-100">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code
        className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm dark:bg-gray-700"
        {...props}
      >
        {children}
      </code>
    );
  },
};

type MarkdownMessageProps = {
  content: string;
  className?: string;
};

export function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  return (
    <div className={`text-sm [&_p]:mb-1 [&_ul]:my-1 [&_ol]:my-1 [&_pre]:my-2 ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
