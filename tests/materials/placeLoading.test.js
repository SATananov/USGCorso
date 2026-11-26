import { runPlaceLoadRequest } from '../../src/places/placeLoading';

describe('place loading request state', () => {
  test('reports a rejected request and always finishes loading', async () => {
    const onError = jest.fn();
    const onFinish = jest.fn();
    const error = new Error('offline');

    const result = await runPlaceLoadRequest(() => Promise.reject(error), {
      isCurrent: () => true,
      onError,
      onFinish,
    });

    expect(result).toEqual({ ok: false, error });
    expect(onError).toHaveBeenCalledWith(error);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('allows a successful retry', async () => {
    const value = [{ data: [], error: null }];
    const onError = jest.fn();
    const onFinish = jest.fn();
    const result = await runPlaceLoadRequest(() => Promise.resolve(value), {
      isCurrent: () => true,
      onError,
      onFinish,
    });

    expect(result).toEqual({ ok: true, value });
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  test('does not apply stale request callbacks', async () => {
    const onError = jest.fn();
    const onFinish = jest.fn();
    const result = await runPlaceLoadRequest(() => Promise.reject(new Error('offline')), {
      isCurrent: () => false,
      onError,
      onFinish,
    });

    expect(result.ok).toBe(false);
    expect(onError).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });
});
