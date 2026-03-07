import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { user, signIn, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError("Invalid email or password.");
    } else {
      setEmail("");
      setPassword("");
      onClose();
    }
  }

  async function handleSignOut() {
    await signOut();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-card border border-border p-8 w-full max-w-sm z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-muted-foreground hover:text-foreground text-xl leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>

        {user ? (
          /* ── Signed in ── */
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-secondary mb-5">
              Admin Session
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Signed in as{" "}
              <span className="text-foreground">{user.email}</span>
            </p>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2.5 border border-border text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          /* ── Login form ── */
          <form onSubmit={handleSubmit}>
            <p className="text-[10px] tracking-[0.25em] uppercase text-secondary mb-8">
              Admin Login
            </p>

            <div className="space-y-5 mb-6">
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full bg-muted text-foreground px-3 py-2.5 text-sm border border-transparent focus:outline-none focus:border-secondary transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-destructive mb-5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2.5 bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
