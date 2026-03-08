import { useRef } from "react";

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
    // Restore cursor/selection after React re-render
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
          title="Bold (wrap with **)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={e => { e.preventDefault(); wrapSelection("*", "*"); }}
          className={btnClass}
          title="Italic (wrap with *)"
        >
          <em>I</em>
        </button>
        <div className="w-px h-3.5 bg-border/40 mx-0.5" />
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
        rows={rows}
        className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors resize-y"
      />
    </div>
  );
}
