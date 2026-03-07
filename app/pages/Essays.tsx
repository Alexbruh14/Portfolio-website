import { useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SpotlightCard } from "../components/SpotlightCard";
import { essayContent } from "../data/content";

const essays = [
  {
    id: 1,
    title: "Diagnosing the Incurable: Thucydides, Plato, and the limitations of politics in the face of Human Nature",
    date: "Febuary 2026",
    excerpt: "This essay explores whether the political framework in Plato's Republic can serve as an adequate antidote to stasis, the severe societal and moral breakdown described in Thucydides' The Peloponnesian War. While Plato argues that societal health relies on reordering the human soul and eliminating private interests to prevent conflict, the paper contends that this theoretical solution is practically inadequate. Ultimately, the essay demonstrates that Plato's idealized system fails to withstand Thucydides' harsh reality: under the extreme necessities and pressures of war, human nature abandons reason and inevitably breaks toward primal survival.",
    category: "Ancient Political Thought",
    imageUrl: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc3MjQwMTg1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 2,
    title: "Political Polarization and the Future of Deliberative Democracy",
    date: "December 2025",
    excerpt: "This essay explores the challenges posed by increasing political polarization to deliberative democratic processes, proposing mechanisms for fostering constructive civic dialogue.",
    category: "Political Theory",
    imageUrl: "https://images.unsplash.com/photo-1627990316935-9c473904206e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xpdGljcyUyMGdvdmVybm1lbnQlMjBjYXBpdG9sfGVufDF8fHx8MTc3MjMxOTM2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 3,
    title: "Federalism in the 21st Century: Adapting to Modern Challenges",
    date: "November 2025",
    excerpt: "A critical analysis of federal systems in addressing contemporary issues such as climate change, digital privacy, and interstate commerce in an interconnected world.",
    category: "Constitutional Law",
    imageUrl: "https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzcyMzYxMzIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 4,
    title: "The Intersection of International Law and Domestic Policy",
    date: "October 2025",
    excerpt: "Examining how international legal frameworks influence domestic policy-making, with case studies from human rights treaties and trade agreements.",
    category: "International Law",
    imageUrl: "https://images.unsplash.com/photo-1639414839192-0562f4065ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwbGlicmFyeSUyMGJvb2tzfGVufDF8fHx8MTc3MjQzMTk2M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 5,
    title: "Civil Liberties in the Digital Age: Privacy, Security, and Freedom",
    date: "September 2025",
    excerpt: "An exploration of how traditional civil liberties concepts must evolve to address digital surveillance, data privacy, and the balance between security and freedom.",
    category: "Civil Rights",
    imageUrl: "https://images.unsplash.com/photo-1766802106922-f9bbec6ba516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwd3JpdGluZyUyMGRlc2t8ZW58MXx8fHwxNzcyNDMxOTY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
  {
    id: 6,
    title: "Theories of Justice: From Rawls to Contemporary Debates",
    date: "August 2025",
    excerpt: "A comprehensive review of theories of distributive justice, examining how philosophical frameworks inform policy debates on inequality and social welfare.",
    category: "Political Philosophy",
    imageUrl: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljYWwlMjBhcmNoaXRlY3R1cmUlMjBjb2x1bW5zfGVufDF8fHx8MTc3MjQwMTg1M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  },
];

type Essay = typeof essays[0];

export default function Essays() {
  const [selected, setSelected] = useState<Essay | null>(null);

  // ── Detail view ──────────────────────────────────────────────
  if (selected) {
    const record = essayContent[selected.id] ?? { summary: "", notes: "" };
    const pdfUrl = record.pdfFile ? `${import.meta.env.BASE_URL}pdfs/${record.pdfFile}` : null;

    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">

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

            {/* Summary */}
            <div className="flex-1 flex flex-col border-b border-border min-h-0">
              <div className="px-4 py-2 border-b border-border shrink-0">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Summary</span>
              </div>
              {record.summary ? (
                <p className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto">{record.summary}</p>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No summary yet</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 py-2 border-b border-border shrink-0">
                <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Notes & Analysis</span>
              </div>
              {record.notes ? (
                <p className="flex-1 p-4 text-sm text-muted-foreground leading-relaxed overflow-auto">{record.notes}</p>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-muted-foreground/30 tracking-[0.15em] uppercase">No notes yet</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────────────
  return (
    <div>
      <section className="py-28 bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-8">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Writing</span>
          <h1 className="mt-3 mb-6 text-foreground">Essays</h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Scholarly essays examining constitutional law, political philosophy, and legal theory.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-8">
          <div className="divide-y divide-border">
            {essays.map((essay) => (
              <SpotlightCard
                key={essay.id}
                onClick={() => setSelected(essay)}
                className="group flex gap-8 py-10 cursor-pointer -mx-4 px-4"
              >
                <div className="shrink-0 w-32 h-40 overflow-hidden">
                  <ImageWithFallback
                    src={essay.imageUrl}
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
                  <span className="mt-4 text-xs tracking-[0.15em] uppercase text-muted-foreground group-hover:text-secondary transition-colors">
                    Open Essay →
                  </span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
