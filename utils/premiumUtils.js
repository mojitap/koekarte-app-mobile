export function checkCanUsePremium(createdAt, isPaid, isFreeExtended = false) {
  if (isPaid) return true;
  if (isFreeExtended) return true;

  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= 5;
}
