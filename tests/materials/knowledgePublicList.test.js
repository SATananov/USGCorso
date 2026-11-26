import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import KnowledgePublicList from '../../src/components/KnowledgePublicList';
import { getPublicKnowledgeItems } from '../../src/knowledge/knowledgePublicService';

jest.mock('../../src/knowledge/knowledgePublicService', () => ({
  getPublicKnowledgeItems: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const ReactModule = jest.requireActual('react');
  return {
    ...actual,
    useFocusEffect: (callback) => ReactModule.useEffect(callback, [callback]),
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('KnowledgePublicList loading recovery', () => {
  test('shows an error after a rejected request and retries successfully', async () => {
    getPublicKnowledgeItems
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: [{ id: 'k1', title: 'Recovered item', content_type: 'article' }], error: null });

    await render(<KnowledgePublicList />);

    expect(await screen.findByText('Knowledge could not be loaded')).toBeTruthy();
    expect(screen.queryByText('Loading approved materials…')).toBeNull();

    fireEvent.press(screen.getByText('TRY AGAIN'));
    await waitFor(() => expect(screen.getByText('Recovered item')).toBeTruthy());
    expect(getPublicKnowledgeItems).toHaveBeenCalledTimes(2);
  });
});
