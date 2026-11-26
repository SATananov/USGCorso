import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddMaterialScreen from '../../src/screens/AddMaterialScreen';
import { createContentItem, getIsAdmin } from '../../src/governance/contentGovernanceService';

jest.mock('../../src/auth/AuthContext', () => ({
  useAuth: () => ({ session: { user: { id: 'user-1' } } }),
}));

jest.mock('../../src/governance/contentGovernanceService', () => ({
  createContentItem: jest.fn(),
  getIsAdmin: jest.fn(),
  deleteMyContentItem: jest.fn(),
  uploadMyContentImage: jest.fn(),
  adminSetContentStatus: jest.fn(),
}));

jest.mock('../../src/governance/userContentMediaService', () => ({ uploadMyContentImage: jest.fn() }));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

describe('Add Material form validation', () => {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() };

  beforeEach(() => {
    getIsAdmin.mockResolvedValue({ data: false, error: null });
    createContentItem.mockResolvedValue({ data: [{ id: 'new-item', status: 'pending' }], error: null });
  });

  test('requires a title before creating a material', async () => {
    await render(<AddMaterialScreen navigation={navigation} />);
    await fireEvent.press(screen.getByText('SUBMIT FOR REVIEW'));
    expect(await screen.findByText('Add a material title.')).toBeTruthy();
    expect(createContentItem).not.toHaveBeenCalled();
  });

  test('accepts the 180-character title boundary and submits a mocked create', async () => {
    await render(<AddMaterialScreen navigation={navigation} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Material title'), 'A'.repeat(180));
    await fireEvent.press(screen.getByText('SUBMIT FOR REVIEW'));

    expect(await screen.findByText('Material submitted')).toBeTruthy();
    expect(createContentItem).toHaveBeenCalledWith(expect.objectContaining({ title: 'A'.repeat(180) }));
  });

  test('rejects a title beyond the 180-character boundary', async () => {
    await render(<AddMaterialScreen navigation={navigation} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Material title'), 'A'.repeat(181));
    await fireEvent.press(screen.getByText('SUBMIT FOR REVIEW'));

    expect(await screen.findByText('The title is too long.')).toBeTruthy();
    expect(createContentItem).not.toHaveBeenCalled();
  });

  test('rejects body text beyond the 20,000-character boundary', async () => {
    await render(<AddMaterialScreen navigation={navigation} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Material title'), 'Valid title');
    await fireEvent.changeText(screen.getByPlaceholderText('Write the content or a short description...'), 'x'.repeat(20001));
    await fireEvent.press(screen.getByText('SUBMIT FOR REVIEW'));

    expect(await screen.findByText('The text is too long.')).toBeTruthy();
    expect(createContentItem).not.toHaveBeenCalled();
  });

  test('shows a friendly error when the mocked create operation fails', async () => {
    createContentItem.mockResolvedValue({ data: null, error: new Error('offline') });
    await render(<AddMaterialScreen navigation={navigation} />);
    await fireEvent.changeText(screen.getByPlaceholderText('Material title'), 'Valid title');
    await fireEvent.press(screen.getByText('SUBMIT FOR REVIEW'));

    expect(await screen.findByText('The material could not be saved.')).toBeTruthy();
    expect(createContentItem).toHaveBeenCalledTimes(1);
  });
});
