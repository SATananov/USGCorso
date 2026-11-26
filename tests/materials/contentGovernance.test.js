import {
  createContentItem,
  deleteMyContentItem,
  getMyContentItems,
  updateMyContentItem,
} from '../../src/governance/contentGovernanceService';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

describe('My Materials backend operations', () => {
  test('reads the signed-in user material list through a mocked RPC', async () => {
    const response = { data: [{ id: 'm1', title: 'Test material' }], error: null };
    supabase.rpc.mockResolvedValue(response);

    await expect(getMyContentItems(null)).resolves.toEqual(response);
    expect(supabase.rpc).toHaveBeenCalledWith('list_my_content_items', { target_section: null });
  });

  test('creates content with normalized values through a mocked RPC', async () => {
    supabase.rpc.mockResolvedValue({ data: [{ id: 'm2' }], error: null });

    await createContentItem({
      section: 'knowledge',
      contentType: 'article',
      title: '  A title  ',
      body: '  Body  ',
      sourceLanguage: 'en',
    });

    expect(supabase.rpc).toHaveBeenCalledWith('create_content_item_v2', {
      target_section: 'knowledge',
      target_content_type: 'article',
      target_title: 'A title',
      target_body: 'Body',
      target_context_type: null,
      target_context_id: null,
      target_source_language: 'en',
    });
  });

  test('updates content through a mocked RPC', async () => {
    supabase.rpc.mockResolvedValue({ data: null, error: null });
    await updateMyContentItem('m3', { title: ' Updated ', body: '', contentType: 'article' });
    expect(supabase.rpc).toHaveBeenCalledWith('update_my_content_item', {
      target_item_id: 'm3',
      target_title: 'Updated',
      target_body: null,
      target_content_type: 'article',
    });
  });

  test('deletes content through a mocked RPC', async () => {
    supabase.rpc.mockResolvedValue({ data: true, error: null });
    await deleteMyContentItem('m4');
    expect(supabase.rpc).toHaveBeenCalledWith('delete_my_content_item', { target_item_id: 'm4' });
  });
});
