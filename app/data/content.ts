// ─────────────────────────────────────────────────────────────
//  Edit this file directly to update your essay and book review content.
//
//  For PDFs:
//    1. Drop the PDF file into  public/pdfs/
//    2. Set pdfFile to the filename, e.g. "essay-1.pdf"
//
//  Keys match the `id` values in Essays.tsx and BookReviews.tsx.
// ─────────────────────────────────────────────────────────────

export interface EssayContent {
  summary: string;
  notes: string;
  pdfFile?: string;
}

export interface ReviewContent {
  review: string;
}

export const essayContent: Record<number, EssayContent> = {
  1: {
    summary: "This essay was written in an Ancient Political Thought class taught by Professor Dean Mathiowetz. This essay explores the great General Thucydides' detailed account of Athens and the Greek region before and durring the battle between Athens and Sparta. Among many of the vastly intresting details Thucydides examines the one this paper is about is his diagnosis of Stasis, (the greek term for corruption, revolution, degeneration). His point is that Stasis is an innate part of humans. He examines this in the Corcyran Revolution where we see brutal attocities being commited amongs the people. Fathers and sons fighting in the streets and chaos for ten days. My analysis compares Thucydides' examination of Stasis to Plato's imagined solution. Plato's Republic   ",
    notes: "TEST NOTES",
    pdfFile: "Ancient Political Thought Midterm Essay .pdf",
  },
  2: {
    summary: "",
    notes: "",
    // pdfFile: "polarization.pdf",
  },
  3: {
    summary: "",
    notes: "",
    // pdfFile: "federalism.pdf",
  },
  4: {
    summary: "",
    notes: "",
    // pdfFile: "international-law.pdf",
  },
  5: {
    summary: "",
    notes: "",
    // pdfFile: "civil-liberties.pdf",
  },
  6: {
    summary: "",
    notes: "",
    // pdfFile: "theories-of-justice.pdf",
  },
};

export const reviewContent: Record<number, ReviewContent> = {
  1: { review: "" },
  2: { review: "" },
  3: { review: "" },
  4: { review: "" },
  5: { review: "" },
  6: { review: "" },
};
