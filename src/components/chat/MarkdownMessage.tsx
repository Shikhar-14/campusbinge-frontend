import React from 'react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  // Parse markdown-style formatting
  const parseMarkdown = (text: string): JSX.Element[] => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let orderedListItems: string[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = '';

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-2 my-4 text-foreground/90">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-[15px] leading-7">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
      if (orderedListItems.length > 0) {
        elements.push(
          <ol key={`olist-${elements.length}`} className="list-decimal pl-6 space-y-2 my-4 text-foreground/90">
            {orderedListItems.map((item, idx) => (
              <li key={idx} className="text-[15px] leading-7">
                {parseInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
        orderedListItems = [];
      }
    };

    const flushCodeBlock = () => {
      if (codeLines.length > 0) {
        elements.push(
          <div key={`code-${elements.length}`} className="my-4 rounded-lg overflow-hidden border border-border/50">
            {codeLanguage && (
              <div className="bg-muted/30 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border/50">
                {codeLanguage}
              </div>
            )}
            <pre className="bg-muted/20 p-4 overflow-x-auto">
              <code className="text-sm font-mono text-foreground">{codeLines.join('\n')}</code>
            </pre>
          </div>
        );
        codeLines = [];
        codeLanguage = '';
      }
    };

    lines.forEach((line, index) => {
      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          flushCodeBlock();
          inCodeBlock = false;
        } else {
          flushList();
          inCodeBlock = true;
          // Extract language if specified
          const langMatch = line.trim().match(/^```(\w+)/);
          if (langMatch) {
            codeLanguage = langMatch[1];
          }
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      // Headings - check from most specific (####) to least specific (#)
      if (line.startsWith('#### ')) {
        flushList();
        elements.push(
          <h4 key={index} className="text-base font-semibold mt-5 mb-2 text-foreground flex items-center gap-2">
            {parseInlineMarkdown(line.substring(5))}
          </h4>
        );
      } else if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={index} className="text-lg font-semibold mt-6 mb-3 text-foreground">
            {parseInlineMarkdown(line.substring(4))}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={index} className="text-xl font-semibold mt-6 mb-3 text-foreground">
            {parseInlineMarkdown(line.substring(3))}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-foreground">
            {parseInlineMarkdown(line.substring(2))}
          </h1>
        );
      }
      // Horizontal rule
      else if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(
          <hr key={index} className="my-6 border-border/50" />
        );
      }
      // Blockquote
      else if (line.trim().startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={index} className="border-l-4 border-primary/30 pl-4 py-1 my-4 text-foreground/80 italic">
            {parseInlineMarkdown(line.trim().substring(2))}
          </blockquote>
        );
      }
      // Lists - unordered
      else if (line.trim().match(/^[-*•]\s/)) {
        if (orderedListItems.length > 0) {
          flushList(); // Flush ordered list if switching
        }
        listItems.push(line.trim().substring(2));
      }
      // Numbered lists
      else if (line.trim().match(/^\d+\.\s/)) {
        if (listItems.length > 0) {
          flushList(); // Flush unordered list if switching
        }
        orderedListItems.push(line.trim().replace(/^\d+\.\s/, ''));
      }
      // Empty line
      else if (line.trim() === '') {
        flushList();
        if (elements.length > 0 && elements[elements.length - 1].type !== 'div') {
          elements.push(<div key={`space-${index}`} className="h-3" />);
        }
      }
      // Regular paragraph
      else {
        flushList();
        elements.push(
          <p key={index} className="text-[15px] leading-7 text-foreground/90 mb-3">
            {parseInlineMarkdown(line)}
          </p>
        );
      }
    });

    flushList();
    flushCodeBlock();

    return elements;
  };

  // Parse inline markdown (bold, italic, code, links)
  const parseInlineMarkdown = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let currentText = text;
    let key = 0;

    // Bold text **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;
    const codeRegex = /`([^`]+)`/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    while (currentText.length > 0) {
      // Find all matches
      const boldMatch = boldRegex.exec(currentText);
      const italicMatch = italicRegex.exec(currentText);
      const codeMatch = codeRegex.exec(currentText);
      const linkMatch = linkRegex.exec(currentText);

      // Reset regex indices
      boldRegex.lastIndex = 0;
      italicRegex.lastIndex = 0;
      codeRegex.lastIndex = 0;
      linkRegex.lastIndex = 0;

      // Find earliest match
      const matches = [
        { type: 'bold', match: boldMatch, index: boldMatch?.index ?? Infinity },
        { type: 'italic', match: italicMatch, index: italicMatch?.index ?? Infinity },
        { type: 'code', match: codeMatch, index: codeMatch?.index ?? Infinity },
        { type: 'link', match: linkMatch, index: linkMatch?.index ?? Infinity },
      ].sort((a, b) => a.index - b.index);

      const earliest = matches[0];

      if (earliest.index === Infinity) {
        parts.push(currentText);
        break;
      }

      // Add text before match
      if (earliest.index > 0) {
        parts.push(currentText.substring(0, earliest.index));
      }

      // Add formatted element
      if (earliest.type === 'bold' && earliest.match) {
        parts.push(
          <strong key={key++} className="font-semibold text-foreground">
            {earliest.match[1]}
          </strong>
        );
        currentText = currentText.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === 'italic' && earliest.match) {
        parts.push(
          <em key={key++} className="italic text-foreground/90">
            {earliest.match[1]}
          </em>
        );
        currentText = currentText.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === 'code' && earliest.match) {
        parts.push(
          <code key={key++} className="bg-muted/50 px-1.5 py-0.5 rounded text-[13px] font-mono text-primary border border-border/30">
            {earliest.match[1]}
          </code>
        );
        currentText = currentText.substring(earliest.index + earliest.match[0].length);
      } else if (earliest.type === 'link' && earliest.match) {
        parts.push(
          <a
            key={key++}
            href={earliest.match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline underline-offset-2 transition-colors font-medium"
          >
            {earliest.match[1]}
          </a>
        );
        currentText = currentText.substring(earliest.index + earliest.match[0].length);
      }
    }

    return parts;
  };

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <div className="space-y-0.5 font-sans antialiased leading-relaxed">
        {parseMarkdown(content)}
      </div>
    </div>
  );
};