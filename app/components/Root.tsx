import { Outlet } from "react-router";
import { Navigation } from "./Navigation";
import { AuthProvider } from "../contexts/AuthContext";
import { SiteContentProvider } from "../contexts/SiteContentContext";

export default function Root() {
  return (
    <AuthProvider>
    <SiteContentProvider>
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-card border-t border-border">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p
                className="text-xl text-secondary tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}
              >
                Alex Herrera
              </p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">
                © {new Date().getFullYear()} · Politics & Legal Studies
              </p>
            </div>
            <div className="flex items-center gap-8">
              {[
                { label: "Email", href: "mailto:your.email@university.edu" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/steven-herrera-57240b3a7" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-secondary transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
    </SiteContentProvider>
    </AuthProvider>
  );
}
