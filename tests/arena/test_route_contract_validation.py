import copy
import unittest
from datetime import datetime, timedelta, timezone

from route_contract import MAX_HISTORY_BYTES, assess_contract
from route_verifier import MAX_FIX_GAP_SECONDS, assess_route


START = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)


def route(*, owner='owner-a', dog='dog-a', shift=0):
    start = START + timedelta(minutes=shift)
    return {
        'owner_id': owner,
        'dog_id': dog,
        'started_at': start.isoformat(),
        'ended_at': (start + timedelta(minutes=10)).isoformat(),
        'reported_distance_m': 740,
        'reported_duration_s': 600,
        'samples': [
            {
                'measured_at': (start + timedelta(seconds=i * 60)).isoformat(),
                'latitude': 42.0,
                'longitude': 25.0 + i * 0.0009,
                'accuracy_m': 8.0,
            }
            for i in range(11)
        ],
    }


def verify(candidate):
    return assess_route(
        candidate['started_at'], candidate['ended_at'],
        candidate['reported_distance_m'], candidate['reported_duration_s'],
        candidate['samples'],
    )


class AuditFix02Tests(unittest.TestCase):
    def test_normal_route_still_candidate(self):
        self.assertEqual(verify(route()).decision, 'CANDIDATE_ONLY')

    def test_gps_gap_review(self):
        candidate = route()
        seconds = [0, 30, 60, 90, 120, 360, 390, 420, 450, 480, 600]
        for sample, second in zip(candidate['samples'], seconds):
            sample['measured_at'] = (START + timedelta(seconds=second)).isoformat()
        result = verify(candidate)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('GPS_SIGNAL_GAP', result.reasons)
        self.assertFalse(assess_contract(candidate, []).eligible_for_award)

    def test_gap_exact_boundary_not_flagged(self):
        candidate = route()
        seconds = [0, 60, 120, 180, 360, 420, 480, 510, 540, 570, 600]
        self.assertEqual(max(b - a for a, b in zip(seconds, seconds[1:])), MAX_FIX_GAP_SECONDS)
        for sample, second in zip(candidate['samples'], seconds):
            sample['measured_at'] = (START + timedelta(seconds=second)).isoformat()
        self.assertNotIn('GPS_SIGNAL_GAP', verify(candidate).reasons)

    def test_gap_only_one_second_above_boundary(self):
        candidate = route()
        seconds = [0, 60, 120, 179, 360, 420, 480, 510, 540, 570, 600]
        for sample, second in zip(candidate['samples'], seconds):
            sample['measured_at'] = (START + timedelta(seconds=second)).isoformat()
        self.assertIn('GPS_SIGNAL_GAP', verify(candidate).reasons)

    def test_broken_timestamp_too_long_rejected(self):
        candidate = route()
        candidate['samples'][0]['measured_at'] = '2' * 10000
        self.assertEqual(verify(candidate).decision, 'REJECT')

    def test_start_timestamp_too_long_rejected(self):
        candidate = route()
        candidate['started_at'] = '2' * 10000
        self.assertEqual(verify(candidate).decision, 'REJECT')

    def test_timestamp_must_have_timezone(self):
        candidate = route()
        candidate['samples'][0]['measured_at'] = '2026-01-01T10:00:00'
        self.assertEqual(verify(candidate).decision, 'REJECT')

    def test_timezone_offset_conversion(self):
        candidate = route()
        candidate['started_at'] = '2026-01-01T12:00:00+02:00'
        candidate['ended_at'] = '2026-01-01T12:10:00+02:00'
        self.assertEqual(verify(candidate).decision, 'CANDIDATE_ONLY')

    def test_repeated_timestamp_still_rejected(self):
        candidate = route()
        candidate['samples'][4]['measured_at'] = candidate['samples'][3]['measured_at']
        self.assertEqual(verify(candidate).decision, 'REJECT')

    def test_history_large_extra_string_is_budget_review(self):
        old = route(shift=60)
        old['payload'] = 'x' * (MAX_HISTORY_BYTES + 1)
        result = assess_contract(route(), [old])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)
        self.assertFalse(result.eligible_for_award)

    def test_history_nested_unknown_field_is_budget_review(self):
        old = route(shift=60)
        old['nested'] = {'noise': ['x' * 1000000]}
        result = assess_contract(route(), [old])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)

    def test_history_extra_sample_data_is_budget_review(self):
        old = route(shift=60)
        old['samples'][0]['payload'] = 'x' * 10000
        self.assertIn('HISTORY_BUDGET_EXCEEDED', assess_contract(route(), [old]).reasons)

    def test_history_many_small_sessions_budget(self):
        old = route(shift=60)
        result = assess_contract(route(), [old] * 300)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_BUDGET_EXCEEDED', result.reasons)

    def test_corrupt_old_still_review(self):
        old = route(shift=60)
        old['samples'][1]['longitude'] = float('nan')
        result = assess_contract(route(), [old])
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('HISTORY_CORRUPTED', result.reasons)

    def test_no_mutation_and_no_awards(self):
        candidate, history = route(), [route(shift=60)]
        before = copy.deepcopy((candidate, history))
        result = assess_contract(candidate, history)
        self.assertEqual((candidate, history), before)
        self.assertFalse(result.eligible_for_award)
        self.assertNotEqual(result.decision, 'VERIFIED')


if __name__ == '__main__':
    unittest.main()
