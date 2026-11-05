from dataclasses import dataclass
from datetime import datetime, timezone
from math import asin, cos, isfinite, radians, sin, sqrt
from statistics import median


@dataclass(frozen=True)
class VerificationResult:
    decision: str
    reasons: tuple[str, ...]
    usable_samples: int
    calculated_distance_m: int
    covered_duration_s: int
    max_segment_speed_mps: float


def _instant(value):
    if isinstance(value, datetime):
        moment = value
    elif isinstance(value, str):
        moment = datetime.fromisoformat(value.replace('Z', '+00:00'))
    else:
        raise ValueError('INVALID_TIMESTAMP')
    if moment.tzinfo is None:
        raise ValueError('INVALID_TIMESTAMP')
    return moment.astimezone(timezone.utc)


def _number(value, lower, upper):
    if isinstance(value, bool) or not isinstance(value, (float, int)):
        raise ValueError('INVALID_NUMBER')
    number = float(value)
    if not isfinite(number) or not lower <= number <= upper:
        raise ValueError('INVALID_NUMBER')
    return number


def _distance_m(a, b):
    lat1, lat2 = radians(a[1]), radians(b[1])
    dlat = lat2 - lat1
    dlon = radians(b[2] - a[2])
    h = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371000.0 * 2 * asin(min(1.0, sqrt(h)))


def assess_route(started_at, ended_at, reported_distance_m, reported_duration_s, samples):
    invalid = VerificationResult('REJECT', ('INVALID_INPUT',), 0, 0, 0, 0.0)
    try:
        started = _instant(started_at)
        ended = _instant(ended_at)
        claimed_distance = _number(reported_distance_m, 100, 15000)
        claimed_duration = _number(reported_duration_s, 300, 7200)
        elapsed = (ended - started).total_seconds()
        if not 300 <= elapsed <= 7200 or abs(elapsed - claimed_duration) > 120:
            return invalid
        if not isinstance(samples, list) or not 2 <= len(samples) <= 300:
            return invalid
        points = []
        for sample in samples:
            if not isinstance(sample, dict):
                return invalid
            stamp = _instant(sample['measured_at'])
            lat = _number(sample['latitude'], -90, 90)
            lon = _number(sample['longitude'], -180, 180)
            accuracy = _number(sample['accuracy_m'], 0, 100)
            if not started <= stamp <= ended:
                return invalid
            if points and stamp <= points[-1][0]:
                return VerificationResult('REJECT', ('INVALID_SEQUENCE',), 0, 0, 0, 0.0)
            points.append((stamp, lat, lon, accuracy))
    except (ValueError, TypeError, KeyError, OverflowError):
        return invalid

    usable = [p for p in points if p[3] <= 50]
    reasons = []
    if len(usable) < 10:
        reasons.append('TOO_FEW_USABLE_SAMPLES')
    if len(usable) < 2:
        return VerificationResult('REVIEW_REQUIRED', tuple(reasons + ['LOW_SIGNAL_QUALITY']), len(usable), 0, 0, 0.0)
    covered = int((usable[-1][0] - usable[0][0]).total_seconds())
    if covered < 0.7 * elapsed:
        reasons.append('INSUFFICIENT_COVERAGE')
    if median(p[3] for p in points) > 25:
        reasons.append('LOW_SIGNAL_QUALITY')
    distance = 0.0
    maximum_speed = 0.0
    for a, b in zip(usable, usable[1:]):
        segment_distance = _distance_m(a, b)
        delta = (b[0] - a[0]).total_seconds()
        maximum_speed = max(maximum_speed, segment_distance / delta)
        distance += segment_distance
    if maximum_speed > 8:
        reasons.append('IMPOSSIBLE_SPEED')
    if abs(distance - claimed_distance) > max(150, 0.2 * claimed_distance):
        reasons.append('DISTANCE_MISMATCH')
    if distance < 50:
        reasons.append('INSUFFICIENT_MOVEMENT')
    return VerificationResult(
        'REVIEW_REQUIRED' if reasons else 'CANDIDATE_ONLY',
        tuple(dict.fromkeys(reasons)),
        len(usable),
        round(distance),
        covered,
        round(maximum_speed, 3),
    )
