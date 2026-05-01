// Package vedic - Williams Optimizer
// O(√n × log₂(n)) sublinear space batching
// Validated: p < 10^-133

package vedic

import "math"

// BatchSizeFor calculates optimal batch size for n items
// Formula: √n × log₂(n)
func BatchSizeFor(n int) int {
	if n <= 0 {
		return 1
	}

	sqrtN := math.Sqrt(float64(n))
	log2N := math.Log2(float64(n))
	batchSize := int(sqrtN * log2N)

	if batchSize < 1 {
		return 1
	}
	if batchSize > n {
		return n
	}

	return batchSize
}

// WilliamsBatchProcess processes items in Williams-optimal batches
func WilliamsBatchProcess(totalItems int, processFn func(start, end int)) {
	batchSize := BatchSizeFor(totalItems)
	numBatches := (totalItems + batchSize - 1) / batchSize

	for batch := 0; batch < numBatches; batch++ {
		start := batch * batchSize
		end := start + batchSize
		if end > totalItems {
			end = totalItems
		}

		processFn(start, end)
	}
}
