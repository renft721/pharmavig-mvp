import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/icons/Icon';
import { findingsApi } from '../api/client';

// Static mock data for ICSR-00482
const MOCK_FINDING = {
  id: 'icsr-00482',
  drug: 'Atorvastatina 40 mg',
  adverse_reaction: 'Mialgia severa con CK elevada',
  conf: 87,
  status: 'review',
  statusLabel: 'En revisión',
  cases: 234,
  severity: 'Grado 3',
  window: '90 días',
  meddra: '10028411',
  ndc: '0071-0156-23',
  detected: '11 may 2026',
  description: `Reacción adversa musculoesquelética grado 3 asociada a Atorvastatina en dosis ≥ 40 mg, predominante en pacientes mayores de 65 años con tratamiento concomitante de fibratos. La elevación de creatina quinasa (> 10× LSN) sugiere riesgo de rabdomiólisis.`,
  sources: [
    { src: 'FDA FAERS',                cases: 118, sev: 'Severa',   conf: 92, note: 'Predominio en >65 años' },
    { src: 'EudraVigilance',           cases: 64,  sev: 'Moderada', conf: 88, note: 'Discrepancia con FAERS' },
    { src: 'WHO VigiBase',             cases: 42,  sev: 'Severa',   conf: 74, note: 'Muestra reducida' },
    { src: 'PubMed (meta-análisis)',   cases: 10,  sev: 'Severa',   conf: 81, note: 'Estudio Lancet 2024' },
  ],
  reasoning: [
    'Agregación de 234 reportes de FAERS, EudraVigilance, VigiBase y PubMed con criterio MedDRA 10028411.',
    'Filtro por dosis ≥ 40 mg/día y edad ≥ 65 años → 187 casos relevantes.',
    'Detección de patrón estadístico significativo (PRR 4.2, χ² 89.7) vs línea base poblacional.',
    'Discrepancia detectada en gravedad: FAERS clasifica "severa" (118/234), EudraVigilance "moderada" (54/64) → marcado como conflicto.',
  ],
  timeline: [
    { t: 'Detectado por IA',    d: '11 may · 09:14', s: 'ai' },
    { t: 'Asignado a L. Pérez', d: '11 may · 09:18', s: 'brand' },
    { t: 'Conflicto detectado', d: '12 may · 14:02', s: 'conflict' },
    { t: 'Escalado a QPPV',     d: '13 may · 11:30', s: 'review' },
    { t: 'Pendiente de firma',  d: '14 may · ahora',  s: 'pending' },
  ],
};

export default function FindingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Use mock data (in production this would come from API)
  const f = MOCK_FINDING;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async () => {
    if (!comment.trim()) { alert('Añade un comentario antes de aprobar.'); return; }
    setLoading(true);
    try {
      await findingsApi.approve(id, comment);
      showToast('Hallazgo aprobado y firmado correctamente.');
      setTimeout(() => navigate('/approval'), 1500);
    } catch (e) {
      showToast(`Error: ${e.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) { alert('Añade un comentario antes de rechazar.'); return; }
    setLoading(true);
    try {
      await findingsApi.reject(id, comment);
      showToast('Hallazgo rechazado.');
      setTimeout(() => navigate('/approval'), 1500);
    } catch (e) {
      showToast(`Error: ${e.message}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Topbar
        title={`${f.drug} · ${f.adverse_reaction}`}
        breadcrumb={`Casos / ${f.drug} / ICSR‑00482`}
      />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'danger' ? 'var(--pv-danger-700)' : 'var(--pv-success-700)',
          color: '#fff', fontWeight: 600, fontSize: 14,
          boxShadow: 'var(--pv-shadow-lg)',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>

        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hero card */}
          <div className="pv-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '20px 28px',
              background: 'linear-gradient(180deg, var(--pv-teal-50), transparent)',
              borderBottom: '1px solid var(--pv-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pv-badge pv-badge--ai pv-badge--lg">
                    <Icon.Sparkle size={11} />Detectado por IA · {f.conf}%
                  </span>
                  <span className="pv-badge pv-badge--review pv-badge--lg">{f.statusLabel}</span>
                  <span className="pv-mono" style={{ color: 'var(--pv-text-muted)' }}>
                    ICSR‑00482 · MEDDRA {f.meddra}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="pv-btn pv-btn--ghost pv-btn--sm" onClick={() => navigate(-1)}>
                    <Icon.ArrowL />Anterior
                  </button>
                  <button className="pv-btn pv-btn--ghost pv-btn--sm">
                    Siguiente<Icon.ArrowR />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: 28 }}>
              <div className="pv-h1" style={{ marginBottom: 8 }}>{f.adverse_reaction}</div>
              <div className="pv-body" style={{ color: 'var(--pv-text-soft)', marginBottom: 20, maxWidth: 720 }}>
                {f.description}
              </div>

              {/* Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  ['Confianza IA',  `${f.conf}%`, 'var(--pv-teal-500)'],
                  ['Casos totales', String(f.cases), 'var(--pv-headline)'],
                  ['Gravedad media', f.severity, 'var(--pv-danger-700)'],
                  ['Ventana',       f.window, 'var(--pv-headline)'],
                ].map(([k, v, c]) => (
                  <div key={k} style={{ padding: 16, background: 'var(--pv-ink-50)', borderRadius: 12 }}>
                    <div className="pv-caption">{k}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: c, letterSpacing: '-0.02em', marginTop: 4 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Comment box */}
              <div className="pv-input" style={{ height: 'auto', padding: '12px 14px', marginBottom: 14, alignItems: 'flex-start' }}>
                <textarea
                  rows={3}
                  style={{ resize: 'vertical', width: '100%' }}
                  placeholder="Añade tu comentario de revisión antes de aprobar o rechazar…"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="pv-btn pv-btn--success" onClick={handleApprove} disabled={loading}>
                  <Icon.Check />Aprobar y firmar
                </button>
                <button className="pv-btn pv-btn--secondary" onClick={handleReject} disabled={loading}>
                  <Icon.X />Rechazar como falso positivo
                </button>
                <button className="pv-btn pv-btn--ai">
                  <Icon.Sparkle />Pedir evidencia adicional
                </button>
                <button className="pv-btn pv-btn--ghost">Asignar a QPPV</button>
              </div>
            </div>
          </div>

          {/* Conflict alert */}
          <div className="pv-alert pv-alert--conflict" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ width: 6, background: 'var(--pv-conflict-500)', flexShrink: 0 }} />
            <div style={{ padding: 20, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className="pv-alert__icon" style={{ background: 'var(--pv-conflict-100)', color: 'var(--pv-conflict-700)' }}>
                  <Icon.Split size={18} />
                </div>
                <div>
                  <div className="pv-alert__title">Conflicto detectado entre fuentes regulatorias</div>
                  <div className="pv-caption">FDA FAERS y EudraVigilance discrepan en la gravedad reportada.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence sources */}
          <div className="pv-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div className="pv-h3">Evidencia por fuente</div>
              <button className="pv-btn pv-btn--ghost pv-btn--sm">
                <Icon.External />Abrir todas
              </button>
            </div>
            {f.sources.map((s, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 0.7fr 0.7fr 1fr 1fr 80px',
                gap: 16,
                padding: '14px 0',
                borderBottom: i < f.sources.length - 1 ? '1px solid var(--pv-border)' : 'none',
                alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.src}</div>
                  <div className="pv-caption">{s.note}</div>
                </div>
                <div>
                  <div className="pv-caption">Casos</div>
                  <div className="pv-mono" style={{ fontSize: 14, color: 'var(--pv-text)' }}>{s.cases}</div>
                </div>
                <div>
                  <div className="pv-caption">Gravedad</div>
                  <div style={{ fontWeight: 600, color: s.sev === 'Severa' ? 'var(--pv-danger-700)' : 'var(--pv-warn-700)' }}>
                    {s.sev}
                  </div>
                </div>
                <div>
                  <div className="pv-caption" style={{ marginBottom: 4 }}>Confianza</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="pv-bar pv-bar--ai" style={{ flex: 1 }}>
                      <i style={{ width: s.conf + '%' }} />
                    </div>
                    <span className="pv-mono">{s.conf}%</span>
                  </div>
                </div>
                <div className="pv-caption">Sincronizado hace 14 min</div>
                <button className="pv-btn pv-btn--ghost pv-btn--sm" aria-label="Abrir fuente">
                  <Icon.External />
                </button>
              </div>
            ))}
          </div>

          {/* AI reasoning */}
          <div className="pv-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Icon.Sparkle size={18} />
              <div className="pv-h3">Razonamiento del agente</div>
              <span className="pv-badge pv-badge--ai" style={{ marginLeft: 'auto' }}>Trazable</span>
            </div>
            <ol style={{ paddingLeft: 22, margin: 0, display: 'grid', gap: 10 }}>
              {f.reasoning.map((r, i) => (
                <li key={i} className="pv-body-sm">{r}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Case data */}
          <div className="pv-card" style={{ padding: 20 }}>
            <div className="pv-h4" style={{ marginBottom: 12 }}>Datos del caso</div>
            {[
              ['Principio activo', f.drug],
              ['Dosis',            '40 mg / día'],
              ['Vía',              'Oral'],
              ['Población',        '≥ 65 años'],
              ['MedDRA',           f.meddra],
              ['NDC',              f.ndc],
              ['Detección',        f.detected],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--pv-border)' }}>
                <div className="pv-caption">{k}</div>
                <div className="pv-mono" style={{ color: 'var(--pv-text)' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Assignment */}
          <div className="pv-card" style={{ padding: 20 }}>
            <div className="pv-h4" style={{ marginBottom: 12 }}>Asignación</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div className="pv-avatar">MR</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Dra. Marta Ruiz</div>
                <div className="pv-caption">QPPV · Pharma EU</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="pv-avatar" style={{ background: 'var(--pv-teal-100)', color: 'var(--pv-teal-700)' }}>LP</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Luis Pérez</div>
                <div className="pv-caption">Especialista PV</div>
              </div>
            </div>
            <hr className="pv-hr" style={{ margin: '14px 0' }} />
            <div className="pv-caption">SLA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Icon.Clock size={14} />
              <span style={{ fontWeight: 600, color: 'var(--pv-warn-700)' }}>22 h restantes</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="pv-card" style={{ padding: 20 }}>
            <div className="pv-h4" style={{ marginBottom: 12 }}>Trazabilidad</div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative' }}>
              {f.timeline.map(({ t, d, s }, i) => (
                <li key={t} style={{ display: 'grid', gridTemplateColumns: '16px 1fr', gap: 12, padding: '8px 0' }}>
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <span
                      className={`pv-badge pv-badge--${s} pv-badge--plain`}
                      style={{ width: 12, height: 12, padding: 0, borderRadius: 999 }}
                    />
                    {i < f.timeline.length - 1 && (
                      <span style={{ position: 'absolute', top: 12, bottom: -8, width: 2, background: 'var(--pv-border)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{t}</div>
                    <div className="pv-caption">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
