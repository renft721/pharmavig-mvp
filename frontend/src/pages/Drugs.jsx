import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import Topbar from '../components/layout/Topbar';
import Icon from '../components/icons/Icon';

const SAMPLE_DRUGS = [
  { id: 1, name: 'Atorvastatina', dose: '10–80 mg', atc: 'C10AA05', findings: 4, status: 'active' },
  { id: 2, name: 'Metformina',    dose: '500–2550 mg', atc: 'A10BA02', findings: 2, status: 'active' },
  { id: 3, name: 'Sertralina',    dose: '50–200 mg',  atc: 'N06AB06', findings: 1, status: 'active' },
  { id: 4, name: 'Warfarina',     dose: '1–10 mg',    atc: 'B01AA03', findings: 3, status: 'active' },
  { id: 5, name: 'Ibuprofeno',    dose: '200–800 mg', atc: 'M01AE01', findings: 1, status: 'active' },
];

export default function Drugs() {
  const [search, setSearch] = useState('');

  const filtered = SAMPLE_DRUGS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <Topbar
        title="Medicamentos monitorizados"
        breadcrumb="Inicio / Medicamentos"
        actions={
          <button className="pv-btn pv-btn--primary">
            <Icon.Pill />Añadir medicamento
          </button>
        }
      />
      <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="pv-input" style={{ maxWidth: 480 }}>
          <Icon.Search />
          <input
            placeholder="Buscar medicamento o principio activo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="pv-table--rounded">
          <table className="pv-table">
            <thead>
              <tr>
                <th>Principio activo</th>
                <th>Dosis</th>
                <th>Código ATC</th>
                <th>Hallazgos activos</th>
                <th>Estado</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="pv-avatar" style={{ background: 'var(--pv-blue-50)', color: 'var(--pv-blue-700)' }}>
                        <Icon.Pill size={14} />
                      </div>
                      <span style={{ fontWeight: 600 }}>{d.name}</span>
                    </div>
                  </td>
                  <td className="pv-mono">{d.dose}</td>
                  <td className="pv-mono" style={{ color: 'var(--pv-blue-700)' }}>{d.atc}</td>
                  <td>
                    <span className={`pv-badge ${d.findings > 2 ? 'pv-badge--conflict' : 'pv-badge--pending'}`}>
                      {d.findings} hallazgo{d.findings !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td><span className="pv-badge pv-badge--approved">Activo</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="pv-btn pv-btn--ghost pv-btn--sm"><Icon.Search size={13} /></button>
                      <button className="pv-btn pv-btn--ai pv-btn--sm">
                        <Icon.Sparkle size={13} />Analizar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
