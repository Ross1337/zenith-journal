'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string; email: string }>('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(res.token);
      localStorage.setItem('admin_email', res.email ?? email);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#080910' }}>
      {/* Ambient orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #42E2B8 0%, #5B8EFF 60%, transparent 100%)' }} />
      </div>

      <div className="relative w-full max-w-sm mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 arctic-gradient font-display font-bold">ZENITH</div>
          <p className="text-sm" style={{ color: '#6e7790' }}>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg p-6 space-y-4 border"
          style={{ background: '#0e1018', borderColor: '#232a44' }}>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ba5be' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                background: '#12151f',
                border: '1px solid #232a44',
                color: '#eef1fa',
              }}
              onFocus={e => (e.target.style.borderColor = '#42E2B8')}
              onBlur={e => (e.target.style.borderColor = '#232a44')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#9ba5be' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{
                background: '#12151f',
                border: '1px solid #232a44',
                color: '#eef1fa',
              }}
              onFocus={e => (e.target.style.borderColor = '#42E2B8')}
              onBlur={e => (e.target.style.borderColor = '#232a44')}
            />
          </div>

          {error && (
            <p className="text-xs px-3 py-2 rounded" style={{ background: 'rgba(255,80,80,0.1)', color: '#ff8080' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-sm font-semibold transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #42E2B8, #5B8EFF)',
              color: '#080910',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
