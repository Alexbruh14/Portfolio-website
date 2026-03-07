// Renders a small subset of Markdown: **bold**, - bullet lists, and paragraphs.
// Usage: <RichText text={someString} className="..." />

interface Props {
  text: string;
  className?: string;
}

function parseLine(line: string, key: number) {
  // Split on **bold** tokens
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span key={key}>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part
      )}
    </span>
  );
}

export function RichText({ text, className }: Props) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className={className}>
      {paragraphs.map((block, pi) => {
        const lines = block.split("\n").filter(l => l.trim() !== "");
        const isList = lines.every(l => /^[-•]\s/.test(l.trim()));

        if (isList) {
          return (
            <ul key={pi} className="list-disc list-outside pl-5 space-y-1 mb-3">
              {lines.map((l, li) => (
                <li key={li}>{parseLine(l.replace(/^[-•]\s+/, ""), li)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={pi} className="mb-3 last:mb-0">
            {lines.map((l, li) => (
              <span key={li}>
                {parseLine(l, li)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
