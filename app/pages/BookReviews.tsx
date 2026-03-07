import { useState } from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";
import { reviewContent } from "../data/content";

const bookReviews = [
  {
    id: 1,
    bookTitle: "The Limits of Constitutional Democracy",
    author: "Jeffrey K. Tulis & Stephen Macedo (Eds.)",
    reviewDate: "February 2026",
    excerpt: "A thought-provoking collection that challenges conventional assumptions about democratic theory. The essays provide nuanced perspectives on the tensions between popular sovereignty and constitutional constraints.",
    category: "Political Theory",
    imageUrl: "https://images.unsplash.com/photo-1619771678310-9f1e06085d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXclMjBib29rcyUyMGxpYnJhcnl8ZW58MXx8fHwxNzcyMzY4NDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 2,
    bookTitle: "Justice: What's the Right Thing to Do?",
    author: "Michael Sandel",
    reviewDate: "January 2026",
    excerpt: "Sandel masterfully presents complex philosophical debates in accessible language. This book serves as an excellent introduction to theories of justice while challenging readers to examine their own moral assumptions.",
    category: "Philosophy",
    imageUrl: "https://images.unsplash.com/photo-1639414839192-0562f4065ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc3MjQzMTk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 3,
    bookTitle: "The Federalist Papers",
    author: "Alexander Hamilton, James Madison & John Jay",
    reviewDate: "December 2025",
    excerpt: "Essential reading for anyone studying American constitutional law. The timeless arguments for federalism and separation of powers remain remarkably relevant to contemporary political debates.",
    category: "Constitutional Law",
    imageUrl: "https://images.unsplash.com/photo-1766802106922-f9bbec6ba516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwd3JpdGluZyUyMGRlc2t8ZW58MXx8fHwxNzcyNDMxOTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 4,
    bookTitle: "How Democracies Die",
    author: "Steven Levitsky & Daniel Ziblatt",
    reviewDate: "November 2025",
    excerpt: "A compelling analysis of democratic backsliding that draws on comparative historical examples. The authors provide valuable insights into the fragility of democratic institutions and the informal norms that sustain them.",
    category: "Political Science",
    imageUrl: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc3MjQwMTg1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 5,
    bookTitle: "The New Jim Crow",
    author: "Michelle Alexander",
    reviewDate: "October 2025",
    excerpt: "A powerful and meticulously researched examination of systemic racism in the criminal justice system. Alexander's arguments are both legally rigorous and morally compelling.",
    category: "Civil Rights",
    imageUrl: "https://images.unsplash.com/photo-1619771678310-9f1e06085d86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXclMjBib29rcyUyMGxpYnJhcnl8ZW58MXx8fHwxNzcyMzY4NDk4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 6,
    bookTitle: "A Theory of Justice",
    author: "John Rawls",
    reviewDate: "September 2025",
    excerpt: "Rawls' magnum opus remains foundational to contemporary political philosophy. His framework for thinking about fairness and social contract theory continues to shape academic and policy debates half a century after publication.",
    category: "Philosophy",
    imageUrl: "https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMzYxMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

type Review = typeof bookReviews[0];

export default function BookReviews() {
  const [selected, setSelected] = useState<Review | null>(null);

  // ── Detail view ──────────────────────────────────────────────
  if (selected) {
    const reviewText = reviewContent[selected.id]?.review ?? "";

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
          <p className="flex-1 min-w-0 text-sm text-foreground truncate">{selected.bookTitle}</p>
          <div className="shrink-0 flex items-center gap-2.5">
            <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{selected.category}</span>
            <span className="text-muted-foreground/40 text-xs">·</span>
            <span className="text-xs text-muted-foreground">{selected.reviewDate}</span>
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
                  src={selected.imageUrl}
                  alt={selected.bookTitle}
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

            {/* Excerpt for context */}
            <div className="px-4 py-3 border-b border-border bg-muted/30 shrink-0">
              <p className="text-xs text-muted-foreground leading-relaxed italic">{selected.excerpt}</p>
            </div>

            {reviewText ? (
              <p className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto whitespace-pre-wrap">{reviewText}</p>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No review written yet</p>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div>
      <section className="py-28 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Reading</span>
          <h1 className="mt-3 mb-6 text-foreground">Book Reviews</h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Critical engagements with influential works in political theory, legal philosophy, and constitutional studies.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-8">
          <div className="divide-y divide-border">
            {bookReviews.map((review, i) => (
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
                    src={review.imageUrl}
                    alt={review.bookTitle}
                    className="w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-105 transition-all duration-500"
                  />
                </div>
                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">{review.category}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <time className="text-xs text-muted-foreground">{review.reviewDate}</time>
                    </div>
                    <h3 className="mb-1 text-foreground group-hover:text-secondary transition-colors">{review.bookTitle}</h3>
                    <p className="text-sm text-muted-foreground italic mb-3">by {review.author}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.excerpt}</p>
                  </div>
                  <span className="mt-4 text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-secondary transition-colors">
                    Open Review →
                  </span>
                </div>
              </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
