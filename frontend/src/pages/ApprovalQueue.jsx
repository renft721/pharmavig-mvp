import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/icons/Icon';

const ALL_ROWS = [
  ['ICSR-00482', 'Atorvastatina', '40 mg',  'Mialgia · CK elevada',         87, 'Marta R.', 'review',   'Revisar',   '22 h'],
  ['ICSR-00481', 'Metformina',    '850 mg',  'Acidosis láctica',              92, 'Marta R.', 'conflict', 'Conflicto', '8 h'],
  ['ICSR-00480', 'Sertralina',    '50 mg',   'Hiponatremia',                  74, 'Luis P.',  'pending',  'Pendiente', '48 h'],
  ['ICSR-00479', 'Warfarina',     '5 mg',    'Hematoma subdural',             96, 'Marta R.', 'approved', 'Aprobado',  '—'],
  ['ICSR-00478', 'Ibuprofeno',    '600 mg',  'Reacción gastrointestinal',     68, 'Luis P.',  'rejected', 'Rechazado', '—'],
  ['ICSR-00477', 'Amlodipino',    '10 mg',   'Edema periférico',              81, '—',        'pending',  'Pendiente', '52 h'],
  ['ICSR-00476', 'Omeprazol',     '20 mg',   'Hipomagnesemia',                78, 'Luis P.',  'review',   'Revisar',   '18 h'],
  ['ICSR-00475', 'Levotiroxina',  '100 µg',  'Palpitaciones',                 65, '—',        'pending',  'Pendiente', '60 h'],
  ['ICSR-00474', 'Clopidogrel',   '75 mg',   'Sangrado digestivo',            89, 'Marta R.', 'review',   'Revisar',   '30 h'],
  ['ICSR-00473', 'Simvastatina',  '20 mg',   'Mialgia',                       82, 'Luis P.',  'conflict', 'Conflicto', '12 h'],
];

const STATUS_FILTERS = ['Todos · 47', 'Pendiente · 24', 'Revisar · 12', 'Conflicto · 3', 'Aprobado · 184'];

export default function ApprovalQueue() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(new Set([0, 1, 2]));
  const [filterIdx, setFilterIdx] = useState(0);
  const [search, setSearch] = useState('');

  const toggleRow = (i) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const toggleAll = () => {
    selected.size === ALL_ROWS.length ? setSelected(new Set()) : setSelected(new Set(ALL_ROWS.map((_, i) => i)));
  };

  const filtered = ALL_ROWS.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r[0].toLowerCase().includes(q) || r[1].toLowerCase().includes(q) || r[3].toLowerCase().includes(q);
  });

  const slaColor = (sla) => {
    if (sla === '—') return 'var(--pv-text)';
    const h = parseInt(sla);
    if (h < 24) return 'var(--pv-danger-700)';
    if (h < 48) return 'var(--pv-warn-700)';
    return 'var(--pv-text)';
  };

  return (
    <AppShell>
      <Topbar title="Cola de aprobación · 47 hallazgos pendientes" breadcrumb="Inicio / Cola de aprobación" />
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Filter bar */}
        <div className="pv-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div className="pv-input" style={{ flex: '1 1 320px', minWidth: 280 }}>
            <Icon.Search />
            <input
              placeholder="Filtrar por medicamento, MedDRA o número de caso…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUS_FILTERS.map((f, i) => (
              <button
                key={f}
                className="pv-chip"
                aria-pressed={filterIdx === i ? 'true' : 'false'}
                onClick={() => setFilterIdx(i)}
              >{f}</button>
            ))}
          </div>
          <button className="pv-btn pv-btn--secondary pv-btn--sm">
            <Icon.Filter />Más filtros
          </button>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="pv-card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 14, background: 'var(--pv-blue-50)', borderColor: 'var(--pv-blue-100)' }}>
            <span className="pv-badge pv-badge--brand">{selected.size} seleccionados</span>
            <div className="pv-body-sm" style={{ color: 'var(--pv-blue-700)' }}>
              Aplicar acción a los hallazgos seleccionados:
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
              <button className="pv-btn pv-btn--success pv-btn--sm">
                <Icon.Check />Aprobar todos
              </button>
              <button className="pv-btn pv-btn--secondary pv-btn--sm">
                <Icon.X />Rechazar
              </button>
              <button className="pv-btn pv-btn--ghost pv-btn--sm">Asignar…</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="pv-table--rounded">
          <table className="pv-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todo"
                    checked={selected.size === ALL_ROWS.length}
                    onChange={toggleAll}
                  />
                </th>
                <th>Caso</th>
                <th>Medicamento</th>
                <th>Reacción adversa</th>
                <th>Confianza</th>
                <th>Asignado a</th>
                <th>Estado</th>
                <th>SLA</th>
                <th style={{ width: 80 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r[0]} onClick={() => navigate(`/findings/${r[0].toLowerCase()}`)} style={{ cursor: 'pointer' }}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.has(i)}
                      onChange={() => toggleRow(i)}
                      aria-label={`Seleccionar ${r[0]}`}
                    />
                  </td>
                  <td>
                    <span className="pv-mono" style={{ color: 'var(--pv-blue-700)', fontWeight: 600 }}>{r[0]}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r[1]}</div>
                    <div className="pv-caption">{r[2]}</div>
                  </td>
                  <td>{r[3]}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="pv-bar" style={{ width: 84 }}>
                        <i style={{
                          width: r[4] + '%',
                          background: r[4] >= 85 ? 'var(--pv-success-500)' : r[4] >= 70 ? 'var(--pv-warn-500)' : 'var(--pv-ink-400)',
                        }} />
                      </div>
                      <span className="pv-mono">{r[4]}%</span>
                    </div>
                  </td>
                  <td>
                    {r[5] === '—' ? (
                      <span className="pv-caption">Sin asignar</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="pv-avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                          {r[5].split(' ').map((s) => s[0]).join('')}
                        </div>
                        <span className="pv-body-sm">{r[5]}</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`pv-badge pv-badge--${r[6]}`}>{r[7]}</span>
                  </td>
                  <td>
                    {r[8] === '—' ? (
                      <span className="pv-caption">—</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: slaColor(r[8]) }}>
                        <Icon.Clock size={13} />
                        <span className="pv-body-sm" style={{ fontWeight: 600 }}>{r[8]}</span>
                      </div>
                    )}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="pv-btn pv-btn--success pv-btn--sm" aria-label="Aprobar" style={{ padding: '0 10px' }}>
                        <Icon.Check />
                      </button>
                      <button
                        className="pv-btn pv-btn--secondary pv-btn--sm"
                        aria-label="Abrir"
                        style={{ padding: '0 10px' }}
                        onClick={() => navigate(`/findings/${r[0].toLowerCase()}`)}
                      >
                        <Icon.ArrowR />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid var(--pv-border)',
          }}>
            <div className="pv-caption">Mostrando {filtered.length} de 47 hallazgos</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="pv-btn pv-btn--ghost pv-btn--sm"><Icon.ArrowL />Anterior</button>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className="pv-btn pv-btn--ghost pv-btn--sm"
                  style={{
                    minWidth: 34, padding: 0, justifyContent: 'center',
                    background: n === 1 ? 'var(--pv-blue-700)' : 'transparent',
                    color: n === 1 ? '#fff' : 'inherit',
                  }}
                >{n}</button>
              ))}
              <button className="pv-btn pv-btn--ghost pv-btn--sm">Siguiente<Icon.ArrowR /></button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
