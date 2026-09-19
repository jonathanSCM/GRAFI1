'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Card {
  id: string;
  programmed: boolean;
}

interface CardResponse {
  card: Card | null;
  profileUrl: string;
}

export default function CardPage() {
  const [data, setData] = useState<CardResponse | null>(null);

  useEffect(() => {
    api<CardResponse>('/cards/me').then(setData).catch(() => {});
  }, []);

  if (!data) return <p className="text-sm text-neutral-500">Cargando...</p>;

  const programmed = data.card?.programmed ?? false;

  return (
    <div className="max-w-2xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tarjeta NFC</h1>
        <p className="text-sm text-neutral-500 mt-1">
          La tarjeta física es un chip pasivo: no tiene software propio, solo guarda la URL de tu
          perfil.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="text-sm font-medium">Estado de tu tarjeta</h2>
        <span
          className={`text-sm w-fit border rounded-full px-3 py-1.5 ${
            programmed
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {programmed ? '✓ Programada y lista para usar' : 'Pendiente de programación'}
        </span>
        <p className="text-xs text-neutral-500">
          Tu proveedor configura y programa esta tarjeta por ti. Si tienes dudas sobre su entrega,
          contáctalo directamente.
        </p>
      </div>
    </div>
  );
}
