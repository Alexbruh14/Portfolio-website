import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Star } from "lucide-react";

interface BookReview {
  id: number;
  bookTitle: string;
  author: string;
  reviewDate: string;
  rating: number;
  excerpt: string;
  imageUrl: string;
  category: string;
}

interface BookReviewCardProps {
  review: BookReview;
}

export function BookReviewCard({ review }: BookReviewCardProps) {
  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="relative h-48 overflow-hidden bg-muted">
        <ImageWithFallback
          src={review.imageUrl}
          alt={review.bookTitle}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {review.category}
          </span>
        </div>
        
        <h3 className="mb-2 group-hover:text-primary transition-colors">
          {review.bookTitle}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          by {review.author}
        </p>
        
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          ))}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {review.excerpt}
        </p>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{review.reviewDate}</span>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-accent/50 border-t border-border">
        <span className="text-sm group-hover:text-primary transition-colors">
          Read full review →
        </span>
      </div>
    </article>
  );
}
