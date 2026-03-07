import { Calendar, Clock } from "lucide-react";

interface Essay {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  readTime: string;
}

interface EssayCardProps {
  essay: Essay;
}

export function EssayCard({ essay }: EssayCardProps) {
  return (
    <article className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
            {essay.category}
          </span>
        </div>
        
        <h3 className="mb-3 group-hover:text-primary transition-colors">
          {essay.title}
        </h3>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {essay.excerpt}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{essay.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{essay.readTime}</span>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-accent/50 border-t border-border">
        <span className="text-sm group-hover:text-primary transition-colors">
          Read full essay →
        </span>
      </div>
    </article>
  );
}
