// utils/premiumUtils.js

export const checkCanUsePremium = (createdAtStr, isPaid) => {
  if (isPaid) return true;
  if (!createdAtStr) return false;

  const createdAt = new Date(createdAtStr);
  const today = new Date();
  const diffTime = today - createdAt;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays < 5;
};
