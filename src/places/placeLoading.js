export async function runPlaceLoadRequest(request, { isCurrent, onError, onFinish }) {
  try {
    return { ok: true, value: await request() };
  } catch (error) {
    if (isCurrent()) {
      onError(error);
    }
    return { ok: false, error };
  } finally {
    if (isCurrent()) {
      onFinish();
    }
  }
}
