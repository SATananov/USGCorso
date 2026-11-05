import copy
import unittest
from datetime import datetime, timedelta, timezone

from route_verifier import assess_route


T0 = datetime(2026, 1, 1, 10, 0, tzinfo=timezone.utc)


def example():
    samples = []
    for index in range(11):
        samples.append({
            'measured_at': (T0 + timedelta(seconds=60 * index)).isoformat(),
            'latitude': 42.0,
            'longitude': 25.0 + index * 0.0009,
            'accuracy_m': 8.0,
        })
    return (T0.isoformat(), (T0 + timedelta(minutes=10)).isoformat(), 740, 600, samples)


class VerifyRouteTests(unittest.TestCase):
    def test_good_is_candidate_not_verified(self):
        result = assess_route(*example())
        self.assertEqual(result.decision, 'CANDIDATE_ONLY')
        self.assertEqual(result.reasons, ())

    def test_few_points_needs_review(self):
        a, b, d, t, s = example()
        self.assertIn('TOO_FEW_USABLE_SAMPLES', assess_route(a, b, d, t, s[:2]).reasons)

    def test_repeated_timestamp_rejected(self):
        a, b, d, t, s = example()
        s[2]['measured_at'] = s[1]['measured_at']
        self.assertEqual(assess_route(a, b, d, t, s).decision, 'REJECT')

    def test_reversed_timestamp_rejected(self):
        a, b, d, t, s = example()
        s.reverse()
        self.assertIn('INVALID_SEQUENCE', assess_route(a, b, d, t, s).reasons)

    def test_implausible_jump(self):
        a, b, d, t, s = example()
        s[5]['longitude'] += 0.1
        self.assertIn('IMPOSSIBLE_SPEED', assess_route(a, b, d, t, s).reasons)

    def test_distance_mismatch(self):
        a, b, d, t, s = example()
        self.assertIn('DISTANCE_MISMATCH', assess_route(a, b, 3000, t, s).reasons)

    def test_stationary_trace(self):
        a, b, d, t, s = example()
        for point in s:
            point['longitude'] = 25.0
        result = assess_route(a, b, d, t, s)
        self.assertIn('INSUFFICIENT_MOVEMENT', result.reasons)

    def test_low_accuracy(self):
        a, b, d, t, s = example()
        for point in s:
            point['accuracy_m'] = 40
        self.assertIn('LOW_SIGNAL_QUALITY', assess_route(a, b, d, t, s).reasons)

    def test_out_of_range_coordinate(self):
        a, b, d, t, s = example()
        s[3]['latitude'] = 101
        self.assertEqual(assess_route(a, b, d, t, s).decision, 'REJECT')

    def test_nan_rejected(self):
        a, b, d, t, s = example()
        s[0]['longitude'] = float('nan')
        self.assertEqual(assess_route(a, b, d, t, s).decision, 'REJECT')

    def test_not_enough_coverage(self):
        a, b, d, t, s = example()
        s = s[3:7]
        self.assertIn('INSUFFICIENT_COVERAGE', assess_route(a, b, d, t, s).reasons)

    def test_input_not_mutated(self):
        args = example()
        previous = copy.deepcopy(args)
        assess_route(*args)
        self.assertEqual(args, previous)

    def test_missing_field(self):
        a, b, d, t, s = example()
        del s[0]['accuracy_m']
        self.assertEqual(assess_route(a, b, d, t, s).decision, 'REJECT')

    def test_bool_distance_rejected(self):
        a, b, d, t, s = example()
        self.assertEqual(assess_route(a, b, True, t, s).decision, 'REJECT')


if __name__ == '__main__':
    unittest.main()
