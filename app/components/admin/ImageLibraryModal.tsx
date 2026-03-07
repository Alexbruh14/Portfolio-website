import { useRef, useState, useCallback } from "react";
import { useImageLibrary, type LibraryImage } from "../../hooks/useImageLibrary";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the selected image URL when confirmed */
  onSelect: (url: string) => void;
  /** If provided, shows a "Position Image" step after selection */
  onSelectWithPosition?: (url: string) => void;
}

type View = "library" | "upload";

export function ImageLibraryModal({ open, onClose, onSelect }: Props) {
  const { images, loading, uploading, upload, remove } = useImageLibrary();
  const [view, setView] = useState<View>("library");
  const [selected, setSelected] = useState<LibraryImage | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setView("library");
    setSelected(null);
    setUploadPreview(null);
    setAltDraft("");
    setConfirmDelete(null);
  }, []);

  function handleClose() {
    reset();
    onClose();
  }

  function handleConfirm() {
    if (!selected) return;
    onSelect(selected.url);
    handleClose();
  }

  function handleFileChange(files: FileList | null) {
    if (!files?.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = e => setUploadPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!fileRef.current?.files?.length) return;
    const file = fileRef.current.files[0];
    const img = await upload(file, altDraft);
    if (img) {
      setSelected(img);
      setView("library");
      setUploadPreview(null);
      setAltDraft("");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
    setView("upload");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-card border border-border w-full max-w-4xl h-[85vh] flex flex-col z-10">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center gap-6 shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Image Library</span>
          <div className="flex items-center gap-1">
            {(["library", "upload"] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-[10px] tracking-[0.15em] uppercase transition-colors ${
                  view === v
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "library" ? `Library (${images.length})` : "Upload"}
              </button>
            ))}
          </div>
          <button onClick={handleClose} className="ml-auto text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* ── Library view ── */}
          {view === "library" && (
            <div className="flex flex-1 min-h-0">

              {/* Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">Loading…</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <p className="text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">No images yet</p>
                    <button
                      onClick={() => setView("upload")}
                      className="px-4 py-2 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Upload your first image
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map(img => (
                      <div
                        key={img.id}
                        onClick={() => setSelected(img)}
                        className={`relative group cursor-pointer border-2 transition-all ${
                          selected?.id === img.id
                            ? "border-secondary"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                          <img
                            src={img.url}
                            alt={img.alt || img.filename}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Delete button */}
                        {confirmDelete === img.id ? (
                          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center gap-2 p-2">
                            <p className="text-[10px] text-center text-muted-foreground">Delete permanently?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); remove(img); setConfirmDelete(null); }}
                                className="px-2 py-1 bg-destructive text-destructive-foreground text-[10px] uppercase"
                              >
                                Delete
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); setConfirmDelete(null); }}
                                className="px-2 py-1 border border-border text-[10px] text-muted-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmDelete(img.id); }}
                            className="absolute top-1 right-1 w-6 h-6 bg-background/80 text-muted-foreground hover:text-destructive text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        )}

                        {selected?.id === img.id && (
                          <div className="absolute top-1 left-1 w-5 h-5 bg-secondary flex items-center justify-center">
                            <span className="text-secondary-foreground text-[10px]">✓</span>
                          </div>
                        )}

                        {img.alt && (
                          <p className="px-1 py-0.5 text-[10px] text-muted-foreground truncate bg-background/60">{img.alt}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected detail */}
              {selected && (
                <div className="w-56 border-l border-border flex flex-col shrink-0">
                  <div className="px-4 py-3 border-b border-border shrink-0">
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Selected</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                    <div className="aspect-[4/3] overflow-hidden mb-3">
                      <img src={selected.url} alt={selected.alt} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mb-1 truncate">{selected.filename}</p>
                    <p className="text-[10px] text-muted-foreground/40 mb-4">
                      {new Date(selected.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 border-t border-border shrink-0">
                    <button
                      onClick={handleConfirm}
                      className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground text-[10px] tracking-[0.15em] uppercase hover:bg-secondary/90 transition-colors"
                    >
                      Use this image
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Upload view ── */}
          {view === "upload" && (
            <div className="flex-1 p-6 flex flex-col gap-5">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed transition-colors rounded-sm flex flex-col items-center justify-center p-12 cursor-pointer ${
                  dragOver ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/50"
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="max-h-48 max-w-full object-contain mb-4" />
                ) : (
                  <>
                    <div className="text-4xl text-muted-foreground/20 mb-4">↑</div>
                    <p className="text-sm text-muted-foreground mb-1">Drop an image here or click to browse</p>
                    <p className="text-[10px] text-muted-foreground/40">JPG, PNG, WebP, GIF</p>
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleFileChange(e.target.files)}
                />
              </div>

              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-1.5">
                  Alt text / description
                </label>
                <input
                  type="text"
                  value={altDraft}
                  onChange={e => setAltDraft(e.target.value)}
                  placeholder="Describe the image…"
                  className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadPreview}
                  className="px-6 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                <button
                  onClick={() => { setUploadPreview(null); setView("library"); }}
                  className="px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
