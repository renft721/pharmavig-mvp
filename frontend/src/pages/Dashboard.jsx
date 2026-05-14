import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/icons/Icon';
import { findingsApi } from '../api/client';

// Mock data for demo (replaces live API data when backend is unavailable)
const MOCK_FINDINGS = [
  { id: 'icsr-00482', drug: 'Atorvastatina 40mg', react: 'Mialgia · CK elevada',   conf: 87, status: 'review',    label: 'Revisar',   cases: 234, sources: '3 / 4' },
  { id: 'icsr-00481', drug: 'Metformina 850mg',   react: 'Acidosis láctica',         conf: 92, status: 'conflict',  label: 'Conflicto', cases: 187, sources: '4 / 4' },
  { id: 'icsr-00480', drug: 'Sertralina 50mg',    react: 'Hiponatremia',             conf: 74, status: 'pending',   label: 'Pendiente', cases: 62,  sources: '2 / 4' },
  { id: 'icsr-00479', drug: 'Warfarina 5mg',      react: 'Hematoma subdural',        conf: 96, status: 'review',    label: 'Revisar',   cases: 412, sources: '4 / 4' },
];

const RECENT_DRUGS = ['Metformina', 'Sertralina', 'Warfarina', 'Ibuprofeno', 'Amlodipino'];

const MY_QUEUE = [
  ['ICSR-00482', 'Atorvastatina', 'review'],
  ['ICSR-00481', 'Metformina',   'conflict'],
  ['ICSR-00477', 'Amlodipino',   'pending'],
  ['ICSR-00475', 'Omeprazol',    'review'],
  ['ICSR-00473', 'Levotiroxina', 'pending'],
];

const ACTIVITY = [
  { who: 'Agente IA', what: 'detectó conflicto en ICSR‑00481', t: 'hace 14 m', ai: true },
  { who: 'L. Pérez',  what: 'aprobó ICSR‑00479',               t: 'hace 1 h' },
  { who: 'Tú',        what: 'asignaste ICSR‑00478 a QPPV',      t: 'hace 2 h' },
  { who: 'Agente IA', what: 'sincronizó EudraVigilance',        t: 'hace 3 h', ai: true },
];

const KPIS = [
  ['Pendientes',   '47',  '+8 vs ayer',     'var(--pv-orange-500)'],
  ['En revisión',  '12',  '5 propios',      'var(--pv-warn-500)'],
  ['Conflictos',   '3',   'Requieren QPPV', 'var(--pv-conflict-500)'],
  ['Aprobados 7d', '184', '+22%',           'var(--pv-success-500)'],
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState(MOCK_FINDINGS);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');

  useEffect(() => {
    findingsApi.listPending().then((data) => {
      if (data?.length) setFindings(data);
    }).catch(() => {/* stay with mock data */});
  }, []);

  const filters = ['Todos', 'Conflicto', 'Alta confianza', 'Asignados a mí'];

  return (
    <AppShell>
      <Topbar title="Cola de hallazgos · pendientes de revisión" breadcrumb="Inicio / Dashboard" />
      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Hero search */}
          <div className="pv-card pv-bg-wash" style={{ padding: 32, borderRadius: 18 }}>
            <div className="pv-eyebrow" style={{ marginBottom: 8 }}>Búsqueda activa</div>
            <div className="pv-h1" style={{ marginBottom: 16, maxWidth: 520 }}>
              ¿Qué medicamento quieres investigar hoy?
            </div>
            <div className="pv-input pv-input--lg" style={{ background: 'var(--pv-surface)', boxShadow: 'var(--pv-shadow-md)' }}>
              <Icon.Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Principio activo, nombre comercial…"
              />
              <button className="pv-btn pv-btn--ai pv-btn--sm">
                <Icon.Sparkle />Investigar
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pv-caption" style={{ marginRight: 4 }}>Recientes:</span>
              {RECENT_DRUGS.map((d) => (
                <button key={d} className="pv-chip" onClick={() => setSearch(d)}>{d}</button>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {KPIS.map(([k, v, s, c]) => (
              <div key={k} className="pv-card" style={{ padding: 18 }}>
                <div className="pv-caption">{k}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--pv-headline)', letterSpacing: '-0.02em', marginTop: 2 }}>{v}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 12, color: c, fontWeight: 600 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: c }} />{s}
                </div>
              </div>
            ))}
          </div>

          {/* AI summary alert */}
          <div className="pv-alert pv-alert--ai">
            <div className="pv-alert__icon"><Icon.Sparkle size={18} /></div>
            <div style={{ flex: 1 }}>
              <div className="pv-alert__title">Resumen del agente · últimas 24 h</div>
              <div className="pv-alert__body">
                Se procesaron 1.247 fuentes y se generaron 12 hallazgos nuevos. 3 presentan conflicto
                entre FDA FAERS y EudraVigilance y requieren tu firma como QPPV.
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="pv-btn pv-btn--brand pv-btn--sm" onClick={() => navigate('/approval')}>
                  Ver los 3 conflictos
                </button>
                <button className="pv-btn pv-btn--ghost pv-btn--sm">
                  Descargar resumen PDF
                </button>
              </div>
            </div>
          </div>

          {/* Findings grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div className="pv-h3">Hallazgos prioritarios</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {filters.map((f) => (
                  <button
                    key={f}
                    className="pv-chip"
                    aria-pressed={filter === f ? 'true' : 'false'}
                    onClick={() => setFilter(f)}
                  >{f}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {findings.map((f, i) => (
                <div
                  key={f.id || i}
                  className="pv-card"
                  style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }}
                  onClick={() => navigate(`/findings/${f.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <div className="pv-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon.Sparkle size={11} /> Hallazgo IA
                      </div>
                      <div className="pv-h4" style={{ marginTop: 6 }}>{f.react || f.adverse_reaction}</div>
                      <div className="pv-body-sm" style={{ color: 'var(--pv-text-soft)' }}>{f.drug || f.drug_id}</div>
                    </div>
                    <span className={`pv-badge pv-badge--${f.status}`}>{f.label || f.status}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div className="pv-caption" style={{ marginBottom: 4 }}>Confianza {f.conf || 80}%</div>
                      <div className="pv-bar pv-bar--ai"><i style={{ width: (f.conf || 80) + '%' }} /></div>
                    </div>
                    {f.sources && <div className="pv-caption">{f.sources}</div>}
                  </div>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="pv-btn pv-btn--success pv-btn--sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); alert('Aprobado'); }}
                    >
                      <Icon.Check />Aprobar
                    </button>
                    <button
                      className="pv-btn pv-btn--secondary pv-btn--sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={(e) => { e.stopPropagation(); alert('Rechazado'); }}
                    >
                      <Icon.X />Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="pv-card" style={{ padding: 20 }}>
            <div className="pv-h4" style={{ marginBottom: 14 }}>Mi cola</div>
            {MY_QUEUE.map(([id, drug, s]) => (
              <div
                key={id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', borderRadius: 8, cursor: 'pointer' }}
                onClick={() => navigate(`/findings/${id.toLowerCase().replace('-', '-')}`)}
              >
                <span className={`pv-badge pv-badge--${s} pv-badge--plain`} style={{ width: 8, padding: '0 6px', height: 18 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pv-mono" style={{ color: 'var(--pv-blue-700)', fontWeight: 600 }}>{id}</div>
                  <div className="pv-caption">{drug}</div>
                </div>
                <Icon.ArrowR size={14} />
              </div>
            ))}
          </div>

          <div className="pv-card" style={{ padding: 20 }}>
            <div className="pv-h4" style={{ marginBottom: 14 }}>Actividad reciente</div>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--pv-border)' : 'none' }}>
                <div className="pv-avatar" style={{
                  width: 28, height: 28, fontSize: 11,
                  background: a.ai ? 'var(--pv-teal-100)' : 'var(--pv-blue-100)',
                  color: a.ai ? 'var(--pv-teal-700)' : 'var(--pv-blue-700)',
                }}>
                  {a.ai ? 'AI' : a.who[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pv-body-sm"><b>{a.who}</b> {a.what}</div>
                  <div className="pv-caption">{a.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
