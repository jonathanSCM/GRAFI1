'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export default function QrPage() {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadQr() {
      setError(null);
      const token = localStorage.getItem('token');

      // fetch lanza (TypeError) si no hay conexión con el servidor.
      const res = await fetch(`${API_URL}/qr/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }).catch(() => null);

      if (!res) {
        setError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.');
        return;
      }
      if (!res.ok) {
        // El backend responde 404 si aún no has creado tu perfil.
        setError(
          res.status === 404
            ? 'Primero crea tu perfil en "Mi perfil" para generar tu QR.'
            : 'No se pudo generar el QR. Intenta de nuevo en un momento.',
        );
        return;
      }
      const blob = await res.blob();
      if (!blob.type.startsWith('image/')) {
        setError('No se pudo generar el QR. Intenta de nuevo en un momento.');
        return;
      }
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    }

    loadQr();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="max-w-md flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Código QR</h1>
      <p className="text-sm text-neutral-500 mb-4">
        Este QR siempre apunta a tu perfil. Si actualizas tus datos, no necesitas generarlo de nuevo.
      </p>

      <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col items-center gap-5">
        {src ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="QR de perfil" className="w-56 h-56 rounded-xl" />
            <a
              href={src}
              download="qr-perfil.png"
              className="bg-black text-white text-sm rounded-xl px-5 py-2.5 font-medium hover:bg-neutral-800 transition"
            >
              Descargar QR
            </a>
          </>
        ) : error ? (
          <div className="w-56 min-h-56 flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-4xl">📱</span>
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        ) : (
          <div className="w-56 h-56 rounded-xl bg-neutral-100 animate-pulse" aria-label="Cargando QR" />
        )}
      </div>
    </div>
  );
}
