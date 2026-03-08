import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface EssayAnnotation {
  id: number;
  essay_id: number;
  selected_text: string;
  comment: string;
  color: string;
  section: "summary" | "notes" | "pdf";
  metadata?: { rects?: HighlightRect[] } | null;
  created_at: string;
}

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useEssayAnnotations(essayId: number) {
  const [annotations, setAnnotations] = useState<EssayAnnotation[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAnnotations() {
    if (!supabaseConfigured || !essayId) {
      setAnnotations([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("essay_annotations")
      .select("*")
      .eq("essay_id", essayId)
      .order("created_at", { ascending: true });

    if (error || !data) {
      setAnnotations([]);
    } else {
      setAnnotations(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    fetchAnnotations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essayId]);

  async function addAnnotation(
    annotation: Omit<EssayAnnotation, "id" | "created_at">
  ) {
    const { error } = await supabase
      .from("essay_annotations")
      .insert([{ ...annotation, essay_id: essayId }]);
    if (!error) fetchAnnotations();
    return error;
  }

  async function updateAnnotation(
    id: number,
    updates: Partial<Pick<EssayAnnotation, "comment" | "color">>
  ) {
    const { error } = await supabase
      .from("essay_annotations")
      .update(updates)
      .eq("id", id);
    if (!error) fetchAnnotations();
    return error;
  }

  async function deleteAnnotation(id: number) {
    const { error } = await supabase
      .from("essay_annotations")
      .delete()
      .eq("id", id);
    if (!error) fetchAnnotations();
    return error;
  }

  return { annotations, loading, addAnnotation, updateAnnotation, deleteAnnotation };
}
