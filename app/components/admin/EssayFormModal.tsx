import { useState, useEffect, useRef } from "react";
import type { Essay } from "../../hooks/useEssays";
import { ImageLibraryModal } from "./ImageLibraryModal";
import { useImageLibrary } from "../../hooks/useImageLibrary";
import { supabase } from "../../../lib/supabase";
import { RichTextarea } from "./RichTextarea";
import { ImagePositionEditor, parseImageValue, serializeImageValue } from "./ImagePositionEditor";

const PDF_BUCKET = "portfolio-pdfs";
const supabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

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
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [imgEditorOpen, setImgEditorOpen] = useState(false);
  const { upload, uploading } = useImageLibrary();
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  async function handleDirectUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = await upload(file);
    if (img) set("image_url", img.url);
    e.target.value = "";
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !supabaseConfigured) return;
    setPdfUploading(true);
    setPdfError(null);
    const filename = `${Date.now()}-${file.name
      .replace(/\s+/g, "-")           // spaces → dashes
      .replace(/[^\x20-\x7E]/g, "-") // non-ASCII (em dash, smart quotes, etc.) → dash
      .replace(/[^a-zA-Z0-9._-]/g, "-") // remaining special chars → dash
      .replace(/-+/g, "-")            // collapse consecutive dashes
      .replace(/^-|-(?=\.)/g, "")     // strip leading dash or dash before extension
    }`;
    const { error: uploadError } = await supabase.storage
      .from(PDF_BUCKET)
      .upload(filename, file, { cacheControl: "3600", upsert: false });
    if (uploadError) {
      setPdfError(`Upload failed: ${uploadError.message}`);
    } else {
      const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(filename);
      set("pdf_file", data.publicUrl);
    }
    setPdfUploading(false);
    e.target.value = "";
  }

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : EMPTY);
      setError(null);
      setPdfError(null);
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
      const msg = (err as { message?: string })?.message;
      setError(msg ? `Supabase error: ${msg}` : "Failed to save. Check your Supabase connection.");
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
                  {form.image_url && (() => {
                    const p = parseImageValue(form.image_url, form.image_url);
                    return (
                      <div className="w-16 h-16 overflow-hidden border border-border shrink-0 relative">
                        <img
                          src={p.url}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: `${p.x}% ${p.y}%`,
                            transform: `scale(${p.scale})`,
                            transformOrigin: `${p.x}% ${p.y}%`,
                          }}
                        />
                      </div>
                    );
                  })()}
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
                    <>
                      <button
                        type="button"
                        onClick={() => setImgEditorOpen(true)}
                        className="px-3 py-2 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
                      >
                        ✦ Position
                      </button>
                      <button type="button" onClick={() => set("image_url", "")} className="text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>

              <ImagePositionEditor
                open={imgEditorOpen}
                value={parseImageValue(form.image_url, form.image_url)}
                onClose={() => setImgEditorOpen(false)}
                onConfirm={pos => { set("image_url", serializeImageValue(pos)); setImgEditorOpen(false); }}
                previewAspectRatio={32 / 40}
              />
              <ImageLibraryModal
                open={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                onSelect={url => { set("image_url", url); setLibraryOpen(false); }}
              />
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">PDF File</label>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => { setPdfError(null); pdfRef.current?.click(); }}
                    disabled={pdfUploading || !supabaseConfigured}
                    title={supabaseConfigured ? "Upload a PDF from your computer" : "Supabase not configured"}
                    className="px-3 py-2 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors disabled:opacity-50"
                  >
                    {pdfUploading ? "Uploading…" : "↑ Upload PDF"}
                  </button>
                  <input ref={pdfRef} type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
                  {form.pdf_file && (
                    <button type="button" onClick={() => { set("pdf_file", ""); setPdfError(null); }} className="text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                      Remove
                    </button>
                  )}
                </div>
                {pdfError && (
                  <p className="text-[10px] text-destructive mb-2">{pdfError}</p>
                )}
                {/* URL fallback — paste a direct link to a PDF */}
                <input
                  type="url"
                  value={form.pdf_file}
                  onChange={e => { set("pdf_file", e.target.value); setPdfError(null); }}
                  placeholder="…or paste a PDF URL directly"
                  className="w-full bg-muted text-foreground px-3 py-2 text-xs border border-transparent focus:outline-none focus:border-secondary transition-colors"
                />
                {form.pdf_file && (
                  <p className="text-[10px] text-muted-foreground/50 mt-1 truncate">
                    {form.pdf_file.startsWith("http") ? form.pdf_file.split("/").pop() : form.pdf_file}
                  </p>
                )}
              </div>
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
              <RichTextarea
                label="Summary"
                value={form.summary}
                onChange={v => set("summary", v)}
                rows={6}
              />
              <RichTextarea
                label="Notes & Analysis"
                value={form.notes}
                onChange={v => set("notes", v)}
                rows={6}
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
