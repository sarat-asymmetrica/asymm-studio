---
name: five-timbres-quality-validation
description: Holistic quality validation across five harmonically-related dimensions - Correctness, Performance, Reliability, Synergy, Elegance. Use harmonic mean (not arithmetic) to calculate unified quality score that penalizes weakness in any dimension. Apply for production readiness assessment. Target score ≥ 8.0/10 for deployment.
category: testing
version: 1.0.0
created: 2025-11-01
last_used: 2025-10-25
success_rate: 14/14 wave assessments
source_wave: Testing Manifesto (October 2025 Methodology)
---

# Five Timbres Quality Validation

**One-sentence purpose:** Measure production readiness across five dimensions using harmonic mean to ensure no weak dimension compromises overall quality.

**Discovered:** October 2025 Testing Manifesto, applied across all 14 agent waves

---

## Purpose

### What This Skill Does

Validates software quality across five interdependent dimensions (timbres):
1. **Correctness** - Does it work?
2. **Performance** - Is it fast?
3. **Reliability** - Does it work under stress?
4. **Synergy** - Do components harmonize?
5. **Elegance** - Is it maintainable?

Uses **harmonic mean** (not arithmetic) to calculate unified score, ensuring you can't hide poor performance in one dimension.

### Why It Exists

Traditional testing focuses on correctness only ("tests pass = ship it"). But production systems fail from performance bottlenecks, unreliable error handling, poor component integration, and unmaintainable code - even when tests pass.

**Without this skill:**
- Code passes tests but crashes in production (reliability not tested)
- Features work but are too slow for users (performance not measured)
- Components work individually but break together (synergy not validated)

**With this skill:**
- All five dimensions measured objectively
- Harmonic mean penalizes weakness (can't hide 2.0 performance with 10.0 correctness)
- Production readiness gate: ≥ 8.0/10 required for deployment

---

## When to Use

### Triggering Conditions

1. **Pre-production quality gate** - Before deploying to production
2. **Wave completion assessment** - After finishing major development wave
3. **Architecture decision** - Choosing between alternative approaches

### The Pattern

#### Calculate Each Timbre (0.0 - 10.0 scale)

**1. Correctness Timbre:**
```
Test pass rate: X/Y tests passing
Edge cases: Boundary values, nulls, max values handled?
Error states: Graceful error messages, no panics?

Score = (pass_rate × 7) + (edge_cases × 2) + (error_handling × 1)
```

**2. Performance Timbre:**
```
API response time: p50, p95, p99
Target: < 100ms p95
Score = 10 if < 50ms, 8 if < 100ms, 6 if < 200ms, 4 if < 500ms, 2 if < 1s, 0 if ≥ 1s
```

**3. Reliability Timbre:**
```
Load test: 1M iterations, error rate < 0.01%
Score = 10 × (1 - error_rate)  // 0.001% error = 9.99 score
```

**4. Synergy Timbre:**
```
Integration: Do components work together?
Test full workflows (not isolated units)
Score = emergent_benefit / expected_benefit  // > 1.0 = synergy, < 1.0 = friction
```

**5. Elegance Timbre:**
```
Code clarity: Clear variable names, comments where needed
Structure: Logical organization, DRY principle
Mathematical patterns: Constants emerge naturally (φ, π, etc.)
Score = (clarity × 0.4) + (structure × 0.4) + (patterns × 0.2)
```

#### Calculate Harmonic Mean

```rust
fn harmonic_mean(scores: &[f64]) -> f64 {
    let n = scores.len() as f64;
    let sum_reciprocals: f64 = scores.iter()
        .map(|s| if *s > 0.0 { 1.0 / s } else { 0.0 })
        .sum();
    n / sum_reciprocals
}

let quality = harmonic_mean(&[correctness, performance, reliability, synergy, elegance]);
```

#### Interpret Score

```
9.0-10.0: LEGENDARY (ship with confidence)
8.0-9.0:  EXCELLENT (production-ready)
7.0-8.0:  GOOD (acceptable, but improve weak dimensions)
6.0-7.0:  FAIR (not production-ready, refine)
< 6.0:    POOR (restart or redesign)
```

---

## Why It Works

**Harmonic mean vs Arithmetic mean:**
```
Scores: [9, 9, 9, 9, 3]

Arithmetic: (9+9+9+9+3)/5 = 7.8  (HIDES the 3)
Harmonic: 5/(1/9 + 1/9 + 1/9 + 1/9 + 1/3) = 5.14  (EXPOSES the 3)
```

Harmonic mean penalizes outliers - you can't compensate for 3/10 reliability with 10/10 correctness. Users don't care that your tests pass if the app crashes under load.

---

## Evidence

**Source:** Wave 1-4 quality assessments (14 agents)
**Quality:** 9.0-9.8 average (all waves ≥ 8.0 threshold)
**Success Rate:** 14/14 waves met production standards

---

## Example

**Wave 3 Final Database Validation:**
```
Correctness:  2.5 (0/7 tests passing - table naming mismatch)
Performance:  9.0 (queries fast when they work)
Reliability:  8.0 (migration process solid)
Synergy:      7.0 (schema design coherent)
Elegance:     9.0 (clean migration code)

Harmonic Mean = 5 / (1/2.5 + 1/9.0 + 1/8.0 + 1/7.0 + 1/9.0)
              = 5 / (0.40 + 0.11 + 0.125 + 0.14 + 0.11)
              = 5 / 0.885
              = 5.65

Result: BLOCKED (< 8.0 threshold)
Root cause exposed: Correctness failure (2.5) pulls down entire score
Action: Fix table naming, retest
```

After fix:
```
Correctness:  10.0 (7/7 tests passing)
[Other scores same]

Harmonic Mean = 8.5  (PRODUCTION READY)
```

---

## Success Indicators

✅ All five timbres scored objectively (not subjectively)
✅ Harmonic mean calculated (not arithmetic)
✅ Weak dimension identified and addressed
✅ Score ≥ 8.0 before production deployment

❌ Using arithmetic mean (hides weaknesses)
❌ Skipping dimensions (incomplete assessment)
❌ Deploying with score < 8.0 (production risk)

---

**Maintained by:** Dr. Amara Osei
**Last reviewed:** 2025-11-01
