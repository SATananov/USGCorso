import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AppNavigator from '../../src/navigation/AppNavigator';
import { useAuth } from '../../src/auth/AuthContext';
import { getMyRole } from '../../src/admin/adminService';

jest.mock('../../src/auth/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('../../src/admin/adminService', () => ({ getMyRole: jest.fn() }));
jest.mock('../../src/app/AppControlContext', () => ({
  useAppControls: () => ({ leaveGuestMode: jest.fn() }),
}));

describe('protected route navigation', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ loading: false, session: null });
    getMyRole.mockResolvedValue({ data: { role: 'user' }, error: null });
  });

  async function renderNavigation() {
    return render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );
  }

  test('shows sign-in gate when navigating to a protected route without a session', async () => {
    await renderNavigation();
    await fireEvent.press(screen.getByText('OPEN_PROTECTED'));
    expect(screen.getByText('Please sign in to access this area.')).toBeTruthy();
  });

  test('opens the protected destination when a session exists', async () => {
    useAuth.mockReturnValue({
      loading: false,
      session: { user: { id: 'user-1' }, access_token: 'test-token' },
    });
    await renderNavigation();
    await fireEvent.press(screen.getByText('OPEN_PROTECTED'));
    expect(screen.getByText('ROUTE:MyMaterials')).toBeTruthy();
  });

  test('requires the admin role for admin destinations', async () => {
    useAuth.mockReturnValue({
      loading: false,
      session: { user: { id: 'user-1' }, access_token: 'test-token' },
    });
    await renderNavigation();
    await fireEvent.press(screen.getByText('OPEN_ADMIN'));
    expect(await screen.findByText('Administrator access is required.')).toBeTruthy();
    expect(getMyRole).toHaveBeenCalledWith('user-1');
  });
});
