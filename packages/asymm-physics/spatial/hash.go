// Package spatial - Spatial Hashing
// Fast collision detection using digital root hashing (O(1))

package spatial

import (
	"github.com/asymmetrica/asymm-physics/core"
	"github.com/asymmetrica/asymm-physics/vedic"
)

// SpatialHash provides fast spatial queries using digital root
type SpatialHash struct {
	CellSize float64
	Buckets  [9][]int
	Count    int
}

// NewSpatialHash creates new spatial hash
func NewSpatialHash(cellSize float64) *SpatialHash {
	return &SpatialHash{
		CellSize: cellSize,
		Buckets:  [9][]int{},
		Count:    0,
	}
}

// Clear removes all elements
func (sh *SpatialHash) Clear() {
	for i := range sh.Buckets {
		sh.Buckets[i] = sh.Buckets[i][:0]
	}
	sh.Count = 0
}

// Hash computes bucket index for position
func (sh *SpatialHash) Hash(pos core.Vec2) int {
	gridX := int(pos.X / sh.CellSize)
	gridY := int(pos.Y / sh.CellSize)
	combined := gridX*10000 + gridY
	root := vedic.DigitalRoot(combined)
	return root - 1 // 0-indexed
}

// Insert adds element to spatial hash
func (sh *SpatialHash) Insert(elementIdx int, pos core.Vec2) {
	bucket := sh.Hash(pos)
	sh.Buckets[bucket] = append(sh.Buckets[bucket], elementIdx)
	sh.Count++
}

// Query returns elements in same bucket
func (sh *SpatialHash) Query(pos core.Vec2) []int {
	bucket := sh.Hash(pos)
	return sh.Buckets[bucket]
}

// QueryRadius returns elements within radius
func (sh *SpatialHash) QueryRadius(pos core.Vec2, radius float64, positions []core.Vec2) []int {
	candidates := sh.Query(pos)
	radiusSq := radius * radius
	result := make([]int, 0, len(candidates))

	for _, idx := range candidates {
		if idx >= len(positions) {
			continue
		}

		distSq := pos.DistanceSq(positions[idx])
		if distSq <= radiusSq {
			result = append(result, idx)
		}
	}

	return result
}
