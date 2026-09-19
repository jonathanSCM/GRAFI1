'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import type { Profile, ProfileLink } from '@/lib/types';
import { resolveProfileStyle } from '@/lib/profile-style';
import LinkIcon from '@/components/LinkIcon';
import SaveContactModal from '@/components/SaveContactModal';
import LeadForm from '@/components/LeadForm';
import CatalogSection from '@/components/CatalogSection';
import PdfViewerModal from '@/components/PdfViewerModal';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

const LINK_LABELS: Record<string, string> = {
  WHATSAPP: 'WhatsApp',
  CALL: 'Llamar',
  EMAIL: 'Email',
  WEBSITE: 'Sitio web',
  PROJECTS: 'Proyectos',
  SCHEDULE_MEETING: 'Agendar reunión',
  SAVE_CONTACT: 'Guardar contacto',
  PDF: 'PDF',
  CUSTOM: '',
};

function trackEvent(slug: string, eventType: string, linkId?: string) {
  fetch(`${API_URL}/analytics/${slug}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, linkId }),
  }).catch(() => {});
}

function handleLinkClick(slug: string, link: ProfileLink) {
  if (link.type === 'SAVE_CONTACT') {
    trackEvent(slug, 'SAVE_CONTACT_CLICK', link.id);
    window.location.href = `${API_URL}/vcard/${slug}`;
    return;
  }
  const eventMap: Record<string, string> = {
    WHATSAPP: 'WHATSAPP_CLICK',
    CALL: 'PHONE_CLICK',
    EMAIL: 'EMAIL_CLICK',
    CUSTOM: 'CUSTOM_LINK_CLICK',
  };
  trackEvent(slug, eventMap[link.type] ?? 'CUSTOM_LINK_CLICK', link.id);
  window.open(link.url, '_blank');
}

export default function ProfileView({ profile }: { profile: Profile }) {
  const [host, setHost] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfViewer, setPdfViewer] = useState<{ url: string; title: string } | null>(null);

  const canSaveContact = profile.hasSaveContact !== false;

  useEffect(() => {
    trackEvent(profile.slug, 'PROFILE_VIEW');
    setHost(window.location.host);

    if (!canSaveContact) return;
    const key = `grafi_save_contact_dismissed_${profile.slug}`;
    const dismissed = localStorage.getItem(key) === '1';
    if (!dismissed) {
      const timer = setTimeout(() => setModalOpen(true), 700);
      return () => clearTimeout(timer);
    }
  }, [profile.slug, canSaveContact]);

  function closeModal() {
    localStorage.setItem(`grafi_save_contact_dismissed_${profile.slug}`, '1');
    setModalOpen(false);
  }

  const style = resolveProfileStyle(profile);

  return (
    <main
      className="min-h-screen flex justify-center px-4 py-12"
      style={{ ...style.backgroundStyle, color: style.textColor }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {profile.company && (
          <Link
            href={`/empresa/${profile.company.slug}`}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border opacity-80 hover:opacity-100 transition"
            style={{ borderColor: `${style.textColor}33` }}
          >
            {profile.company.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.company.logo} alt={profile.company.name} className="w-3.5 h-3.5 rounded-full object-cover" />
            )}
            <span>{profile.company.name}</span>
          </Link>
        )}

        {profile.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.photo}
            alt={profile.fullName}
            className={`w-28 h-28 rounded-full object-cover shadow-lg ring-1 ring-black/5 ${
              profile.photoStyle === 'BLACK_AND_WHITE' ? 'grayscale' : ''
            }`}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-2xl font-semibold shadow-lg"
            style={{ backgroundColor: style.buttonBackground, color: style.buttonTextColor }}
          >
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">{profile.fullName}</h1>
          {profile.position && (
            <p className="text-sm opacity-70 mt-0.5">
              {profile.position}
              {profile.companyName ? ` · ${profile.companyName}` : ''}
            </p>
          )}
          {profile.bio && <p className="mt-3 text-sm opacity-80 leading-relaxed">{profile.bio}</p>}
        </div>

        {profile.socialLinks.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center">
            {profile.socialLinks.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent(profile.slug, 'SOCIAL_CLICK')}
                className="text-xs px-3 py-1.5 rounded-full border opacity-90 hover:opacity-100 transition"
                style={{ borderColor: `${style.textColor}33` }}
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}

        <div className="w-full flex flex-col gap-3 mt-2">
          {profile.links.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                if (link.type === 'PDF') {
                  trackEvent(profile.slug, 'CUSTOM_LINK_CLICK', link.id);
                  setPdfViewer({ url: link.url, title: link.title || 'PDF' });
                  return;
                }
                handleLinkClick(profile.slug, link);
              }}
              className="w-full rounded-2xl border py-3.5 px-4 text-sm font-medium transition active:scale-[0.98] hover:opacity-90 shadow-sm flex items-center justify-center gap-2"
              style={{
                backgroundColor: style.buttonBackground,
                borderColor: style.buttonBorder,
                color: style.buttonTextColor,
              }}
            >
              <LinkIcon type={link.type} className="w-4 h-4 shrink-0" />
              {link.title || LINK_LABELS[link.type]}
            </button>
          ))}
        </div>

        {canSaveContact && (
          <button
            onClick={() => setModalOpen(true)}
            className="w-full rounded-2xl border py-3.5 px-4 text-sm font-medium transition active:scale-[0.98] hover:opacity-90 shadow-sm flex items-center justify-center gap-2 mt-2"
            style={{
              backgroundColor: style.buttonBackground,
              borderColor: style.buttonBorder,
              color: style.buttonTextColor,
            }}
          >
            <Download className="w-4 h-4 shrink-0" />
            Guardar contacto
          </button>
        )}

        <CatalogSection slug={profile.slug} textColor={style.textColor} />

        <LeadForm slug={profile.slug} textColor={style.textColor} />

        <p className="text-[11px] opacity-40 mt-6">
          {host}/{profile.slug}
        </p>
      </div>

      {canSaveContact && (
        <SaveContactModal
          open={modalOpen}
          onClose={closeModal}
          profile={profile}
          onSave={() => trackEvent(profile.slug, 'SAVE_CONTACT_CLICK')}
        />
      )}

      {pdfViewer && (
        <PdfViewerModal url={pdfViewer.url} title={pdfViewer.title} onClose={() => setPdfViewer(null)} />
      )}
    </main>
  );
}
