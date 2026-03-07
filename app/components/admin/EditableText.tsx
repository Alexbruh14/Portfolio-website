import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteContent } from "../../contexts/SiteContentContext";

interface Props {
  contentKey: string;
  /** How the value is rendered — receives the current text */
  render: (value: string) => React.ReactNode;
  /** "text" = single line, "area" = multiline (default: "area") */
  inputType?: "text" | "area";
}

export function EditableText({ contentKey, render, inputType = "area" }: Props) {
  const { user } = useAuth();
  const { get, update } = useSiteContent();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const value = get(contentKey);

  function openEditor() {
    setDraft(value);
    setEditing(true);
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  async function handleSave() {
    setSaving(true);
    await update(contentKey, draft);
    setSaving(false);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setEditing(false);
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
  }

  if (!user) return <>{render(value)}</>;

  if (editing) {
    return (
      <div className="relative group/edit">
        {inputType === "area" ? (
          <textarea
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className="w-full bg-muted/60 border border-secondary/50 text-foreground px-3 py-2 text-sm leading-relaxed focus:outline-none focus:border-secondary resize-y"
          />
        ) : (
          <input
            ref={inputRef as React.Ref<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-muted/60 border border-secondary/50 text-foreground px-3 py-2 text-sm focus:outline-none focus:border-secondary"
          />
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-secondary text-secondary-foreground text-[10px] tracking-[0.15em] uppercase disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="px-3 py-1 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <span className="text-[10px] text-muted-foreground/40 ml-1">⌘↵ to save · Esc to cancel</span>
        </div>
      </div>
    );
  }

  return (
    <span
      className="relative group/edit cursor-pointer"
      onClick={openEditor}
      title="Click to edit"
    >
      {render(value)}
      <span className="absolute -top-1 -right-5 opacity-0 group-hover/edit:opacity-100 transition-opacity text-secondary text-xs select-none">✎</span>
    </span>
  );
}
