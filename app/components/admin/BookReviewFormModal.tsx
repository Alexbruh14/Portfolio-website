import { useState, useEffect, useRef } from "react";
import type { BookReview } from "../../hooks/useBookReviews";
import { ImageLibraryModal } from "./ImageLibraryModal";
import { useImageLibrary } from "../../hooks/useImageLibrary";

type FormData = Omit<BookReview, "id">;

const EMPTY: FormData = {
  book_title: "",
  author: "",
  review_date: "",
  excerpt: "",
  category: "",
  image_url: "",
  review_text: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<unknown>;
  onDelete?: () => Promise<unknown>;
  initial?: BookReview | null;
}

export function BookReviewFormModal({ open, onClose, onSave, onDelete, initial }: Props) {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { upload, uploading } = useImageLibrary();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await upload(file);
    if (img) set("image_url", img.url);
    e.target.value = "";
  }

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : EMPTY);
      setError(null);
      setConfirmDelete(false);
    }
  }, [open, initial]);

  if (!open) return null;

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.book_title.trim() || !form.author.trim()) {
      setError("Title and author are required.");
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

      <div className="relative bg-card border border-border w-full max-w-xl max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">
            {isEdit ? "Edit Book Review" : "Add Book Review"}
          </span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Field label="Book Title *" value={form.book_title} onChange={v => set("book_title", v)} />
          <Field label="Author *" value={form.author} onChange={v => set("author", v)} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" value={form.category} onChange={v => set("category", v)} placeholder="e.g. Political Theory" />
            <Field label="Date" value={form.review_date} onChange={v => set("review_date", v)} placeholder="e.g. March 2026" />
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                title="Upload from your computer"
                className="w-8 h-8 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors disabled:opacity-50 text-base"
              >
                {uploading ? "…" : "↑"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleDirectUpload} />
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

          <TextareaField
            label="Short Excerpt"
            value={form.excerpt}
            onChange={v => set("excerpt", v)}
            rows={3}
            hint="Shown on the reviews list"
          />

          <TextareaField
            label="Full Review"
            value={form.review_text}
            onChange={v => set("review_text", v)}
            rows={6}
            hint="Supports **bold** and - bullet points"
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Review"}
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
                  <span className="text-xs text-muted-foreground flex-1">Delete this review permanently?</span>
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
                  Delete review
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
