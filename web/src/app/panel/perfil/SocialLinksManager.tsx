'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { SocialLink } from '@/lib/types';

const PLATFORMS = ['Instagram', 'LinkedIn', 'X', 'Facebook', 'TikTok', 'YouTube', 'GitHub'];

export default function SocialLinksManager({
  onItemsChange,
}: {
  onItemsChange?: (items: SocialLink[]) => void;
}) {
  const [items, setItems] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [url, setUrl] = useState('');

  function load() {
    api<SocialLink[]>('/social-links')
      .then((data) => {
        setItems(data);
        onItemsChange?.(data);
      })
      .catch(() => {
        setItems([]);
        onItemsChange?.([]);
      });
  }

  useEffect(load, []);

  async function handleAdd() {
    if (!url) return;
    await api('/social-links', { method: 'POST', body: JSON.stringify({ platform, url }) });
    setUrl('');
    load();
  }

  async function remove(id: string) {
    await api(`/social-links/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Redes sociales</h2>
      <div className="flex flex-wrap gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="border border-neutral-300 rounded-lg px-2 py-2 text-sm"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          className="border border-neutral-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[140px]"
        />
        <button type="button" onClick={handleAdd} className="text-sm bg-black text-white rounded-lg px-3">
          Agregar
        </button>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm border border-neutral-200 rounded-lg px-3 py-2"
          >
            <span>
              {item.platform} — <span className="text-neutral-500">{item.url}</span>
            </span>
            <button onClick={() => remove(item.id)} className="text-red-600 text-xs">
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
