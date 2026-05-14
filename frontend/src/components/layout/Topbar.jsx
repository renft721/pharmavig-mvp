import Icon from '../icons/Icon';

export default function Topbar({ title, breadcrumb, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px', borderBottom: '1px solid var(--pv-border)',
      background: 'var(--pv-surface)',
    }}>
      <div>
        {breadcrumb && (
          <div className="pv-caption" style={{ marginBottom: 4 }}>{breadcrumb}</div>
        )}
        <div className="pv-h2">{title}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="pv-input" style={{ width: 340 }}>
          <Icon.Search />
          <input placeholder="Buscar caso, medicamento…" />
          <kbd>⌘K</kbd>
        </div>
        <button className="pv-btn pv-btn--secondary pv-btn--sm" aria-label="Notificaciones">
          <Icon.Bell />
        </button>
        {actions || (
          <button className="pv-btn pv-btn--primary">
            <Icon.Sparkle />Nuevo análisis
          </button>
        )}
      </div>
    </div>
  );
}
