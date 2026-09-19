'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Profile } from '@/lib/types';

interface Summary {
  totalViews: number;
  byType: { eventType: string; _count: { _all: number } }[];
}

export default function PanelHome() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api<Profile>('/profiles/me')
      .then((p) => {
        setProfile(p);
        api<Summary>('/analytics/me/summary').then(setSummary).catch(() => {});
      })
      .catch((err) => setError(err.message));
  }, []);

  function copyUrl() {
    if (!profile) return;
    navigator.clipboard.writeText(`${window.location.origin}/${profile.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (error) {
    return (
      <div className="max-w-md bg-white border border-neutral-200 rounded-2xl p-8 text-center">
        <p className="text-sm text-neutral-600 mb-3">Aún no tienes un perfil creado.</p>
        <Link
          href="/panel/perfil"
          className="inline-block bg-black text-white text-sm rounded-xl px-4 py-2 font-medium"
        >
          Crear mi perfil
        </Link>
      </div>
    );
  }

  if (!profile) return <p className="text-sm text-neutral-500">Cargando...</p>;

  const activeLinks = profile.links.filter((l) => l.isActive).length;

  const totalViews = summary?.totalViews ?? 0;
  const totalClicks =
    summary?.byType.reduce((sum, t) => (t.eventType === 'PROFILE_VIEW' ? sum : sum + t._count._all), 0) ?? 0;
  const savedContacts =
    summary?.byType.find((t) => t.eventType === 'SAVE_CONTACT_CLICK')?._count._all ?? 0;
  const interactionRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola, {profile.fullName.split(' ')[0]} 👋</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <a
            href={`/${profile.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-neutral-600 hover:text-black transition underline-offset-2 hover:underline"
          >
            {typeof window !== 'undefined' ? window.location.host : 'dominio.com'}/{profile.slug}
          </a>
          <button
            onClick={copyUrl}
            className="text-xs border border-neutral-300 rounded-full px-2.5 py-1 hover:bg-neutral-100 transition"
          >
            {copied ? 'Copiado ✓' : 'Copiar enlace'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500">Visitas</p>
          <p className="text-3xl font-semibold mt-1">{summary ? totalViews : '—'}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500">Clics</p>
          <p className="text-3xl font-semibold mt-1">{summary ? totalClicks : '—'}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500">Contactos guardados</p>
          <p className="text-3xl font-semibold mt-1">{summary ? savedContacts : '—'}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-5">
          <p className="text-xs text-neutral-500">Tasa de interacción</p>
          <p className="text-3xl font-semibold mt-1">{summary ? `${interactionRate}%` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/panel/perfil"
          className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition"
        >
          <p className="text-sm font-medium">Editar perfil</p>
          <p className="text-xs text-neutral-500 mt-1">Foto, colores, fondo y datos</p>
        </Link>
        <Link
          href="/panel/links"
          className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition"
        >
          <p className="text-sm font-medium">Gestionar botones</p>
          <p className="text-xs text-neutral-500 mt-1">Agregar, reordenar y activar</p>
        </Link>
        <Link
          href="/panel/qr"
          className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition"
        >
          <p className="text-sm font-medium">Descargar QR</p>
          <p className="text-xs text-neutral-500 mt-1">Para imprimir o compartir</p>
        </Link>
      </div>
    </div>
  );
}
