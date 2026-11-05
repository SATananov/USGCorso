import copy
import unittest
from dataclasses import FrozenInstanceError
from datetime import datetime, timedelta, timezone

from route_contract import assess_contract


T0 = datetime(2026, 1, 1, 10, 0, tzinfo=timezone.utc)


def route(*, minutes=0, owner='owner-a', dog='dog-a', offset=0.0, accuracy=8.0):
    started = T0 + timedelta(minutes=minutes)
    return {
        'owner_id': owner,
        'dog_id': dog,
        'started_at': started.isoformat(),
        'ended_at': (started + timedelta(minutes=10)).isoformat(),
        'reported_distance_m': 740,
        'reported_duration_s': 600,
        'samples': [
            {
                'measured_at': (started + timedelta(minutes=i)).isoformat(),
                'latitude': 42.0,
                'longitude': 25.0 + offset + i * 0.0009,
                'accuracy_m': accuracy,
            }
            for i in range(11)
        ],
    }


class ContractTests(unittest.TestCase):
    def test_candidate_no_award(self):
        result = assess_contract(route(), [])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')
        self.assertEqual(result.reasons, ())
        self.assertFalse(result.eligible_for_award)
        self.assertEqual((result.route_decision, result.fair_play_decision), ('CANDIDATE_ONLY', 'CANDIDATE_ONLY'))

    def test_bad_coordinates_reject_before_fair_play(self):
        candidate = route()
        candidate['samples'][2]['latitude'] = 101
        result = assess_contract(candidate, [])
        self.assertEqual((result.decision, result.fair_play_decision), ('REJECT', 'NOT_RUN'))

    def test_invalid_history_reject(self):
        result = assess_contract(route(), 'not a list')
        self.assertEqual(result.decision, 'REJECT')
        self.assertIn('INVALID_HISTORY', result.reasons)

    def test_bounded_history_reject(self):
        result = assess_contract(route(), [route()] * 1001)
        self.assertEqual(result.decision, 'REJECT')
        self.assertIn('INVALID_HISTORY', result.reasons)

    def test_invalid_prior_sample_reject(self):
        previous = route(minutes=60)
        previous['samples'][1]['longitude'] = float('nan')
        result = assess_contract(route(), [previous])
        self.assertEqual(result.decision, 'REJECT')
        self.assertEqual(result.fair_play_decision, 'REJECT')

    def test_route_review_with_clean_fair_play(self):
        candidate = route(accuracy=40)
        result = assess_contract(candidate, [])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('LOW_SIGNAL_QUALITY', result.reasons)

    def test_fair_play_overlap(self):
        result = assess_contract(route(), [route(minutes=5, offset=1)])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('OVERLAPPING_SESSION', result.reasons)

    def test_repeated_trace_review(self):
        result = assess_contract(route(), [route(minutes=60)])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('REPEATED_TRACE_REVIEW', result.reasons)

    def test_combined_reasons(self):
        result = assess_contract(route(accuracy=40), [route(minutes=5)])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('LOW_SIGNAL_QUALITY', result.reasons)
        self.assertIn('OVERLAPPING_SESSION', result.reasons)
        self.assertIn('REPEATED_TRACE_REVIEW', result.reasons)
        self.assertEqual(len(result.reasons), len(set(result.reasons)))

    def test_other_owner_not_compared_as_overlap(self):
        result = assess_contract(route(), [route(owner='owner-b', offset=1)])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')

    def test_other_dog_not_compared_as_overlap(self):
        result = assess_contract(route(), [route(dog='dog-b', offset=1)])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')

    def test_absent_field_rejects(self):
        candidate = route()
        del candidate['owner_id']
        self.assertEqual(assess_contract(candidate, []).decision, 'REJECT')

    def test_inputs_unchanged(self):
        candidate, history = route(), [route(minutes=60)]
        before = copy.deepcopy((candidate, history))
        assess_contract(candidate, history)
        self.assertEqual((candidate, history), before)

    def test_deterministic_results(self):
        candidate, history = route(), [route(minutes=5)]
        self.assertEqual(assess_contract(candidate, history), assess_contract(candidate, history))

    def test_result_immutable(self):
        result = assess_contract(route(), [])
        with self.assertRaises(FrozenInstanceError):
            result.decision = 'VERIFIED'

    def test_non_dict_candidate_rejects(self):
        self.assertEqual(assess_contract([], []).decision, 'REJECT')

    def test_no_verification_for_any_case(self):
        candidates = [route(), route(accuracy=40)]
        for candidate in candidates:
            result = assess_contract(candidate, [route(minutes=5)])
            self.assertFalse(result.eligible_for_award)
            self.assertNotEqual(result.decision, 'VERIFIED')


if __name__ == '__main__':
    unittest.main()
