export function checkCanUsePremium(createdAt, isPaid, isFreeExtended) {
  if (isPaid || isFreeExtended) return true;
  if (!createdAt) return false;
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
  return diffDays < 5;
}

export function getFreeDaysLeft(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return Math.max(0, 5 - diff); // 5日間中、残り何日あるか
}
