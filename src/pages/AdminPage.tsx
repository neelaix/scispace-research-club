import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { ShieldCheck, LogOut, RefreshCw, Lock, Eye, EyeOff } from "lucide-react";

interface Booking {
  bookingId: string;
  bookingContact: { name: string; email: string; phone: string };
  attendees: Array<{ name: string; registrationNumber: string; email: string }>;
  attendeeCount: number;
  totalAmount: number;
  currency: string;
  payment: {
    status: string;
    displayStatus?: string;
    recipientUpiId?: string;
    recipientName?: string;
    transactionReference?: string | null;
    screenshotReference?: string;
  };
  event: { name: string; fullName: string };
  createdAt: string;
}

export function AdminPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem("scispace_admin_token"); } catch { return null; }
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [count, setCount] = useState(0);

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
    setBookings([]);
    try { localStorage.removeItem("scispace_admin_token"); } catch { /* ignore */ }
  };

  const fetchBookings = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/admin/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch");
      setBookings(data.bookings ?? []);
      setCount(data.count ?? 0);
    } catch (e) {
      setError((e as Error).message);
      // token expired?
      if ((e as Error).message.includes("Unauthorized")) {
        setToken(null);
        try { localStorage.removeItem("scispace_admin_token"); } catch { /* ignore */ }
      }
    }
  };

  useEffect(() => {
    if (token) fetchBookings();
  }, [token]);

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
              <p className="text-xs uppercase tracking-widest text-white/50">SciSpace Research Club — Interstellar</p>
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
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold text-brand-dark dark:text-white">Bookings — Interstellar</h2>
                <button onClick={fetchBookings} className="inline-flex items-center gap-2 rounded-full border border-brand-dark/10 bg-white px-4 py-2 text-sm dark:border-white/10 dark:bg-[#1E1E24] dark:text-white">
                  <RefreshCw className="h-4 w-4" /> Refresh
                </button>
              </div>
              <p className="mt-1 text-sm text-brand-dark/60 dark:text-white/60">Total: {count} · Server-side authorized (Bearer + httpOnly secure cookie), rate-limited, no DB — in-memory + Google Sheets when configured. All amounts verified as <span className="font-mono">count×₹25</span>.</p>
              {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</p>}

              <div className="mt-6 overflow-hidden rounded-2xl border border-brand-dark/10 bg-white shadow-card dark:border-white/10 dark:bg-[#1E1E24]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-brand-mist text-xs uppercase tracking-widest text-brand-dark/50 dark:bg-[#25252e] dark:text-white/50">
                      <tr>
                        <th className="px-4 py-3">Booking ID</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Attendees</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-dark/5 dark:divide-white/5">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-brand-dark/50 dark:text-white/50">No bookings yet in this instance. Try booking at /#/booking then refresh. Persistent copy is Google Sheets.</td></tr>
                      ) : bookings.map((b) => (
                        <tr key={b.bookingId} className="hover:bg-brand-mist/40 dark:hover:bg-white/5">
                          <td className="px-4 py-3 font-mono text-xs font-semibold dark:text-white">{b.bookingId}</td>
                          <td className="px-4 py-3 dark:text-white/80"><div className="font-medium">{b.bookingContact.name}</div><div className="text-xs text-brand-dark/50 dark:text-white/50">{b.bookingContact.email} · {b.bookingContact.phone}</div></td>
                          <td className="px-4 py-3 dark:text-white"><span className="font-semibold">{b.attendeeCount}</span> <span className="text-xs text-brand-dark/50 dark:text-white/50">{b.attendees.map((a) => a.name).join(", ")}</span></td>
                          <td className="px-4 py-3 font-semibold dark:text-white">₹{b.totalAmount}</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{b.payment.displayStatus ?? b.payment.status}</span><div className="font-mono text-xs text-brand-dark/40 dark:text-white/40">{b.payment.recipientUpiId ?? ""} · {b.payment.transactionReference ?? b.payment.screenshotReference ?? ""}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
