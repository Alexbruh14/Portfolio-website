import { useRef } from "react";
import { useTheme, PALETTES } from "../../contexts/ThemeContext";

// ── Color variable groups ─────────────────────────────────────
const COLOR_GROUPS = [
  {
    label: "Backgrounds",
    vars: [
      { key: "background",   label: "Page background" },
      { key: "card",         label: "Cards & panels" },
      { key: "muted",        label: "Subtle background" },
      { key: "accent",       label: "Accent background" },
    ],
  },
  {
    label: "Text",
    vars: [
      { key: "foreground",        label: "Main text" },
      { key: "muted-foreground",  label: "Secondary text" },
    ],
  },
  {
    label: "Brand",
    vars: [
      { key: "secondary", label: "Accent / brand color" },
      { key: "primary",   label: "Primary color" },
      { key: "ring",      label: "Focus ring" },
    ],
  },
  {
    label: "UI",
    vars: [
      { key: "border",            label: "Borders" },
      { key: "switch-background", label: "Toggle background" },
    ],
  },
];

// ── Single color row ──────────────────────────────────────────
function ColorRow({
  label,
  colorKey,
  value,
  onChange,
}: {
  label: string;
  colorKey: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hex = value?.startsWith("#") ? value : value;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-b-0">
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-[10px] font-mono text-muted-foreground/40 w-[4.5rem] text-right select-all tabular-nums">
        {hex}
      </span>
      <button
        onClick={() => inputRef.current?.click()}
        className="w-7 h-7 rounded-sm border border-white/10 hover:scale-110 hover:border-secondary/40 transition-all shrink-0 shadow-inner"
        style={{ backgroundColor: hex }}
        title={`Edit ${label}`}
      />
      <input
        ref={inputRef}
        type="color"
        value={hex.startsWith("#") ? hex : "#000000"}
        onChange={e => onChange(e.target.value)}
        className="sr-only"
      />
    </div>
  );
}

// ── Main editor ───────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

export function ColorPaletteEditor({ open, onClose }: Props) {
  const { vars, setColorVar, applyPreset } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-sm max-h-[85vh] flex flex-col z-10">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Color Editor</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Quick theme presets */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">Quick Themes</p>
            <div className="flex gap-2 flex-wrap">
              {PALETTES.map(p => (
                <button
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  title={p.name}
                  className="flex flex-col items-center gap-1 p-1.5 border border-border rounded hover:border-secondary/50 hover:bg-muted/30 transition-all group"
                >
                  <div className="flex gap-px">
                    <div className="w-4 h-4 rounded-sm" style={{ background: p.preview.bg }} />
                    <div className="w-4 h-4 rounded-sm" style={{ background: p.preview.card }} />
                    <div className="w-4 h-4 rounded-sm" style={{ background: p.preview.accent }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 group-hover:text-muted-foreground transition-colors leading-none">
                    {p.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Individual color groups */}
          {COLOR_GROUPS.map(group => (
            <div key={group.label} className="px-5 py-3 border-b border-border/60 last:border-b-0">
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/40 mb-1">
                {group.label}
              </p>
              {group.vars.map(({ key, label }) => (
                <ColorRow
                  key={key}
                  label={label}
                  colorKey={key}
                  value={vars[key] ?? "#000000"}
                  onChange={v => setColorVar(key, v)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <p className="text-[10px] text-muted-foreground/30 text-center mb-2.5">
            Changes save automatically
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground text-xs tracking-widest uppercase hover:bg-secondary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
