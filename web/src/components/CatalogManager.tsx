'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

interface CollaboratorOption {
  id: string;
  fullName: string;
  slug: string;
}

interface CatalogItem {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  link?: string | null;
  isActive: boolean;
  assignedTo: CollaboratorOption[];
}

export default function CatalogManager({ collaborators }: { collaborators: CollaboratorOption[] }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [assigned, setAssigned] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  function load() {
    api<CatalogItem[]>('/companies/me/catalog').then(setItems).catch(() => setItems([]));
  }

  useEffect(load, []);

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/uploads/image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setImage(url);
    } finally {
      setUploading(false);
    }
  }

  async function handlePdfFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/uploads/document`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setLink(url);
      setPdfName(file.name);
    } finally {
      setUploadingPdf(false);
    }
  }

  function toggleAssigned(id: string) {
    setAssigned((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/companies/me/catalog', {
        method: 'POST',
        body: JSON.stringify({ title, description, link, image, assignedProfileIds: assigned }),
      });
      setTitle('');
      setDescription('');
      setLink('');
      setImage(null);
      setPdfName('');
      setAssigned([]);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: CatalogItem) {
    await api(`/companies/me/catalog/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load();
  }

  async function remove(item: CatalogItem) {
    await api(`/companies/me/catalog/${item.id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleAdd} className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3">
        <h2 className="text-sm font-medium">Agregar producto / servicio al catálogo</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center border border-neutral-200 shrink-0">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-neutral-400">Sin imagen</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-sm border border-neutral-300 rounded-lg px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
        </div>
        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 resize-none"
        />
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-2">
            <input
              placeholder="Enlace (opcional) o sube un PDF"
              value={link}
              onChange={(e) => {
                setLink(e.target.value);
                setPdfName('');
              }}
              className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={uploadingPdf}
              className="text-sm border border-neutral-300 rounded-xl px-3 py-2 hover:bg-neutral-50 disabled:opacity-50 shrink-0"
            >
              {uploadingPdf ? 'Subiendo...' : 'Subir PDF'}
            </button>
            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfFile}
            />
          </div>
          {pdfName && <p className="text-xs text-neutral-500">📄 {pdfName} — se abrirá dentro del perfil.</p>}
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-1.5">Asignar a colaboradores (se mostrará en su perfil público)</p>
          <div className="flex flex-wrap gap-1.5">
            {collaborators.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleAssigned(c.id)}
                className={`text-xs rounded-full px-3 py-1.5 border transition ${
                  assigned.includes(c.id)
                    ? 'bg-black text-white border-black'
                    : 'border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {c.fullName}
              </button>
            ))}
            {collaborators.length === 0 && (
              <span className="text-xs text-neutral-400">Sin colaboradores con perfil aún.</span>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white rounded-xl py-2.5 font-medium text-sm hover:bg-neutral-800 transition disabled:opacity-50 self-start px-5"
        >
          {saving ? 'Guardando...' : 'Agregar al catálogo'}
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {items.length === 0 && (
          <p className="text-sm text-neutral-400 text-center py-8">Aún no hay productos en el catálogo.</p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-wrap items-center justify-between gap-y-2 border rounded-2xl px-4 py-3 bg-white transition ${
              item.isActive ? 'border-neutral-200' : 'border-neutral-100 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex items-center justify-center shrink-0">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-neutral-400">—</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {item.assignedTo.length > 0
                    ? item.assignedTo.map((a) => a.fullName).join(', ')
                    : 'Sin asignar'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm ml-auto">
              <button
                onClick={() => toggleActive(item)}
                className="text-xs border border-neutral-300 rounded-full px-2.5 py-1.5 hover:bg-neutral-100 transition"
              >
                {item.isActive ? 'Desactivar' : 'Activar'}
              </button>
              <button
                onClick={() => remove(item)}
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
