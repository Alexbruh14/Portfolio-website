import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "../../lib/supabase";

// Default values shown when Supabase is not connected or a key has no row yet
export const DEFAULTS: Record<string, string> = {
  // Hero
  hero_label: "Graduate Student",
  hero_name: "Alex Herrera",
  hero_description: "Politics & Legal Studies — specializing in constitutional theory, judicial interpretation, and the foundations of democratic governance.",

  // Introduction
  intro_p1: "Welcome to my scholarly portfolio. I am a graduate student specializing in Politics and Legal Studies, with particular interests in constitutional theory, judicial interpretation, and the philosophical underpinnings of democratic governance.",
  intro_p2: "My work examines the intersection of political philosophy and legal doctrine, seeking to understand how theoretical frameworks inform practical questions of law and policy.",
  intro_p3: "Through rigorous analysis and careful argumentation, I explore the tensions between individual liberty and collective governance, between constitutional stability and democratic responsiveness.",

  // Areas of Inquiry
  area_1_title: "Constitutional Theory & Judicial Review",
  area_1_body: "Examining the theoretical foundations of constitutional interpretation, the role of judicial review in democratic systems, and the evolving doctrine of constitutional rights and limitations.",
  area_2_title: "Political Philosophy & Democratic Theory",
  area_2_body: "Investigating classical and contemporary theories of democracy, justice, and political obligation, with attention to the relationship between philosophical ideals and institutional realities.",
  area_3_title: "Civil Liberties & Individual Rights",
  area_3_body: "Analyzing the legal and philosophical dimensions of civil rights, focusing on the balance between individual freedoms and legitimate governmental authority in contemporary contexts.",

  // Scholarly Aims
  aim_1_title: "Current Research",
  aim_1_body: "Completing a doctoral dissertation examining the role of precedent in common law systems, with particular attention to how judicial reasoning accommodates both stability and change.",
  aim_2_title: "Academic Aspirations",
  aim_2_body: "Aspiring to contribute to academic discourse through peer-reviewed publications and to teach at the university level, fostering scholars committed to understanding law and politics in full complexity.",
  aim_3_title: "Long-Term Vision",
  aim_3_body: "Contributing to a deeper public understanding of constitutional governance and the philosophical principles that sustain free societies.",

  // Contact
  contact_email: "your.email@university.edu",
};

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

interface SiteContentCtx {
  get: (key: string) => string;
  update: (key: string, value: string) => Promise<void>;
  loaded: boolean;
}

const SiteContentContext = createContext<SiteContentCtx>({
  get: (key) => DEFAULTS[key] ?? "",
  update: async () => {},
  loaded: false,
});

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase
      .from("site_content")
      .select("key, value")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          for (const row of data) map[row.key] = row.value;
          setContent(map);
        }
        setLoaded(true);
      });
  }, []);

  function get(key: string): string {
    return content[key] ?? DEFAULTS[key] ?? "";
  }

  async function update(key: string, value: string) {
    setContent(prev => ({ ...prev, [key]: value }));
    if (!supabaseConfigured) return;
    await supabase
      .from("site_content")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  }

  return (
    <SiteContentContext.Provider value={{ get, update, loaded }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
