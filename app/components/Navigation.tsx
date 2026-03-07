import { Link, useLocation } from "react-router";

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          <Link to="/">
            <p
              className="text-2xl tracking-tight text-secondary"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
            >
              Alex Herrera
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 tracking-[0.2em] uppercase">
              Politics & Legal Studies
            </p>
          </Link>

          <div className="flex items-center gap-8">
            {[
              { to: "/", label: "About" },
              { to: "/essays", label: "Essays" },
              { to: "/book-reviews", label: "Reviews" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-xs tracking-[0.15em] uppercase transition-colors ${
                  isActive(to)
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
