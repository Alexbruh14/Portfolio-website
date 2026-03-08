import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface BookReview {
  id: number;
  book_title: string;
  author: string;
  review_date: string;
  excerpt: string;
  category: string;
  image_url: string;
  review_text: string;
}

// Static fallback used when Supabase is not configured
const STATIC_REVIEWS: BookReview[] = [
  {
    id: 1,
    book_title: "The Limits of Constitutional Democracy",
    author: "Jeffrey K. Tulis & Stephen Macedo (Eds.)",
    review_date: "February 2026",
    excerpt: "A thought-provoking collection that challenges conventional assumptions about democratic theory. The essays provide nuanced perspectives on the tensions between popular sovereignty and constitutional constraints.",
    category: "Political Theory",
    image_url: "https://images.unsplash.com/photo-1619771678310-9f1e06085d86?w=1080",
    review_text: "",
  },
  {
    id: 2,
    book_title: "Justice: What's the Right Thing to Do?",
    author: "Michael Sandel",
    review_date: "January 2026",
    excerpt: "Sandel masterfully presents complex philosophical debates in accessible language. This book serves as an excellent introduction to theories of justice while challenging readers to examine their own moral assumptions.",
    category: "Philosophy",
    image_url: "https://images.unsplash.com/photo-1639414839192-0562f4065ffd?w=1080",
    review_text: "",
  },
  {
    id: 3,
    book_title: "The Federalist Papers",
    author: "Alexander Hamilton, James Madison & John Jay",
    review_date: "December 2025",
    excerpt: "Essential reading for anyone studying American constitutional law. The timeless arguments for federalism and separation of powers remain remarkably relevant to contemporary political debates.",
    category: "Constitutional Law",
    image_url: "https://images.unsplash.com/photo-1766802106922-f9bbec6ba516?w=1080",
    review_text: "",
  },
  {
    id: 4,
    book_title: "How Democracies Die",
    author: "Steven Levitsky & Daniel Ziblatt",
    review_date: "November 2025",
    excerpt: "A compelling analysis of democratic backsliding that draws on comparative historical examples. The authors provide valuable insights into the fragility of democratic institutions and the informal norms that sustain them.",
    category: "Political Science",
    image_url: "https://images.unsplash.com/photo-1632731187075-11c50d94bd5a?w=1080",
    review_text: "",
  },
  {
    id: 5,
    book_title: "The New Jim Crow",
    author: "Michelle Alexander",
    review_date: "October 2025",
    excerpt: "A powerful and meticulously researched examination of systemic racism in the criminal justice system. Alexander's arguments are both legally rigorous and morally compelling.",
    category: "Civil Rights",
    image_url: "https://images.unsplash.com/photo-1619771678310-9f1e06085d86?w=1080",
    review_text: "",
  },
  {
    id: 6,
    book_title: "A Theory of Justice",
    author: "John Rawls",
    review_date: "September 2025",
    excerpt: "Rawls' magnum opus remains foundational to contemporary political philosophy. His framework for thinking about fairness and social contract theory continues to shape academic and policy debates half a century after publication.",
    category: "Philosophy",
    image_url: "https://images.unsplash.com/photo-1631599143424-5bc234fbebf1?w=1080",
    review_text: "",
  },
];

const supabaseConfigured =
  !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useBookReviews() {
  const [reviews, setReviews] = useState<BookReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingStatic, setUsingStatic] = useState(false);

  async function fetchReviews() {
    if (!supabaseConfigured) {
      setReviews(STATIC_REVIEWS);
      setUsingStatic(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("book_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) {
      setReviews(STATIC_REVIEWS);
      setUsingStatic(true);
    } else {
      setReviews(data);
      setUsingStatic(false);
    }
    setLoading(false);
  }

  useEffect(() => { fetchReviews(); }, []);

  async function addReview(review: Omit<BookReview, "id">) {
    const data = { ...review } as Record<string, unknown>;
    delete data.id;
    const { error } = await supabase.from("book_reviews").insert([data]);
    if (!error) fetchReviews();
    return error;
  }

  async function updateReview(id: number, updates: Partial<Omit<BookReview, "id">>) {
    const data = { ...updates } as Record<string, unknown>;
    delete data.id;
    const { error } = await supabase.from("book_reviews").update(data).eq("id", id);
    if (!error) fetchReviews();
    return error;
  }

  async function deleteReview(id: number) {
    const { error } = await supabase.from("book_reviews").delete().eq("id", id);
    if (!error) fetchReviews();
    return error;
  }

  return { reviews, loading, usingStatic, addReview, updateReview, deleteReview };
}
