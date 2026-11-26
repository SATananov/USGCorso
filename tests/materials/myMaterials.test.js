import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import MyMaterialsScreen from '../../src/screens/MyMaterialsScreen';
import { getMyContentItems } from '../../src/governance/contentGovernanceService';

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

jest.mock('../../src/governance/contentGovernanceService', () => ({
  getMyContentItems: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const ReactModule = jest.requireActual('react');
  return { ...actual, useFocusEffect: (callback) => ReactModule.useEffect(callback, [callback]) };
});

describe('My Materials list', () => {
  const navigation = { navigate: jest.fn() };

  beforeEach(() => {
    getMyContentItems.mockResolvedValue({ data: [], error: null });
  });

  test('shows loading and then the empty state', async () => {
    let resolveLoad;
    getMyContentItems.mockReturnValue(new Promise((resolve) => { resolveLoad = resolve; }));
    await render(<MyMaterialsScreen navigation={navigation} />);

    expect(screen.getByText('myMaterials.loading')).toBeTruthy();
    resolveLoad({ data: [], error: null });
    await waitFor(() => expect(screen.getByText('myMaterials.emptyTitle')).toBeTruthy());
  });

  test('shows loaded items and opens the details route', async () => {
    getMyContentItems.mockResolvedValue({
      data: [{ id: 'm1', title: 'Test material', section_key: 'knowledge', status: 'pending', content_type: 'article', created_at: '2026-01-01' }],
      error: null,
    });
    await render(<MyMaterialsScreen navigation={navigation} />);

    await fireEvent.press(await screen.findByText('Test material'));
    expect(navigation.navigate).toHaveBeenCalledWith('MyMaterialDetails', expect.objectContaining({ item: expect.objectContaining({ id: 'm1' }) }));
  });

  test('pull-to-refresh reloads the list', async () => {
    const refreshResult = { data: [], error: null };
    getMyContentItems.mockResolvedValue(refreshResult);
    const view = await render(<MyMaterialsScreen navigation={navigation} />);
    await waitFor(() => expect(getMyContentItems).toHaveBeenCalledTimes(1));

    const scrollView = view.container.queryAll((node) => Boolean(node.props.refreshControl))[0];
    await act(async () => scrollView.props.refreshControl.props.onRefresh());
    await waitFor(() => expect(getMyContentItems).toHaveBeenCalledTimes(2));
  });

  test('renders backend errors', async () => {
    getMyContentItems.mockRejectedValue(new Error('offline'));
    await render(<MyMaterialsScreen navigation={navigation} />);
    await waitFor(() => expect(screen.getByText('myMaterials.loadFailed')).toBeTruthy());
  });
});

