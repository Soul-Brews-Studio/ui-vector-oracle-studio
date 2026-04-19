import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isVectorHost } from './Header';
import { getMenu, type MenuItem } from '../api/oracle';

type SubNavItem = { path: string; label: string; icon?: string };

const FALLBACK_ITEMS: SubNavItem[] = [
  { path: '/', label: 'Vector Playground', icon: '🔍' },
];

interface Props {
  items?: SubNavItem[];
}

function toSubNavItems(menu: MenuItem[]): SubNavItem[] {
  return menu
    .filter((m) => m.group !== 'hidden' && m.group !== 'admin' && m.hidden !== true)
    .sort((a, b) => a.order - b.order)
    .map((m) => ({
      path: m.path,
      label: m.label,
      ...(m.icon ? { icon: m.icon } : {}),
    }));
}

/**
 * Vector-only sub-nav tab strip, rendered below the main Header.
 * Hidden outside vector.* hosts so studio.* keeps its own nav untouched.
 * Items come from GET /api/menu?host=<current> with host-glob filtering.
 */
export function VectorSubNav({ items: override }: Props) {
  const location = useLocation();
  const [items, setItems] = useState<SubNavItem[]>(override ?? FALLBACK_ITEMS);

  useEffect(() => {
    if (override) return;
    if (typeof window === 'undefined') return;
    let cancelled = false;
    (async () => {
      try {
        const menu = await getMenu({ host: window.location.hostname });
        if (cancelled || menu.length === 0) return;
        const next = toSubNavItems(menu);
        if (next.length > 0) setItems(next);
      } catch {
        // keep fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [override]);

  if (!isVectorHost()) return null;

  return (
    <div
      className="sticky top-[92px] z-40 backdrop-blur-xl"
      style={{ background: 'rgba(10, 10, 15, 0.55)', borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
    >
      <nav className="flex items-center gap-1 px-4 py-1.5 max-w-[1400px] mx-auto overflow-x-auto">
        {items.map((it) => {
          const active = location.pathname === it.path;
          return (
            <Link
              key={it.path}
              to={it.path}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] whitespace-nowrap transition-all duration-150 ${
                active
                  ? 'bg-accent/15 text-accent font-semibold border border-accent/25'
                  : 'text-text-secondary hover:bg-bg-card hover:text-accent border border-transparent'
              }`}
            >
              {it.icon && <span aria-hidden>{it.icon}</span>}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
