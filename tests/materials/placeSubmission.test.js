import { placeCopy } from '../../src/places/placeCopy';
import { submitPlaceRequest } from '../../src/places/placeSubmission';

const values = {
  name: '',
  category: 'veterinary',
  city: 'Sofia',
  latitude: 42.7,
  longitude: 23.3,
  country: 'Bulgaria',
  address: 'Test address',
};

describe('place submission results', () => {
  test('submits generated name and reports success', async () => {
    const createPlaceFn = jest.fn().mockResolvedValue({ error: null });
    const result = await submitPlaceRequest({
      userId: 'user-1', values, categories: placeCopy.en.categories,
      formCopy: placeCopy.en.form, createPlaceFn,
    });

    expect(result).toEqual({ ok: true });
    expect(createPlaceFn).toHaveBeenCalledWith('user-1', expect.objectContaining({ name: 'Veterinary — Sofia' }));
    expect(values.name).toBe('');
  });

  test.each(['bg', 'en', 'it'])('uses truthful %s network copy and retains input values', async (language) => {
    const enteredValues = { ...values, name: 'Clinic', city: 'Plovdiv' };
    const createPlaceFn = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await submitPlaceRequest({
      userId: 'user-1', values: enteredValues, categories: placeCopy[language].categories,
      formCopy: placeCopy[language].form, createPlaceFn,
    });

    expect(result).toEqual({ ok: false, message: placeCopy[language].form.networkError });
    expect(result.message).not.toMatch(/saved|запазен[иао]?|salvat[oi]?/i);
    expect(enteredValues).toEqual({ ...values, name: 'Clinic', city: 'Plovdiv' });
    expect(createPlaceFn).toHaveBeenCalledTimes(1);
  });

  test('maps a returned permission failure without reporting success', async () => {
    const result = await submitPlaceRequest({
      userId: 'user-1', values, categories: placeCopy.en.categories,
      formCopy: placeCopy.en.form,
      createPlaceFn: jest.fn().mockResolvedValue({ error: { code: '42501' } }),
    });

    expect(result).toEqual({ ok: false, message: placeCopy.en.form.permissionDenied });
  });
});
