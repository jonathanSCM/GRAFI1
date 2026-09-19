'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Company, Profile, ProfileLink, SocialLink } from '@/lib/types';
import PhotoUploader from './PhotoUploader';
import SocialLinksManager from './SocialLinksManager';
import ColorCustomizer, { CustomizationState, DEFAULT_CUSTOMIZATION } from '@/components/ColorCustomizer';
import LivePreview from './LivePreview';

// Convierte cualquier texto en un slug válido: sin acentos, minúsculas,
// solo letras, números y guiones. Así el usuario nunca puede escribir uno inválido.
function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita acentos (a -> a)
    .toLowerCase()
    .replace(/\s+/g, '-') // espacios -> guiones
    .replace(/[^a-z0-9-]/g, '') // quita caracteres no permitidos
    .replace(/-+/g, '-'); // colapsa guiones repetidos
}

export default function ProfileEditorPage() {
  const [exists, setExists] = useState(true);
  const [form, setForm] = useState({
    slug: '',
    fullName: '',
    position: '',
    companyName: '',
    bio: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [photoStyle, setPhotoStyle] = useState<'COLOR' | 'BLACK_AND_WHITE'>('COLOR');
  const [customization, setCustomization] = useState<CustomizationState>(DEFAULT_CUSTOMIZATION);
  const [linkTitles, setLinkTitles] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  useEffect(() => {
    api<Profile>('/profiles/me')
      .then((p) => {
        setExists(true);
        setCompany(p.company ?? null);
        setForm({
          slug: p.slug,
          fullName: p.fullName,
          position: p.position ?? '',
          companyName: p.company ? p.company.name : p.companyName ?? '',
          bio: p.bio ?? '',
        });
        setPhoto(p.photo ?? null);
        setLogo(p.logo ?? null);
        setPhotoStyle(p.photoStyle);
        setCustomization({
          theme: p.theme,
          backgroundType: p.backgroundType,
          backgroundColor: p.backgroundColor ?? DEFAULT_CUSTOMIZATION.backgroundColor,
          backgroundTo: p.backgroundTo ?? DEFAULT_CUSTOMIZATION.backgroundTo,
          buttonColor: p.buttonColor ?? DEFAULT_CUSTOMIZATION.buttonColor,
          buttonTextColor: p.buttonTextColor ?? DEFAULT_CUSTOMIZATION.buttonTextColor,
          textColor: p.textColor ?? DEFAULT_CUSTOMIZATION.textColor,
        });
        setLinkTitles(p.links.filter((l) => l.isActive).map((l: ProfileLink) => l.title));
        setSocialLinks(p.socialLinks ?? []);
      })
      .catch(() => setExists(false));
  }, []);

  async function handleSubmit() {
    setSlugError(null);
    setMessage(null);

    if (!form.slug) {
      setSlugError('La URL (slug) es obligatoria. Ej: juan-perez');
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      setSlugError('La URL solo puede tener minúsculas, números y guiones. Ej: juan-perez');
      return;
    }
    if (!form.fullName) {
      setMessage({ text: 'El nombre completo es obligatorio', ok: false });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        photo,
        logo,
        photoStyle,
        ...customization,
      };
      if (exists) {
        await api('/profiles/me', { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        await api('/profiles', { method: 'POST', body: JSON.stringify(form) });
        await api('/profiles/me', { method: 'PATCH', body: JSON.stringify(payload) });
        setExists(true);
      }
      setMessage({ text: '✅ Guardado correctamente', ok: true });
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Error al guardar';
      // Si el error viene del slug (p. ej. ya está en uso), lo mostramos en rojo bajo la casilla.
      if (/slug|url/i.test(text)) {
        setSlugError('Esa URL ya está en uso o no es válida. Prueba con otra. Ej: juan-perez');
      } else {
        setMessage({ text, ok: false });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start max-w-5xl">
      <div className="w-full lg:flex-1 flex flex-col gap-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>

        <div className="flex flex-col gap-4">
          <label className="text-sm flex flex-col gap-1">
            URL pública (slug)
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugError(null);
                setForm({ ...form, slug: slugify(e.target.value) });
              }}
              disabled={exists}
              required
              placeholder="ej: juan-perez"
              className={`border rounded-xl px-3 py-2 ${
                slugError ? 'border-red-500' : 'border-neutral-300'
              } disabled:bg-neutral-100 disabled:text-neutral-500`}
            />
            {slugError ? (
              <span className="text-xs text-red-600 font-medium">{slugError}</span>
            ) : (
              <span className="text-xs text-neutral-500">
                Tu tarjeta será <b>grafi.digital/{form.slug || 'tu-nombre'}</b>. Solo minúsculas,
                números y guiones (sin espacios ni tildes).
              </span>
            )}
          </label>

          <label className="text-sm flex flex-col gap-1">
            Nombre completo
            <input
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              className="border border-neutral-300 rounded-xl px-3 py-2"
            />
          </label>

          <label className="text-sm flex flex-col gap-1">
            Cargo
            <input
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              className="border border-neutral-300 rounded-xl px-3 py-2"
            />
          </label>

          <label className="text-sm flex flex-col gap-1">
            Empresa
            <input
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              disabled={!!company}
              className="border border-neutral-300 rounded-xl px-3 py-2 disabled:bg-neutral-100 disabled:text-neutral-500"
            />
            {company && (
              <span className="text-xs text-neutral-500 flex items-center gap-1.5 mt-1">
                {company.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={company.logo} alt={company.name} className="w-4 h-4 rounded-full object-cover" />
                )}
                Detectado automáticamente porque perteneces a {company.name}. No se puede editar.
              </span>
            )}
          </label>

          <label className="text-sm flex flex-col gap-1">
            Descripción
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="border border-neutral-300 rounded-xl px-3 py-2"
            />
          </label>
        </div>

        {!exists && (
          <div className="border-t border-neutral-200 pt-6">
            <p className="text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
              💡 Completa tu URL y nombre, y toca <b>Guardar</b>. Enseguida se desbloquea la
              personalización: foto, logo, colores y redes.
            </p>
          </div>
        )}

        {exists && (
          <>
            <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
              <h2 className="text-sm font-medium">Foto y logo</h2>
              <PhotoUploader value={photo} onChange={setPhoto} label="Foto" />
              <PhotoUploader value={logo} onChange={setLogo} label="Logo" />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={photoStyle === 'BLACK_AND_WHITE'}
                  onChange={(e) => setPhotoStyle(e.target.checked ? 'BLACK_AND_WHITE' : 'COLOR')}
                />
                Foto en blanco y negro
              </label>
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <ColorCustomizer value={customization} onChange={setCustomization} />
            </div>

            <div className="border-t border-neutral-200 pt-6">
              <SocialLinksManager onItemsChange={setSocialLinks} />
            </div>
          </>
        )}

        {message && (
          <p className={`text-sm font-medium ${message.ok ? 'text-green-600' : 'text-red-600'}`}>
            {message.text}
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="bg-black text-white rounded-xl py-3 font-medium disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <LivePreview
        fullName={form.fullName}
        position={form.position}
        companyName={form.companyName}
        bio={form.bio}
        photo={photo}
        photoStyle={photoStyle}
        linkTitles={linkTitles}
        socialLinks={socialLinks}
        {...customization}
      />
    </div>
  );
}
