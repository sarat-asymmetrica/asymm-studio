// Package forces - Force Generators
// Attraction, repulsion, boundaries, flow fields

package forces

import (
	"github.com/asymmetrica/asymm-physics/core"
)

// Attract calculates attraction force (inverse square law)
func Attract(p1, p2 core.Vec2, strength float64) core.Vec2 {
	delta := p2.Sub(p1)
	distSq := delta.LengthSq() + 0.01

	forceMagnitude := strength / distSq
	if forceMagnitude > 1000 {
		forceMagnitude = 1000
	}

	return delta.Normalize().Scale(forceMagnitude)
}

// Repel calculates repulsion force
func Repel(p1, p2 core.Vec2, strength float64) core.Vec2 {
	return Attract(p1, p2, -strength)
}

// BoundaryForce keeps particles in bounds with spring forces
func BoundaryForce(pos core.Vec2, minX, minY, maxX, maxY, softness, strength float64) core.Vec2 {
	force := core.Zero2()

	// Left
	if pos.X < minX+softness {
		force.X = ((minX + softness) - pos.X) * strength
	}
	// Right
	if pos.X > maxX-softness {
		force.X = -(pos.X - (maxX - softness)) * strength
	}
	// Top
	if pos.Y < minY+softness {
		force.Y = ((minY + softness) - pos.Y) * strength
	}
	// Bottom
	if pos.Y > maxY-softness {
		force.Y = -(pos.Y - (maxY - softness)) * strength
	}

	return force
}
