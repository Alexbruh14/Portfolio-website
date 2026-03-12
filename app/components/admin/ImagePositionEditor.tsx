import { useRef, useState, useCallback, useEffect } from "react";

export interface ImagePosition {
  url: string;
  x: number;   // pan percentage — 0–100 keeps image over frame; <0 or >100 = blank space
  y: number;
  scale: number; // 1.0–3.0
}

interface Props {
  open: boolean;
  value: ImagePosition;
  onClose: () => void;
  onConfirm: (pos: ImagePosition) => void;
  /** Force the preview to this aspect ratio (width/height). Defaults to natural image ratio. */
  previewAspectRatio?: number;
}

/** Compute frame + image layout from canvas dimensions */
function computeLayout(
  canvasW: number,
  canvasH: number,
  frameAspect: number,
  natAspect: number | null,
  scale: number,
) {
  // Crop frame: 45% of canvas on each axis — generous margins to drag into
  const maxFrameH = canvasH * 0.45;
  const maxFrameW = canvasW * 0.55;
  let frameH = maxFrameH;
  let frameW = frameH * frameAspect;
  if (frameW > maxFrameW) {
    frameW = maxFrameW;
    frameH = frameW / frameAspect;
  }
  const frameLeft = (canvasW - frameW) / 2;
  const frameTop  = (canvasH - frameH) / 2;

  // Image: covers the crop frame × scale
  let imgW: number, imgH: number;
  const eff = natAspect ?? frameAspect;
  if (eff > frameW / frameH) {
    imgH = frameH * scale;
    imgW = imgH * eff;
  } else {
    imgW = frameW * scale;
    imgH = imgW / eff;
  }

  return {
    frameW, frameH, frameLeft, frameTop,
    imgW, imgH,
    panRangeX: Math.max(1, imgW - frameW),
    panRangeY: Math.max(1, imgH - frameH),
  };
}

export function ImagePositionEditor({ open, value, onClose, onConfirm, previewAspectRatio }: Props) {
  const [pos, setPos] = useState<ImagePosition>(value);
  const [naturalAspect, setNaturalAspect] = useState<number | null>(null);
  const [canvasDims, setCanvasDims] = useState({ w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ mx: number; my: number; x: number; y: number; scale: number } | null>(null);

  // Sync when value changes (new image selected)
  const [prevUrl, setPrevUrl] = useState(value.url);
  if (value.url !== prevUrl) {
    setPrevUrl(value.url);
    setPos(value);
    setNaturalAspect(null);
  }

  // Track canvas size
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCanvasDims({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [open]);

  const frameAspect = previewAspectRatio ?? naturalAspect ?? 1;
  const canvasAspect = Math.min(Math.max(frameAspect * 2.2, 1.5), 3.5);

  const layout = canvasDims.w > 0
    ? computeLayout(canvasDims.w, canvasDims.h, frameAspect, naturalAspect, pos.scale)
    : null;

  const imgLeft = layout ? layout.frameLeft + (layout.frameW - layout.imgW) * (pos.x / 100) : 0;
  const imgTop  = layout ? layout.frameTop  + (layout.frameH - layout.imgH) * (pos.y / 100) : 0;

  // Drag
  const startDrag = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    setPos(current => {
      dragOrigin.current = { mx: clientX, my: clientY, x: current.x, y: current.y, scale: current.scale };
      return current;
    });
  }, []);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragOrigin.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const { x: x0, y: y0, mx, my, scale } = dragOrigin.current;
    const dx = clientX - mx;
    const dy = clientY - my;
    const l = computeLayout(rect.width, rect.height, frameAspect, naturalAspect, scale);
    // No clamp — allow x,y outside 0–100 so image can go fully off-frame
    const newX = x0 - (dx / l.panRangeX) * 100;
    const newY = y0 - (dy / l.panRangeY) * 100;
    setPos(prev => ({ ...prev, x: newX, y: newY }));
  }, [naturalAspect, frameAspect]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    dragOrigin.current = null;
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", endDrag);
    };
  }, [isDragging, moveDrag, endDrag]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-card border border-border w-full max-w-3xl z-10">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] tracking-[0.25em] uppercase text-secondary">Position Image</span>
          <span className="text-[10px] text-muted-foreground/50">Drag freely · frame = what users see</span>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>

        {/* Canvas */}
        <div className="p-6 space-y-5">
          <div
            ref={containerRef}
            className="relative w-full select-none"
            style={{
              aspectRatio: canvasAspect,
              cursor: isDragging ? "grabbing" : "grab",
              // Checkered pattern to make blank areas visible
              backgroundImage: "repeating-conic-gradient(#88888820 0% 25%, transparent 0% 50%)",
              backgroundSize: "16px 16px",
            }}
            onMouseDown={e => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
            onTouchStart={e => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); }}
            onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; moveDrag(t.clientX, t.clientY); }}
            onTouchEnd={endDrag}
          >
            {/* Loading state */}
            {!naturalAspect && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/40 tracking-[0.15em] uppercase">Loading…</span>
              </div>
            )}

            {/* Image — can extend past frame edges */}
            {layout && (
              <img
                src={pos.url}
                alt="Preview"
                draggable={false}
                className="absolute pointer-events-none"
                onLoad={e => {
                  const img = e.currentTarget;
                  if (img.naturalWidth && img.naturalHeight)
                    setNaturalAspect(img.naturalWidth / img.naturalHeight);
                }}
                style={{ left: imgLeft, top: imgTop, width: layout.imgW, height: layout.imgH }}
              />
            )}

            {/* Dark overlay outside crop frame */}
            {layout && (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: layout.frameLeft,
                  top: layout.frameTop,
                  width: layout.frameW,
                  height: layout.frameH,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  outline: "1.5px solid rgba(255,255,255,0.6)",
                }}
              />
            )}

            {/* Corner brackets */}
            {layout && ([
              { t: layout.frameTop,                  l: layout.frameLeft,                  bT: true,  bL: true  },
              { t: layout.frameTop,                  l: layout.frameLeft + layout.frameW,  bT: true,  bR: true  },
              { t: layout.frameTop + layout.frameH,  l: layout.frameLeft,                  bB: true,  bL: true  },
              { t: layout.frameTop + layout.frameH,  l: layout.frameLeft + layout.frameW,  bB: true,  bR: true  },
            ] as const).map((c, i) => (
              <div
                key={i}
                className="absolute pointer-events-none"
                style={{
                  top: c.t, left: c.l, width: 14, height: 14,
                  transform: `translate(${(c as any).bR ? "-100%" : "0"}, ${(c as any).bB ? "-100%" : "0"})`,
                  borderTop: (c as any).bT ? "2px solid white" : undefined,
                  borderBottom: (c as any).bB ? "2px solid white" : undefined,
                  borderLeft: (c as any).bL ? "2px solid white" : undefined,
                  borderRight: (c as any).bR ? "2px solid white" : undefined,
                }}
              />
            ))}

            {/* Label */}
            {layout && (
              <div className="absolute pointer-events-none" style={{ top: layout.frameTop - 20, left: layout.frameLeft }}>
                <span className="text-[9px] tracking-[0.2em] uppercase text-white/50">Card view</span>
              </div>
            )}

            {/* Readout */}
            <div className="absolute bottom-2 right-2 bg-background/60 px-2 py-1 text-[10px] text-muted-foreground pointer-events-none">
              {Math.round(pos.x)}% · {Math.round(pos.y)}%
            </div>
          </div>

          {/* Zoom slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Zoom</label>
              <span className="text-[10px] text-muted-foreground/50">{pos.scale.toFixed(2)}×</span>
            </div>
            <input
              type="range" min="1.0" max="3.0" step="0.05" value={pos.scale}
              onChange={e => setPos(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full accent-secondary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/30 mt-1">
              <span>1× (fill frame)</span><span>3× (zoomed in)</span>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground/50 mr-1">Presets</span>
            {[
              { label: "Center", x: 50, y: 50 },
              { label: "Top",    x: 50, y: 0   },
              { label: "Bottom", x: 50, y: 100 },
              { label: "Left",   x: 0,  y: 50  },
              { label: "Right",  x: 100,y: 50  },
            ].map(p => (
              <button type="button" key={p.label}
                onClick={() => setPos(prev => ({ ...prev, x: p.x, y: p.y }))}
                className="px-2.5 py-1 border border-border text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors"
              >{p.label}</button>
            ))}
            <button type="button"
              onClick={() => setPos(prev => ({ ...prev, scale: 1.0 }))}
              className="px-2.5 py-1 border border-border text-[10px] uppercase text-muted-foreground hover:text-foreground hover:border-secondary/50 transition-colors ml-auto"
            >Reset zoom</button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button type="button" onClick={() => onConfirm(pos)}
            className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors"
          >Apply</button>
          <button type="button" onClick={onClose}
            className="px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >Cancel</button>
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
  const url = raw && raw.startsWith("http") ? raw : fallbackUrl;
  return { url, x: 50, y: 50, scale: 1 };
}

/** Serialize ImagePosition to a JSON string for storage */
export function serializeImageValue(pos: ImagePosition): string {
  return JSON.stringify(pos);
}

/**
 * Renders an image absolutely positioned within a `relative overflow-hidden` container,
 * using pixel math that supports x,y values outside 0–100 (blank space at edges).
 */
export function PositionedImage({
  pos, containerW, containerH, className, style, onLoad, ...rest
}: {
  pos: ImagePosition;
  containerW: number;
  containerH: number;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [natAspect, setNatAspect] = useState<number | null>(null);

  let computedStyle: React.CSSProperties;
  if (natAspect !== null) {
    let imgW: number, imgH: number;
    if (natAspect > containerW / containerH) {
      imgH = containerH * pos.scale;
      imgW = imgH * natAspect;
    } else {
      imgW = containerW * pos.scale;
      imgH = imgW / natAspect;
    }
    computedStyle = {
      position: "absolute",
      left: (containerW - imgW) * (pos.x / 100),
      top:  (containerH - imgH) * (pos.y / 100),
      width: imgW,
      height: imgH,
      ...style,
    };
  } else {
    // Fallback until natural dims load
    computedStyle = {
      width: "100%", height: "100%",
      objectFit: "cover",
      objectPosition: `${Math.max(0, Math.min(100, pos.x))}% ${Math.max(0, Math.min(100, pos.y))}%`,
      ...style,
    };
  }

  return (
    <img
      {...rest}
      className={className}
      style={computedStyle}
      onLoad={e => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight)
          setNatAspect(img.naturalWidth / img.naturalHeight);
        onLoad?.(e);
      }}
    />
  );
}
