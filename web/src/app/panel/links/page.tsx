'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { ProfileLink } from '@/lib/types';
import LinkIcon from '@/components/LinkIcon';
import { LINK_TYPE_DEFS, getLinkTypeDef } from '@/lib/link-types';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const SELECTABLE_TYPES = LINK_TYPE_DEFS.filter((d) => d.type !== 'SAVE_CONTACT');

export default function LinksPage() {
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [picking, setPicking] = useState(false);
  const [activeType, setActiveType] = useState<ProfileLink['type'] | null>(null);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [dial, setDial] = useState(DEFAULT_COUNTRY.dial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [limit, setLimit] = useState<{ count: number; limit: number } | null>(null);

  function load() {
    api<ProfileLink[]>('/links').then(setLinks).catch(() => setLinks([]));
    api<{ count: number; limit: number }>('/links/limit').then(setLimit).catch(() => setLimit(null));
  }

  useEffect(load, []);

  function pickType(type: ProfileLink['type']) {
    const def = getLinkTypeDef(type);
    setActiveType(type);
    setTitle(def.label);
    setValue('');
    setDial(DEFAULT_COUNTRY.dial);
    setFileName('');
    setError(null);
    setPicking(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/uploads/document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('No se pudo subir el archivo');
      const { url } = await res.json();
      setValue(url);
      setFileName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!activeType) return;
    const def = getLinkTypeDef(activeType);
    if (def.field !== 'none' && !value.trim()) {
      setError('Completa este campo.');
      return;
    }
    const rawValue = def.field === 'phone' ? `${dial}${value}` : value;
    const url = def.field === 'none' ? '' : def.buildUrl(rawValue);
    try {
      await api('/links', { method: 'POST', body: JSON.stringify({ type: activeType, title, url }) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el botón');
      return;
    }
    setActiveType(null);
    setTitle('');
    setValue('');
    setDial(DEFAULT_COUNTRY.dial);
    setFileName('');
    load();
  }

  async function toggleActive(link: ProfileLink) {
    await api(`/links/${link.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    load();
  }

  async function remove(link: ProfileLink) {
    await api(`/links/${link.id}`, { method: 'DELETE' });
    load();
  }

  async function move(index: number, direction: -1 | 1) {
    const next = [...links];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLinks(next);
    await api('/links/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds: next.map((l) => l.id) }),
    });
  }

  const activeDef = activeType ? getLinkTypeDef(activeType) : null;
  const atLimit = limit ? limit.count >= limit.limit : false;

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Botones</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Estos son los botones de acción que verán tus visitantes en tu perfil público.
          {limit && (
            <span className={atLimit ? 'text-amber-600 font-medium' : ''}>
              {' '}
              {limit.count}/{limit.limit} usados.
            </span>
          )}
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
        <h2 className="text-sm font-medium">Agregar botón</h2>

        {atLimit && !activeType && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Alcanzaste el límite de {limit?.limit} botones de tu plan. Contacta a soporte para ampliarlo.
          </p>
        )}

        {!activeType && !picking && (
          <button
            onClick={() => setPicking(true)}
            disabled={atLimit}
            className="bg-black text-white rounded-xl py-2.5 font-medium text-sm hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Elegir tipo de botón
          </button>
        )}

        {picking && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {SELECTABLE_TYPES.map((def) => (
              <button
                key={def.type}
                onClick={() => pickType(def.type)}
                className="flex flex-col items-center gap-1.5 border border-neutral-200 rounded-xl py-3 px-2 hover:border-black hover:bg-neutral-50 transition"
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                  <LinkIcon type={def.type} className="w-4 h-4 text-neutral-700" />
                </div>
                <span className="text-[11px] text-center leading-tight">{def.label}</span>
              </button>
            ))}
          </div>
        )}

        {activeType && activeDef && (
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                <LinkIcon type={activeType} className="w-4 h-4 text-neutral-700" />
              </div>
              {activeDef.label}
              <button
                type="button"
                onClick={() => setActiveType(null)}
                className="ml-auto text-xs text-neutral-400 hover:text-neutral-700"
              >
                Cambiar
              </button>
            </div>
            <input
              placeholder="Título del botón"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />
            {activeDef.field === 'phone' && (
              <div className="flex gap-2">
                <select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  className="border border-neutral-300 rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 w-28"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial}>
                      {c.name} +{c.dial}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Número sin código de país"
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ''))}
                  inputMode="numeric"
                  required
                  className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            )}
            {activeDef.field === 'file' && (
              <div className="flex flex-col gap-2">
                <label className="border border-dashed border-neutral-300 rounded-xl px-3 py-3 text-sm text-center cursor-pointer hover:bg-neutral-50 transition">
                  {uploading ? 'Subiendo...' : fileName || 'Elegir archivo PDF'}
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            )}
            {activeDef.field !== 'none' && activeDef.field !== 'phone' && activeDef.field !== 'file' && (
              <input
                placeholder={activeDef.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                type={activeDef.field === 'email' ? 'email' : 'text'}
                required
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            )}
            {activeDef.helper && <p className="text-xs text-neutral-400">{activeDef.helper}</p>}
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={uploading || (activeDef.field === 'file' && !value)}
              className="bg-black text-white rounded-xl py-2.5 font-medium text-sm hover:bg-neutral-800 transition disabled:opacity-50"
            >
              Agregar botón
            </button>
          </form>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {links.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">Aún no tienes botones. Agrega el primero arriba.</p>
        )}
        {links.map((link, i) => (
          <div
            key={link.id}
            className={`flex flex-wrap items-center justify-between gap-y-2 border rounded-2xl px-4 py-3 bg-white transition ${
              link.isActive ? 'border-neutral-200' : 'border-neutral-100 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                <LinkIcon type={link.type} className="w-4 h-4 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm font-medium">{link.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{link.clickCount} clics</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm ml-auto">
              <button
                onClick={() => move(i, -1)}
                aria-label="Subir"
                className="w-9 h-9 rounded-lg hover:bg-neutral-100 transition flex items-center justify-center"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                aria-label="Bajar"
                className="w-9 h-9 rounded-lg hover:bg-neutral-100 transition flex items-center justify-center"
              >
                ↓
              </button>
              <button
                onClick={() => toggleActive(link)}
                className="text-xs border border-neutral-300 rounded-full px-2.5 py-1.5 hover:bg-neutral-100 transition ml-1"
              >
                {link.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => remove(link)}
                className="text-xs text-red-600 hover:bg-red-50 rounded-full px-2.5 py-1.5 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
