import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";
import { AdminToolbar } from "../components/admin/AdminToolbar";
import { EssayFormModal } from "../components/admin/EssayFormModal";
import { useEssays, type Essay } from "../hooks/useEssays";
import { useEssayAnnotations, type EssayAnnotation, type HighlightRect } from "../hooks/useEssayAnnotations";
import { useAuth } from "../contexts/AuthContext";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

// ── Annotation colors ──────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { id: "yellow", label: "Yellow", bg: "rgba(251,191,36,0.4)",  border: "#f59e0b" },
  { id: "green",  label: "Green",  bg: "rgba(52,211,153,0.4)",  border: "#10b981" },
  { id: "blue",   label: "Blue",   bg: "rgba(96,165,250,0.4)",  border: "#3b82f6" },
  { id: "pink",   label: "Pink",   bg: "rgba(244,114,182,0.4)", border: "#ec4899" },
  { id: "orange", label: "Orange", bg: "rgba(251,146,60,0.4)",  border: "#f97316" },
];

function getColor(id: string) {
  return HIGHLIGHT_COLORS.find(c => c.id === id) ?? HIGHLIGHT_COLORS[0];
}

// ── Inline markdown parser (bold / italic) ────────────────────
function parseInline(raw: string): React.ReactNode {
  const parts = raw.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

// ── Annotated text (summary / notes) ─────────────────────────
function AnnotatedText({
  text,
  annotations,
  containerRef,
  hoveredId,
}: {
  text: string;
  annotations: EssayAnnotation[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  hoveredId: number | null;
}) {
  if (!annotations.length) {
    return (
      <div
        ref={containerRef}
        className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap select-text cursor-text"
      >
        {parseInline(text)}
      </div>
    );
  }

  const marks: Array<{ start: number; end: number; ann: EssayAnnotation }> = [];
  for (const ann of annotations) {
    const idx = text.indexOf(ann.selected_text);
    if (idx !== -1) marks.push({ start: idx, end: idx + ann.selected_text.length, ann });
  }
  marks.sort((a, b) => a.start - b.start);

  const events: Array<{ pos: number; type: "start" | "end"; ann: EssayAnnotation }> = [];
  for (const m of marks) {
    events.push({ pos: m.start, type: "start", ann: m.ann });
    events.push({ pos: m.end,   type: "end",   ann: m.ann });
  }
  events.sort((a, b) => a.pos - b.pos || (a.type === "end" ? -1 : 1));

  const segments: Array<{ text: string; anns: EssayAnnotation[] }> = [];
  const active = new Set<EssayAnnotation>();
  const positions = [...new Set(events.map(e => e.pos))].sort((a, b) => a - b);
  let pos = 0;

  for (const p of positions) {
    if (p > pos) segments.push({ text: text.slice(pos, p), anns: [...active] });
    for (const ev of events.filter(e => e.pos === p)) {
      ev.type === "start" ? active.add(ev.ann) : active.delete(ev.ann);
    }
    pos = p;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), anns: [...active] });

  return (
    <div
      ref={containerRef}
      className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap select-text cursor-text"
    >
      {segments.map((seg, i) => {
        if (!seg.anns.length) return <span key={i}>{parseInline(seg.text)}</span>;
        const ann = seg.anns[0];
        const c = getColor(ann.color);
        const isHovered = ann.id === hoveredId;
        return (
          <mark
            key={i}
            style={{
              backgroundColor: isHovered ? c.border : c.bg,
              borderBottom: `2px solid ${c.border}`,
              borderRadius: "2px",
              padding: "0 1px",
              transition: "background-color 0.15s",
              boxShadow: isHovered ? `0 0 0 2px ${c.border}40` : "none",
            }}
            title={ann.comment}
          >
            {parseInline(seg.text)}
          </mark>
        );
      })}
    </div>
  );
}

// ── Annotation popup ──────────────────────────────────────────
function AnnotationPopup({
  position,
  selectedText,
  section,
  onAdd,
  onClose,
}: {
  position: { x: number; y: number };
  selectedText: string;
  section: "summary" | "notes" | "pdf";
  onAdd: (comment: string, color: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [color, setColor] = useState("yellow");

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="fixed z-[500] bg-card border border-border shadow-2xl rounded-lg p-3 w-72"
      style={{ left: position.x, top: position.y }}
      onMouseDown={e => e.stopPropagation()}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="mb-2">
        <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-1">
          Annotate <span className="text-secondary">({section})</span>
        </p>
        <p className="text-xs text-secondary/80 line-clamp-2 italic">"{selectedText}"</p>
      </div>
      <div className="flex gap-1.5 mb-2">
        {HIGHLIGHT_COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => setColor(c.id)}
            className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c.border,
              borderColor: color === c.id ? "white" : "transparent",
              outline: color === c.id ? `2px solid ${c.border}` : "none",
            }}
            title={c.label}
          />
        ))}
      </div>
      <textarea
        autoFocus
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Add a comment…"
        className="w-full bg-muted/40 border border-border rounded text-xs text-foreground placeholder:text-muted-foreground/40 p-2 resize-none focus:outline-none focus:ring-1 focus:ring-secondary/50"
        rows={3}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
          Cancel
        </button>
        <button
          onClick={() => { onAdd(comment, color); onClose(); }}
          className="text-[10px] tracking-[0.15em] uppercase text-secondary hover:text-secondary/80 transition-colors px-2 py-1 border border-secondary/30 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Annotation card ───────────────────────────────────────────
function AnnotationCard({
  annotation,
  index,
  onDelete,
  onColorChange,
  isAdmin,
  onHoverIn,
  onHoverOut,
  isHovered,
}: {
  annotation: EssayAnnotation;
  index: number;
  onDelete: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  isAdmin: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  isHovered: boolean;
}) {
  const c = getColor(annotation.color);
  return (
    <div
      className="rounded-lg border p-3 text-xs transition-all duration-150 cursor-default"
      style={{
        borderColor: isHovered ? c.border : `${c.border}60`,
        backgroundColor: isHovered ? c.bg : `${c.bg}80`,
        boxShadow: isHovered ? `0 0 0 1px ${c.border}40, 0 2px 8px ${c.border}20` : "none",
      }}
      onPointerEnter={onHoverIn}
      onPointerLeave={onHoverOut}
    >
      {/* Header row: number badge + section label */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
          style={{ backgroundColor: c.border, color: "#000000cc" }}
        >
          {index + 1}
        </span>
        <p className="text-[10px] tracking-[0.12em] uppercase text-foreground/40">{annotation.section}</p>
      </div>
      <p className="text-foreground/90 italic line-clamp-2 mb-1.5 pl-6">"{annotation.selected_text}"</p>
      {annotation.comment && (
        <p className="text-foreground/70 leading-relaxed mb-2 pl-6">{annotation.comment}</p>
      )}
      {isAdmin && (
        <div className="flex items-center justify-between mt-1 pl-6">
          <div className="flex gap-1">
            {HIGHLIGHT_COLORS.map(hc => (
              <button
                key={hc.id}
                onClick={() => onColorChange(annotation.id, hc.id)}
                className="w-3.5 h-3.5 rounded-full border transition-transform hover:scale-125"
                style={{
                  backgroundColor: hc.border,
                  borderColor: annotation.color === hc.id ? "white" : "transparent",
                  outline: annotation.color === hc.id ? `1.5px solid ${hc.border}` : "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => onDelete(annotation.id)}
            className="text-[10px] uppercase text-muted-foreground/50 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Essays page ──────────────────────────────────────────
export default function Essays() {
  const { essays, loading, usingStatic, addEssay, updateEssay, deleteEssay } = useEssays();
  const { user } = useAuth();

  const [selected, setSelected]         = useState<Essay | null>(null);
  const [formOpen, setFormOpen]         = useState(false);
  const [editing, setEditing]           = useState<Essay | null>(null);
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const [annotationsOpen, setAnnotationsOpen] = useState(false);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<number | null>(null);
  const prevAnnotationCount = useRef(0);
  const [numPages, setNumPages]         = useState(0);
  const [pdfWidth, setPdfWidth]         = useState(0);

  const [pendingSelection, setPendingSelection] = useState<{
    text: string;
    section: "summary" | "notes" | "pdf";
    position: { x: number; y: number };
    rects?: HighlightRect[];
  } | null>(null);

  // Section refs for selection detection
  const summaryRef      = useRef<HTMLDivElement>(null);
  const notesRef        = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfContentRef   = useRef<HTMLDivElement>(null);
  const popupRef        = useRef<HTMLDivElement>(null);

  const { annotations, addAnnotation, updateAnnotation, deleteAnnotation } =
    useEssayAnnotations(selected?.id ?? 0);

  // Measure PDF container width for react-pdf
  useEffect(() => {
    if (!pdfContainerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setPdfWidth(Math.floor(entries[0].contentRect.width));
    });
    ro.observe(pdfContainerRef.current);
    return () => ro.disconnect();
  }, [selected]);

  // Global mouseup for annotation selection
  const handleDocMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!user || !selected) return;
      if (popupRef.current?.contains(e.target as Node)) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPendingSelection(null);
        return;
      }
      const selText = selection.toString().trim();
      if (!selText) { setPendingSelection(null); return; }

      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;

      let section: "summary" | "notes" | "pdf" | null = null;
      let rects: HighlightRect[] | undefined;

      if (pdfContentRef.current?.contains(ancestor)) {
        section = "pdf";
        // Store normalized rects relative to pdfContentRef for persistent highlights
        const contentEl = pdfContentRef.current!;
        const contentRect = contentEl.getBoundingClientRect();
        const totalH = contentEl.offsetHeight || 1;
        const totalW = contentRect.width || 1;
        rects = Array.from(range.getClientRects()).map(r => ({
          top:    (r.top  - contentRect.top) / totalH,
          left:   (r.left - contentRect.left) / totalW,
          width:  r.width  / totalW,
          height: r.height / totalH,
        })).filter(r => r.width > 0 && r.height > 0);
      } else if (summaryRef.current?.contains(ancestor)) {
        section = "summary";
      } else if (notesRef.current?.contains(ancestor)) {
        section = "notes";
      }

      if (!section) { setPendingSelection(null); return; }

      const rect = range.getBoundingClientRect();
      setPendingSelection({
        text: selText,
        section,
        rects,
        position: {
          x: Math.min(Math.max(rect.left, 8), window.innerWidth  - 304),
          y: Math.min(rect.bottom + 8,         window.innerHeight - 220),
        },
      });
    },
    [user, selected]
  );

  useEffect(() => {
    if (!selected) return;
    document.addEventListener("mouseup", handleDocMouseUp);
    return () => document.removeEventListener("mouseup", handleDocMouseUp);
  }, [selected, handleDocMouseUp]);

  // Auto-open annotations panel when a new annotation is added
  useEffect(() => {
    if (annotations.length > prevAnnotationCount.current) {
      setAnnotationsOpen(true);
      setSidebarOpen(true);
    }
    prevAnnotationCount.current = annotations.length;
  }, [annotations.length]);

  function openAdd()           { setEditing(null);   setFormOpen(true); }
  function openEdit(e: Essay)  { setEditing(e);       setFormOpen(true); }

  // ── Detail view ──────────────────────────────────────────────
  if (selected) {
    const pdfUrl = selected.pdf_file
      ? selected.pdf_file.startsWith("http")
        ? selected.pdf_file
        : `${import.meta.env.BASE_URL}pdfs/${selected.pdf_file}`
      : null;

    const pdfAnnotations     = annotations.filter(a => a.section === "pdf");
    const summaryAnnotations = annotations.filter(a => a.section === "summary");
    const notesAnnotations   = annotations.filter(a => a.section === "notes");

    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex flex-col"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Top bar */}
        <div className="border-b border-border bg-card px-5 py-2.5 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSelected(null)}
            className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-secondary transition-colors shrink-0"
          >
            ← Back
          </button>
          <div className="w-px h-3.5 bg-border shrink-0" />
          <p className="flex-1 min-w-0 text-sm text-foreground truncate">{selected.title}</p>
          <div className="shrink-0 flex items-center gap-2.5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{selected.category}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{selected.date}</span>
            {numPages > 0 && (
              <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <span className="text-xs text-muted-foreground">{numPages} {numPages === 1 ? "page" : "pages"}</span>
              </>
            )}
            {user && (
              <>
                <span className="text-muted-foreground/40 text-xs">·</span>
                <button
                  onClick={() => openEdit(selected)}
                  className="text-[10px] tracking-[0.15em] uppercase text-secondary/70 hover:text-secondary transition-colors"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">

          {/* ── PDF viewer ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-2 border-b border-border shrink-0 flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">PDF</span>
              {user && pdfUrl && (
                <span className="text-[10px] text-muted-foreground/40 italic">Select text to annotate</span>
              )}
            </div>

            <div ref={pdfContainerRef} className="flex-1 overflow-y-auto bg-muted/10">
              {pdfUrl ? (
                <div ref={pdfContentRef} className="relative">
                  {/* Persistent PDF highlight overlays */}
                  {pdfAnnotations.map((ann, annIdx) => {
                    const c = getColor(ann.color);
                    const isHov = ann.id === hoveredAnnotationId;
                    const globalIdx = annotations.findIndex(a => a.id === ann.id);
                    return ann.metadata?.rects?.map((r, i) => (
                      <div key={`${ann.id}-${i}`}>
                        {/* Highlight rect */}
                        <div
                          className="absolute"
                          style={{
                            top:    `${r.top    * 100}%`,
                            left:   `${r.left   * 100}%`,
                            width:  `${r.width  * 100}%`,
                            height: `${r.height * 100}%`,
                            backgroundColor: isHov ? c.border : c.bg,
                            borderBottom: `2px solid ${c.border}`,
                            zIndex: 5,
                            transition: "background-color 0.15s",
                            boxShadow: isHov ? `0 0 0 1px ${c.border}` : "none",
                            cursor: "default",
                          }}
                          onPointerEnter={() => setHoveredAnnotationId(ann.id)}
                          onPointerLeave={() => setHoveredAnnotationId(null)}
                        />
                        {/* Number badge on first rect only */}
                        {i === 0 && (
                          <div
                            className="absolute flex items-center justify-center text-[8px] font-bold pointer-events-none"
                            style={{
                              top:    `${r.top * 100}%`,
                              left:   `${(r.left + r.width) * 100}%`,
                              width:  "14px",
                              height: "14px",
                              borderRadius: "50%",
                              backgroundColor: c.border,
                              color: "#000000cc",
                              transform: "translate(-50%, -50%)",
                              zIndex: 6,
                              opacity: isHov ? 1 : 0.8,
                            }}
                          >
                            {globalIdx + 1}
                          </div>
                        )}
                      </div>
                    ));
                  })}
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                    loading={
                      <div className="flex items-center justify-center h-40">
                        <p className="text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">Loading PDF…</p>
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-40">
                        <p className="text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">Failed to load PDF</p>
                      </div>
                    }
                  >
                    {pdfWidth > 0 && Array.from({ length: numPages }, (_, i) => (
                      <Page
                        key={i + 1}
                        pageNumber={i + 1}
                        width={pdfWidth}
                        renderTextLayer
                        renderAnnotationLayer={false}
                        className="block"
                      />
                    ))}
                  </Document>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground/50 tracking-[0.15em] uppercase">No PDF attached</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Thin divider strip with protruding toggle pill ─────── */}
          <div className="w-px shrink-0 border-l border-border relative z-10">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-5 h-10 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted/40 transition-colors shadow-sm"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <span className="text-muted-foreground/50 text-[10px] select-none leading-none">
                {sidebarOpen ? "›" : "‹"}
              </span>
            </button>
          </div>

          {/* ── Collapsible right sidebar ───────────────────────── */}
          <AnimatePresence initial={false}>
            {sidebarOpen && (
              <motion.div
                key="sidebar"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "24rem", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="shrink-0 overflow-hidden flex flex-col"
              >
                {/* Fixed-width inner so content doesn't squish during animation */}
                <div className="w-96 h-full flex flex-col bg-card overflow-y-auto">

                  {/* Summary */}
                  <div className="border-b border-border">
                    <div className="px-4 py-2 border-b border-border">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Summary</span>
                    </div>
                    {selected.summary ? (
                      <AnnotatedText
                        text={selected.summary}
                        annotations={summaryAnnotations}
                        containerRef={summaryRef}
                        hoveredId={hoveredAnnotationId}
                      />
                    ) : (
                      <div ref={summaryRef} className="flex items-center justify-center py-8">
                        <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No summary yet</p>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="border-b border-border">
                    <div className="px-4 py-2 border-b border-border">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Notes & Analysis</span>
                    </div>
                    {selected.notes ? (
                      <AnnotatedText
                        text={selected.notes}
                        annotations={notesAnnotations}
                        containerRef={notesRef}
                        hoveredId={hoveredAnnotationId}
                      />
                    ) : (
                      <div ref={notesRef} className="flex items-center justify-center py-8">
                        <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No notes yet</p>
                      </div>
                    )}
                  </div>

                  {/* Annotations — collapsed by default */}
                  <div className="border-t border-border">
                    <button
                      onClick={() => setAnnotationsOpen(o => !o)}
                      className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Annotations</span>
                        {annotations.length > 0 && (
                          <span className="text-[10px] bg-secondary/20 text-secondary px-1.5 py-0.5 rounded-full tabular-nums">
                            {annotations.length}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-muted-foreground/40 text-xs transition-transform duration-200"
                        style={{ display: "inline-block", transform: annotationsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        ▾
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {annotationsOpen && (
                        <motion.div
                          key="annotations"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          {annotations.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">
                                {user ? "Select text on the PDF, summary, or notes" : "No annotations"}
                              </p>
                            </div>
                          ) : (
                            <div
                              className="p-3 flex flex-col gap-3"
                              onMouseLeave={() => setHoveredAnnotationId(null)}
                            >
                              {annotations.map((ann, idx) => (
                                <AnnotationCard
                                  key={ann.id}
                                  annotation={ann}
                                  index={idx}
                                  onDelete={deleteAnnotation}
                                  onColorChange={(id, color) => updateAnnotation(id, { color })}
                                  isAdmin={!!user}
                                  onHoverIn={() => setHoveredAnnotationId(ann.id)}
                                  onHoverOut={() => setHoveredAnnotationId(null)}
                                  isHovered={hoveredAnnotationId === ann.id}
                                />
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Annotation popup */}
        {pendingSelection && (
          <div ref={popupRef}>
            <AnnotationPopup
              position={pendingSelection.position}
              selectedText={pendingSelection.text}
              section={pendingSelection.section}
              onAdd={(comment, color) =>
                addAnnotation({
                  essay_id: selected.id,
                  selected_text: pendingSelection.text,
                  comment,
                  color,
                  section: pendingSelection.section,
                  metadata: pendingSelection.rects?.length
                    ? { rects: pendingSelection.rects }
                    : null,
                })
              }
              onClose={() => {
                window.getSelection()?.removeAllRanges();
                setPendingSelection(null);
              }}
            />
          </div>
        )}

        <EssayFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={data => updateEssay(selected.id, data)}
          onDelete={() => { setSelected(null); return deleteEssay(selected.id); }}
          initial={editing}
        />
      </motion.div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div className={user ? "pb-14" : ""}>
      <section className="py-28 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Writing</span>
          <h1 className="mt-3 mb-6 text-foreground">Essays</h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Scholarly essays examining constitutional law, political philosophy, and legal theory.
          </p>
          {usingStatic && user && (
            <p className="mt-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40">
              Showing static data — connect Supabase to enable live editing
            </p>
          )}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-8">
          {loading ? (
            <div className="py-20 text-center">
              <p className="text-xs text-muted-foreground/40 tracking-[0.15em] uppercase">Loading…</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {essays.map((essay, i) => (
                <motion.div
                  key={essay.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
                >
                  <SpotlightCard
                    onClick={() => { setNumPages(0); setSelected(essay); }}
                    className="group flex gap-8 py-10 cursor-pointer -mx-4 px-4"
                  >
                    <div className="shrink-0 w-32 h-40 overflow-hidden">
                      <ImageWithFallback
                        src={essay.image_url}
                        alt={essay.title}
                        className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{essay.category}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <time className="text-xs text-muted-foreground">{essay.date}</time>
                        </div>
                        <h3 className="mb-3 text-foreground group-hover:text-secondary transition-colors">{essay.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{essay.excerpt}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-secondary transition-colors">
                          Open Essay →
                        </span>
                        {user && (
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(essay); }}
                            className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40 hover:text-secondary transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdminToolbar onAddBookReview={() => {}} onAddEssay={openAdd} />

      <EssayFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={data => editing ? updateEssay(editing.id, data) : addEssay(data)}
        initial={editing}
        onDelete={editing ? () => deleteEssay(editing.id) : undefined}
      />
    </div>
  );
}
