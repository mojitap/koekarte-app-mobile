export function checkCanUsePremium(createdAt, isPaid, isFreeExtended) {
  if (isPaid || isFreeExtended) return true;

  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);

  return diffDays < 5;
}
