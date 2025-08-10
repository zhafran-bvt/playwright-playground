// Simple deep merge for plain objects.
// Arrays and non-plain objects are replaced by the override.
export function deepMerge<T>(base: T, override: any): T {
  if (!override || typeof override !== 'object' || Array.isArray(override)) {
    return (override as T) ?? base;
  }
  if (!base || typeof base !== 'object' || Array.isArray(base)) {
    return { ...(override as any) } as T;
  }
  const out: any = { ...(base as any) };
  for (const key of Object.keys(override)) {
    const b = (base as any)[key];
    const o = override[key];
    if (o && typeof o === 'object' && !Array.isArray(o) && b && typeof b === 'object' && !Array.isArray(b)) {
      out[key] = deepMerge(b, o);
    } else {
      out[key] = o;
    }
  }
  return out as T;
}

