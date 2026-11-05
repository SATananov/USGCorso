import copy
import unittest
from datetime import datetime, timedelta, timezone

from route_fair_play import assess_fair_play


T0 = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)


def route(*, shift=0, owner='owner-a', dog='dog-a', longitude_shift=0, n=11):
    start = T0 + timedelta(minutes=shift)
    return {
        'owner_id': owner,
        'dog_id': dog,
        'started_at': start.isoformat(),
        'ended_at': (start + timedelta(minutes=10)).isoformat(),
        'samples': [
            {
                'measured_at': (start + timedelta(minutes=i * 10 / (n - 1))).isoformat(),
                'latitude': 42.0,
                'longitude': 25.0 + longitude_shift + (i / (n - 1)) * 10 * 0.0009,
            }
            for i in range(n)
        ],
    }


class FairPlayTests(unittest.TestCase):
    def test_empty_history_candidate(self):
        self.assertEqual(assess_fair_play(route(), []).decision, 'CANDIDATE_ONLY')

    def test_half_overlap_review(self):
        result = assess_fair_play(route(), [route(shift=5, longitude_shift=1)])
        self.assertIn('OVERLAPPING_SESSION', result.reasons)

    def test_short_overlap_not_flagged(self):
        result = assess_fair_play(route(), [route(shift=9, longitude_shift=1)])
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')

    def test_touching_windows_not_overlap(self):
        self.assertEqual(assess_fair_play(route(), [route(shift=10, longitude_shift=1)]).decision, 'CANDIDATE_ONLY')

    def test_other_dog_ignored(self):
        self.assertEqual(assess_fair_play(route(), [route(dog='dog-b')]).decision, 'CANDIDATE_ONLY')

    def test_other_owner_ignored(self):
        self.assertEqual(assess_fair_play(route(), [route(owner='owner-b')]).decision, 'CANDIDATE_ONLY')

    def test_identical_geometry_different_time_review(self):
        result = assess_fair_play(route(), [route(shift=60)])
        self.assertIn('REPEATED_TRACE_REVIEW', result.reasons)
        self.assertNotIn('OVERLAPPING_SESSION', result.reasons)

    def test_changed_trace_not_replay(self):
        self.assertEqual(assess_fair_play(route(), [route(shift=60, longitude_shift=1)]).decision, 'CANDIDATE_ONLY')

    def test_repeated_geometry_review_only(self):
        self.assertEqual(assess_fair_play(route(), [route(shift=60)]).decision, 'REVIEW_REQUIRED')

    def test_both_flags_deduplicated(self):
        result = assess_fair_play(route(), [route(), route()])
        self.assertEqual(result.reasons, ('OVERLAPPING_SESSION', 'REPEATED_TRACE_REVIEW'))

    def test_bad_input_rejected(self):
        bad = route()
        bad['samples'][0]['longitude'] = float('nan')
        self.assertEqual(assess_fair_play(bad, []).decision, 'REJECT')

    def test_nonmonotonic_history_rejected(self):
        old = route()
        old['samples'][1]['measured_at'] = old['samples'][0]['measured_at']
        self.assertEqual(assess_fair_play(route(), [old]).decision, 'REJECT')

    def test_limit_history(self):
        self.assertEqual(assess_fair_play(route(), [route()] * 1001).decision, 'REJECT')

    def test_input_unchanged(self):
        current, history = route(), [route(shift=60)]
        before = copy.deepcopy((current, history))
        assess_fair_play(current, history)
        self.assertEqual((current, history), before)

    def test_naive_timestamp_rejected(self):
        current = route()
        current['started_at'] = '2026-01-01T10:00:00'
        self.assertEqual(assess_fair_play(current, []).decision, 'REJECT')

    def test_same_shape_mismatched_sample_count_review(self):
        current = route(n=11)
        old = route(shift=60, n=21)
        self.assertIn('REPEATED_TRACE_REVIEW', assess_fair_play(current, [old]).reasons)


if __name__ == '__main__':
    unittest.main()
