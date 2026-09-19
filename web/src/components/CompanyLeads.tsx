'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  createdAt: string;
  collaborator: { fullName: string; slug: string } | null;
}

export default function CompanyLeads() {
  const [leads, setLeads] = useState<Lead[] | null>(null);

  useEffect(() => {
    api<Lead[]>('/companies/me/leads').then(setLeads).catch(() => setLeads([]));
  }, []);

  function exportCsv() {
    if (!leads) return;
    downloadCsv(
      `leads-empresa-${new Date().toISOString().slice(0, 10)}.csv`,
      leads.map((l) => ({
        Colaborador: l.collaborator?.fullName ?? '',
        Nombre: l.name,
        Email: l.email ?? '',
        Teléfono: l.phone ?? '',
        Mensaje: l.message ?? '',
        Fecha: new Date(l.createdAt).toLocaleString(),
      })),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">Leads capturados por todos los colaboradores.</p>
        <button
          onClick={exportCsv}
          disabled={!leads || leads.length === 0}
          className="text-sm border border-neutral-300 rounded-xl px-4 py-2 hover:bg-neutral-100 transition disabled:opacity-40 self-start sm:self-auto shrink-0"
        >
          Exportar CSV
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 bg-neutral-50">
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Colaborador</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Nombre</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Contacto</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => (
              <tr key={lead.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 px-4 text-neutral-600">{lead.collaborator?.fullName ?? '—'}</td>
                <td className="py-3 px-4 font-medium">{lead.name}</td>
                <td className="py-3 px-4 text-neutral-600">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div>{lead.phone}</div>}
                </td>
                <td className="py-3 px-4 text-neutral-500 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {leads?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-400">
                  Sin leads todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
