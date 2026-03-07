import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface Essay {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  image_url: string;
  summary: string;
  notes: string;
  pdf_file: string;
}

const STATIC_ESSAYS: Essay[] = [
  {
    id: 1,
    title: "Diagnosing the Incurable: Thucydides, Plato, and the limitations of politics in the face of Human Nature",
    date: "February 2026",
    excerpt: "This essay explores whether the political framework in Plato's Republic can serve as an adequate antidote to stasis, the severe societal and moral breakdown described in Thucydides' The Peloponnesian War.",
    category: "Ancient Political Thought",
    image_url: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?w=1080",
    summary: "",
    notes: "",
    pdf_file: "Ancient Political Thought Midterm Essay .pdf",
  },
  {
    id: 2,
    title: "Political Polarization and the Future of Deliberative Democracy",
    date: "December 2025",
    excerpt: "This essay explores the challenges posed by increasing political polarization to deliberative democratic processes, proposing mechanisms for fostering constructive civic dialogue.",
    category: "Political Theory",
    image_url: "https://images.unsplash.com/photo-1627990316935-9c473904206e?w=1080",
    summary: "",
    notes: "",
    pdf_file: "",
  },
  {
    id: 3,
    title: "Federalism in the 21st Century: Adapting to Modern Challenges",
    date: "November 2025",
    excerpt: "A critical analysis of federal systems in addressing contemporary issues such as climate change, digital privacy, and interstate commerce in an interconnected world.",
    category: "Constitutional Law",
    image_url: "https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?w=1080",
    summary: "",
    notes: "",
    pdf_file: "",
  },
  {
    id: 4,
    title: "The Intersection of International Law and Domestic Policy",
    date: "October 2025",
    excerpt: "Examining how international legal frameworks influence domestic policy-making, with case studies from human rights treaties and trade agreements.",
    category: "International Law",
    image_url: "https://images.unsplash.com/photo-1639414839192-0562f4065ffd?w=1080",
    summary: "",
    notes: "",
    pdf_file: "",
  },
  {
    id: 5,
    title: "Civil Liberties in the Digital Age: Privacy, Security, and Freedom",
    date: "September 2025",
    excerpt: "An exploration of how traditional civil liberties concepts must evolve to address digital surveillance, data privacy, and the balance between security and freedom.",
    category: "Civil Rights",
    image_url: "https://images.unsplash.com/photo-1766802106922-f9bbec6ba516?w=1080",
    summary: "",
    notes: "",
    pdf_file: "",
  },
  {
    id: 6,
    title: "Theories of Justice: From Rawls to Contemporary Debates",
    date: "August 2025",
    excerpt: "A comprehensive review of theories of distributive justice, examining how philosophical frameworks inform policy debates on inequality and social welfare.",
    category: "Political Philosophy",
    image_url: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?w=1080",
    summary: "",
    notes: "",
    pdf_file: "",
  },
];

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useEssays() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingStatic, setUsingStatic] = useState(false);

  async function fetchEssays() {
    if (!supabaseConfigured) {
      setEssays(STATIC_ESSAYS);
      setUsingStatic(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("essays")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setEssays(STATIC_ESSAYS);
      setUsingStatic(true);
    } else {
      setEssays(data);
      setUsingStatic(false);
    }
    setLoading(false);
  }

  useEffect(() => { fetchEssays(); }, []);

  async function addEssay(essay: Omit<Essay, "id">) {
    const data = { ...essay } as Record<string, unknown>;
    delete data.id;
    const { error } = await supabase.from("essays").insert([data]);
    if (!error) fetchEssays();
    return error;
  }

  async function updateEssay(id: number, updates: Partial<Omit<Essay, "id">>) {
    const { error } = await supabase.from("essays").update(updates).eq("id", id);
    if (!error) fetchEssays();
    return error;
  }

  async function deleteEssay(id: number) {
    const { error } = await supabase.from("essays").delete().eq("id", id);
    if (!error) fetchEssays();
    return error;
  }

  return { essays, loading, usingStatic, addEssay, updateEssay, deleteEssay };
}
