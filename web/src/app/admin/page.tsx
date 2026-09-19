'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PasswordInput from '@/components/PasswordInput';

interface Plan {
  id: string;
  name: string;
  maxButtons: number;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  profile?: { slug: string } | null;
  planId: string | null;
  plan: Plan | null;
  company: { name: string; plan: Plan | null } | null;
  buttonLimitOverride: number | null;
  effectiveButtonLimit: number;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  PENDING: 'Pendiente',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [limitDraft, setLimitDraft] = useState({ planId: '', buttonLimitOverride: '' });
  const [qrMsg, setQrMsg] = useState<string | null>(null);

  function load() {
    api<AdminUser[]>('/admin/users').then(setUsers);
    api<Plan[]>('/admin/plans').then(setPlans);
  }

  useEffect(load, []);

  function startEditLimit(user: AdminUser) {
    setEditingLimit(user.id);
    setLimitDraft({
      planId: user.planId ?? '',
      buttonLimitOverride: user.buttonLimitOverride !== null ? String(user.buttonLimitOverride) : '',
    });
  }

  async function saveLimit(userId: string) {
    await api(`/admin/users/${userId}/limits`, {
      method: 'PATCH',
      body: JSON.stringify({
        planId: limitDraft.planId || null,
        buttonLimitOverride: limitDraft.buttonLimitOverride === '' ? null : Number(limitDraft.buttonLimitOverride),
      }),
    });
    setEditingLimit(null);
    load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/users', { method: 'POST', body: JSON.stringify(form) });
    setForm({ name: '', email: '', password: '' });
    load();
  }

  async function toggleStatus(user: AdminUser) {
    const status = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api(`/admin/users/${user.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usuarios</h1>
          <p className="text-sm text-neutral-500 mt-1">{users.length} usuarios registrados</p>
        </div>
        <div className="flex items-center gap-2">
          {qrMsg && <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">{qrMsg}</span>}
          <button
            onClick={async () => {
              setQrMsg(null);
              const r = await api<{ updated: number }>('/qr/regenerate-all', { method: 'POST' });
              setQrMsg(`QR regenerados: ${r.updated}`);
            }}
            className="text-xs border border-neutral-300 rounded-full px-3 py-1.5 hover:bg-neutral-100 transition"
          >
            Regenerar QRs
          </button>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex gap-2 bg-white border border-neutral-200 rounded-2xl p-5"
      >
        <input
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 outline-none focus:ring-2 focus:ring-black/10"
        />
        <div className="flex-1">
          <PasswordInput
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            placeholder="Contraseña"
            required
            className="border border-neutral-300 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <button
          type="submit"
          className="bg-black text-white rounded-xl px-5 font-medium text-sm hover:bg-neutral-800 transition"
        >
          Crear
        </button>
      </form>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-neutral-200 bg-neutral-50">
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Nombre</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Email</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Perfil</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Estado</th>
              <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Botones</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                <td className="py-3 px-4 font-medium">{u.name}</td>
                <td className="py-3 px-4 text-neutral-600">{u.email}</td>
                <td className="py-3 px-4 text-neutral-600">{u.profile?.slug ?? '—'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_STYLES[u.status]}`}
                  >
                    {STATUS_LABELS[u.status]}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {editingLimit === u.id ? (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={limitDraft.planId}
                        onChange={(e) => setLimitDraft({ ...limitDraft, planId: e.target.value })}
                        disabled={!!u.company}
                        title={u.company ? `Pertenece a ${u.company.name}: usa el plan de la empresa` : undefined}
                        className="border border-neutral-300 rounded-lg px-1.5 py-1 text-xs outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-40"
                      >
                        <option value="">Sin plan (5)</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.maxButtons})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        placeholder="custom"
                        value={limitDraft.buttonLimitOverride}
                        onChange={(e) => setLimitDraft({ ...limitDraft, buttonLimitOverride: e.target.value })}
                        className="border border-neutral-300 rounded-lg px-1.5 py-1 text-xs w-16 outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <button
                        onClick={() => saveLimit(u.id)}
                        className="text-xs bg-black text-white rounded-full px-2.5 py-1"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingLimit(null)}
                        className="text-xs border border-neutral-300 rounded-full px-2.5 py-1"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">{u.effectiveButtonLimit}</span>
                      {u.buttonLimitOverride !== null && (
                        <span className="text-xs text-amber-600 border border-amber-200 bg-amber-50 rounded-full px-1.5">
                          personalizado
                        </span>
                      )}
                      {u.buttonLimitOverride === null && u.company && (
                        <span className="text-xs text-neutral-400">
                          (empresa: {u.company.plan?.name ?? 'sin plan'})
                        </span>
                      )}
                      {u.buttonLimitOverride === null && !u.company && u.plan && (
                        <span className="text-xs text-neutral-400">({u.plan.name})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => startEditLimit(u)}
                        className="text-xs border border-neutral-300 rounded-full px-2.5 py-1 hover:bg-neutral-100 transition"
                      >
                        Editar
                      </button>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    className="text-xs border border-neutral-300 rounded-full px-3 py-1 hover:bg-neutral-100 transition"
                  >
                    {u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Sin usuarios todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
