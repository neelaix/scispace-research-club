import { useState } from "react";
import { Layout } from "../components/Layout";
import { ShieldCheck, LogOut, Lock, Eye, EyeOff } from "lucide-react";

export function AdminPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("scispace_admin_token"); } catch { return null; }
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isAuthed = !!token;

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token);
      try { localStorage.setItem("scispace_admin_token", data.token); } catch { /* ignore */ }
      setPass("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
    setToken(null);
    try { localStorage.removeItem("scispace_admin_token"); } catch { /* ignore */ }
  };

  return (
    <Layout>
      <section className="bg-brand-dark py-12 dark:bg-brand-dark">
        <div className="container-site max-w-5xl">
          <div className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-xs uppercase tracking-widest text-white/50">SciSpace Research Club</p>
            </div>
            {isAuthed && (
              <button onClick={logout} className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-brand-canvas py-10 dark:bg-[#121216]">
        <div className="container-site max-w-5xl">
          {!isAuthed ? (
            <div className="mx-auto max-w-md rounded-2xl border border-brand-dark/10 bg-white p-8 shadow-card dark:border-white/10 dark:bg-[#1E1E24]">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-brand-dark dark:text-white"><Lock className="h-5 w-5" /> Admin Login</h2>
              <p className="mt-1 text-xs text-brand-dark/50 dark:text-white/50">Protected — server-side auth, rate-limited (5/15m), secure httpOnly cookie. Default dev: admin / scispace2026 (set ADMIN_USERNAME / ADMIN_PASSWORD_HASH in env for prod).</p>
              <div className="mt-5 grid gap-4">
                <div>
                  <label htmlFor="admin-user" className="mb-1.5 block text-sm font-semibold text-brand-dark dark:text-white">Username</label>
                  <input id="admin-user" value={user} onChange={(e) => setUser(e.target.value)} placeholder="admin" className="w-full rounded-xl border border-brand-dark/12 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-[#25252e] dark:text-white" />
                </div>
                <div>
                  <label htmlFor="admin-pass" className="mb-1.5 block text-sm font-semibold text-brand-dark dark:text-white">Password</label>
                  <div className="relative">
                    <input id="admin-pass" type={showPass ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-brand-dark/12 bg-white px-4 py-3 pr-10 text-sm dark:border-white/10 dark:bg-[#25252e] dark:text-white" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-dark/40 dark:text-white/40" aria-label="toggle password">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
                <button onClick={login} disabled={loading} className="btn-accent w-full justify-center py-3 disabled:opacity-60">
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-brand-dark/10 bg-white p-8 shadow-card dark:border-white/10 dark:bg-[#1E1E24]">
              <h2 className="font-display text-xl font-semibold text-brand-dark dark:text-white">Welcome, Admin</h2>
              <p className="mt-2 text-sm leading-relaxed text-brand-dark/60 dark:text-white/60">
                Ticketing is now handled exclusively via the official VIT-AP VTApp portal (<a href="https://vtapp.vitap.ac.in/events/interstellar-a-journey-beyond-limits" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-blue-dark underline decoration-brand-blue/30 underline-offset-4 hover:text-brand-orange-dark">vtapp.vitap.ac.in/events/interstellar-a-journey-beyond-limits</a>). No in-app payment or booking data is stored.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-brand-dark/60 dark:text-white/60">
                Onboarding initiatives — Member Recruitment, Team Selection and Community Building — are marked as <span className="font-semibold text-emerald-600">Completed</span>. You can still join SciSpace by emailing <a href="mailto:spaceresearch.club@vitap.ac.in" className="font-semibold text-brand-blue-dark underline decoration-brand-blue/30 underline-offset-4 hover:text-brand-orange-dark">spaceresearch.club@vitap.ac.in</a>.
              </p>
              {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
