// Package vedic - Harmonic Mathematics
// Harmonic mean for quality scores

package vedic

// HarmonicMean calculates harmonic mean of values
// H = n / (1/x₁ + 1/x₂ + ... + 1/xₙ)
func HarmonicMean(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}

	sum := 0.0
	for _, v := range values {
		if v != 0 {
			sum += 1.0 / v
		}
	}

	if sum == 0 {
		return 0
	}

	return float64(len(values)) / sum
}
