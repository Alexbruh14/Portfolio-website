import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export interface LibraryImage {
  id: number;
  url: string;
  filename: string;
  alt: string;
  created_at: string;
}

const BUCKET = "portfolio-images";

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useImageLibrary() {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetch = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLoading(true);
    const { data } = await supabase
      .from("image_library")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setImages(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  async function upload(file: File, alt = ""): Promise<LibraryImage | null> {
    if (!supabaseConfigured) return null;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const url = urlData.publicUrl;

    const { data, error: dbError } = await supabase
      .from("image_library")
      .insert([{ url, filename, alt }])
      .select()
      .single();

    setUploading(false);
    if (dbError || !data) return null;

    await fetch();
    return data as LibraryImage;
  }

  async function remove(image: LibraryImage) {
    await supabase.storage.from(BUCKET).remove([image.filename]);
    await supabase.from("image_library").delete().eq("id", image.id);
    await fetch();
  }

  async function updateAlt(id: number, alt: string) {
    await supabase.from("image_library").update({ alt }).eq("id", id);
    setImages(prev => prev.map(img => img.id === id ? { ...img, alt } : img));
  }

  return { images, loading, uploading, upload, remove, updateAlt, refetch: fetch };
}
