import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";
import { RichText } from "../components/RichText";
import { AdminToolbar } from "../components/admin/AdminToolbar";
import { EssayFormModal } from "../components/admin/EssayFormModal";
import { useEssays, type Essay } from "../hooks/useEssays";
import { useAuth } from "../contexts/AuthContext";

export default function Essays() {
  const { essays, loading, usingStatic, addEssay, updateEssay, deleteEssay } = useEssays();
  const { user } = useAuth();

  const [selected, setSelected] = useState<Essay | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Essay | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(essay: Essay) {
    setEditing(essay);
    setFormOpen(true);
  }

  // ── Detail view ──────────────────────────────────────────────
  if (selected) {
    const pdfUrl = selected.pdf_file
      ? selected.pdf_file.startsWith("http")
        ? selected.pdf_file
        : `${import.meta.env.BASE_URL}pdfs/${selected.pdf_file}`
      : null;

    return (
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex flex-col"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Compact top bar */}
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

        {/* Two-column panel */}
        <div className="flex flex-1 min-h-0">
          {/* Left — PDF */}
          <div className="flex-1 border-r border-border flex flex-col">
            <div className="px-4 py-2 border-b border-border shrink-0">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">PDF</span>
            </div>
            <div className="flex-1 bg-muted/20">
              {pdfUrl ? (
                <iframe src={pdfUrl} className="w-full h-full" title={selected.title} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted-foreground/50 tracking-[0.15em] uppercase">No PDF attached</p>
                </div>
              )}
            </div>
          </div>

          {/* Right — Summary & Notes */}
          <div className="flex flex-col bg-card shrink-0" style={{ width: "22rem" }}>
            <div className="flex-1 flex flex-col border-b border-border min-h-0">
              <div className="px-4 py-2 border-b border-border shrink-0">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Summary</span>
              </div>
              {selected.summary ? (
                <RichText text={selected.summary} className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto" />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No summary yet</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 py-2 border-b border-border shrink-0">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Notes & Analysis</span>
              </div>
              {selected.notes ? (
                <RichText text={selected.notes} className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto" />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

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
                    onClick={() => setSelected(essay)}
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
        onSave={data => addEssay(data)}
        initial={editing}
        onDelete={editing ? () => deleteEssay(editing.id) : undefined}
      />
    </div>
  );
}
