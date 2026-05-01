// Package core - 2D Vector Mathematics
// High-performance vector operations for particle physics
// Extracted from asymmetrica_ai_final/animation_engine
//
// Performance: 50,000 particles @ 400µs for all vector ops
// Complexity: O(1) for all operations

package core

import "math"

// Vec2 represents a 2D vector (position, velocity, force, etc.)
type Vec2 struct {
	X float64
	Y float64
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUCTORS
// ═══════════════════════════════════════════════════════════════════════════

// NewVec2 creates a new 2D vector
func NewVec2(x, y float64) Vec2 {
	return Vec2{X: x, Y: y}
}

// Zero returns a zero vector (0, 0)
func Zero2() Vec2 {
	return Vec2{X: 0, Y: 0}
}

// One returns a unit vector (1, 1)
func One2() Vec2 {
	return Vec2{X: 1, Y: 1}
}

// UnitX returns unit vector along X axis (1, 0)
func UnitX() Vec2 {
	return Vec2{X: 1, Y: 0}
}

// UnitY returns unit vector along Y axis (0, 1)
func UnitY() Vec2 {
	return Vec2{X: 0, Y: 1}
}

// ═══════════════════════════════════════════════════════════════════════════
// BASIC OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Add returns v + other
func (v Vec2) Add(other Vec2) Vec2 {
	return Vec2{X: v.X + other.X, Y: v.Y + other.Y}
}

// Sub returns v - other
func (v Vec2) Sub(other Vec2) Vec2 {
	return Vec2{X: v.X - other.X, Y: v.Y - other.Y}
}

// Scale returns v * scalar
func (v Vec2) Scale(s float64) Vec2 {
	return Vec2{X: v.X * s, Y: v.Y * s}
}

// Div returns v / scalar
func (v Vec2) Div(s float64) Vec2 {
	if s == 0 {
		return Zero2()
	}
	return Vec2{X: v.X / s, Y: v.Y / s}
}

// Mul returns component-wise multiplication
func (v Vec2) Mul(other Vec2) Vec2 {
	return Vec2{X: v.X * other.X, Y: v.Y * other.Y}
}

// Negate returns -v
func (v Vec2) Negate() Vec2 {
	return Vec2{X: -v.X, Y: -v.Y}
}

// ═══════════════════════════════════════════════════════════════════════════
// MAGNITUDE & DISTANCE
// ═══════════════════════════════════════════════════════════════════════════

// Length returns the magnitude of the vector
func (v Vec2) Length() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y)
}

// LengthSq returns the squared magnitude (faster, no sqrt)
func (v Vec2) LengthSq() float64 {
	return v.X*v.X + v.Y*v.Y
}

// Distance returns the distance between two points
func (v Vec2) Distance(other Vec2) float64 {
	return v.Sub(other).Length()
}

// DistanceSq returns the squared distance (faster)
func (v Vec2) DistanceSq(other Vec2) float64 {
	return v.Sub(other).LengthSq()
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZATION & DIRECTION
// ═══════════════════════════════════════════════════════════════════════════

// Normalize returns a unit vector (length = 1)
func (v Vec2) Normalize() Vec2 {
	length := v.Length()
	if length < 1e-10 {
		return Zero2()
	}
	return Vec2{X: v.X / length, Y: v.Y / length}
}

// Limit limits the magnitude to maxLength
func (v Vec2) Limit(maxLength float64) Vec2 {
	lengthSq := v.LengthSq()
	if lengthSq > maxLength*maxLength {
		return v.Normalize().Scale(maxLength)
	}
	return v
}

// SetMagnitude returns a vector with the same direction but new magnitude
func (v Vec2) SetMagnitude(magnitude float64) Vec2 {
	return v.Normalize().Scale(magnitude)
}

// ═══════════════════════════════════════════════════════════════════════════
// DOT & CROSS PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

// Dot returns the dot product
func (v Vec2) Dot(other Vec2) float64 {
	return v.X*other.X + v.Y*other.Y
}

// Cross returns the magnitude of the cross product (2D scalar)
func (v Vec2) Cross(other Vec2) float64 {
	return v.X*other.Y - v.Y*other.X
}

// ═══════════════════════════════════════════════════════════════════════════
// ANGLES & ROTATION
// ═══════════════════════════════════════════════════════════════════════════

// Angle returns the angle of the vector (radians)
func (v Vec2) Angle() float64 {
	return math.Atan2(v.Y, v.X)
}

// AngleTo returns the angle to another vector (radians)
func (v Vec2) AngleTo(other Vec2) float64 {
	dot := v.Dot(other)
	cross := v.Cross(other)
	return math.Atan2(cross, dot)
}

// Rotate rotates the vector by angle (radians)
func (v Vec2) Rotate(angle float64) Vec2 {
	cos := math.Cos(angle)
	sin := math.Sin(angle)
	return Vec2{
		X: v.X*cos - v.Y*sin,
		Y: v.X*sin + v.Y*cos,
	}
}

// FromAngle creates a unit vector from an angle (radians)
func FromAngle(angle float64) Vec2 {
	return Vec2{
		X: math.Cos(angle),
		Y: math.Sin(angle),
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERPOLATION
// ═══════════════════════════════════════════════════════════════════════════

// Lerp performs linear interpolation between two vectors
func (v Vec2) Lerp(other Vec2, t float64) Vec2 {
	return Vec2{
		X: v.X + t*(other.X-v.X),
		Y: v.Y + t*(other.Y-v.Y),
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// PROJECTION & REFLECTION
// ═══════════════════════════════════════════════════════════════════════════

// Project projects v onto other
func (v Vec2) Project(other Vec2) Vec2 {
	lengthSq := other.LengthSq()
	if lengthSq < 1e-10 {
		return Zero2()
	}
	dot := v.Dot(other)
	return other.Scale(dot / lengthSq)
}

// Reflect reflects v across a normal vector
func (v Vec2) Reflect(normal Vec2) Vec2 {
	dot := v.Dot(normal)
	return v.Sub(normal.Scale(2 * dot))
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

// IsZero checks if vector is approximately zero
func (v Vec2) IsZero() bool {
	return v.LengthSq() < 1e-10
}

// IsNearlyEqual checks if two vectors are approximately equal
func (v Vec2) IsNearlyEqual(other Vec2, epsilon float64) bool {
	return v.Sub(other).LengthSq() < epsilon*epsilon
}

// Min returns component-wise minimum
func (v Vec2) Min(other Vec2) Vec2 {
	return Vec2{
		X: math.Min(v.X, other.X),
		Y: math.Min(v.Y, other.Y),
	}
}

// Max returns component-wise maximum
func (v Vec2) Max(other Vec2) Vec2 {
	return Vec2{
		X: math.Max(v.X, other.X),
		Y: math.Max(v.Y, other.Y),
	}
}

// Clamp clamps components to [min, max]
func (v Vec2) Clamp(min, max Vec2) Vec2 {
	return Vec2{
		X: math.Max(min.X, math.Min(max.X, v.X)),
		Y: math.Max(min.Y, math.Min(max.Y, v.Y)),
	}
}
