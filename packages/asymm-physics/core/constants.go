// Package core - Mathematical Constants
// Universal constants from ancient mathematics and modern physics
// Optimized for 60 FPS particle physics and natural animations

package core

import "math"

const (
	// ═══════════════════════════════════════════════════════════════════════
	// FUNDAMENTAL CONSTANTS
	// ═══════════════════════════════════════════════════════════════════════

	Pi  = math.Pi    // 3.14159...
	Tau = 2 * math.Pi // 6.28318... (full circle)
	E   = math.E     // 2.71828... (natural growth)

	// ═══════════════════════════════════════════════════════════════════════
	// GOLDEN RATIO FAMILY (Vedic & Greek)
	// ═══════════════════════════════════════════════════════════════════════

	// Phi - The Golden Ratio (φ = (1 + √5) / 2)
	Phi = 1.618033988749895

	// PhiConjugate - The golden ratio conjugate (1/φ = φ - 1)
	PhiConjugate = 0.618033988749895

	// GoldenAngle - The golden angle in degrees (137.5077640°)
	GoldenAngle = 137.50776405003785

	// GoldenAngleRad - The golden angle in radians
	GoldenAngleRad = 2.39996322972865

	// ═══════════════════════════════════════════════════════════════════════
	// FIBONACCI SEQUENCE (first 20 numbers)
	// ═══════════════════════════════════════════════════════════════════════

	Fib1  = 1
	Fib2  = 1
	Fib3  = 2
	Fib4  = 3
	Fib5  = 5
	Fib6  = 8
	Fib7  = 13
	Fib8  = 21
	Fib9  = 34
	Fib10 = 55
	Fib11 = 89
	Fib12 = 144
	Fib13 = 233
	Fib14 = 377
	Fib15 = 610
	Fib16 = 987
	Fib17 = 1597
	Fib18 = 2584
	Fib19 = 4181
	Fib20 = 6765

	// ═══════════════════════════════════════════════════════════════════════
	// TESLA HARMONICS
	// ═══════════════════════════════════════════════════════════════════════

	// TeslaHarmonic - Natural resonance frequency (Hz)
	TeslaHarmonic = 4.909

	// Tesla's divine numbers
	Tesla3 = 3
	Tesla6 = 6
	Tesla9 = 9

	// ═══════════════════════════════════════════════════════════════════════
	// PERFORMANCE TARGETS
	// ═══════════════════════════════════════════════════════════════════════

	TargetFPS     = 60    // Target frames per second
	MinFPS        = 30    // Minimum acceptable FPS
	FrameBudgetMs = 16.67 // Budget per frame at 60 FPS (ms)

	// ═══════════════════════════════════════════════════════════════════════
	// WILLIAMS OPTIMIZER CRITICAL POINTS
	// Phase transitions in the O(√t × log₂(t)) optimizer
	// ═══════════════════════════════════════════════════════════════════════

	WilliamsCritical1 = 1.5 // Initial organization
	WilliamsCritical2 = 3.2 // Pattern emergence
	WilliamsCritical3 = 7.5 // Stable structure
)

// FibonacciSequence - Pre-computed for O(1) lookup
var FibonacciSequence = []uint64{
	0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597,
	2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418,
	317811, 514229, 832040, 1346269, 2178309, 3524578, 5702887, 9227465,
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// DegreesToRadians converts degrees to radians
func DegreesToRadians(degrees float64) float64 {
	return degrees * (Pi / 180.0)
}

// RadiansToDegrees converts radians to degrees
func RadiansToDegrees(radians float64) float64 {
	return radians * (180.0 / Pi)
}

// Fibonacci returns the nth Fibonacci number
func Fibonacci(n int) uint64 {
	if n < 0 {
		return 0
	}
	if n < len(FibonacciSequence) {
		return FibonacciSequence[n]
	}

	// Calculate for larger n
	a, b := uint64(0), uint64(1)
	for i := 0; i < n; i++ {
		a, b = b, a+b
	}
	return a
}

// PhiPower returns φ^n (golden ratio raised to power n)
func PhiPower(n float64) float64 {
	return math.Pow(Phi, n)
}
