"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZenithMark } from "@/components/shell/zenith-mark";
import { register } from "@/lib/auth";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { token } = await register(email, password, name);
      localStorage.setItem("zenith_token", token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-dawn px-4">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <ZenithMark size={30} />
        <span className="font-display text-[17px] font-semibold tracking-[0.18em] text-ink">ZENITH</span>
      </Link>
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="rounded-xl border border-edge bg-raised p-7 shadow-xl">
          <h1 className="mb-5 text-center text-[18px] font-semibold text-ink">Create account</h1>
          {error && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-[13px] text-red-400">{error}</p>
          )}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-medium text-ink-muted">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                placeholder="Ross"
                className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-ink-muted">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-medium text-ink-muted">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="6+ characters"
                className="w-full rounded-lg border border-edge bg-surface px-3 py-2 text-[14px] text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-gold px-4 py-2.5 text-[14px] font-semibold text-ink-inverse transition hover:bg-gold-hover disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </div>
          <p className="mt-4 text-center text-[12px] text-ink-faint">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-gold hover:text-gold-hover">
              Sign in
            </Link>
          </p>
        </div>
      </form>
      <p className="mt-8 text-[12px] text-ink-faint">See your edge clearly.</p>
    </main>
  );
}
