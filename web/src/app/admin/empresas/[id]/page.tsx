'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Avatar from '@/components/Avatar';
import PasswordInput from '@/components/PasswordInput';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  status: string;
  slug: string | null;
  linkCount: number;
  totalEvents: number;
  leadCount: number;
}

interface Plan {
  id: string;
  name: string;
  maxCollaborators: number;
  maxButtons: number;
}

interface FreeUser {
  id: string;
  name: string;
  email: string;
  companyId: string | null;
}

interface CompanyData {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logo?: string | null;
  plan: Plan | null;
  collaboratorLimitOverride: number | null;
  effectiveCollaboratorLimit: number;
  collaborators: Collaborator[];
  totalEvents: number;
  totalLeads: number;
}

type AddMode = 'assign' | 'create';

export default function AdminCompanyDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<CompanyData | null>(null);
  const [allUsers, setAllUsers] = useState<FreeUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<AddMode>('assign');
  const [assignUserId, setAssignUserId] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [editPlan, setEditPlan] = useState(false);
  const [planDraft, setPlanDraft] = useState({ planId: '', override: '' });
  const [unassigning, setUnassigning] = useState<string | null>(null);

  function load() {
    api<CompanyData>(`/admin/companies/${params.id}`).then(setData).catch((e) => setError(e.message));
    api<FreeUser[]>('/admin/users').then(setAllUsers);
    api<Plan[]>('/admin/plans').then(setPlans);
  }

  useEffect(load, [params.id]);

  const freeUsers = allUsers.filter((u) => !u.companyId || u.companyId === data?.id);
  const assignableUsers = freeUsers.filter((u) => !data?.collaborators.find((c) => c.id === u.id));

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assignUserId) return;
    setSaving(true);
    setError(null);
    try {
      await api(`/admin/companies/${params.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ userId: assignUserId }),
      });
      setAssignUserId('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar usuario');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ ...createForm, companyId: params.id }),
      });
      setCreateForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  }

  async function handleUnassign(userId: string) {
    setUnassigning(userId);
    setError(null);
    try {
      await api(`/admin/companies/unassign/${userId}`, { method: 'POST' });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al desasignar');
    } finally {
      setUnassigning(null);
    }
  }

  async function savePlan() {
    await api(`/admin/companies/${params.id}/limits`, {
      method: 'PATCH',
      body: JSON.stringify({
        planId: planDraft.planId || null,
        collaboratorLimitOverride: planDraft.override === '' ? null : Number(planDraft.override),
      }),
    });
    setEditPlan(false);
    load();
  }

  if (error && !data) return <p className="text-sm text-red-600 p-6">{error}</p>;
  if (!data) return <p className="text-sm text-neutral-500 p-6">Cargando...</p>;

  const atCapacity = data.collaborators.length >= data.effectiveCollaboratorLimit;

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/empresas" className="text-xs text-neutral-500 hover:underline">
            ← Volver a empresas
          </Link>
          <div className="flex items-center gap-3 mt-1">
            {data.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logo} alt={data.name} className="w-10 h-10 rounded-xl object-cover border border-neutral-200" />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
              <p className="text-sm text-neutral-500">/{data.slug}</p>
            </div>
          </div>
        </div>
        <a
          href={`/empresa/${data.slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs border border-neutral-300 rounded-full px-3 py-1.5 hover:bg-neutral-50 transition"
        >
          Ver página pública ↗
        </a>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Colaboradores</p>
          <p className="text-2xl font-semibold">
            {data.collaborators.length}
            <span className="text-base font-normal text-neutral-400"> / {data.effectiveCollaboratorLimit}</span>
          </p>
          {atCapacity && (
            <p className="text-xs text-amber-600 mt-1">Límite alcanzado</p>
          )}
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Interacciones</p>
          <p className="text-2xl font-semibold">{data.totalEvents}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <p className="text-xs text-neutral-500 mb-1">Leads</p>
          <p className="text-2xl font-semibold">{data.totalLeads}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-neutral-500">Plan</p>
            {!editPlan && (
              <button
                onClick={() => {
                  setPlanDraft({
                    planId: data.plan?.id ?? '',
                    override: data.collaboratorLimitOverride !== null ? String(data.collaboratorLimitOverride) : '',
                  });
                  setEditPlan(true);
                }}
                className="text-xs text-neutral-400 hover:text-neutral-700"
              >
                Editar
              </button>
            )}
          </div>
          {editPlan ? (
            <div className="flex flex-col gap-1.5 mt-1">
              <select
                value={planDraft.planId}
                onChange={(e) => setPlanDraft({ ...planDraft, planId: e.target.value })}
                className="border border-neutral-300 rounded-lg px-2 py-1 text-xs outline-none"
              >
                <option value="">Sin plan (1)</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.maxCollaborators})</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Override"
                value={planDraft.override}
                onChange={(e) => setPlanDraft({ ...planDraft, override: e.target.value })}
                className="border border-neutral-300 rounded-lg px-2 py-1 text-xs outline-none w-full"
              />
              <div className="flex gap-1">
                <button onClick={savePlan} className="text-xs bg-black text-white rounded-full px-2.5 py-1">Guardar</button>
                <button onClick={() => setEditPlan(false)} className="text-xs border border-neutral-300 rounded-full px-2.5 py-1">✕</button>
              </div>
            </div>
          ) : (
            <p className="text-base font-semibold mt-1">
              {data.plan?.name ?? 'Sin plan'}
              {data.collaboratorLimitOverride !== null && (
                <span className="text-xs font-normal text-amber-600 ml-1">custom</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Collaborators table */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Colaboradores ({data.collaborators.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-neutral-50 border-b border-neutral-100">
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Usuario</th>
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Perfil</th>
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide">Estado</th>
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">Botones</th>
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">Vistas</th>
              <th className="py-2.5 px-4 text-xs font-medium text-neutral-500 uppercase tracking-wide text-center">Leads</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.collaborators.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} className="w-7 h-7 text-xs shrink-0" />
                    <div>
                      <p className="font-medium leading-tight">{c.name}</p>
                      <p className="text-xs text-neutral-400 leading-tight">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-neutral-600">
                  {c.slug ? (
                    <a href={`/${c.slug}`} target="_blank" rel="noreferrer" className="text-xs underline">
                      /{c.slug}
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400">Sin perfil</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs border rounded-full px-2 py-0.5 ${
                    c.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                    c.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {c.status === 'ACTIVE' ? 'Activo' : c.status === 'SUSPENDED' ? 'Suspendido' : 'Pendiente'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-neutral-600">{c.linkCount}</td>
                <td className="py-3 px-4 text-center text-neutral-600">{c.totalEvents}</td>
                <td className="py-3 px-4 text-center text-neutral-600">{c.leadCount}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleUnassign(c.id)}
                    disabled={unassigning === c.id}
                    className="text-xs text-red-600 border border-red-200 rounded-full px-3 py-1 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {unassigning === c.id ? '...' : 'Quitar'}
                  </button>
                </td>
              </tr>
            ))}
            {data.collaborators.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-neutral-400 text-sm">
                  Sin colaboradores todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add collaborator */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-semibold text-sm">Agregar colaborador</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100">
          <button
            onClick={() => setAddMode('assign')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              addMode === 'assign'
                ? 'text-black border-b-2 border-black'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Asignar usuario existente
          </button>
          <button
            onClick={() => setAddMode('create')}
            className={`flex-1 py-2.5 text-sm font-medium transition ${
              addMode === 'create'
                ? 'text-black border-b-2 border-black'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Crear usuario nuevo
          </button>
        </div>

        <div className="p-5">
          {addMode === 'assign' ? (
            <form onSubmit={handleAssign} className="flex gap-2">
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
                required
              >
                <option value="">Seleccionar usuario...</option>
                {assignableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={saving || !assignUserId}
                className="bg-black text-white rounded-xl px-5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50"
              >
                {saving ? 'Asignando...' : 'Asignar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                placeholder="Nombre completo"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
              />
              <input
                placeholder="Email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                required
                className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
              />
              <div className="flex-1">
                <PasswordInput
                  value={createForm.password}
                  onChange={(v) => setCreateForm({ ...createForm, password: v })}
                  placeholder="Contraseña (mín. 8 caracteres)"
                  required
                  className="border border-neutral-300 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-black text-white rounded-xl px-5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50 whitespace-nowrap"
              >
                {saving ? 'Creando...' : 'Crear y asignar'}
              </button>
            </form>
          )}

          {addMode === 'assign' && assignableUsers.length === 0 && (
            <p className="text-xs text-neutral-400 mt-2">
              No hay usuarios disponibles para asignar. Crea uno nuevo en la otra pestaña.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
