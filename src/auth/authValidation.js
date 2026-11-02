export function getPasswordRules(password) {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password) {
  return Object.values(getPasswordRules(password)).every(Boolean);
}

export function isEmailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateLogin(email, password) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'emailRequired';
  } else if (!isEmailValid(email)) {
    errors.email = 'emailInvalid';
  }

  if (!password) {
    errors.password = 'passwordRequired';
  }

  return errors;
}
export function validateRegister(email, password, confirmPassword) {
  const errors = {};

  if (!email.trim()) {
    errors.email = 'emailRequired';
  } else if (!isEmailValid(email)) {
    errors.email = 'emailInvalid';
  }

  if (!password) {
    errors.password = 'passwordRequired';
  } else {
    const rules = getPasswordRules(password);

    if (!rules.length) {
      errors.password = 'passwordLength';
    } else if (!rules.uppercase) {
      errors.password = 'passwordUppercase';
    } else if (!rules.lowercase) {
      errors.password = 'passwordLowercase';
    } else if (!rules.number) {
      errors.password = 'passwordNumber';
    } else if (!rules.special) {
      errors.password = 'passwordSpecial';
    }
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'confirmRequired';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'passwordMismatch';
  }

  return errors;
}
