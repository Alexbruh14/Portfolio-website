import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-32 text-center">
      <h1 className="mb-6">Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        The page you seek does not exist at this location.
      </p>
      <Link 
        to="/"
        className="inline-block text-sm uppercase tracking-wider border-b-2 border-foreground hover:text-secondary hover:border-secondary transition-colors pb-1"
      >
        Return Home
      </Link>
    </div>
  );
}
