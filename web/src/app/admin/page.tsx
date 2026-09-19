'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PasswordInput from '@/components/PasswordInput';

interface Plan {
  id: string;
  name: string;
  slug: string;
  maxButtons: number;
  maxSocialLinks: number;
  billingCycle?: string;
  durationMonths?: number | null;
  priceBolivares?: string | null;
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
  socialLinkLimitOverride: number | null;
  effectiveButtonLimit: number;
  effectiveSocialLinkLimit: number;
  planExpiresAt: string | null;
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
const CYCLE_LABELS: Record<string, string> = {
  LIFETIME: 'De por vida',
  ANNUAL: 'Anual',
  CONTRACT: 'Contrato',
};

function planExpiryBadge(expiresAt: string | null) {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  const expired = d < new Date();
  const label = d.toLocaleDateString('es-BO');
  return (
    <span className={`text-xs rounded-full px-2 py-0.5 border ${expired ? 'text-red-600 border-red-200 bg-red-50' : 'text-green-700 border-green-200 bg-green-50'}`}>
      {expired ? '✕ Vencido' : '✓'} {label}
    </span>
  );
}

interface EditDraft {
  planId: string;
  planExpiresAt: string;
  buttonLimitOverride: string;
  socialLinkLimitOverride: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft>({ planId: '', planExpiresAt: '', buttonLimitOverride: '', socialLinkLimitOverride: '' });
  const [saving, setSaving] = useState(false);
  const [qrMsg, setQrMsg] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  function load() {
    api<AdminUser[]>('/admin/users').then(setUsers);
    api<Plan[]>('/admin/plans').then(setPlans);
  }

  useEffect(load, []);

  function openEdit(u: AdminUser) {
    setEditing(u.id);
    setDraft({
      planId: u.planId ?? '',
      planExpiresAt: u.planExpiresAt ? u.planExpiresAt.slice(0, 10) : '',
      buttonLimitOverride: u.buttonLimitOverride !== null ? String(u.buttonLimitOverride) : '',
      socialLinkLimitOverride: u.socialLinkLimitOverride !== null ? String(u.socialLinkLimitOverride) : '',
    });
  }

  async function saveDraft(userId: string) {
    setSaving(true);
    try {
      await api(`/admin/users/${userId}/limits`, {
        method: 'PATCH',
        body: JSON.stringify({
          planId: draft.planId || null,
          planExpiresAt: draft.planExpiresAt || null,
          buttonLimitOverride: draft.buttonLimitOverride === '' ? null : Number(draft.buttonLimitOverride),
          socialLinkLimitOverride: draft.socialLinkLimitOverride === '' ? null : Number(draft.socialLinkLimitOverride),
        }),
      });
      setEditing(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    try {
      await api('/admin/users', { method: 'POST', body: JSON.stringify(form) });
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err: any) {
      setCreateError(err.message);
    }
  }

  async function toggleStatus(u: AdminUser) {
    const status = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    await api(`/admin/users/${u.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    load();
  }

  const editingUser = users.find((u) => u.id === editing) ?? null;
  const selectedPlan = plans.find((p) => p.id === draft.planId) ?? null;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
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

      {/* Crear usuario */}
      <form onSubmit={handleCreate} className="flex flex-wrap gap-2 bg-white border border-neutral-200 rounded-2xl p-5">
        <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px] outline-none focus:ring-2 focus:ring-black/10" />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
          className="border border-neutral-300 rounded-xl px-3 py-2 text-sm flex-1 min-w-[180px] outline-none focus:ring-2 focus:ring-black/10" />
        <div className="flex-1 min-w-[160px]">
          <PasswordInput value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="Contraseña" required
            className="border border-neutral-300 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-black/10" />
        </div>
        <button type="submit" className="bg-black text-white rounded-xl px-5 font-medium text-sm hover:bg-neutral-800 transition">Crear</button>
        {createError && <p className="text-xs text-red-600 w-full">{createError}</p>}
      </form>

      {/* Tabla */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-neutral-200 bg-neutral-50">
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Usuario</th>
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Perfil</th>
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Estado</th>
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Plan</th>
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Vencimiento</th>
                <th className="py-3 px-4 font-medium text-neutral-500 text-xs uppercase tracking-wide">Límites</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const effectivePlan = u.company ? u.company.plan : u.plan;
                const viaCompany = !!u.company;
                return (
                  <tr key={u.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition">
                    {/* Usuario */}
                    <td className="py-3 px-4">
                      <p className="font-medium leading-tight">{u.name}</p>
                      <p className="text-neutral-400 text-xs">{u.email}</p>
                    </td>
                    {/* Perfil */}
                    <td className="py-3 px-4 text-neutral-600 text-xs">
                      {u.profile?.slug
                        ? <a href={`https://grafi.digital/${u.profile.slug}`} target="_blank" rel="noreferrer" className="hover:underline">{u.profile.slug}</a>
                        : <span className="text-neutral-300">—</span>}
                    </td>
                    {/* Estado */}
                    <td className="py-3 px-4">
                      <span className={`text-xs border rounded-full px-2.5 py-1 ${STATUS_STYLES[u.status]}`}>
                        {STATUS_LABELS[u.status]}
                      </span>
                    </td>
                    {/* Plan */}
                    <td className="py-3 px-4">
                      {viaCompany ? (
                        <div>
                          <p className="text-xs text-neutral-400 leading-tight">vía empresa</p>
                          <p className="text-xs font-medium">{u.company?.name}</p>
                          {effectivePlan && <p className="text-xs text-neutral-400">{effectivePlan.name}</p>}
                        </div>
                      ) : effectivePlan ? (
                        <div>
                          <p className="text-xs font-medium leading-tight">{effectivePlan.name}</p>
                          {effectivePlan.billingCycle && (
                            <p className="text-xs text-neutral-400">{CYCLE_LABELS[effectivePlan.billingCycle] ?? effectivePlan.billingCycle}</p>
                          )}
                          {effectivePlan.priceBolivares && (
                            <p className="text-xs text-neutral-400">Bs. {effectivePlan.priceBolivares}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300">Sin plan</span>
                      )}
                    </td>
                    {/* Vencimiento */}
                    <td className="py-3 px-4">
                      {planExpiryBadge(u.planExpiresAt) ?? <span className="text-xs text-neutral-300">—</span>}
                    </td>
                    {/* Límites */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs">
                          <span className="text-neutral-400">Btn:</span> <span className="font-medium">{u.effectiveButtonLimit}</span>
                          {u.buttonLimitOverride !== null && <span className="ml-1 text-amber-600 border border-amber-200 bg-amber-50 rounded-full px-1">✎</span>}
                        </span>
                        <span className="text-xs">
                          <span className="text-neutral-400">RS:</span> <span className="font-medium">{u.effectiveSocialLinkLimit}</span>
                          {u.socialLinkLimitOverride !== null && <span className="ml-1 text-amber-600 border border-amber-200 bg-amber-50 rounded-full px-1">✎</span>}
                        </span>
                      </div>
                    </td>
                    {/* Acciones */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(u)}
                        className="text-xs border border-neutral-300 rounded-full px-3 py-1 hover:bg-neutral-100 transition mr-1.5">
                        Gestionar plan
                      </button>
                      <button onClick={() => toggleStatus(u)}
                        className="text-xs border border-neutral-300 rounded-full px-3 py-1 hover:bg-neutral-100 transition">
                        {u.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-neutral-400">Sin usuarios todavía.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de gestión de plan */}
      {editing && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">{editingUser.name}</h2>
                <p className="text-xs text-neutral-400">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditing(null)} className="text-neutral-400 hover:text-neutral-700 text-lg leading-none">✕</button>
            </div>

            {editingUser.company ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                Este usuario pertenece a <strong>{editingUser.company.name}</strong>. Su plan lo hereda de la empresa y no se puede cambiar individualmente.
              </div>
            ) : (
              <>
                {/* Plan */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Plan</label>
                  <select
                    value={draft.planId}
                    onChange={(e) => {
                      const planId = e.target.value;
                      const plan = plans.find((p) => p.id === planId);
                      let planExpiresAt = draft.planExpiresAt;
                      if (plan?.durationMonths) {
                        const d = new Date();
                        d.setMonth(d.getMonth() + plan.durationMonths);
                        planExpiresAt = d.toISOString().slice(0, 10);
                      } else if (plan?.billingCycle === 'LIFETIME') {
                        planExpiresAt = '';
                      }
                      setDraft({ ...draft, planId, planExpiresAt });
                    }}
                    className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Sin plan (acceso básico)</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}{p.priceBolivares ? ` — Bs. ${p.priceBolivares}` : ''}{p.billingCycle ? ` · ${CYCLE_LABELS[p.billingCycle] ?? p.billingCycle}` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedPlan && (
                    <p className="text-xs text-neutral-400">
                      {selectedPlan.maxButtons} botones · {selectedPlan.maxSocialLinks} redes sociales
                      {selectedPlan.durationMonths ? ` · ${selectedPlan.durationMonths} meses` : ` · ${CYCLE_LABELS[selectedPlan.billingCycle ?? ''] ?? selectedPlan.billingCycle}`}
                    </p>
                  )}
                </div>

                {/* Vencimiento */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Fecha de vencimiento</label>
                    {selectedPlan?.durationMonths && (
                      <button
                        type="button"
                        onClick={() => {
                          const d = new Date();
                          d.setMonth(d.getMonth() + selectedPlan.durationMonths!);
                          setDraft({ ...draft, planExpiresAt: d.toISOString().slice(0, 10) });
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ↺ Recalcular ({selectedPlan.durationMonths} meses desde hoy)
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={draft.planExpiresAt}
                    onChange={(e) => setDraft({ ...draft, planExpiresAt: e.target.value })}
                    className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <p className="text-xs text-neutral-400">
                    {selectedPlan?.billingCycle === 'LIFETIME'
                      ? 'Plan de por vida — sin fecha de vencimiento.'
                      : selectedPlan?.durationMonths
                      ? 'Se calculó automáticamente. Puedes ajustarlo manualmente.'
                      : 'Dejar vacío para acceso indefinido.'}
                  </p>
                </div>

                {/* Overrides (avanzado) */}
                <details className="group">
                  <summary className="text-xs text-neutral-400 cursor-pointer hover:text-neutral-600 select-none list-none flex items-center gap-1">
                    <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                    Opciones avanzadas
                  </summary>
                  <div className="mt-3 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Override de botones</label>
                      <input
                        type="number"
                        min="0"
                        placeholder={`Por defecto: ${selectedPlan?.maxButtons ?? 5}`}
                        value={draft.buttonLimitOverride}
                        onChange={(e) => setDraft({ ...draft, buttonLimitOverride: e.target.value })}
                        className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 w-40"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Override de redes sociales</label>
                      <input
                        type="number"
                        min="0"
                        placeholder={`Por defecto: ${selectedPlan?.maxSocialLinks ?? 10}`}
                        value={draft.socialLinkLimitOverride}
                        onChange={(e) => setDraft({ ...draft, socialLinkLimitOverride: e.target.value })}
                        className="border border-neutral-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 w-40"
                      />
                    </div>
                    <p className="text-xs text-neutral-400">Estos valores sobrescriben los límites del plan solo para este usuario.</p>
                  </div>
                </details>
              </>
            )}

            {/* Acciones */}
            <div className="flex gap-2 pt-1">
              {!editingUser.company && (
                <button
                  onClick={() => saveDraft(editing)}
                  disabled={saving}
                  className="flex-1 bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              )}
              <button
                onClick={() => toggleStatus(editingUser)}
                className={`px-4 rounded-xl py-2.5 text-sm border transition ${editingUser.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
              >
                {editingUser.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
