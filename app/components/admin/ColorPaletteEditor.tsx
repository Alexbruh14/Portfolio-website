import { useTheme, PALETTES } from "../../contexts/ThemeContext";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ColorPaletteEditor({ open, onClose }: Props) {
  const { paletteId, setPalette } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-md z-10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Color Palette</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-2">
          <p className="text-[10px] text-muted-foreground/50 tracking-[0.1em] uppercase mb-5">
            Choose a theme for your portfolio
          </p>

          {PALETTES.map(palette => (
            <button
              key={palette.id}
              onClick={() => setPalette(palette.id)}
              className={`w-full flex items-center gap-4 p-3 border transition-all text-left ${
                paletteId === palette.id
                  ? "border-secondary bg-secondary/5"
                  : "border-border hover:border-secondary/40 hover:bg-muted/30"
              }`}
            >
              {/* Color preview swatches */}
              <div className="flex gap-0.5 shrink-0">
                <div
                  className="w-9 h-9 border border-white/10"
                  style={{ background: palette.preview.bg }}
                />
                <div
                  className="w-9 h-9 border border-white/10"
                  style={{ background: palette.preview.card }}
                />
                <div
                  className="w-9 h-9 border border-white/10"
                  style={{ background: palette.preview.accent }}
                />
              </div>

              {/* Mini site preview */}
              <div
                className="w-20 h-9 shrink-0 overflow-hidden border border-white/10 flex flex-col justify-center px-2 gap-1"
                style={{ background: palette.preview.bg }}
              >
                <div className="h-px w-6" style={{ background: palette.preview.accent }} />
                <div className="h-1.5 w-12 rounded-sm opacity-70" style={{ background: palette.preview.accent }} />
                <div className="h-px w-10 opacity-30" style={{ background: palette.preview.accent }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground tracking-[0.08em]">{palette.name}</p>
              </div>

              {paletteId === palette.id && (
                <span className="text-[10px] text-secondary tracking-[0.15em] uppercase shrink-0">Active</span>
              )}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
