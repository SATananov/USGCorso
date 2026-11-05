from dataclasses import dataclass

from route_verifier import assess_route
from route_fair_play import assess_fair_play


MAX_HISTORY_SESSIONS = 1000
MAX_HISTORY_SAMPLES = 6000


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


def _review(reason, route_decision, usable_samples, calculated_distance_m, compared_sessions=0):
    return ContractResult(
        'REVIEW_REQUIRED', (reason,), route_decision, 'NOT_RUN',
        usable_samples, calculated_distance_m, compared_sessions
    )


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

    try:
        route = assess_route(start, end, distance, duration, samples)
    except Exception:
        return _review('INTERNAL_REVIEW_FAILURE', 'ERROR', 0, 0)

    if route.decision not in ('REJECT', 'REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
        return _review('INTERNAL_REVIEW_FAILURE', 'ERROR', 0, 0)
    if route.decision == 'REJECT':
        return ContractResult('REJECT', route.reasons, 'REJECT', 'NOT_RUN', route.usable_samples, route.calculated_distance_m, 0)

    if not isinstance(previous_sessions, (list, tuple)):
        return _review('INVALID_HISTORY', route.decision, route.usable_samples, route.calculated_distance_m)
    if len(previous_sessions) > MAX_HISTORY_SESSIONS:
        return _review('HISTORY_BUDGET_EXCEEDED', route.decision, route.usable_samples, route.calculated_distance_m)

    try:
        total_samples = 0
        for prior in previous_sessions:
            if not isinstance(prior, dict):
                continue
            prior_samples = prior.get('samples')
            if isinstance(prior_samples, (list, tuple)):
                total_samples += len(prior_samples)
                if total_samples > MAX_HISTORY_SAMPLES:
                    return _review('HISTORY_BUDGET_EXCEEDED', route.decision, route.usable_samples, route.calculated_distance_m)

        fair = assess_fair_play(candidate, previous_sessions)
        if fair.decision not in ('REJECT', 'REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
            return _review('INTERNAL_REVIEW_FAILURE', route.decision, route.usable_samples, route.calculated_distance_m)

        if fair.decision == 'REJECT':
            valid_history = []
            found_corrupt = False
            for prior in previous_sessions:
                isolated = assess_fair_play(candidate, [prior])
                if isolated.decision == 'REJECT':
                    found_corrupt = True
                elif isolated.decision in ('REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
                    valid_history.append(prior)
                else:
                    return _review('INTERNAL_REVIEW_FAILURE', route.decision, route.usable_samples, route.calculated_distance_m)
            if not found_corrupt:
                return _review('INTERNAL_REVIEW_FAILURE', route.decision, route.usable_samples, route.calculated_distance_m)
            fair = assess_fair_play(candidate, valid_history)
            if fair.decision not in ('REVIEW_REQUIRED', 'CANDIDATE_ONLY'):
                return _review('INTERNAL_REVIEW_FAILURE', route.decision, route.usable_samples, route.calculated_distance_m)
            extra_reasons = ('HISTORY_CORRUPTED',)
        else:
            extra_reasons = ()
    except Exception:
        return _review('INTERNAL_REVIEW_FAILURE', route.decision, route.usable_samples, route.calculated_distance_m)

    reasons = tuple(dict.fromkeys(route.reasons + fair.reasons + extra_reasons))
    decision = ('REVIEW_REQUIRED'
                if route.decision == 'REVIEW_REQUIRED' or fair.decision == 'REVIEW_REQUIRED' or extra_reasons
                else 'CANDIDATE_ONLY')
    return ContractResult(
        decision, reasons, route.decision, fair.decision,
        route.usable_samples, route.calculated_distance_m, fair.compared_sessions
    )
