// Package core - 3D Vector Mathematics
// High-performance 3D vector operations for 3D particle physics

package core

import "math"

// Vec3 represents a 3D vector (position, velocity, force, etc.)
type Vec3 struct {
	X float64
	Y float64
	Z float64
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTRUCTORS
// ═══════════════════════════════════════════════════════════════════════════

// NewVec3 creates a new 3D vector
func NewVec3(x, y, z float64) Vec3 {
	return Vec3{X: x, Y: y, Z: z}
}

// Zero3 returns a zero vector (0, 0, 0)
func Zero3() Vec3 {
	return Vec3{X: 0, Y: 0, Z: 0}
}

// One3 returns a unit vector (1, 1, 1)
func One3() Vec3 {
	return Vec3{X: 1, Y: 1, Z: 1}
}

// ═══════════════════════════════════════════════════════════════════════════
// BASIC OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

// Add returns v + other
func (v Vec3) Add(other Vec3) Vec3 {
	return Vec3{X: v.X + other.X, Y: v.Y + other.Y, Z: v.Z + other.Z}
}

// Sub returns v - other
func (v Vec3) Sub(other Vec3) Vec3 {
	return Vec3{X: v.X - other.X, Y: v.Y - other.Y, Z: v.Z - other.Z}
}

// Scale returns v * scalar
func (v Vec3) Scale(s float64) Vec3 {
	return Vec3{X: v.X * s, Y: v.Y * s, Z: v.Z * s}
}

// Negate returns -v
func (v Vec3) Negate() Vec3 {
	return Vec3{X: -v.X, Y: -v.Y, Z: -v.Z}
}

// ═══════════════════════════════════════════════════════════════════════════
// MAGNITUDE & DISTANCE
// ═══════════════════════════════════════════════════════════════════════════

// Length returns the magnitude of the vector
func (v Vec3) Length() float64 {
	return math.Sqrt(v.X*v.X + v.Y*v.Y + v.Z*v.Z)
}

// LengthSq returns the squared magnitude (faster, no sqrt)
func (v Vec3) LengthSq() float64 {
	return v.X*v.X + v.Y*v.Y + v.Z*v.Z
}

// Distance returns the distance between two points
func (v Vec3) Distance(other Vec3) float64 {
	return v.Sub(other).Length()
}

// DistanceSq returns the squared distance (faster)
func (v Vec3) DistanceSq(other Vec3) float64 {
	return v.Sub(other).LengthSq()
}

// ═══════════════════════════════════════════════════════════════════════════
// NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

// Normalize returns a unit vector (length = 1)
func (v Vec3) Normalize() Vec3 {
	length := v.Length()
	if length < 1e-10 {
		return Zero3()
	}
	return Vec3{X: v.X / length, Y: v.Y / length, Z: v.Z / length}
}

// ═══════════════════════════════════════════════════════════════════════════
// DOT & CROSS PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════

// Dot returns the dot product
func (v Vec3) Dot(other Vec3) float64 {
	return v.X*other.X + v.Y*other.Y + v.Z*other.Z
}

// Cross returns the cross product (3D vector)
func (v Vec3) Cross(other Vec3) Vec3 {
	return Vec3{
		X: v.Y*other.Z - v.Z*other.Y,
		Y: v.Z*other.X - v.X*other.Z,
		Z: v.X*other.Y - v.Y*other.X,
	}
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERPOLATION
// ═══════════════════════════════════════════════════════════════════════════

// Lerp performs linear interpolation between two vectors
func (v Vec3) Lerp(other Vec3, t float64) Vec3 {
	return Vec3{
		X: v.X + t*(other.X-v.X),
		Y: v.Y + t*(other.Y-v.Y),
		Z: v.Z + t*(other.Z-v.Z),
	}
}
