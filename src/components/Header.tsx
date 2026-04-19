import { useEffect, useState } from 'react';
import { ping, hostLabel } from '../api/oracle';

type Status = 'checking' | 'live' | 'demo';

export function Header({ version = '0.1.0' }: { version?: string }) {
  const [status, setStatus] = useState<Status>('checking');
  const [label] = useState(() => hostLabel());

  useEffect(() => {
    let cancelled = false;
    ping().then((ok) => { if (!cancelled) setStatus(ok ? 'live' : 'demo'); });
    const id = setInterval(() => {
      ping().then((ok) => { if (!cancelled) setStatus(ok ? 'live' : 'demo'); });
    }, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const chip = {
    checking: { bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)', dot: '#94a3b8', text: 'checking…' },
    live:     { bg: 'rgba(74, 222, 128, 0.12)',  border: 'rgba(74, 222, 128, 0.4)',  dot: '#4ade80', text: 'live' },
    demo:     { bg: 'rgba(251, 191, 36, 0.12)',  border: 'rgba(251, 191, 36, 0.4)',  dot: '#fbbf24', text: 'demo mode' },
  }[status];

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl"
      style={{ background: 'rgba(10, 10, 15, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
    >
      <div className="max-w-[1400px] mx-auto h-16 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl">🔮</span>
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-extrabold text-[17px] tracking-tight truncate">ARRA 🔮Racle</span>
            <span className="text-[11px] uppercase tracking-widest text-text-muted">Vector</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden md:inline text-[11px] text-text-muted tabular-nums truncate max-w-[220px]"
            title={label}
          >{label}</span>
          <span
            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[11px] font-semibold"
            style={{ background: chip.bg, border: `1px solid ${chip.border}`, color: chip.dot }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: chip.dot, boxShadow: `0 0 8px ${chip.dot}` }} />
            {chip.text}
          </span>
          <span className="text-[10px] text-text-muted tabular-nums">v{version}</span>
        </div>
      </div>
    </header>
  );
}
