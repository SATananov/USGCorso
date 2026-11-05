from dataclasses import dataclass

from route_verifier import assess_route
from route_fair_play import assess_fair_play


@dataclass(frozen=True)
class ContractResult:
    decision: str
    reasons: tuple[str, ...]
    route_decision: str
    fair_play_decision: str
    usable_samples: int
    calculated_distance_m: int
    compared_sessions: int
    eligible_for_award: bool = False


def assess_contract(candidate, previous_sessions):
    invalid = ContractResult('REJECT', ('INVALID_INPUT',), 'REJECT', 'NOT_RUN', 0, 0, 0)
    if not isinstance(candidate, dict):
        return invalid
    try:
        start = candidate['started_at']
        end = candidate['ended_at']
        distance = candidate['reported_distance_m']
        duration = candidate['reported_duration_s']
        samples = candidate['samples']
        owner_id = candidate['owner_id']
        dog_id = candidate['dog_id']
        if not isinstance(owner_id, str) or not owner_id.strip():
            return invalid
        if not isinstance(dog_id, str) or not dog_id.strip():
            return invalid
    except (KeyError, TypeError):
        return invalid
    route = assess_route(start, end, distance, duration, samples)
    if route.decision not in ('REJECT', 'REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
        return invalid
    if route.decision == 'REJECT':
        return ContractResult('REJECT', route.reasons, 'REJECT', 'NOT_RUN', route.usable_samples, route.calculated_distance_m, 0)
    if not isinstance(previous_sessions, (list, tuple)) or len(previous_sessions) > 1000:
        return ContractResult('REJECT', ('INVALID_HISTORY',), route.decision, 'REJECT', route.usable_samples, route.calculated_distance_m, 0)
    fair = assess_fair_play(candidate, previous_sessions)
    if fair.decision not in ('REJECT', 'REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
        return invalid
    reasons = tuple(dict.fromkeys(route.reasons + fair.reasons))
    if fair.decision == 'REJECT':
        decision = 'REJECT'
    elif route.decision == 'REVIEW_REQUIRED' or fair.decision == 'REVIEW_REQUIRED':
        decision = 'REVIEW_REQUIRED'
    else:
        decision = 'CANDIDATE_ONLY'
    return ContractResult(decision, reasons, route.decision, fair.decision, route.usable_samples, route.calculated_distance_m, fair.compared_sessions)
