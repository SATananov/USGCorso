import { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

function getRecoveryParams(url) {
  if (!url) {
    return new URLSearchParams();
  }

  const queryIndex = url.indexOf('?');
  const hashIndex = url.indexOf('#');
  const parts = [];

  if (queryIndex >= 0) {
    const end = hashIndex >= 0 && hashIndex > queryIndex ? hashIndex : url.length;
    parts.push(url.slice(queryIndex + 1, end));
  }

  if (hashIndex >= 0) {
    parts.push(url.slice(hashIndex + 1));
  }

  return new URLSearchParams(parts.filter(Boolean).join('&'));
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email, password) {
    return supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
  }

  async function signUp(email, password) {
    return supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  async function requestPasswordReset(email, redirectTo) {
    return supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );
  }

  async function recoverSessionFromUrl(url) {
    const params = getRecoveryParams(url);
    const errorDescription = params.get('error_description');
    const errorCode = params.get('error_code');

    if (errorDescription || errorCode) {
      return {
        data: null,
        error: new Error(errorDescription || errorCode),
      };
    }

    const code = params.get('code');

    if (code) {
      return supabase.auth.exchangeCodeForSession(code);
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      return supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }

    const current = await supabase.auth.getSession();

    if (current.data?.session) {
      return current;
    }

    return {
      data: null,
      error: new Error('Recovery session not found'),
    };
  }

  async function updatePassword(password) {
    return supabase.auth.updateUser({ password });
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        recoverSessionFromUrl,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
