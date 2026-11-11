import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from route_contract import MAX_HISTORY_BYTES, MAX_HISTORY_SESSIONS, assess_contract
from route_verifier import assess_route


START = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)


def session(*, points=11, shift=0, owner='owner-a', dog='dog-a'):
    start = START + timedelta(minutes=shift)
    samples = [
        {
            'measured_at': (start + timedelta(seconds=600 * i / max(1, points - 1))).isoformat(),
            'latitude': 42.0,
            'longitude': 25.0 + 0.0081 * i / max(1, points - 1),
            'accuracy_m': 8.0,
        }
        for i in range(points)
    ]
    return {
        'owner_id': owner,
        'dog_id': dog,
        'started_at': start.isoformat(),
        'ended_at': (start + timedelta(seconds=600)).isoformat(),
        'reported_distance_m': 740,
        'reported_duration_s': 600,
        'samples': samples,
    }


def verify(item):
    return assess_route(
        item['started_at'], item['ended_at'],
        item['reported_distance_m'], item['reported_duration_s'], item['samples']
    )


class AuditFix03LoadTests(unittest.TestCase):
    def test_maximum_candidate_samples_are_accepted_for_assessment(self):
        result = verify(session(points=300))
        self.assertEqual(result.usable_samples, 300)
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')

    def test_over_maximum_candidate_samples_rejected(self):
        self.assertEqual(verify(session(points=301)).decision, 'REJECT')

    def test_below_minimum_candidate_samples_rejected(self):
        self.assertEqual(verify(session(points=1)).decision, 'REJECT')

    def test_maximum_route_never_awards(self):
        result = assess_contract(session(points=300), [])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')
        self.assertFalse(result.eligible_for_award)

    def test_history_count_over_limit_short_circuits_fair_play(self):
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(session(), [{}] * (MAX_HISTORY_SESSIONS + 1))
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)
        fair.assert_not_called()

    def test_history_count_equal_limit_is_not_count_rejected(self):
        history = [{}] * MAX_HISTORY_SESSIONS
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(session(), history)
        fair.assert_called()
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('INTERNAL_REVIEW_FAILURE', result.reasons)

    def test_estimated_history_budget_short_circuits_fair_play(self):
        history = [session(shift=60)] * 200
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(session(), history)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)
        fair.assert_not_called()

    def test_large_history_sample_count_short_circuits_fair_play(self):
        history = [session(points=300, shift=60)] * 25
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(session(), history)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)
        fair.assert_not_called()

    def test_invalid_candidate_short_circuits_history_work(self):
        item = session()
        item['samples'][0]['latitude'] = 91
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(item, [session()] * 1001)
        self.assertEqual(result.decision, 'REJECT')
        fair.assert_not_called()

    def test_oversized_history_field_short_circuits_fair_play(self):
        old = session(shift=60)
        old['unrecognized'] = 'a' * (MAX_HISTORY_BYTES + 1)
        with patch('route_contract.assess_fair_play') as fair:
            result = assess_contract(session(), [old])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)
        fair.assert_not_called()

    def test_valid_small_history_still_uses_fair_play(self):
        with patch('route_contract.assess_fair_play', wraps=None) as fair:
            from route_fair_play import FairPlayResult
            fair.return_value = FairPlayResult('CANDIDATE_ONLY', (), 1)
            result = assess_contract(session(), [session(shift=60, owner='other')])
        self.assertEqual(fair.call_count, 1)
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')
        self.assertFalse(result.eligible_for_award)

    def test_load_results_are_deterministic(self):
        item = session(points=300)
        history = [session(shift=60)] * 200
        first = assess_contract(item, history)
        second = assess_contract(item, history)
        self.assertEqual(first, second)
        self.assertFalse(first.eligible_for_award)


if __name__ == '__main__':
    unittest.main()
