import { useRef, useState, useCallback } from "react";

export interface ImagePosition {
  url: string;
  x: number;   // 0–100
  y: number;   // 0–100
  scale: number; // 1.0–2.5
}

interface Props {
  open: boolean;
  value: ImagePosition;
  onClose: () => void;
  onConfirm: (pos: ImagePosition) => void;
  /** Force the preview to this aspect ratio (width/height). Defaults to natural image ratio. */
  previewAspectRatio?: number;
}

export function ImagePositionEditor({ open, value, onClose, onConfirm, previewAspectRatio }: Props) {
  const [pos, setPos] = useState<ImagePosition>(value);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // Sync when value changes (new image selected)
  const [prevUrl, setPrevUrl] = useState(value.url);
  if (value.url !== prevUrl) {
    setPrevUrl(value.url);
    setPos(value);
    setNaturalAspect(null);
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    updateFromEvent(e.nativeEvent);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    updateFromEvent(e.nativeEvent);
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    updateFromTouch(touch);
  }, []);

  function updateFromEvent(e: MouseEvent) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
    setPos(prev => ({ ...prev, x, y }));
  }

  function updateFromTouch(touch: React.Touch) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100)));
    const y = Math.round(Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100)));
    setPos(prev => ({ ...prev, x, y }));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-2xl z-10">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Position Image</span>
          <span className="text-[10px] text-muted-foreground/50">Click or drag to set focus point</span>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Preview — drag area */}
        <div className="p-6 space-y-5">
          <div
            ref={containerRef}
            className="relative w-full overflow-hidden cursor-crosshair select-none border border-border"
            style={{ aspectRatio: previewAspectRatio ?? naturalAspect ?? (16 / 9), maxHeight: "65vh" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {!naturalAspect && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <span className="text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">Loading…</span>
              </div>
            )}
            <img
              src={pos.url}
              alt="Preview"
              className="w-full h-full pointer-events-none"
              onLoad={e => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setNaturalAspect(img.naturalWidth / img.naturalHeight);
                }
              }}
              style={{
                objectFit: "cover",
                objectPosition: `${pos.x}% ${pos.y}%`,
                transform: `scale(${pos.scale})`,
                transformOrigin: `${pos.x}% ${pos.y}%`,
              }}
            />

            {/* Focus crosshair */}
            <div
              className="absolute w-6 h-6 pointer-events-none"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="absolute inset-0 border-2 border-secondary rounded-full" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-secondary/70" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-secondary/70" />
            </div>

            {/* Overlay hint */}
            <div className="absolute top-2 left-2 bg-background/60 px-2 py-1 text-[10px] text-muted-foreground pointer-events-none">
              {pos.x}% · {pos.y}%
            </div>
          </div>

          {/* Zoom slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Zoom</label>
              <span className="text-[10px] text-muted-foreground/50">{pos.scale.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.05"
              value={pos.scale}
              onChange={e => setPos(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full accent-secondary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/30 mt-1">
              <span>1× (full)</span>
              <span>2.5× (zoomed in)</span>
            </div>
          </div>

          {/* Reset + presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 mr-1">Presets</span>
            {[
              { label: "Center", x: 50, y: 50 },
              { label: "Top", x: 50, y: 20 },
              { label: "Bottom", x: 50, y: 80 },
              { label: "Left", x: 20, y: 50 },
              { label: "Right", x: 80, y: 50 },
            ].map(p => (
              <button
                type="button"
                key={p.label}
                onClick={() => setPos(prev => ({ ...prev, x: p.x, y: p.y }))}
                className="px-2.5 py-1 border border-border text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPos(prev => ({ ...prev, scale: 1.0 }))}
              className="px-2.5 py-1 border border-border text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors ml-auto"
            >
              Reset zoom
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            type="button"
            onClick={() => onConfirm(pos)}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** Parse a stored JSON string into ImagePosition, with defaults */
export function parseImageValue(raw: string, fallbackUrl: string): ImagePosition {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.url) return { x: 50, y: 50, scale: 1, ...parsed };
  } catch {}
  // raw might just be a plain URL
  const url = raw && raw.startsWith("http") ? raw : fallbackUrl;
  return { url, x: 50, y: 50, scale: 1 };
}

/** Serialize ImagePosition to a JSON string for storage */
export function serializeImageValue(pos: ImagePosition): string {
  return JSON.stringify(pos);
}
