// Package integrators - Verlet Integration
// Position-based physics (more stable than Euler)
// Performance: ~20ns per particle update

package integrators

import "github.com/asymmetrica/asymm-physics/core"

// VerletState represents particle using Verlet integration
type VerletState struct {
	Position     core.Vec2 // Current position
	PreviousPos  core.Vec2 // Position at previous timestep
	Acceleration core.Vec2 // Current acceleration (forces/mass)
}

// NewVerletState creates new Verlet state at rest
func NewVerletState(x, y float64) VerletState {
	pos := core.NewVec2(x, y)
	return VerletState{
		Position:     pos,
		PreviousPos:  pos,
		Acceleration: core.Zero2(),
	}
}

// NewVerletStateWithVelocity creates Verlet state with initial velocity
func NewVerletStateWithVelocity(x, y, vx, vy, dt float64) VerletState {
	pos := core.NewVec2(x, y)
	vel := core.NewVec2(vx, vy)
	return VerletState{
		Position:     pos,
		PreviousPos:  pos.Sub(vel.Scale(dt)),
		Acceleration: core.Zero2(),
	}
}

// Integrate performs one Verlet integration step
// Formula: x(t+dt) = 2*x(t) - x(t-dt) + a*dt²
func (v *VerletState) Integrate(dt float64) {
	velocity := v.Position.Sub(v.PreviousPos)
	v.PreviousPos = v.Position
	v.Position = v.Position.Add(velocity).Add(v.Acceleration.Scale(dt * dt))
	v.Acceleration = core.Zero2()
}

// IntegrateWithDamping performs Verlet integration with damping
func (v *VerletState) IntegrateWithDamping(dt, damping float64) {
	velocity := v.Position.Sub(v.PreviousPos).Scale(1.0 - damping)
	v.PreviousPos = v.Position
	v.Position = v.Position.Add(velocity).Add(v.Acceleration.Scale(dt * dt))
	v.Acceleration = core.Zero2()
}

// ApplyForce applies force to particle (F = ma → a = F/m)
func (v *VerletState) ApplyForce(force core.Vec2, mass float64) {
	v.Acceleration = v.Acceleration.Add(force.Scale(1.0 / mass))
}

// Velocity returns current velocity
func (v *VerletState) Velocity(dt float64) core.Vec2 {
	return v.Position.Sub(v.PreviousPos).Scale(1.0 / dt)
}

// ConstrainToBox constrains particle to rectangular boundary
func (v *VerletState) ConstrainToBox(minX, minY, maxX, maxY, restitution float64) {
	// X bounds
	if v.Position.X < minX {
		v.Position.X = minX
		v.PreviousPos.X = v.Position.X + (v.Position.X-v.PreviousPos.X)*restitution
	} else if v.Position.X > maxX {
		v.Position.X = maxX
		v.PreviousPos.X = v.Position.X + (v.Position.X-v.PreviousPos.X)*restitution
	}

	// Y bounds
	if v.Position.Y < minY {
		v.Position.Y = minY
		v.PreviousPos.Y = v.Position.Y + (v.Position.Y-v.PreviousPos.Y)*restitution
	} else if v.Position.Y > maxY {
		v.Position.Y = maxY
		v.PreviousPos.Y = v.Position.Y + (v.Position.Y-v.PreviousPos.Y)*restitution
	}
}
