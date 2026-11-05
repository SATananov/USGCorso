import copy
import unittest
from datetime import datetime, timedelta, timezone

from route_contract import assess_contract
from route_verifier import assess_route


START = datetime(2026, 1, 1, 10, tzinfo=timezone.utc)


def example():
    return {
        'owner_id': 'owner-a',
        'dog_id': 'dog-a',
        'started_at': START.isoformat(),
        'ended_at': (START + timedelta(minutes=10)).isoformat(),
        'reported_distance_m': 740,
        'reported_duration_s': 600,
        'samples': [
            {
                'measured_at': (START + timedelta(minutes=i)).isoformat(),
                'latitude': 42.0,
                'longitude': 25.0 + 0.0009 * i,
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


class AuditFix03NumericTests(unittest.TestCase):
    def test_baseline_candidate_only(self):
        self.assertEqual(verify(example()).decision, 'CANDIDATE_ONLY')

    def test_nonfinite_distance_rejected(self):
        for value in (float('nan'), float('inf'), -float('inf')):
            with self.subTest(value=str(value)):
                item = example()
                item['reported_distance_m'] = value
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_nonfinite_duration_rejected(self):
        for value in (float('nan'), float('inf'), -float('inf')):
            with self.subTest(value=str(value)):
                item = example()
                item['reported_duration_s'] = value
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_nonfinite_coordinates_rejected(self):
        for key in ('latitude', 'longitude'):
            for value in (float('nan'), float('inf'), -float('inf')):
                with self.subTest(key=key, value=str(value)):
                    item = example()
                    item['samples'][4][key] = value
                    self.assertEqual(verify(item).decision, 'REJECT')

    def test_nonfinite_accuracy_rejected(self):
        for value in (float('nan'), float('inf'), -float('inf')):
            with self.subTest(value=str(value)):
                item = example()
                item['samples'][4]['accuracy_m'] = value
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_boolean_numeric_fields_rejected(self):
        for key in ('reported_distance_m', 'reported_duration_s'):
            with self.subTest(key=key):
                item = example()
                item[key] = True
                self.assertEqual(verify(item).decision, 'REJECT')
        for key in ('latitude', 'longitude', 'accuracy_m'):
            with self.subTest(key=key):
                item = example()
                item['samples'][4][key] = False
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_huge_integer_fields_rejected_without_exception(self):
        large = 10 ** 400
        for key in ('reported_distance_m', 'reported_duration_s'):
            with self.subTest(key=key):
                item = example()
                item[key] = large
                self.assertEqual(verify(item).decision, 'REJECT')
        for key in ('latitude', 'longitude', 'accuracy_m'):
            with self.subTest(key=key):
                item = example()
                item['samples'][4][key] = large
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_numeric_strings_rejected(self):
        item = example()
        item['samples'][3]['latitude'] = '42.0'
        self.assertEqual(verify(item).decision, 'REJECT')
        item = example()
        item['reported_distance_m'] = '740'
        self.assertEqual(verify(item).decision, 'REJECT')

    def test_complex_values_rejected(self):
        item = example()
        item['samples'][3]['longitude'] = 25 + 0j
        self.assertEqual(verify(item).decision, 'REJECT')

    def test_outside_numeric_limits_rejected(self):
        cases = (
            ('reported_distance_m', 99.99),
            ('reported_distance_m', 15000.01),
            ('reported_duration_s', 299.99),
            ('reported_duration_s', 7200.01),
        )
        for key, value in cases:
            with self.subTest(key=key, value=value):
                item = example()
                item[key] = value
                self.assertEqual(verify(item).decision, 'REJECT')

    def test_distance_bounds_allowed_for_review(self):
        for value in (100, 15000):
            with self.subTest(value=value):
                item = example()
                item['reported_distance_m'] = value
                self.assertEqual(verify(item).decision, 'REVIEW_REQUIRED')
                self.assertIn('DISTANCE_MISMATCH', verify(item).reasons)

    def test_duration_lower_bound_accepted(self):
        item = example()
        item['ended_at'] = (START + timedelta(seconds=300)).isoformat()
        item['reported_duration_s'] = 300
        for index, sample in enumerate(item['samples']):
            sample['measured_at'] = (START + timedelta(seconds=index * 30)).isoformat()
        self.assertNotEqual(verify(item).decision, 'REJECT')

    def test_duration_upper_bound_accepted_for_review(self):
        item = example()
        item['ended_at'] = (START + timedelta(seconds=7200)).isoformat()
        item['reported_duration_s'] = 7200
        for index, sample in enumerate(item['samples']):
            sample['measured_at'] = (START + timedelta(seconds=index * 720)).isoformat()
        result = verify(item)
        self.assertEqual(result.decision, 'REVIEW_REQUIRED')
        self.assertIn('GPS_SIGNAL_GAP', result.reasons)

    def test_coordinate_bounds_are_numbers_not_structural_errors(self):
        for key, value in (('latitude', -90.0), ('latitude', 90.0),
                           ('longitude', -180.0), ('longitude', 180.0)):
            with self.subTest(key=key, value=value):
                item = example()
                item['samples'][4][key] = value
                result = verify(item)
                self.assertNotEqual(result.decision, 'REJECT')
                self.assertEqual(result.decision, 'REVIEW_REQUIRED')

    def test_accuracy_bounds_are_valid(self):
        for value in (0.0, 100.0):
            with self.subTest(value=value):
                item = example()
                item['samples'][4]['accuracy_m'] = value
                self.assertNotEqual(verify(item).decision, 'REJECT')

    def test_numeric_failures_never_award_and_do_not_mutate(self):
        for value in (float('inf'), 10 ** 400, True):
            with self.subTest(value=str(value)[:40]):
                item = example()
                item['reported_distance_m'] = value
                before = copy.deepcopy(item)
                result = assess_contract(item, [])
                self.assertEqual(result.decision, 'REJECT')
                self.assertFalse(result.eligible_for_award)
                self.assertEqual(item, before)


if __name__ == '__main__':
    unittest.main()
