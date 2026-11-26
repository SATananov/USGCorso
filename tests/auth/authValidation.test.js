import {
  isEmailValid,
  isPasswordValid,
  validateLogin,
  validateRegister,
} from '../../src/auth/authValidation';

describe('SoftUni authentication validation', () => {
  test.each([
    ['user@example.com', true],
    [' user@example.co ', true],
    ['', false],
    ['not-an-email', false],
    ['user@', false],
  ])('validates email %s as %s', (email, expected) => {
    expect(isEmailValid(email)).toBe(expected);
  });

  test.each([
    ['Aa1!aa', true],
    ['Aa1!a', false],
    ['aa1!aa', false],
    ['AA1!AA', false],
    ['Aa!!aa', false],
    ['Aa11aa', false],
  ])('validates password rule boundary for %s as %s', (password, expected) => {
    expect(isPasswordValid(password)).toBe(expected);
  });

  test('requires login email and password and rejects malformed email', () => {
    expect(validateLogin('', '')).toEqual({ email: 'emailRequired', password: 'passwordRequired' });
    expect(validateLogin('invalid', 'x')).toEqual({ email: 'emailInvalid' });
    expect(validateLogin('person@example.com', 'x')).toEqual({});
  });

  test('validates registration fields and confirmation', () => {
    expect(validateRegister('', '', '')).toEqual({
      email: 'emailRequired',
      password: 'passwordRequired',
      confirmPassword: 'confirmRequired',
    });
    expect(validateRegister('person@example.com', 'Aa1!aa', 'Aa1!ab')).toEqual({
      confirmPassword: 'passwordMismatch',
    });
    expect(validateRegister('person@example.com', 'Aa1!aa', 'Aa1!aa')).toEqual({});
  });
});
