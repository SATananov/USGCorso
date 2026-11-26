import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/auth/AuthContext';
import { emitAuthEvent, supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => {
  let listener;
  return {
    supabase: {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn((callback) => {
          listener = callback;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        }),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        exchangeCodeForSession: jest.fn(),
        setSession: jest.fn(),
      },
    },
    emitAuthEvent: (event, session) => listener?.(event, session),
  };
});

describe('AuthProvider session state', () => {
  beforeEach(() => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
  });

  test('loads an existing session', async () => {
    const session = { user: { id: 'user-1' }, access_token: 'token' };
    supabase.auth.getSession.mockResolvedValue({ data: { session } });
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.session).toEqual(session);
    expect(result.current.user).toEqual(session.user);
  });

  test('reflects sign-in and sign-out session events', async () => {
    const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
    const { result } = await renderHook(() => useAuth(), { wrapper });
    const session = { user: { id: 'user-2' }, access_token: 'token-2' };

    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => emitAuthEvent('SIGNED_IN', session));
    expect(result.current.session).toEqual(session);
    await act(async () => emitAuthEvent('SIGNED_OUT', null));
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
