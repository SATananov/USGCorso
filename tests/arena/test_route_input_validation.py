import copy
import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from route_contract import assess_contract, MAX_HISTORY_SAMPLES


T0 = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)


def fixture(*, shift=0, owner='owner-a', dog='dog-a', offset=0.0, accuracy=8.0):
    start = T0 + timedelta(minutes=shift)
    return {
        'owner_id': owner,
        'dog_id': dog,
        'started_at': start.isoformat(),
        'ended_at': (start + timedelta(minutes=10)).isoformat(),
        'reported_distance_m': 740,
        'reported_duration_s': 600,
        'samples': [
            {
                'measured_at': (start + timedelta(minutes=i)).isoformat(),
                'latitude': 42.0,
                'longitude': 25.0 + offset + i * 0.0009,
                'accuracy_m': accuracy,
            }
            for i in range(11)
        ],
    }


class AuditFix01Tests(unittest.TestCase):
    def test_corrupt_history_review_not_reject(self):
        broken = fixture(shift=60)
        broken['samples'][1]['longitude'] = float('nan')
        result = assess_contract(fixture(), [broken])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_CORRUPTED', result.reasons)
        self.assertFalse(result.eligible_for_award)

    def test_corrupt_other_owner_review(self):
        broken = fixture(owner='owner-b')
        broken['samples'][0]['measured_at'] = 'not-a-date'
        result = assess_contract(fixture(), [broken])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_CORRUPTED', result.reasons)

    def test_corrupt_history_preserves_overlap_reason(self):
        broken = fixture(shift=60)
        broken['samples'][0]['latitude'] = 100.0
        result = assess_contract(fixture(), [fixture(shift=5, offset=1), broken])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('OVERLAPPING_SESSION', result.reasons)
        self.assertIn('HISTORY_CORRUPTED', result.reasons)

    def test_bad_new_route_still_rejected(self):
        candidate = fixture()
        candidate['samples'][2]['latitude'] = 100.0
        result = assess_contract(candidate, [fixture()])
        self.assertEqual(result.decision, 'REJECT')
        self.assertEqual(result.fair_play_decision, 'NOT_RUN')

    def test_history_count_limit_review(self):
        result = assess_contract(fixture(), [fixture()] * 1001)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)

    def test_history_sample_budget_review(self):
        sample = fixture()
        result = assess_contract(fixture(), [sample] * (MAX_HISTORY_SAMPLES // 11 + 1))
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)

    def test_invalid_history_type_review(self):
        result = assess_contract(fixture(), 'not history')
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertFalse(result.eligible_for_award)

    def test_route_internal_error_review(self):
        with patch('route_contract.assess_route', side_effect=RuntimeError('private')):
            result = assess_contract(fixture(), [])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertEqual(result.reasons, ('INTERNAL_REVIEW_FAILURE',))
        self.assertFalse(result.eligible_for_award)

    def test_fair_play_internal_error_review(self):
        with patch('route_contract.assess_fair_play', side_effect=RuntimeError('private')):
            result = assess_contract(fixture(), [])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertEqual(result.reasons, ('INTERNAL_REVIEW_FAILURE',))

    def test_valid_clean_candidate_unchanged(self):
        result = assess_contract(fixture(), [])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')
        self.assertEqual(result.reasons, ())
        self.assertFalse(result.eligible_for_award)

    def test_inputs_unchanged(self):
        old = fixture(shift=60)
        old['samples'][2]['longitude'] = float('nan')
        candidate = fixture()
        original = copy.deepcopy((candidate, [old]))
        assess_contract(candidate, [old])
        self.assertEqual((candidate, [old]), original)

    def test_malformed_history_never_awards(self):
        cases = [None, 99, [], [None], [fixture()] * 1001]
        for history in cases:
            self.assertFalse(assess_contract(fixture(), history).eligible_for_award)

    def test_multiple_bad_history_records_review(self):
        result = assess_contract(fixture(), [None, {}, fixture(shift=60)])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_CORRUPTED', result.reasons)

    def test_low_accuracy_and_corrupt_history_keep_both_reasons(self):
        result = assess_contract(fixture(accuracy=40), [None])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('LOW_SIGNAL_QUALITY', result.reasons)
        self.assertIn('HISTORY_CORRUPTED', result.reasons)


if __name__ == '__main__':
    unittest.main()
