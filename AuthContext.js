// ✅ 1. context/AuthContext.js を新規作成
import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [showAuthStack, setShowAuthStack] = useState(true); // 初期はログイン画面へ

  return (
    <AuthContext.Provider value={{ showAuthStack, setShowAuthStack }}>
      {children}
    </AuthContext.Provider>
  );
};