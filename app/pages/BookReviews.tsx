import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";
import { RichText } from "../components/RichText";
import { AdminToolbar } from "../components/admin/AdminToolbar";
import { BookReviewFormModal } from "../components/admin/BookReviewFormModal";
import { useBookReviews, type BookReview } from "../hooks/useBookReviews";
import { useAuth } from "../contexts/AuthContext";

export default function BookReviews() {
  const { reviews, loading, usingStatic, addReview, updateReview, deleteReview } = useBookReviews();
  const { user } = useAuth();

  const [selected, setSelected] = useState<BookReview | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BookReview | null>(null);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(review: BookReview) {
    setEditing(review);
    setFormOpen(true);
  }

  // ── Detail view ──────────────────────────────────────────────
  if (selected) {
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
          <p className="flex-1 min-w-0 text-sm text-foreground truncate">{selected.book_title}</p>
          <div className="shrink-0 flex items-center gap-2.5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{selected.category}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{selected.review_date}</span>
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
          {/* Left — Book cover */}
          <div className="w-56 border-r border-border flex flex-col shrink-0">
            <div className="px-4 py-2 border-b border-border shrink-0">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Cover</span>
            </div>
            <div className="flex-1 p-5 flex items-start justify-center overflow-hidden">
              <div className="w-full shadow-2xl">
                <ImageWithFallback
                  src={selected.image_url}
                  alt={selected.book_title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right — Review */}
          <div className="flex-1 flex flex-col bg-card">
            <div className="px-4 py-2 border-b border-border shrink-0">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">My Review</span>
              <p className="text-xs text-muted-foreground/60 italic mt-0.5">by {selected.author}</p>
            </div>

            {/* Excerpt */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <p className="text-xs text-muted-foreground leading-relaxed italic">{selected.excerpt}</p>
            </div>

            {selected.review_text ? (
              <RichText text={selected.review_text} className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto" />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No review written yet</p>
              </div>
            )}
          </div>
        </div>

        <BookReviewFormModal
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={data => updateReview(selected.id, data)}
          onDelete={() => { setSelected(null); return deleteReview(selected.id); }}
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
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Reading</span>
          <h1 className="mt-3 mb-6 text-foreground">Book Reviews</h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Critical engagements with influential works in political theory, legal philosophy, and constitutional studies.
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
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
                >
                  <SpotlightCard
                    onClick={() => setSelected(review)}
                    className="group flex gap-8 py-10 cursor-pointer -mx-4 px-4"
                  >
                    <div className="shrink-0 w-24 h-36 overflow-hidden">
                      <ImageWithFallback
                        src={review.image_url}
                        alt={review.book_title}
                        className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{review.category}</span>
                          <span className="text-muted-foreground/40">·</span>
                          <time className="text-xs text-muted-foreground">{review.review_date}</time>
                        </div>
                        <h3 className="mb-1 text-foreground group-hover:text-secondary transition-colors">{review.book_title}</h3>
                        <p className="text-sm text-muted-foreground italic mb-3">by {review.author}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.excerpt}</p>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-secondary transition-colors">
                          Open Review →
                        </span>
                        {user && (
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(review); }}
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

      <AdminToolbar onAddBookReview={openAdd} />

      <BookReviewFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={data => addReview(data)}
        initial={editing}
        onDelete={editing ? () => deleteReview(editing.id) : undefined}
      />
    </div>
  );
}
