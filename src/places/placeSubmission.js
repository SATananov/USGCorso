function getSubmissionErrorMessage(error, formCopy) {
  const status = error?.status ?? error?.statusCode;
  const code = String(error?.code ?? '');

  if (status === 401 || status === 403 || code === '42501') {
    return formCopy.permissionDenied;
  }

  if (error instanceof TypeError || /network|fetch/i.test(String(error?.message ?? ''))) {
    return formCopy.networkError;
  }

  return formCopy.failed;
}

export async function submitPlaceRequest({ userId, values, categories, formCopy, createPlaceFn }) {
  const payload = {
    ...values,
    name: values.name.trim() || `${categories[values.category]}${values.city.trim() ? ` — ${values.city.trim()}` : ''}`,
  };

  try {
    const { error } = await createPlaceFn(userId, payload);
    return error
      ? { ok: false, message: getSubmissionErrorMessage(error, formCopy) }
      : { ok: true };
  } catch (error) {
    return { ok: false, message: getSubmissionErrorMessage(error, formCopy) };
  }
}
