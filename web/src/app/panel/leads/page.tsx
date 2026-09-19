'use client';

import { useEffect, useState } from 'react';
import { api, getToken } from '@/lib/api';

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
  source?: string | null;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Lead[]>('/leads')
      .then(setLeads)
      .catch((err) => setError(err.message));
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

  async function exportCsv() {
    const token = getToken();
    const res = await fetch(`${API_URL}/leads/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.message ?? 'Error al exportar');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Personas que dejaron sus datos desde tu perfil público.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!leads || leads.length === 0}
          className="text-sm border border-neutral-300 rounded-xl px-4 py-2 hover:bg-neutral-100 transition disabled:opacity-40 self-start sm:self-auto shrink-0"
        >
          Exportar CSV
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 bg-neutral-50">
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Nombre</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Contacto</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Mensaje</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {leads?.map((lead) => (
              <tr key={lead.id} className="border-b border-neutral-100 last:border-0">
                <td className="py-3 px-4 font-medium">{lead.name}</td>
                <td className="py-3 px-4 text-neutral-600">
                  {lead.email && <div>{lead.email}</div>}
                  {lead.phone && <div>{lead.phone}</div>}
                </td>
                <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">{lead.message}</td>
                <td className="py-3 px-4 text-neutral-500 text-xs">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {leads?.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-neutral-400">
                  Aún no tienes leads.
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
