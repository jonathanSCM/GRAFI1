'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getRole } from '@/lib/api';

const NAV_ITEMS = [
  { href: '/admin', label: 'Usuarios', icon: '◷' },
  { href: '/admin/empresas', label: 'Empresas', icon: '▣' },
  { href: '/admin/tarjetas', label: 'Tarjetas NFC', icon: '◧' },
  { href: '/admin/planes', label: 'Planes', icon: '◆' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || getRole() !== 'ADMIN') {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex bg-neutral-50">
      <aside className="w-60 h-screen sticky top-0 border-r border-neutral-200 bg-white p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-2 mb-6 shrink-0">
          <Image src="/brand-icon.png" alt="Grafi" width={32} height={32} className="rounded-lg" />
          <span className="font-semibold text-sm">Grafi Admin</span>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto min-h-0">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm py-2.5 px-3 rounded-xl flex items-center gap-2.5 transition ${
                  active ? 'bg-black text-white font-medium' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <span className="text-base w-4 text-center">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/panel"
          className="text-sm py-2.5 px-3 rounded-xl flex items-center gap-2.5 text-neutral-600 hover:bg-neutral-100 transition mt-auto border-t border-neutral-100 pt-4 shrink-0"
        >
          <span className="text-base w-4 text-center">←</span>
          Volver al panel
        </Link>
      </aside>
      <main className="flex-1 min-h-screen p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
