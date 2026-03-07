import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSiteContent } from "./SiteContentContext";

export interface ColorPalette {
  id: string;
  name: string;
  preview: { bg: string; card: string; accent: string };
  vars: Record<string, string>;
}

export const PALETTES: ColorPalette[] = [
  {
    id: "midnight-terracotta",
    name: "Midnight Terracotta",
    preview: { bg: "#0f0c18", card: "#17131f", accent: "#e07b54" },
    vars: {
      background: "#0f0c18",
      foreground: "#f0ece8",
      card: "#17131f",
      "card-foreground": "#f0ece8",
      popover: "#17131f",
      "popover-foreground": "#f0ece8",
      primary: "#f0ece8",
      "primary-foreground": "#0f0c18",
      secondary: "#e07b54",
      "secondary-foreground": "#0f0c18",
      muted: "#231d2f",
      "muted-foreground": "#9088a4",
      accent: "#2a1c18",
      "accent-foreground": "#e07b54",
      border: "#231d2f",
      ring: "#e07b54",
      "switch-background": "#3d3150",
    },
  },
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    preview: { bg: "#0d0b08", card: "#141109", accent: "#c9a84c" },
    vars: {
      background: "#0d0b08",
      foreground: "#f5f0e8",
      card: "#141109",
      "card-foreground": "#f5f0e8",
      popover: "#141109",
      "popover-foreground": "#f5f0e8",
      primary: "#f5f0e8",
      "primary-foreground": "#0d0b08",
      secondary: "#c9a84c",
      "secondary-foreground": "#0d0b08",
      muted: "#1e1b10",
      "muted-foreground": "#8a8060",
      accent: "#2a2210",
      "accent-foreground": "#c9a84c",
      border: "#1e1b10",
      ring: "#c9a84c",
      "switch-background": "#302a18",
    },
  },
  {
    id: "navy-scholar",
    name: "Navy Scholar",
    preview: { bg: "#080d18", card: "#0d1422", accent: "#5b9bd5" },
    vars: {
      background: "#080d18",
      foreground: "#e8edf5",
      card: "#0d1422",
      "card-foreground": "#e8edf5",
      popover: "#0d1422",
      "popover-foreground": "#e8edf5",
      primary: "#e8edf5",
      "primary-foreground": "#080d18",
      secondary: "#5b9bd5",
      "secondary-foreground": "#080d18",
      muted: "#141c2e",
      "muted-foreground": "#6e80a0",
      accent: "#152040",
      "accent-foreground": "#5b9bd5",
      border: "#141c2e",
      ring: "#5b9bd5",
      "switch-background": "#1e2a40",
    },
  },
  {
    id: "forest-sage",
    name: "Forest Sage",
    preview: { bg: "#080e0a", card: "#0d1610", accent: "#7ab89a" },
    vars: {
      background: "#080e0a",
      foreground: "#e8f0eb",
      card: "#0d1610",
      "card-foreground": "#e8f0eb",
      popover: "#0d1610",
      "popover-foreground": "#e8f0eb",
      primary: "#e8f0eb",
      "primary-foreground": "#080e0a",
      secondary: "#7ab89a",
      "secondary-foreground": "#080e0a",
      muted: "#131f16",
      "muted-foreground": "#6a8070",
      accent: "#1a2e20",
      "accent-foreground": "#7ab89a",
      border: "#131f16",
      ring: "#7ab89a",
      "switch-background": "#1e3028",
    },
  },
  {
    id: "charcoal-rose",
    name: "Charcoal Rose",
    preview: { bg: "#110f10", card: "#191518", accent: "#c47a8a" },
    vars: {
      background: "#110f10",
      foreground: "#f5eef0",
      card: "#191518",
      "card-foreground": "#f5eef0",
      popover: "#191518",
      "popover-foreground": "#f5eef0",
      primary: "#f5eef0",
      "primary-foreground": "#110f10",
      secondary: "#c47a8a",
      "secondary-foreground": "#110f10",
      muted: "#251e22",
      "muted-foreground": "#947080",
      accent: "#2e1a1f",
      "accent-foreground": "#c47a8a",
      border: "#251e22",
      ring: "#c47a8a",
      "switch-background": "#3a2830",
    },
  },
];

export function applyPalette(palette: ColorPalette) {
  const root = document.documentElement;
  Object.entries(palette.vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

interface ThemeContextValue {
  paletteId: string;
  setPalette: (id: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  paletteId: "midnight-terracotta",
  setPalette: async () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { get, update } = useSiteContent();
  const savedId = get("theme_palette") || "midnight-terracotta";
  const [paletteId, setPaletteId] = useState(savedId);

  useEffect(() => {
    const palette = PALETTES.find(p => p.id === savedId);
    if (palette) {
      applyPalette(palette);
      setPaletteId(savedId);
    }
  }, [savedId]);

  async function setPalette(id: string) {
    const palette = PALETTES.find(p => p.id === id);
    if (!palette) return;
    applyPalette(palette);
    setPaletteId(id);
    await update("theme_palette", id);
  }

  return (
    <ThemeContext.Provider value={{ paletteId, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}
