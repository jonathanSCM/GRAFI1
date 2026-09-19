'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Summary {
  totalViews: number;
  byType: { eventType: string; _count: { _all: number } }[];
  clicksByLink: { id: string; title: string; clickCount: number }[];
}

const EVENT_LABELS: Record<string, string> = {
  PROFILE_VIEW: 'Visitas al perfil',
  NFC_SCAN: 'Escaneos NFC',
  QR_SCAN: 'Escaneos QR',
  WHATSAPP_CLICK: 'Clics en WhatsApp',
  PHONE_CLICK: 'Clics en llamar',
  EMAIL_CLICK: 'Clics en email',
  SOCIAL_CLICK: 'Clics en redes sociales',
  CUSTOM_LINK_CLICK: 'Clics en botones',
  SAVE_CONTACT_CLICK: 'Contactos guardados',
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    api<Summary>('/analytics/me/summary').then(setSummary).catch(() => {});
  }, []);

  if (!summary) return <p className="text-sm text-neutral-500">Cargando...</p>;

  const maxClicks = Math.max(1, ...summary.clicksByLink.map((l) => l.clickCount));

  const topActions = summary.byType
    .filter((row) => row.eventType !== 'PROFILE_VIEW')
    .sort((a, b) => b._count._all - a._count._all);

  const totalActions = topActions.reduce((sum, row) => sum + row._count._all, 0);
  const interactionRate = summary.totalViews > 0 ? Math.round((totalActions / summary.totalViews) * 100) : 0;

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analíticas</h1>
        <p className="text-sm text-neutral-500 mt-1">Cómo interactúan los visitantes con tu perfil.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <p className="text-xs text-neutral-500">Visitas totales</p>
          <p className="text-4xl font-semibold mt-1 tracking-tight">{summary.totalViews}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
          <p className="text-xs text-neutral-500">Tasa de interacción</p>
          <p className="text-4xl font-semibold mt-1 tracking-tight">{interactionRate}%</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-sm font-medium mb-4">Top acciones</h2>
        <div className="flex flex-col gap-2.5">
          {topActions.length === 0 && <p className="text-sm text-neutral-400">Sin datos todavía.</p>}
          {topActions.map((row, i) => (
            <div key={row.eventType} className="flex items-center justify-between text-sm">
              <span className="text-neutral-600 flex items-center gap-2">
                <span className="text-xs text-neutral-400 w-4">{i + 1}.</span>
                {EVENT_LABELS[row.eventType] ?? row.eventType}
              </span>
              <span className="font-medium">{row._count._all}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6">
        <h2 className="text-sm font-medium mb-4">Clics por botón</h2>
        <div className="flex flex-col gap-3">
          {summary.clicksByLink.length === 0 && <p className="text-sm text-neutral-400">Sin botones todavía.</p>}
          {summary.clicksByLink.map((link) => (
            <div key={link.id} className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>{link.title}</span>
                <span className="font-medium">{link.clickCount}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${(link.clickCount / maxClicks) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
