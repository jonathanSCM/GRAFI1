import Image from 'next/image';
import Link from 'next/link';
import { Unbounded, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  Check,
  CircleUserRound,
  Contact,
  FolderKanban,
  Globe,
  Layers,
  Palette,
  QrCode,
  SmartphoneNfc,
  Tag,
  Users,
  Zap,
} from 'lucide-react';
import LinkIcon from '@/components/LinkIcon';
import Reveal from '@/components/landing/Reveal';
import FaqAccordion from '@/components/landing/FaqAccordion';
import { FAQS } from '@/components/landing/faqs';
import './landing.css';

const display = Unbounded({ subsets: ['latin'], weight: ['500', '600', '800'], variable: '--font-lp-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-lp-body' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-lp-mono' });

const WHATSAPP_LINK = 'https://wa.me/59162095357';

const getWhatsAppLink = (message: string) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/59162095357?text=${encodedMessage}`;
};

const INCLUDES = [
  { icon: SmartphoneNfc, label: 'Tarjeta NFC personalizada' },
  { icon: QrCode, label: 'Código QR dinámico' },
  { icon: Palette, label: 'Perfil digital editable' },
  { icon: Layers, label: 'Botones de contacto' },
  { icon: Globe, label: 'Redes sociales' },
  { icon: Briefcase, label: 'Portafolio, catálogo o servicios' },
  { icon: Contact, label: 'Botón para guardar contacto' },
  { icon: BarChart3, label: 'Analíticas básicas' },
  { icon: Users, label: 'Captación de leads' },
];

const STEPS = [
  { n: '01', title: 'Recibe tu tarjeta Grafi', text: 'Te entregamos una tarjeta NFC personalizada lista para usar.' },
  { n: '02', title: 'Configura tu perfil digital', text: 'Agrega tu foto, cargo, empresa, WhatsApp, redes, catálogo y servicios.' },
  { n: '03', title: 'Comparte con un toque', text: 'Acerca tu tarjeta a un celular, muestra tu QR o comparte tu enlace.' },
  { n: '04', title: 'Mide tus resultados', text: 'Desde tu panel ves visitas, clics, interacciones y contactos generados.' },
];

type Channel =
  | { type: Parameters<typeof LinkIcon>[0]['type']; label: string; icon?: never }
  | { icon: typeof BookOpen; label: string; type?: never };

const CHANNELS: Channel[] = [
  { type: 'WHATSAPP', label: 'WhatsApp' },
  { type: 'CALL', label: 'Teléfono' },
  { type: 'EMAIL', label: 'Email' },
  { type: 'INSTAGRAM', label: 'Instagram' },
  { type: 'FACEBOOK', label: 'Facebook' },
  { type: 'LINKEDIN', label: 'LinkedIn' },
  { type: 'WEBSITE', label: 'Sitio web' },
  { type: 'PROJECTS', label: 'Portafolio' },
  { icon: BookOpen, label: 'Catálogo' },
  { icon: FolderKanban, label: 'Proyectos' },
  { type: 'SCHEDULE_MEETING', label: 'Agenda de reuniones' },
  { type: 'SAVE_CONTACT', label: 'Guardar contacto' },
];

const PROFESIONAL_FEATURES = [
  'Tarjeta NFC Grafi',
  'Perfil digital personalizado',
  'Código QR dinámico',
  'Botones de contacto',
  'Redes sociales',
  'Guardar contacto',
  'Panel de edición',
  'Tema claro u oscuro',
  'Personalización con colores y marca',
  'Analíticas básicas',
  'Formulario de contacto',
  'Captación de leads',
  'Exportación de leads',
];

const PROFESIONAL_IDEAL = [
  'Consultores',
  'Vendedores',
  'Agentes inmobiliarios',
  'Emprendedores',
  'Ejecutivos',
  'Abogados',
  'Médicos',
  'Freelancers',
  'Creadores de marca personal',
];

const EMPRESA_IDEAL = [
  'Inmobiliarias',
  'Concesionarias',
  'Constructoras',
  'Clínicas',
  'Estudios jurídicos',
  'Agencias',
  'Instituciones educativas',
  'Equipos comerciales',
  'Empresas B2B',
];

const EMPRESA_FEATURES = [
  'Todo lo del Plan Profesional',
  'Panel de empresa',
  'Gestión de colaboradores',
  'Perfiles digitales por empleado',
  'Diseño corporativo y control de marca',
  'Estadísticas por colaborador',
  'Leads centralizados',
  'Catálogo corporativo',
  'Asignación de productos o proyectos',
  'Soporte prioritario',
];

const PRICING = [
  {
    slug: 'basico',
    name: 'Grafi Básico',
    amount: '150',
    note: 'pago único · de por vida',
    features: ['Perfil digital básico', 'NFC + QR dinámico', 'WhatsApp, teléfono, email', 'Redes sociales', 'Panel de edición'],
    message: 'Hola, quiero solicitar el Plan Grafi Básico (Bs. 150 pago único).',
  },
  {
    slug: 'pro',
    name: 'Grafi Pro',
    amount: '150',
    note: 'por año · renovación anual',
    badge: 'Más popular',
    featured: true,
    features: ['Todo lo del Básico', 'Guardar contacto', 'Catálogo / servicios', 'Captación de leads', 'Exportar leads', 'Analíticas completas'],
    message: 'Hola, quiero solicitar el Plan Grafi Pro (Bs. 150/año).',
  },
];

const EMPRESA_WA_MESSAGE =
  'Hola, quiero información sobre los planes Grafi Empresa para equipos y organizaciones.';

const BENEFITS = [
  { icon: Zap, title: 'Sin tarjetas desactualizadas', text: 'Edita tu perfil las veces que quieras sin volver a imprimir tarjetas.' },
  { icon: SmartphoneNfc, title: 'Funciona con NFC, QR y link', text: 'Comparte acercando la tarjeta, mostrando el QR o enviando tu enlace.' },
  { icon: Palette, title: 'Personalización profesional', text: 'Agrega tu foto, logo, colores, datos, redes y marca personal.' },
  { icon: Layers, title: 'Más que una tarjeta', text: 'Muestra tu contacto, redes, catálogo, portafolio, servicios y agenda.' },
  { icon: Contact, title: 'Guarda contactos fácilmente', text: 'Que otras personas guarden tus datos en su celular con un solo clic.' },
  { icon: BarChart3, title: 'Mide tus interacciones', text: 'Consulta cuántas personas visitan tu perfil y qué botones usan más.' },
  { icon: Users, title: 'Captura oportunidades', text: 'Recibe datos de personas interesadas mediante formularios y leads.' },
];

const WHY = [
  'Diseño moderno y minimalista',
  'Compatible con Android y iPhone',
  'No requiere instalar aplicaciones',
  'Perfil editable desde panel',
  'Tarjeta NFC física incluida',
  'Código QR dinámico',
  'Ideal para profesionales y empresas',
  'Entrega hasta la ubicación indicada',
  'Soporte para configuración inicial',
];

const USE_CASES = [
  { icon: Briefcase, title: 'Para vendedores', text: 'Comparte WhatsApp, catálogo, agenda y datos de contacto con clientes potenciales.' },
  { icon: Building2, title: 'Para inmobiliarias', text: 'Muestra propiedades, proyectos, WhatsApp y agenda de reuniones desde cada perfil.' },
  { icon: Contact, title: 'Para consultores', text: 'Centraliza tus servicios, redes, portafolio y contacto profesional.' },
  { icon: Users, title: 'Para empresas', text: 'Administra perfiles digitales de colaboradores y mide el rendimiento de tu equipo.' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Grafi',
      url: 'https://grafi.digital',
      logo: 'https://grafi.digital/brand-icon.png',
      description:
        'Tarjetas digitales inteligentes NFC + QR con perfil profesional editable, analíticas y captación de leads.',
      slogan: 'Tu contacto, en un solo toque',
    },
    {
      '@type': 'Product',
      name: 'Tarjeta digital NFC Grafi',
      brand: { '@type': 'Brand', name: 'Grafi' },
      description:
        'Tarjeta NFC física con código QR dinámico y perfil digital editable para compartir WhatsApp, redes sociales, portafolio y catálogo con un solo toque.',
      image: 'https://grafi.digital/hero-product.png',
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className={`${display.variable} ${body.variable} ${mono.variable} lp`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: '#001b36', borderBottom: '1px solid rgba(247,243,234,0.12)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/brand-icon.png" alt="Grafi" width={30} height={30} className="rounded-lg" />
            <span className="lp-display text-sm tracking-wide" style={{ color: '#fff' }}>GRAFI</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-2 rounded-full transition hover:opacity-80"
            style={{ border: '1px solid rgba(247,243,234,0.3)', color: '#fff' }}
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden lp-dotfield">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-16 sm:pt-24 sm:pb-32 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
          {/* Render del producto: primero en mobile, segundo en desktop */}
          <div className="lp-rise order-first lg:order-last flex justify-center" style={{ animationDelay: '120ms' }}>
            <Image
              src="/hero-product.png"
              alt="Tarjeta NFC Grafi con código QR, perfil digital y panel de analíticas"
              width={918}
              height={874}
              priority
              className="lp-float w-full max-w-[340px] sm:max-w-[440px] lg:max-w-[520px] h-auto"
            />
          </div>
          <div className="lp-rise order-last lg:order-first">
            <span
              className="lp-mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full"
              style={{ background: 'var(--signal-soft)', color: 'var(--signal-dark)' }}
            >
              NFC + QR · perfil editable
            </span>
            <h1 className="lp-display mt-5 text-[2rem] sm:text-5xl lg:text-[3.4rem] leading-[1.05] font-semibold" style={{ color: 'var(--ink)' }}>
              La última tarjeta que vas a necesitar en tu vida
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg max-w-lg leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
              Con <strong>Grafi.digital</strong> compartís tu WhatsApp, redes, portafolio, catálogo y
              datos profesionales con una tarjeta digital inteligente. Olvídate del papel: tu perfil
              se actualiza cuando quieras, desde tu panel.
            </p>
            <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 lp-notch-sm text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ background: 'var(--signal)', color: '#fff' }}
              >
                Solicitar mi tarjeta
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold transition hover:opacity-70"
                style={{ color: 'var(--ink)' }}
              >
                Ver cómo funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ ES GRAFI */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
            ¿Qué es Grafi?
          </p>
          <h2 className="lp-display mt-3 text-3xl sm:text-4xl max-w-2xl" style={{ color: 'var(--ink)' }}>
            Un sistema de networking digital, no solo una tarjeta
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
            Grafi combina una tarjeta NFC física, un código QR y un perfil profesional editable.
            Con una sola tarjeta compartís toda tu información al instante, medís interacciones y
            generás oportunidades de contacto reales.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {INCLUDES.map((item, i) => (
            <Reveal key={item.label} delay={i * 40}>
              <div
                className="h-full flex flex-col gap-3 p-5 lp-notch-sm"
                style={{ background: 'var(--paper-dim)', border: '1px solid var(--line)' }}
              >
                <item.icon className="w-5 h-5" style={{ color: 'var(--signal)' }} />
                <span className="text-sm font-medium leading-snug" style={{ color: 'var(--ink)' }}>
                  {item.label}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-20 sm:py-28" style={{ background: 'var(--ink)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#ff8a96' }}>
              ¿Cómo funciona?
            </p>
            <h2 className="lp-display mt-3 text-3xl sm:text-4xl text-white max-w-xl">
              De la caja a tu primer contacto, en cuatro pasos
            </h2>
          </Reveal>

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: 'rgba(247,243,234,0.14)' }}>
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div className="h-full p-7" style={{ background: 'var(--ink)' }}>
                  <span className="lp-display text-4xl" style={{ color: 'rgba(247,243,234,0.25)' }}>
                    {step.n}
                  </span>
                  <h3 className="lp-display mt-5 text-lg text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'rgba(247,243,234,0.65)' }}>
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TODO TU PERFIL */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
            Un solo lugar
          </p>
          <h2 className="lp-display mt-3 text-3xl sm:text-4xl max-w-2xl" style={{ color: 'var(--ink)' }}>
            Todo tu perfil profesional, siempre a la mano
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
            Tu información siempre disponible, actualizada y lista para compartir.
          </p>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-3">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.label} delay={i * 35}>
              <div
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-medium"
                style={{ border: '1px solid var(--line)', color: 'var(--ink)' }}
              >
                {c.type ? <LinkIcon type={c.type} className="w-4 h-4" /> : <c.icon className="w-4 h-4" />}
                {c.label}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PLANES */}
      <section className="py-20 sm:py-28 lp-dotfield" style={{ background: 'var(--paper-dim)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
              Planes
            </p>
            <h2 className="lp-display mt-3 text-3xl sm:text-4xl max-w-xl" style={{ color: 'var(--ink)' }}>
              Para una persona o para todo tu equipo
            </h2>
          </Reveal>

          <div className="mt-14 grid lg:grid-cols-2 gap-6">
            {/* Profesional */}
            <Reveal>
              <div className="lp-notch h-full p-8 sm:p-10 flex flex-col" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <span className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
                  Plan Profesional
                </span>
                <h3 className="lp-display mt-3 text-2xl" style={{ color: 'var(--ink)' }}>
                  Para profesionales, vendedores y marcas personales
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
                  Presentate mejor, compartí tu información de forma moderna y generá más
                  contactos.
                </p>
                <ul className="mt-7 flex-1 grid sm:grid-cols-2 gap-y-2.5 gap-x-4">
                  {PROFESIONAL_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--ink)' }}>
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--signal)' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="lp-mono mt-7 text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--signal-dark)' }}>
                  Ideal para
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PROFESIONAL_IDEAL.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ border: '1px solid var(--line)', color: 'var(--ink-tint)' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 px-6 py-3.5 lp-notch-sm text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{ border: '1.5px solid var(--ink)', color: 'var(--ink)' }}
                >
                  Solicitar Plan Profesional
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>

            {/* Empresa */}
            <Reveal delay={120}>
              <div className="lp-notch h-full p-8 sm:p-10 flex flex-col" style={{ background: 'var(--ink)' }}>
                <div className="flex items-center justify-between">
                  <span className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: '#ff8a96' }}>
                    Plan Empresa
                  </span>
                  <span
                    className="lp-mono text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                    style={{ background: 'var(--signal)', color: '#fff' }}
                  >
                    Para equipos
                  </span>
                </div>
                <h3 className="lp-display mt-3 text-2xl text-white">
                  Para equipos comerciales y organizaciones
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(247,243,234,0.7)' }}>
                  Administrá las tarjetas digitales de todo un equipo desde un solo panel, con
                  marca, estadísticas y leads centralizados.
                </p>
                <ul className="mt-7 flex-1 grid sm:grid-cols-2 gap-y-2.5 gap-x-4">
                  {EMPRESA_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#ff8a96' }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="lp-mono mt-7 text-[10px] uppercase tracking-[0.18em]" style={{ color: '#ff8a96' }}>
                  Ideal para
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {EMPRESA_IDEAL.map((p) => (
                    <span
                      key={p}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ border: '1px solid rgba(247,243,234,0.25)', color: 'rgba(247,243,234,0.75)' }}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-8 flex items-center justify-center gap-2 px-6 py-3.5 lp-notch-sm text-sm font-semibold transition hover:-translate-y-0.5"
                  style={{ background: 'var(--signal)', color: '#fff' }}
                >
                  Solicitar demo empresarial
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>

          {/* PRECIOS */}
          <div className="mt-16">
            <Reveal>
              <h3 className="lp-display text-3xl sm:text-4xl text-center" style={{ color: 'var(--ink)' }}>
                Planes y precios
              </h3>
              <p className="mt-3 text-center text-sm" style={{ color: 'var(--ink-tint)' }}>
                Pago anual · incluye tarjeta NFC física
              </p>
            </Reveal>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PRICING.map((p, i) => (
                <Reveal key={p.slug} delay={i * 70}>
                  <a
                    href={getWhatsAppLink(p.message)}
                    target="_blank"
                    rel="noreferrer"
                    className="relative h-full pt-3 block transition hover:-translate-y-0.5"
                  >
                    <div className="relative h-full">
                      {p.badge && (
                        <span
                          className="lp-mono absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ background: 'var(--signal)', color: '#fff' }}
                        >
                          {p.badge}
                        </span>
                      )}
                      <div
                        className="h-full p-6 pt-7 lp-notch-sm flex flex-col gap-3 cursor-pointer"
                        style={{
                          background: '#001b36',
                          border: p.featured ? '1.5px solid var(--signal)' : '1px solid rgba(247,243,234,0.12)',
                        }}
                      >
                        <span className="lp-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: p.featured ? 'var(--signal)' : 'rgba(247,243,234,0.55)' }}>
                          {p.name}
                        </span>
                        <div>
                          <span
                            className="lp-display text-3xl"
                            style={{ color: p.featured ? 'var(--signal)' : '#fff' }}
                          >
                            <span className="text-base mr-1">Bs.</span>
                            {p.amount}
                          </span>
                          <span className="block text-xs mt-1" style={{ color: 'rgba(247,243,234,0.55)' }}>
                            {p.note}
                          </span>
                        </div>
                        <ul className="flex-1 flex flex-col gap-2 mt-2">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(247,243,234,0.8)' }}>
                              <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: p.featured ? 'var(--signal)' : 'rgba(247,243,234,0.5)' }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div
                          className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 lp-notch-sm text-xs font-semibold"
                          style={{ background: p.featured ? 'var(--signal)' : 'rgba(247,243,234,0.1)', color: '#fff' }}
                        >
                          Solicitar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </a>
                </Reveal>
              ))}
              {/* Empresa */}
              <Reveal delay={140}>
                <div className="h-full pt-3">
                  <div
                    className="h-full p-6 pt-7 lp-notch-sm flex flex-col gap-3"
                    style={{ background: '#001b36', border: '1px solid rgba(247,243,234,0.12)' }}
                  >
                    <span className="lp-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: 'rgba(247,243,234,0.55)' }}>
                      Grafi Empresa
                    </span>
                    <div>
                      <span className="lp-display text-3xl text-white">A medida</span>
                      <span className="block text-xs mt-1" style={{ color: 'rgba(247,243,234,0.55)' }}>
                        desde Bs. 300/mes · contrato anual
                      </span>
                    </div>
                    <ul className="flex-1 flex flex-col gap-2 mt-2">
                      {['Panel de empresa', 'Múltiples colaboradores', 'Leads centralizados', 'Catálogo corporativo', 'Soporte prioritario'].map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(247,243,234,0.8)' }}>
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgba(247,243,234,0.5)' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={getWhatsAppLink(EMPRESA_WA_MESSAGE)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 lp-notch-sm text-xs font-semibold transition hover:-translate-y-0.5"
                      style={{ background: 'rgba(247,243,234,0.1)', color: '#fff' }}
                    >
                      Consultar
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <div
                className="mt-4 p-5 sm:px-8 lp-notch-sm flex items-center gap-4 sm:gap-5"
                style={{ background: '#001b36', border: '1px solid rgba(247,243,234,0.12)' }}
              >
                <span
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: '1.5px solid var(--signal)' }}
                >
                  <Tag className="w-5 h-5 -rotate-45" style={{ color: 'var(--signal)' }} />
                </span>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-white">
                    Personalización de la tarjeta:{' '}
                    <span style={{ color: 'var(--signal)' }}>+ Bs. 49</span>
                  </p>
                  <p className="mt-0.5 text-xs sm:text-sm" style={{ color: 'rgba(247,243,234,0.7)' }}>
                    Incluye nombre, logo, colores y diseño personalizado.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div
                className="mt-4 p-5 sm:px-8 lp-notch-sm flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
                style={{ background: '#001b36', border: '1px solid rgba(247,243,234,0.12)' }}
              >
                <span
                  className="w-12 h-12 rounded-full hidden sm:flex items-center justify-center shrink-0"
                  style={{ border: '1.5px solid rgba(247,243,234,0.4)' }}
                >
                  <CircleUserRound className="w-5 h-5 text-white" />
                </span>
                <p className="flex-1 text-sm sm:text-base text-white text-center sm:text-left leading-relaxed">
                  Ideal para profesionales, vendedores, emprendedores, inmobiliarias y equipos
                  comerciales.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 lp-notch-sm text-sm font-semibold whitespace-nowrap transition hover:-translate-y-0.5 w-full sm:w-auto"
                  style={{ background: 'var(--signal)', color: '#fff' }}
                >
                  Solicita una demo
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
            Beneficios
          </p>
          <h2 className="lp-display mt-3 text-3xl sm:text-4xl max-w-xl" style={{ color: 'var(--ink)' }}>
            Más que una tarjeta de presentación
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ background: 'var(--line)' }}>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 60}>
              <div className="h-full p-7" style={{ background: 'var(--paper)' }}>
                <b.icon className="w-5 h-5" style={{ color: 'var(--signal)' }} />
                <h3 className="lp-display mt-4 text-base" style={{ color: 'var(--ink)' }}>
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* POR QUÉ ELEGIR */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--paper-dim)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-start">
          <Reveal>
            <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
              Por qué Grafi
            </p>
            <h2 className="lp-display mt-3 text-3xl sm:text-4xl" style={{ color: 'var(--ink)' }}>
              Pensado para que se vea bien y funcione siempre
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <ul className="grid sm:grid-cols-2 gap-y-3.5 gap-x-8">
              {WHY.map((w) => (
                <li key={w} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--ink)' }}>
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--signal)' }} />
                  {w}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* CASOS DE USO */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20 sm:py-28">
        <Reveal>
          <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
            Casos de uso
          </p>
          <h2 className="lp-display mt-3 text-3xl sm:text-4xl max-w-xl" style={{ color: 'var(--ink)' }}>
            Se adapta a cómo trabajás
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {USE_CASES.map((u, i) => (
            <Reveal key={u.title} delay={i * 70}>
              <div className="h-full p-6 lp-notch-sm" style={{ background: 'var(--paper-dim)', border: '1px solid var(--line)' }}>
                <u.icon className="w-5 h-5" style={{ color: 'var(--signal)' }} />
                <h3 className="lp-display mt-4 text-base" style={{ color: 'var(--ink)' }}>
                  {u.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ink-tint)' }}>
                  {u.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28" style={{ background: 'var(--paper-dim)' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <Reveal>
            <p className="lp-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--signal-dark)' }}>
              Preguntas frecuentes
            </p>
            <h2 className="lp-display mt-3 text-3xl sm:text-4xl" style={{ color: 'var(--ink)' }}>
              Todo lo que querías saber
            </h2>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden lp-dotfield-light py-24 sm:py-32" style={{ background: 'var(--ink)' }}>
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <Reveal>
            <h2 className="lp-display text-3xl sm:text-5xl text-white leading-[1.1]">
              La última tarjeta profesional que vas a necesitar
            </h2>
            <p className="mt-6 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'rgba(247,243,234,0.7)' }}>
              Moderniza tu presentación profesional y convertí cada contacto en una oportunidad.
            </p>
            <p className="lp-display mt-8 text-xl text-white">Grafi.digital</p>
            <p className="lp-mono text-xs uppercase tracking-[0.2em] mt-1" style={{ color: '#ff8a96' }}>
              Tu contacto, en un solo toque
            </p>
            <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 lp-notch-sm text-sm font-semibold transition hover:-translate-y-0.5"
                style={{ background: 'var(--signal)', color: '#fff' }}
              >
                Solicitar ahora
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-70"
                style={{ border: '1.5px solid rgba(247,243,234,0.4)' }}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10" style={{ background: 'var(--ink)', borderTop: '1px solid rgba(247,243,234,0.1)' }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/brand-icon.png" alt="Grafi" width={24} height={24} className="rounded-md" />
            <span className="lp-display text-xs tracking-wide text-white/80">GRAFI.DIGITAL</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(247,243,234,0.45)' }}>
            © {new Date().getFullYear()} Grafi. Tu contacto, en un solo toque.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-white/70 hover:text-white transition"
            >
              WhatsApp
            </a>
            <Link href="/login" className="text-xs text-white/70 hover:text-white transition">
              Iniciar sesión →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
