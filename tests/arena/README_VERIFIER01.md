# USG ARENA 03B4F — VERIFIER 01

Baseline: 2ed54d3d4a3470f900ae22e3604fd58c5d66a347.

This is a local, deterministic, standard-library-only Python analyzer. It does not read or write Supabase, request permissions, trigger Android GPS, update awards, or publish rankings. All fixture coordinates are synthetic. Never treat `CANDIDATE_ONLY` as `verified` or grant points based on this output.

Run from the USGCorso root:

```powershell
python -m unittest discover -s tests/arena -p test_route_verifier.py -v
```

The verifier takes the reported start/end timestamps, distance (m), duration (s), and a list of ordered measured_at/latitude/longitude/accuracy_m objects. It returns a deterministic immutable `VerificationResult` with `decision`, `reasons`, `usable_samples`, derived distance, duration covered, and maximum segment speed.

Outcomes: `REJECT` for malformed or structurally invalid inputs; `REVIEW_REQUIRED` for weak or implausible signals; `CANDIDATE_ONLY` for plausible input. Neither last outcome proves a real dog walk.

Provisional thresholds: 10 usable samples with accuracy <=50m, >=70% time coverage, median accuracy <=25m, segment speed <=8m/s, claimed vs geometric distance discrepancy no more than max(150m, 20% of reported distance), and >=50m geometric movement. These need calibration on consented real-world samples before being used for production decisions.

Current limitations: no hardware attestation or spoofing detection, no multi-session replay detection, no account authentication, no duplicate route fingerprint, no review audit, no server-side award issuer. Haversine distance is not map matching and noisy samples may trigger false positives. 2–9 structurally valid points are flagged, not automatically approved. This test suite is not evidence of production security.

Git: no commit/push until Android-independent local test PASS and user approval. Prior tests/arena/concurrency01.py remains unchanged and unexecuted.
