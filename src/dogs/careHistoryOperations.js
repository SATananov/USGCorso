const supplementalFields = [
  'time',
  'category',
  'quantity',
  'unit',
  'customDescription',
  'duration',
  'healthType',
  'weightKg',
  'description',
  'updatedAt',
];

export function mergeCareHistoryRows(remoteRows = [], extensions = [], dogName) {
  const extensionKey = (userId, dogId, entryId) => `${userId}:${dogId}:${entryId}`;
  const byRemoteId = new Map(extensions.filter(item => item.linkedEntryId).map(item => [extensionKey(item.userId, item.dogId, item.linkedEntryId), item]));
  const remote = remoteRows.map(row => {
    const extension = byRemoteId.get(extensionKey(row.owner_id, row.dog_id, row.id));
    const additional = {};
    for (const field of supplementalFields) {
      if (extension && Object.prototype.hasOwnProperty.call(extension, field)) additional[field] = extension[field];
    }
    return { ...row, ...additional, id: row.id, kind: row.kind, source: 'remote', dogName };
  });
  const local = extensions.filter(item => !item.linkedEntryId).map(item => ({ ...item, source: 'local', dogName }));
  return [...remote, ...local];
}

export function getCareHistoryEntryDetails(item, { label = value => String(value || ''), weightLabel = 'Weight' } = {}) {
  if (item.kind === 'feeding') {
    const food = item.source === 'remote' ? item.food_name : item.customDescription || label(item.category) || item.food_name;
    const quantity = item.source === 'remote' ? item.amount_g : item.quantity ?? item.amount_g;
    const unit = item.source === 'remote' ? 'g' : item.unit || 'g';
    return `${food} · ${quantity} ${unit}`;
  }
  if (item.kind === 'care') {
    const care = item.source === 'remote' ? item.care_type : label(item.category) || item.care_type;
    return `${care}${item.duration ? ` · ${item.duration} min` : ''}`;
  }
  if (item.healthType === 'weightType') return `${weightLabel}: ${item.weightKg} kg`;
  return `${label(item.healthType)}${item.description ? ` · ${item.description}` : ''}`;
}
export async function saveRemoteCareEntryWithExtension({ saveRemote, saveExtension }) {
  const response = await saveRemote();
  if (response?.error || !response?.data) throw response?.error || new Error('Cloud care entry was not saved');
  try {
    await saveExtension(response.data.id);
    return { data: response.data, extensionSaved: true, extensionError: null };
  } catch (extensionError) {
    return { data: response.data, extensionSaved: false, extensionError };
  }
}

export function switchCareHistorySection({ editing, currentSection, nextSection, confirmDiscard, discard, switchTo }) {
  if (currentSection === nextSection) return 'unchanged';
  const apply = () => {
    if (editing) discard();
    switchTo(nextSection);
  };
  if (editing) {
    confirmDiscard(apply);
    return 'confirmation-required';
  }
  apply();
  return 'switched';
}
