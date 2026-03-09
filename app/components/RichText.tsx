// Renders a small subset of Markdown: **bold**, *italic*, ## headings, - bullet lists.
// Usage: <RichText text={someString} className="..." />
import type { ReactNode } from "react";

interface Props {
  text: string;
  className?: string;
}

function parseLine(line: string, key: number) {
  // Split on **bold** or *italic* tokens (bold must be checked first)
  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <span key={key}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*"))
          return <em key={i}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </span>
  );
}

export function RichText({ text, className }: Props) {
  // Split into individual lines (not double-newline paragraphs) to handle headings per-line
  const lines = text.split("\n");

  const rendered: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Heading
    if (line.startsWith("## ")) {
      rendered.push(
        <p key={i} className="text-base font-semibold text-foreground mt-3 mb-1">
          {parseLine(line.slice(3), i)}
        </p>
      );
      i++;
      continue;
    }

    // Bullet block: collect consecutive bullet lines
    if (/^[-•]\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i].trim())) {
        items.push(lines[i].replace(/^[-•]\s+/, ""));
        i++;
      }
      rendered.push(
        <ul key={`ul-${i}`} className="list-disc list-outside pl-5 space-y-1 mb-3">
          {items.map((item, li) => <li key={li}>{parseLine(item, li)}</li>)}
        </ul>
      );
      continue;
    }

    // Blank line → spacing
    if (line.trim() === "") {
      rendered.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph line
    rendered.push(
      <span key={i} className="block leading-relaxed">
        {parseLine(line, i)}
      </span>
    );
    i++;
  }

  return <div className={className}>{rendered}</div>;
}
