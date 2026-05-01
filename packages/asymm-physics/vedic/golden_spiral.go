// Package vedic - Golden Spiral (Phyllotaxis)
// Natural sunflower seed distribution pattern

package vedic

import (
	"math"

	"github.com/asymmetrica/asymm-physics/core"
)

const GoldenAngle = 2.39996322972865 // 137.508° in radians

// GoldenSpiral2D calculates position in a 2D golden spiral
// Used for natural particle spawning (sunflower pattern)
func GoldenSpiral2D(index int, center core.Vec2, spacing float64) core.Vec2 {
	if index < 0 {
		index = 0
	}

	angle := float64(index) * GoldenAngle
	radius := core.Phi * math.Sqrt(float64(index)) * spacing

	return core.NewVec2(
		center.X+radius*math.Cos(angle),
		center.Y+radius*math.Sin(angle),
	)
}

// SpawnPhyllotaxis creates particles in sunflower spiral pattern
func SpawnPhyllotaxis(count int, center core.Vec2, spacing float64) []core.Vec2 {
	positions := make([]core.Vec2, count)
	for i := 0; i < count; i++ {
		positions[i] = GoldenSpiral2D(i, center, spacing)
	}
	return positions
}
