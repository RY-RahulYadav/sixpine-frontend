export const getDisplayPrices = (product: any, variant?: any) => {
  // Normalize possible price fields from different payload shapes
  const p = product || {};
  const v = variant || {};

  const parse = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  };

  // Prefer explicit parent-level fields if present
  const parentPrice = parse(p.price ?? p.Price ?? p.parent_price ?? p.parentPrice ?? p.newPrice ?? null);
  const parentOld = parse(p.old_price ?? p.oldPrice ?? p.originalPrice ?? p.old_price ?? null);

  // Variant-level fallback
  const variantPrice = parse(v.price ?? v.price_display ?? v.variantPrice ?? null);
  const variantOld = parse(v.old_price ?? v.oldPrice ?? v.originalPrice ?? null);

  // Decide final values: if parent-level provided (not null), use it; otherwise variant; otherwise null
  const price = parentPrice !== null ? parentPrice : (variantPrice !== null ? variantPrice : null);
  const old_price = parentOld !== null ? parentOld : (variantOld !== null ? variantOld : null);

  return { price, old_price };
};

export const formatINR = (val?: number | null) => {
  if (val === null || val === undefined) return '';
  try {
    return `₹${Number(val).toLocaleString('en-IN')}`;
  } catch {
    return String(val);
  }
};
