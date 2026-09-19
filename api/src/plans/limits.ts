export function effectiveButtonLimit(user: {
  buttonLimitOverride: number | null;
  plan: { maxButtons: number } | null;
  company?: { plan: { maxButtons: number } | null } | null;
}): number {
  return user.buttonLimitOverride ?? user.company?.plan?.maxButtons ?? user.plan?.maxButtons ?? 5;
}

export function effectiveCollaboratorLimit(company: {
  collaboratorLimitOverride: number | null;
  plan: { maxCollaborators: number } | null;
}): number {
  return company.collaboratorLimitOverride ?? company.plan?.maxCollaborators ?? 1;
}

type PlanFeature = 'hasLeads' | 'hasCatalog' | 'hasAnalytics' | 'hasExportLeads' | 'hasSaveContact' | 'hasCompanyPanel';

export function hasFeature(
  user: { plan: { features: unknown } | null; company?: { plan: { features: unknown } | null } | null },
  feature: PlanFeature,
): boolean {
  // Users without any plan get full access (grandfathered / admin-assigned)
  const features = (user.company?.plan?.features ?? user.plan?.features) as Record<string, boolean> | null;
  if (!features || typeof features !== 'object') return true;
  // If the feature key is absent, default to true (forward-compatible)
  if (!(feature in features)) return true;
  return features[feature] === true;
}
