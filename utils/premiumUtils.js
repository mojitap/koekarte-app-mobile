export function checkCanUsePremium(createdAt, isPaid, isFreeExtended) {
  if (isPaid || isFreeExtended) return true;
  if (!createdAt) return false;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffTime = now - createdDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));  // ← 切り捨て！

  return diffDays < 5;  // 5日未満ならOK
}

export function getFreeDaysLeft(createdAt) {
  const created = new Date(createdAt);
  const now = new Date();
  const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
  return Math.max(0, 5 - diff); // 5日間中、残り何日あるか
}
