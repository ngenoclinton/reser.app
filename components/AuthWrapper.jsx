'use client';

import { AuthProvider } from "../context/authLogContext";
// import { AuthProvider } from '@/context/authContext';

const AuthWrapper = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AuthWrapper;