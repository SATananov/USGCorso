from dataclasses import dataclass
from datetime import datetime, timezone
from math import floor, isfinite


@dataclass(frozen=True)
class FairPlayResult:
    decision: str
    reasons: tuple[str, ...]
    compared_sessions: int


def _timestamp(value):
    if isinstance(value, datetime):
        instant = value
    elif isinstance(value, str):
        instant = datetime.fromisoformat(value.replace('Z', '+00:00'))
    else:
        raise ValueError('INVALID_TIMESTAMP')
    if instant.tzinfo is None:
        raise ValueError('INVALID_TIMESTAMP')
    return instant.astimezone(timezone.utc)


def _location(value):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError('INVALID_COORDINATE')
    val = float(value)
    if not isfinite(val):
        raise ValueError('INVALID_COORDINATE')
    return val


def _read(session):
    if not isinstance(session, dict):
        raise ValueError('INVALID_SESSION')
    dog_id = session['dog_id']
    owner_id = session['owner_id']
    if not isinstance(dog_id, str) or not dog_id.strip() or not isinstance(owner_id, str) or not owner_id.strip():
        raise ValueError('INVALID_ID')
    start = _timestamp(session['started_at'])
    end = _timestamp(session['ended_at'])
    if end <= start:
        raise ValueError('INVALID_WINDOW')
    samples = session['samples']
    if not isinstance(samples, list) or not 2 <= len(samples) <= 300:
        raise ValueError('INVALID_SAMPLES')
    fixes = []
    previous = None
    for sample in samples:
        if not isinstance(sample, dict):
            raise ValueError('INVALID_SAMPLE')
        stamp = _timestamp(sample['measured_at'])
        latitude = _location(sample['latitude'])
        longitude = _location(sample['longitude'])
        if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
            raise ValueError('INVALID_COORDINATE')
        if not (start <= stamp <= end) or (previous is not None and stamp <= previous):
            raise ValueError('INVALID_SEQUENCE')
        previous = stamp
        fixes.append((stamp, latitude, longitude))
    return owner_id, dog_id, start, end, fixes


def _shape(fixes):
    anchors = []
    for step in range(7):
        position = step * (len(fixes) - 1) / 6
        left = floor(position)
        right = min(left + 1, len(fixes) - 1)
        weight = position - left
        latitude = fixes[left][1] * (1 - weight) + fixes[right][1] * weight
        longitude = fixes[left][2] * (1 - weight) + fixes[right][2] * weight
        anchors.append((round(latitude, 4), round(longitude, 4)))
    return tuple(anchors)


def assess_fair_play(candidate, previous_sessions):
    try:
        current = _read(candidate)
        if not isinstance(previous_sessions, (tuple, list)) or len(previous_sessions) > 1000:
            raise ValueError('INVALID_HISTORY')
        previous = [_read(item) for item in previous_sessions]
    except (ValueError, TypeError, KeyError, OverflowError):
        return FairPlayResult('REJECT', ('INVALID_INPUT',), 0)

    reasons = []
    for item in previous:
        if item[0] != current[0] or item[1] != current[1]:
            continue
        overlap = max(0.0, (min(current[3], item[3]) - max(current[2], item[2])).total_seconds())
        shorter = min((current[3] - current[2]).total_seconds(), (item[3] - item[2]).total_seconds())
        if overlap / shorter >= 0.5:
            reasons.append('OVERLAPPING_SESSION')
        same_shape = _shape(current[4]) == _shape(item[4])
        if same_shape:
            reasons.append('REPEATED_TRACE_REVIEW')
    unique = tuple(dict.fromkeys(reasons))
    return FairPlayResult('REVIEW_REQUIRED' if unique else 'CANDIDATE_ONLY', unique, len(previous))
