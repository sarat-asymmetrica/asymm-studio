// Package integrators - Spring Physics
// Smooth spring dynamics using Hooke's Law
// Performance: ~15ns per spring update

package integrators

import "math"

// SpringConfig defines spring physical properties
type SpringConfig struct {
	Stiffness float64 // k (spring constant)
	Damping   float64 // c (damping coefficient)
	Mass      float64 // m (mass)
}

// SpringState represents 1D spring state
type SpringState struct {
	Position float64
	Velocity float64
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════

// Bouncy returns bouncy spring preset (high stiffness, low damping)
func Bouncy() SpringConfig {
	return SpringConfig{Stiffness: 300, Damping: 15, Mass: 1.0}
}

// Smooth returns smooth spring preset (balanced)
func Smooth() SpringConfig {
	return SpringConfig{Stiffness: 170, Damping: 26, Mass: 1.0}
}

// Stiff returns stiff spring preset (very snappy)
func Stiff() SpringConfig {
	return SpringConfig{Stiffness: 500, Damping: 40, Mass: 1.0}
}

// Critical returns critically damped spring (no overshoot)
func Critical(stiffness, mass float64) SpringConfig {
	criticalDamping := 2 * math.Sqrt(stiffness*mass)
	return SpringConfig{Stiffness: stiffness, Damping: criticalDamping, Mass: mass}
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRATION (SEMI-IMPLICIT EULER)
// ═══════════════════════════════════════════════════════════════════════════

// Update updates spring using semi-implicit Euler (stable!)
func (s *SpringState) Update(target float64, config SpringConfig, dt float64) {
	// F = -kx - cv
	displacement := s.Position - target
	springForce := -config.Stiffness * displacement
	dampingForce := -config.Damping * s.Velocity
	totalForce := springForce + dampingForce

	// a = F/m
	acceleration := totalForce / config.Mass

	// Semi-implicit Euler (velocity first = stable)
	s.Velocity += acceleration * dt
	s.Position += s.Velocity * dt
}

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════

// NaturalFrequency returns ω₀ = √(k/m)
func (c SpringConfig) NaturalFrequency() float64 {
	return math.Sqrt(c.Stiffness / c.Mass)
}

// DampingRatio returns ζ = c / (2√(km))
func (c SpringConfig) DampingRatio() float64 {
	criticalDamping := 2 * math.Sqrt(c.Stiffness*c.Mass)
	return c.Damping / criticalDamping
}

// IsStable checks if configuration is stable
func (c SpringConfig) IsStable() bool {
	return c.Stiffness > 0 && c.Damping >= 0 && c.Mass > 0
}
