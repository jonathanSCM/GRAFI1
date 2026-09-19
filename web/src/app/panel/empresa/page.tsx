'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import CompanyEditForm from '@/components/CompanyEditForm';
import PasswordInput from '@/components/PasswordInput';
import Avatar from '@/components/Avatar';
import CatalogManager from '@/components/CatalogManager';
import CompanyLeads from '@/components/CompanyLeads';

interface Collaborator {
  id: string;
  profileId: string | null;
  name: string;
  email: string;
  status: string;
  slug: string | null;
  linkCount: number;
  totalEvents: number;
  leadCount: number;
}

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  website?: string | null;
  redirectEnabled: boolean;
  theme?: 'LIGHT' | 'DARK';
  backgroundType?: 'THEME' | 'SOLID' | 'GRADIENT';
  backgroundColor?: string | null;
  backgroundTo?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  textColor?: string | null;
  collaborators: Collaborator[];
  totalEvents: number;
  totalLeads: number;
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'colaboradores', label: 'Colaboradores' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'leads', label: 'Leads' },
  { id: 'estadisticas', label: 'Estadísticas' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function CompanyDashboardPage() {
  const [data, setData] = useState<CompanyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>('dashboard');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function load() {
    api<CompanyData>('/companies/me')
      .then(setData)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    setAdding(true);
    try {
      await api('/companies/me/users', { method: 'POST', body: JSON.stringify(newUser) });
      setNewUser({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al agregar el colaborador');
    } finally {
      setAdding(false);
    }
  }

  if (error) {
    return <p className="text-sm text-neutral-500">No tienes una empresa asignada.</p>;
  }

  if (!data) return <p className="text-sm text-neutral-500">Cargando...</p>;

  const collaboratorOptions = data.collaborators
    .filter((c): c is Collaborator & { slug: string; profileId: string } => !!c.slug && !!c.profileId)
    .map((c) => ({ id: c.profileId, fullName: c.name, slug: c.slug }));

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">Panel de empresa · gestión centralizada de colaboradores</p>
      </div>

      <div className="flex gap-1 border-b border-neutral-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-sm px-4 py-2.5 -mb-px border-b-2 transition whitespace-nowrap shrink-0 ${
              tab === t.id
                ? 'border-black font-medium text-black'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
              <p className="text-xs text-neutral-500">Colaboradores</p>
              <p className="text-3xl font-semibold mt-1">{data.collaborators.length}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
              <p className="text-xs text-neutral-500">Interacciones totales</p>
              <p className="text-3xl font-semibold mt-1">{data.totalEvents}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
              <p className="text-xs text-neutral-500">Leads totales</p>
              <p className="text-3xl font-semibold mt-1">{data.totalLeads}</p>
            </div>
          </div>
          <CompanyEditForm company={data} patchUrl="/companies/me" onSaved={load} />
        </div>
      )}

      {tab === 'colaboradores' && (
        <div className="flex flex-col gap-6">
          <form
            onSubmit={handleAddUser}
            className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3"
          >
            <h2 className="text-sm font-medium">Agregar colaborador</h2>
            <p className="text-xs text-neutral-500">
              Crea una cuenta para un miembro de tu equipo. Podrá iniciar sesión y crear su propio perfil.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                placeholder="Nombre"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm sm:flex-1 outline-none focus:ring-2 focus:ring-black/10"
              />
              <input
                placeholder="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm sm:flex-1 outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="sm:flex-1">
                <PasswordInput
                  value={newUser.password}
                  onChange={(v) => setNewUser({ ...newUser, password: v })}
                  placeholder="Contraseña"
                  required
                  className="border border-neutral-300 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className="bg-black text-white rounded-xl px-5 py-2.5 sm:py-0 font-medium text-sm hover:bg-neutral-800 transition disabled:opacity-50 shrink-0"
              >
                {adding ? 'Agregando...' : 'Agregar'}
              </button>
            </div>
            {addError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {addError}
              </p>
            )}
          </form>

          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Colaborador</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Perfil</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Botones</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Interacciones</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Leads</th>
                </tr>
              </thead>
              <tbody>
                {data.collaborators.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} className="w-7 h-7 text-xs" />
                        {c.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {c.slug ? (
                        <a href={`/${c.slug}`} target="_blank" rel="noreferrer" className="underline">
                          /{c.slug}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4">{c.linkCount}</td>
                    <td className="py-3 px-4">{c.totalEvents}</td>
                    <td className="py-3 px-4">{c.leadCount}</td>
                  </tr>
                ))}
                {data.collaborators.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      Sin colaboradores todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'catalogo' && <CatalogManager collaborators={collaboratorOptions} />}

      {tab === 'leads' && <CompanyLeads />}

      {tab === 'estadisticas' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
              <p className="text-xs text-neutral-500">Interacciones totales</p>
              <p className="text-3xl font-semibold mt-1">{data.totalEvents}</p>
            </div>
            <div className="bg-white border border-neutral-200 rounded-2xl p-5">
              <p className="text-xs text-neutral-500">Leads totales</p>
              <p className="text-3xl font-semibold mt-1">{data.totalLeads}</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-sm">
              <thead>
                <tr className="text-left border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Colaborador</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Interacciones</th>
                  <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Leads</th>
                </tr>
              </thead>
              <tbody>
                {[...data.collaborators]
                  .sort((a, b) => b.totalEvents - a.totalEvents)
                  .map((c) => (
                    <tr key={c.id} className="border-b border-neutral-100 last:border-0">
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} className="w-7 h-7 text-xs" />
                          {c.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">{c.totalEvents}</td>
                      <td className="py-3 px-4">{c.leadCount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
