import { useState, useEffect } from "react";
import type { Essay } from "../../hooks/useEssays";
import { ImageLibraryModal } from "./ImageLibraryModal";

type FormData = Omit<Essay, "id">;

const EMPTY: FormData = {
  title: "",
  date: "",
  excerpt: "",
  category: "",
  image_url: "",
  summary: "",
  notes: "",
  pdf_file: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<unknown>;
  onDelete?: () => Promise<unknown>;
  initial?: Essay | null;
}

export function EssayFormModal({ open, onClose, onSave, onDelete, initial }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<"info" | "content">("info");
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : EMPTY);
      setError(null);
      setConfirmDelete(false);
      setTab("info");
    }
  }, [open, initial]);

  if (!open) return null;

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    const err = await onSave(form);
    setSaving(false);
    if (err) {
      setError("Failed to save. Check your Supabase connection.");
    } else {
      onClose();
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setDeleting(true);
    await onDelete();
    setDeleting(false);
    onClose();
  }

  const isEdit = !!initial;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">
            {isEdit ? "Edit Essay" : "Add Essay"}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["info", "content"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                tab === t
                  ? "text-secondary border-b-2 border-secondary -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "info" ? "Info" : "Summary & Notes"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {tab === "info" && (
            <>
              <Field label="Title *" value={form.title} onChange={v => set("title", v)} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category" value={form.category} onChange={v => set("category", v)} placeholder="e.g. Political Theory" />
                <Field label="Date" value={form.date} onChange={v => set("date", v)} placeholder="e.g. March 2026" />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">Cover Image</label>
                <div className="flex items-center gap-3">
                  {form.image_url && (
                    <img src={form.image_url} alt="" className="w-16 h-16 object-cover border border-border shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="px-3 py-2 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
                  >
                    {form.image_url ? "Change Image" : "Browse Library"}
                  </button>
                  {form.image_url && (
                    <button type="button" onClick={() => set("image_url", "")} className="text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <ImageLibraryModal
                open={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                onSelect={url => { set("image_url", url); setLibraryOpen(false); }}
              />
              <Field label="PDF filename" value={form.pdf_file} onChange={v => set("pdf_file", v)} placeholder="essay.pdf (must be in public/pdfs/)" />
              <TextareaField
                label="Short Excerpt"
                value={form.excerpt}
                onChange={v => set("excerpt", v)}
                rows={3}
                hint="Shown on the essays list"
              />
            </>
          )}

          {tab === "content" && (
            <>
              <TextareaField
                label="Summary"
                value={form.summary}
                onChange={v => set("summary", v)}
                rows={6}
                hint="Supports **bold** and - bullet points"
              />
              <TextareaField
                label="Notes & Analysis"
                value={form.notes}
                onChange={v => set("notes", v)}
                rows={6}
                hint="Supports **bold** and - bullet points"
              />
            </>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Essay"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>

          {isEdit && onDelete && (
            <div className="pt-2 border-t border-border">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground flex-1">Delete this essay permanently?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs uppercase tracking-widest disabled:opacity-50"
                  >
                    {deleting ? "Deleting…" : "Confirm Delete"}
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs text-muted-foreground/50 hover:text-destructive transition-colors tracking-[0.1em] uppercase"
                >
                  Delete essay
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors"
      />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows, hint }: {
  label: string; value: string; onChange: (v: string) => void; rows: number; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{label}</label>
        {hint && <span className="text-[10px] text-muted-foreground/40">{hint}</span>}
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors resize-y"
      />
    </div>
  );
}
