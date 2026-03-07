import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { ColorPaletteEditor } from "./ColorPaletteEditor";

interface AdminToolbarProps {
  onAddBookReview?: () => void;
  onAddEssay?: () => void;
}

export function AdminToolbar({ onAddBookReview, onAddEssay }: AdminToolbarProps) {
  const { user, signOut } = useAuth();
  const [paletteOpen, setPaletteOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-[200] border-t border-secondary/30 bg-background/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center gap-6">
          <div className="flex items-center gap-2 mr-4">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-secondary">Admin Mode</span>
            <span className="text-muted-foreground/30 text-xs mx-2">|</span>
            <span className="text-[10px] text-muted-foreground">{user.email}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50">Add</span>
            {onAddEssay && (
              <button
                onClick={onAddEssay}
                className="px-3 py-1.5 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
              >
                + Essay
              </button>
            )}
            {onAddBookReview && (
              <button
                onClick={onAddBookReview}
                className="px-3 py-1.5 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
              >
                + Book Review
              </button>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground/40 hidden md:block">Click any text to edit it</span>
            <button
              onClick={() => setPaletteOpen(true)}
              className="px-3 py-1.5 border border-border text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
            >
              ◑ Theme
            </button>
            <button
              onClick={() => signOut()}
              className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <ColorPaletteEditor open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
}
