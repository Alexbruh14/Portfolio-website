import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useSiteContent } from "../../contexts/SiteContentContext";
import { ImageLibraryModal } from "./ImageLibraryModal";
import { ImagePositionEditor, parseImageValue, serializeImageValue, type ImagePosition } from "./ImagePositionEditor";

interface Props {
  contentKey: string;
  /** Default URL used when no value is saved yet */
  defaultUrl: string;
  /** className forwarded to the rendered img element */
  className?: string;
  alt?: string;
}

export function EditableImage({ contentKey, defaultUrl, className, alt = "" }: Props) {
  const { user } = useAuth();
  const { get, update } = useSiteContent();
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);

  const raw = get(contentKey);
  const pos = parseImageValue(raw || defaultUrl, defaultUrl);

  // Step 1: pick from library
  function handleSelectFromLibrary(url: string) {
    setPendingUrl(url);
    setLibraryOpen(false);
    setEditorOpen(true);
  }

  // Step 2: confirm position
  async function handleConfirmPosition(newPos: ImagePosition) {
    await update(contentKey, serializeImageValue(newPos));
    setEditorOpen(false);
    setPendingUrl(null);
  }

  const editorValue: ImagePosition = pendingUrl
    ? { url: pendingUrl, x: 50, y: 50, scale: 1 }
    : pos;

  const imgStyle: React.CSSProperties = {
    objectPosition: `${pos.x}% ${pos.y}%`,
    transform: pos.scale !== 1 ? `scale(${pos.scale})` : undefined,
    transformOrigin: `${pos.x}% ${pos.y}%`,
  };

  if (!user) {
    return (
      <img
        src={pos.url}
        alt={alt}
        className={className}
        style={imgStyle}
      />
    );
  }

  return (
    <>
      <div className="relative group/img w-full h-full">
        <img
          src={pos.url}
          alt={alt}
          className={className}
          style={imgStyle}
        />
        {/* Admin overlay */}
        <div
          onClick={() => setLibraryOpen(true)}
          className="absolute inset-0 bg-background/0 group-hover/img:bg-background/40 transition-colors cursor-pointer flex items-center justify-center"
        >
          <div className="opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center gap-2">
            <div className="w-10 h-10 border border-secondary/70 bg-background/80 flex items-center justify-center text-secondary text-lg">
              ⬡
            </div>
            <span className="text-[10px] tracking-[0.15em] uppercase text-secondary bg-background/80 px-2 py-0.5">
              Change Image
            </span>
          </div>
        </div>

        {/* Re-position button (always visible in admin) */}
        <button
          onClick={e => { e.stopPropagation(); setEditorOpen(true); }}
          className="absolute bottom-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity bg-background/80 border border-border px-2 py-1 text-[10px] tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground"
          title="Adjust position & zoom"
        >
          ✥ Position
        </button>
      </div>

      <ImageLibraryModal
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleSelectFromLibrary}
      />

      <ImagePositionEditor
        open={editorOpen}
        value={editorValue}
        onClose={() => { setEditorOpen(false); setPendingUrl(null); }}
        onConfirm={handleConfirmPosition}
      />
    </>
  );
}
