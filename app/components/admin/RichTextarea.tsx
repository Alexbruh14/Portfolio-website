import { useRef } from "react";

// ── HTML → Markdown converter (used on paste) ─────────────────
function nodeToMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(nodeToMd).join("");

  switch (tag) {
    case "strong":
    case "b":
      return `**${inner()}**`;
    case "em":
    case "i":
      return `*${inner()}*`;
    case "u":
      return inner(); // drop underline, keep text
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return `## ${inner()}\n`;
    case "li":
      return `- ${inner()}\n`;
    case "ul":
    case "ol":
      return inner();
    case "br":
      return "\n";
    case "p":
    case "div": {
      const content = inner();
      // only add newline if block has content
      return content ? `${content}\n` : "";
    }
    case "tr":
      return `${inner()}\n`;
    case "td":
    case "th":
      return `${inner()} `;
    case "a":
      return inner(); // keep link text, drop href
    case "img":
      return ""; // drop images
    case "script":
    case "style":
    case "head":
      return "";
    default:
      return inner();
  }
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const md = nodeToMd(doc.body);
  // Collapse 3+ consecutive newlines to 2, trim edges
  return md.replace(/\n{3,}/g, "\n\n").trim();
}

// ─────────────────────────────────────────────────────────────

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}

export function RichTextarea({ label, value, onChange, rows = 6, hint }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(prefix: string, suffix: string) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) +
      prefix +
      selected +
      suffix +
      value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length);
    });
  }

  function toggleBullets() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const after = value.slice(end);
    const lineEnd = after.indexOf("\n") === -1 ? value.length : end + after.indexOf("\n");
    const selected = value.slice(lineStart, lineEnd);
    const lines = selected.split("\n");
    const allBulleted = lines.every(l => /^- /.test(l));
    const toggled = lines
      .map(l => (allBulleted ? l.replace(/^- /, "") : `- ${l}`))
      .join("\n");
    const next = value.slice(0, lineStart) + toggled + value.slice(lineEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const diff = toggled.length - selected.length;
      el.setSelectionRange(lineStart, lineEnd + diff);
    });
  }

  function toggleHeading() {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const before = value.slice(0, start);
    const lineStart = before.lastIndexOf("\n") + 1;
    const after = value.slice(start);
    const lineEndOffset = after.indexOf("\n");
    const lineEnd = lineEndOffset === -1 ? value.length : start + lineEndOffset;
    const line = value.slice(lineStart, lineEnd);

    let next: string;
    let cursorShift: number;
    if (line.startsWith("## ")) {
      next = value.slice(0, lineStart) + line.slice(3) + value.slice(lineEnd);
      cursorShift = -3;
    } else {
      next = value.slice(0, lineStart) + "## " + line + value.slice(lineEnd);
      cursorShift = 3;
    }
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const newPos = Math.max(lineStart, start + cursorShift);
      el.setSelectionRange(newPos, newPos);
    });
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const html = e.clipboardData.getData("text/html");
    // If no HTML on clipboard, let the browser handle plain-text paste normally
    if (!html) return;

    e.preventDefault();
    const md = htmlToMarkdown(html);
    const el = ref.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + md + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + md.length, start + md.length);
    });
  }

  const btnClass =
    "px-2 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent hover:border-border/60 transition-colors rounded-sm select-none";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
          {label}
        </label>
        {hint && <span className="text-[10px] text-muted-foreground/40">{hint}</span>}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 mb-1 border-b border-border/40 pb-1">
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); wrapSelection("**", "**"); }}
          className={btnClass}
          title="Bold — wrap selection with **"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); wrapSelection("*", "*"); }}
          className={btnClass}
          title="Italic — wrap selection with *"
        >
          <em>I</em>
        </button>
        <div className="w-px h-3.5 bg-border/40 mx-0.5" />
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); toggleHeading(); }}
          className={btnClass}
          title="Toggle heading (##)"
        >
          <span className="text-[11px] font-bold">H</span>
        </button>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); toggleBullets(); }}
          className={btnClass}
          title="Toggle bullet list"
        >
          ≡
        </button>
      </div>

      <textarea
        ref={ref}
        value={value}
        onChange={e => onChange(e.target.value)}
        onPaste={handlePaste}
        rows={rows}
        className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors resize-y"
      />
    </div>
  );
}
