'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, clearToken, getRole } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/panel', label: 'Resumen', icon: '⌂' },
  { href: '/panel/perfil', label: 'Mi perfil', icon: '◐' },
  { href: '/panel/links', label: 'Botones', icon: '☰' },
  { href: '/panel/tarjeta', label: 'Tarjeta NFC', icon: '◧' },
  { href: '/panel/qr', label: 'Código QR', icon: '▦' },
  { href: '/panel/leads', label: 'Leads', icon: '✉' },
  { href: '/panel/analiticas', label: 'Analíticas', icon: '◷' },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.replace('/login');
      return;
    }
    const role = getRole();
    setIsAdmin(role === 'ADMIN');
    // Solo los roles con acceso a empresa pueden consultar /companies/me (los demás recibirían 403)
    if (role === 'COMPANY_ADMIN' || role === 'ADMIN') {
      api('/companies/me')
        .then(() => setHasCompany(true))
        .catch(() => setHasCompany(false));
    }
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    clearToken();
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <Image src="/brand-icon.png" alt="Grafi" width={28} height={28} className="rounded-lg" />
          <span className="font-semibold text-sm">Grafi</span>
        </div>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-neutral-100 transition"
        >
          <span className="w-5 h-0.5 bg-neutral-800 rounded-full" />
          <span className="w-5 h-0.5 bg-neutral-800 rounded-full" />
          <span className="w-5 h-0.5 bg-neutral-800 rounded-full" />
        </button>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[80vw] border-r border-neutral-200 bg-white p-4 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:z-auto ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-2 mb-6 shrink-0">
          <Image src="/brand-icon.png" alt="Grafi" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-sm">Grafi</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="ml-auto w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 transition lg:hidden"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 overflow-y-auto min-h-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition ${
                  active
                    ? 'bg-black text-white font-medium shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-neutral-100 pt-3 shrink-0">
          {hasCompany && (
            <Link
              href="/panel/empresa"
              className="text-sm py-2.5 px-3 rounded-xl flex items-center gap-2.5 text-neutral-600 hover:bg-neutral-100 transition"
            >
              <span className="text-base w-4 text-center">▣</span>
              Mi empresa
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className="text-sm py-2.5 px-3 rounded-xl flex items-center gap-2.5 text-neutral-600 hover:bg-neutral-100 transition"
            >
              <span className="text-base w-4 text-center">⚙</span>
              Panel admin
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="text-sm py-2.5 px-3 rounded-xl text-left text-red-600 hover:bg-red-50 transition flex items-center gap-2.5"
          >
            <span className="text-base w-4 text-center">×</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-screen p-4 sm:p-6 lg:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
