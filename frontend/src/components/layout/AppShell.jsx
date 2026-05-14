import { Link, useLocation } from 'react-router-dom';
import Icon from '../icons/Icon';

const nav = [
  ['Dashboard', Icon.Grid, '/'],
  ['Casos', Icon.Doc, '/findings'],
  ['Cola de aprobación', Icon.List, '/approval'],
  ['Medicamentos', Icon.Pill, '/drugs'],
];

export default function AppShell({ children }) {
  const { pathname } = useLocation();

  const activeLabel = nav.find(([, , path]) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  })?.[0] ?? 'Dashboard';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', minHeight: '100vh', background: 'var(--pv-bg)' }}>
      {/* Sidebar */}
      <aside style={{
        background: 'var(--pv-blue-800)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '20px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 8px', marginBottom: 8 }}>
          <Icon.Logo size={28} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.015em' }}>Pharmavig</div>
            <div style={{ fontSize: 10.5, opacity: 0.6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
              Pharmacovigilance · AI
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {nav.map(([label, I, path]) => {
            const on = label === activeLabel;
            return (
              <Link key={label} to={path} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10,
                color: on ? '#fff' : 'rgba(255,255,255,0.65)',
                background: on ? 'rgba(255,255,255,0.12)' : 'transparent',
                fontWeight: 500, fontSize: 13.5, textDecoration: 'none',
                transition: 'background 150ms ease, color 150ms ease',
              }}>
                <I size={16} />{label}
                {on && (
                  <span style={{
                    marginLeft: 'auto', height: 18, padding: '0 8px', borderRadius: 999,
                    background: 'var(--pv-teal-400)', color: 'var(--pv-blue-900)',
                    fontSize: 10.5, fontWeight: 700, display: 'grid', placeItems: 'center',
                  }}>12</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* AI status */}
        <div style={{ marginTop: 'auto', padding: 14, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="pv-dot" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>Agente IA · activo</span>
          </div>
          <div style={{ fontSize: 11.5, opacity: 0.7, lineHeight: 1.45, marginBottom: 10 }}>
            Última sync hace 14 min · 1.247 fuentes
          </div>
          <button className="pv-btn pv-btn--ai pv-btn--sm" style={{ width: '100%', justifyContent: 'center' }}>
            <Icon.Sparkle />Ejecutar análisis
          </button>
        </div>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <div className="pv-avatar" style={{ background: 'var(--pv-teal-400)', color: 'var(--pv-blue-900)' }}>MR</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Dra. Marta Ruiz
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>QPPV · Pharma EU</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  );
}
