'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceMonthly: string;
  priceBolivares: string | null;
  billingCycle: 'LIFETIME' | 'ANNUAL' | 'CONTRACT';
  durationLabel: string | null;
  durationMonths: number | null;
  maxButtons: number;
  maxSocialLinks: number;
  maxCollaborators: number;
}

const CYCLE_LABELS: Record<string, string> = {
  LIFETIME: 'De por vida',
  ANNUAL: '12 meses',
  CONTRACT: 'Según contrato',
};

const CYCLE_STYLES: Record<string, string> = {
  LIFETIME: 'bg-blue-50 text-blue-700 border-blue-200',
  ANNUAL: 'bg-green-50 text-green-700 border-green-200',
  CONTRACT: 'bg-purple-50 text-purple-700 border-purple-200',
  CUSTOM: 'bg-orange-50 text-orange-700 border-orange-200',
};

function planDurationLabel(plan: Plan): string {
  if (plan.durationLabel) return plan.durationLabel;
  if (plan.billingCycle === 'ANNUAL' && plan.durationMonths) return `${plan.durationMonths} meses`;
  return CYCLE_LABELS[plan.billingCycle] || plan.billingCycle;
}

function planDurationStyle(plan: Plan): string {
  if (plan.durationLabel) return CYCLE_STYLES.CUSTOM;
  return CYCLE_STYLES[plan.billingCycle] ?? 'bg-neutral-50 text-neutral-500 border-neutral-200';
}

interface Draft {
  name: string;
  priceMonthly: string;
  priceBolivares: string;
  durationMode: 'LIFETIME' | 'ANNUAL' | 'CONTRACT' | 'CUSTOM';
  durationLabel: string;
  durationMonths: string;
  maxButtons: string;
  maxSocialLinks: string;
  maxCollaborators: string;
}

const EMPTY_DRAFT: Draft = {
  name: '',
  priceMonthly: '',
  priceBolivares: '',
  durationMode: 'ANNUAL',
  durationLabel: '',
  durationMonths: '12',
  maxButtons: '5',
  maxSocialLinks: '10',
  maxCollaborators: '1',
};

function planToDraft(p: Plan): Draft {
  const isCustom = !!p.durationLabel;
  return {
    name: p.name,
    priceMonthly: p.priceMonthly,
    priceBolivares: p.priceBolivares ?? '',
    durationMode: isCustom ? 'CUSTOM' : (p.billingCycle as Draft['durationMode']),
    durationLabel: p.durationLabel ?? '',
    durationMonths: p.durationMonths != null ? String(p.durationMonths) : '',
    maxButtons: String(p.maxButtons),
    maxSocialLinks: String(p.maxSocialLinks),
    maxCollaborators: String(p.maxCollaborators),
  };
}

function draftToPayload(d: Draft) {
  const billingCycle = d.durationMode === 'CUSTOM' ? 'CONTRACT' : d.durationMode;
  const durationLabel = d.durationMode === 'CUSTOM' ? (d.durationLabel || null) : null;
  const durationMonths =
    d.durationMode === 'LIFETIME' ? null :
    d.durationMonths ? Number(d.durationMonths) : null;
  return {
    name: d.name,
    priceMonthly: Number(d.priceMonthly) || 0,
    priceBolivares: d.priceBolivares ? Number(d.priceBolivares) : null,
    billingCycle,
    durationLabel,
    durationMonths,
    maxButtons: Number(d.maxButtons) || 0,
    maxSocialLinks: Number(d.maxSocialLinks) || 0,
    maxCollaborators: Number(d.maxCollaborators) || 1,
  };
}

function DraftForm({ draft, onChange }: { draft: Draft; onChange: (d: Draft) => void }) {
  const f = (field: keyof Draft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      onChange({ ...draft, [field]: e.target.value });

  const cls = 'border border-neutral-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-black/10 w-full';

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Nombre</label>
        <input value={draft.name} onChange={f('name')} placeholder="Grafi Pro" className={cls} />
      </div>

      {/* Duración */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Tipo de duración</label>
        <select
          value={draft.durationMode}
          onChange={(e) => {
            const mode = e.target.value as Draft['durationMode'];
            onChange({
              ...draft,
              durationMode: mode,
              durationMonths: mode === 'ANNUAL' ? '12' : mode === 'LIFETIME' ? '' : draft.durationMonths,
              durationLabel: mode === 'CUSTOM' ? draft.durationLabel : '',
            });
          }}
          className={cls}
        >
          <option value="LIFETIME">De por vida (sin vencimiento)</option>
          <option value="ANNUAL">Anual (12 meses)</option>
          <option value="CONTRACT">Según contrato (manual)</option>
          <option value="CUSTOM">Personalizado (N meses/días)</option>
        </select>
      </div>

      {/* Meses — visible para ANNUAL y CUSTOM */}
      {(draft.durationMode === 'ANNUAL' || draft.durationMode === 'CUSTOM') && (
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">
            {draft.durationMode === 'CUSTOM' ? 'Duración en meses' : 'Meses'}
          </label>
          <input
            type="number"
            min="1"
            value={draft.durationMonths}
            onChange={f('durationMonths')}
            placeholder="12"
            className={cls}
          />
          <p className="text-xs text-neutral-400 mt-1">
            Al asignar el plan a un usuario, la fecha de vencimiento se calcula automáticamente.
          </p>
        </div>
      )}

      {/* Etiqueta personalizada — solo para CUSTOM */}
      {draft.durationMode === 'CUSTOM' && (
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Etiqueta (opcional)</label>
          <input
            value={draft.durationLabel}
            onChange={f('durationLabel')}
            placeholder="ej: 9 meses, 90 días…"
            className={cls}
          />
          <p className="text-xs text-neutral-400 mt-1">Texto que se muestra en la lista de planes.</p>
        </div>
      )}

      {/* CONTRACT info */}
      {draft.durationMode === 'CONTRACT' && (
        <div className="flex items-center">
          <p className="text-xs text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
            La fecha de vencimiento se establece manualmente por usuario al asignar el plan.
          </p>
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Precio Bs.</label>
        <input type="number" step="0.01" min="0" value={draft.priceBolivares} onChange={f('priceBolivares')} placeholder="150" className={cls} />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Máx. botones</label>
        <input type="number" min="0" value={draft.maxButtons} onChange={f('maxButtons')} className={cls} />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Máx. redes sociales</label>
        <input type="number" min="0" value={draft.maxSocialLinks} onChange={f('maxSocialLinks')} className={cls} />
      </div>
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide block mb-1">Máx. colaboradores</label>
        <input type="number" min="1" value={draft.maxCollaborators} onChange={f('maxCollaborators')} className={cls} />
      </div>
    </div>
  );
}

// Fix: unused variable warning
export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [createDraft, setCreateDraft] = useState<Draft>({ ...EMPTY_DRAFT });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function load() { api<Plan[]>('/admin/plans').then(setPlans); }
  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const slug = createDraft.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await api('/admin/plans', { method: 'POST', body: JSON.stringify({ slug, ...draftToPayload(createDraft) }) });
      setCreateDraft({ ...EMPTY_DRAFT });
      setShowCreate(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setEditDraft(planToDraft(plan));
    setError(null);
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      await api(`/admin/plans/${editingId}`, { method: 'PATCH', body: JSON.stringify(draftToPayload(editDraft)) });
      setEditingId(null);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function remove(planId: string, name: string) {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await api(`/admin/plans/${planId}`, { method: 'DELETE' });
      load();
    } catch (err: any) { setError(err.message); }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planes</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Define límites y duración de cada plan. Los límites son sobreescribibles por usuario.
          </p>
        </div>
        <button onClick={() => { setShowCreate(true); setError(null); }}
          className="bg-black text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-neutral-800 transition shrink-0">
          + Nuevo plan
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

      {showCreate && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Nuevo plan</h2>
            <button onClick={() => setShowCreate(false)} className="text-neutral-400 hover:text-neutral-700 text-lg leading-none">✕</button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <DraftForm draft={createDraft} onChange={setCreateDraft} />
            <div className="flex gap-2">
              <button type="submit" disabled={saving || !createDraft.name}
                className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50">
                {saving ? 'Creando…' : 'Crear plan'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="border border-neutral-200 rounded-xl px-4 py-2 text-sm hover:bg-neutral-50 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
            {editingId === plan.id ? (
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-700">Editando {plan.name}</h2>
                  <button onClick={() => setEditingId(null)} className="text-neutral-400 hover:text-neutral-700 text-lg leading-none">✕</button>
                </div>
                <DraftForm draft={editDraft} onChange={setEditDraft} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving}
                    className="bg-black text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-neutral-800 transition disabled:opacity-50">
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="border border-neutral-200 rounded-xl px-4 py-2 text-sm hover:bg-neutral-50 transition">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{plan.name}</span>
                    <span className="text-neutral-400 text-xs">/{plan.slug}</span>
                    <span className={`text-xs border rounded-full px-2 py-0.5 ${planDurationStyle(plan)}`}>
                      {planDurationLabel(plan)}
                    </span>
                    {plan.durationMonths && plan.billingCycle !== 'LIFETIME' && !plan.durationLabel && (
                      <span className="text-xs text-neutral-400">· {plan.durationMonths} meses · auto-expiry</span>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5 text-xs text-neutral-500 flex-wrap">
                    {plan.priceBolivares && <span className="font-medium text-neutral-700">Bs. {plan.priceBolivares}</span>}
                    <span><span className="text-neutral-400">Botones:</span> {plan.maxButtons}</span>
                    <span><span className="text-neutral-400">Redes:</span> {plan.maxSocialLinks}</span>
                    {plan.maxCollaborators > 1 && <span><span className="text-neutral-400">Colaboradores:</span> {plan.maxCollaborators}</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(plan)}
                    className="text-xs border border-neutral-300 rounded-full px-3 py-1.5 hover:bg-neutral-100 transition">
                    Editar
                  </button>
                  <button onClick={() => remove(plan.id, plan.name)}
                    className="text-xs border border-red-200 text-red-600 rounded-full px-3 py-1.5 hover:bg-red-50 transition">
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {plans.length === 0 && (
          <div className="text-center text-neutral-400 py-12 text-sm">Sin planes todavía.</div>
        )}
      </div>
    </div>
  );
}
