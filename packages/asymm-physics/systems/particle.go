// Package systems - Particle System
// High-performance particle physics for 50,000+ particles @ 60 FPS

package systems

import (
	"github.com/asymmetrica/asymm-physics/core"
	"github.com/asymmetrica/asymm-physics/integrators"
)

// Particle represents a single particle
type Particle struct {
	State integrators.VerletState
	Mass  float64
	Color string
	Trail []core.Vec2
}

// NewParticle creates a new particle
func NewParticle(x, y, mass float64) Particle {
	return Particle{
		State: integrators.NewVerletState(x, y),
		Mass:  mass,
		Color: "#06B6D4", // Cyan default
		Trail: make([]core.Vec2, 0, 10),
	}
}

// Update updates particle physics
func (p *Particle) Update(dt float64) {
	p.State.Integrate(dt)
}

// ApplyForce applies force to particle
func (p *Particle) ApplyForce(force core.Vec2) {
	p.State.ApplyForce(force, p.Mass)
}
