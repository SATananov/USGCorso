export function getAuthErrorKey(error) {
  const message = String(error?.message || '').toLowerCase();
  const code = String(error?.code || '').toLowerCase();

  if (
    code.includes('invalid_credentials') ||
    message.includes('invalid login credentials')
  ) {
    return 'invalidCredentials';
  }

  if (
    code.includes('email_exists') ||
    message.includes('already registered') ||
    message.includes('already exists')
  ) {
    return 'emailExists';
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch')
  ) {
    return 'networkError';
  }

  return 'genericError';
}
