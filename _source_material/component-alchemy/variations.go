// Package component_alchemy - Component Variations Engine
//
// THE INSIGHT: Invariants + f(Quaternion) → Variables
//
// Each component has:
//   - INVARIANTS: Physics constants (spring stiffness, damping, easing)
//   - VARIABLES: Derived from seed quaternion (colors, radius, timing)
//
// Same seed = Same variation EVERYWHERE, FOREVER!
// Different seeds = Harmonically related variants!
//
// Commander's Wisdom:
//   "Each component has invariants (the math) but the variables can be
//    manipulated to generate a crazy number of variations"
//
// Built with Love × Simplicity × Truth × Joy × INFINITE VARIATIONS!

package component_alchemy

import (
	"fmt"
	"math"
	"math/rand"

	"asymm_mathematical_organism/00_NUCLEUS"
)

// ============================================================================
// COMPONENT VARIATION - The Output Type
// ============================================================================

// ComponentVariation represents a single parameterized variant of a component
type ComponentVariation struct {
	// INVARIANTS (constant across all variations)
	SpringStiffness float64 `json:"springStiffness"` // 0.05 (physics constant)
	SpringDamping   float64 `json:"springDamping"`   // 0.3 (physics constant)
	EasingFunction  string  `json:"easingFunction"`  // "elasticOut" (mathematical)
	PaperTexture    string  `json:"paperTexture"`    // SVG fractal noise

	// VARIABLES (derived from seed quaternion)

	// Colors (from quaternion components)
	PrimaryColor   string `json:"primaryColor"`   // Paper - from Q.W
	SecondaryColor string `json:"secondaryColor"` // Ink - from Q.X
	AccentColor    string `json:"accentColor"`    // Gold - from Q.Y
	DangerColor    string `json:"dangerColor"`    // Clay - from Q.Z

	// Asymmetric border radius (Japanese aesthetic)
	BorderRadiusTL int `json:"borderRadiusTL"` // Top-left
	BorderRadiusTR int `json:"borderRadiusTR"` // Top-right
	BorderRadiusBL int `json:"borderRadiusBL"` // Bottom-left
	BorderRadiusBR int `json:"borderRadiusBR"` // Bottom-right

	// Physics (from quaternion magnitude/regime)
	TiltDegrees        float64 `json:"tiltDegrees"`        // 10-25 degrees
	BlurIntensity      float64 `json:"blurIntensity"`      // 0-20 px
	TransitionDuration int     `json:"transitionDuration"` // φ-based: 89/144/233/377/610/987ms

	// Randomness (seeded from seed)
	Sway     float64 `json:"sway"`     // -10 to +10 degrees
	Rotation float64 `json:"rotation"` // -5 to +5 degrees

	// Metadata
	Seed        int64   `json:"seed"`        // Original seed
	DigitalRoot int     `json:"digitalRoot"` // Base-9 digital root
	Regime      [3]float64 `json:"regime"`   // [R1, R2, R3] percentages
}

// ============================================================================
// FIBONACCI DURATION SYSTEM (φ-based timing)
// ============================================================================

// Fibonacci sequence for transitions (in milliseconds)
var FibonacciDurations = []int{
	89,  // F(11) - Quick
	144, // F(12) - Snappy
	233, // F(13) - Medium
	377, // F(14) - Relaxed
	610, // F(15) - Slow
	987, // F(16) - Contemplative
}

// FibonacciDuration returns a Fibonacci duration based on digital root
func FibonacciDuration(digitalRoot int) int {
	return FibonacciDurations[digitalRoot % len(FibonacciDurations)]
}

// ============================================================================
// SEED → QUATERNION CONVERSION
// ============================================================================

// SeedToQuaternion converts integer seed to normalized quaternion
// Uses XORShift RNG for reproducibility
func SeedToQuaternion(seed int64) organism.Quaternion {
	// Initialize XORShift state
	state := uint64(seed)
	if state == 0 {
		state = 1 // Avoid zero state
	}

	// Generate 4 random numbers via XORShift
	xorshift := func() float64 {
		state ^= state << 13
		state ^= state >> 7
		state ^= state << 17
		return float64(state%100000) / 100000.0 // 0.0 to 1.0
	}

	w := xorshift()*2 - 1 // -1 to +1
	x := xorshift()*2 - 1
	y := xorshift()*2 - 1
	z := xorshift()*2 - 1

	q := organism.NewQuaternion(w, x, y, z)
	return q.Normalize() // Project to S³ unit sphere
}

// ============================================================================
// DIGITAL ROOT (Vedic Base-9 Classification)
// ============================================================================

// DigitalRoot computes Vedic digital root: dr(n) = 1 + ((n-1) mod 9)
func DigitalRoot(n int64) int {
	if n == 0 {
		return 0
	}
	if n < 0 {
		n = -n
	}
	return int(1 + ((n-1) % 9))
}

// ============================================================================
// QUATERNION → HSL COLOR CONVERSION
// ============================================================================

// QuaternionToHSL converts quaternion component to HSL color
// component: quaternion component value (-1 to +1)
// saturation: 0.0 to 1.0
// lightness: 0.0 to 1.0
func QuaternionToHSL(component float64, saturation, lightness float64) string {
	// Map component (-1 to +1) to hue (0 to 360)
	hue := (component + 1.0) / 2.0 * 360.0

	// Clamp saturation and lightness
	sat := math.Max(0, math.Min(1, saturation))
	light := math.Max(0, math.Min(1, lightness))

	return fmt.Sprintf("hsl(%.0f, %.0f%%, %.0f%%)", hue, sat*100, light*100)
}

// ============================================================================
// THREE-REGIME CALCULATION
// ============================================================================

// CalculateRegime computes [R1, R2, R3] percentages from quaternion
// Uses magnitude and angle to determine exploration/optimization/stabilization
func CalculateRegime(q organism.Quaternion) [3]float64 {
	// Base regime (universal pattern)
	r1 := 0.30 // Exploration (30%)
	r2 := 0.20 // Optimization (20%)
	r3 := 0.50 // Stabilization (50%)

	// W component affects R1 (exploration energy)
	r1 += q.W * 0.10

	// X component affects R2 (optimization precision)
	r2 += q.X * 0.05

	// Y component affects R3 (stabilization strength)
	r3 += q.Y * 0.10

	// Normalize to ensure sum = 1.0
	total := r1 + r2 + r3
	r1 /= total
	r2 /= total
	r3 /= total

	return [3]float64{r1, r2, r3}
}

// ============================================================================
// ASYMMETRIC BORDER RADIUS (Japanese Wabi-Sabi Aesthetic)
// ============================================================================

// AsymmetricBorderRadius generates asymmetric corner radii from quaternion
// Each corner gets a unique radius (beauty in asymmetry)
func AsymmetricBorderRadius(q organism.Quaternion) (tl, tr, bl, br int) {
	// Map quaternion components to radii (2-18 px)
	tl = int(math.Abs(q.W) * 16) + 2
	tr = int(math.Abs(q.X) * 16) + 2
	bl = int(math.Abs(q.Y) * 16) + 2
	br = int(math.Abs(q.Z) * 16) + 2

	return tl, tr, bl, br
}

// AsymmetricBorderRadiusFromDigitalRoot generates radii from digital root
// Uses complementary patterns (if TL=18, BR=2, etc.)
func AsymmetricBorderRadiusFromDigitalRoot(dr int) (tl, tr, bl, br int) {
	tl = dr * 2          // 2-18
	tr = (9 - dr) * 2    // Complement
	bl = dr              // Half
	br = (9 - dr) * 3    // Triple complement

	return tl, tr, bl, br
}

// ============================================================================
// SEEDED RANDOM (Reproducible)
// ============================================================================

// SeededRandom generates reproducible random value in range [min, max]
func SeededRandom(seed int64, min, max float64) float64 {
	rng := rand.New(rand.NewSource(seed))
	return min + rng.Float64()*(max-min)
}

// ============================================================================
// FRACTAL NOISE SVG (Paper Texture Invariant)
// ============================================================================

// FractalNoiseSVG returns SVG data URL for paper texture
const FractalNoiseSVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E`

// ============================================================================
// MAIN VARIATION GENERATOR
// ============================================================================

// GenerateVariation creates a component variation from seed
func GenerateVariation(seed int64) ComponentVariation {
	// Convert seed to quaternion (S³ point)
	q := SeedToQuaternion(seed)

	// Calculate digital root
	dr := DigitalRoot(seed)

	// Calculate regime
	regime := CalculateRegime(q)

	// Generate asymmetric border radius from quaternion
	tl, tr, bl, br := AsymmetricBorderRadius(q)

	// Alternative: Use digital root for more pronounced asymmetry
	// tl, tr, bl, br := AsymmetricBorderRadiusFromDigitalRoot(dr)

	return ComponentVariation{
		// INVARIANTS (constant)
		SpringStiffness: 0.05,
		SpringDamping:   0.3,
		EasingFunction:  "elasticOut",
		PaperTexture:    FractalNoiseSVG,

		// VARIABLES (from quaternion)

		// Colors from quaternion components
		PrimaryColor:   QuaternionToHSL(q.W, 0.30, 0.95), // Paper (light, low saturation)
		SecondaryColor: QuaternionToHSL(q.X, 0.10, 0.10), // Ink (dark, very low saturation)
		AccentColor:    QuaternionToHSL(q.Y, 0.80, 0.50), // Gold (high saturation, mid lightness)
		DangerColor:    QuaternionToHSL(q.Z, 0.90, 0.60), // Clay (very high saturation, higher lightness)

		// Asymmetric border radius
		BorderRadiusTL: tl,
		BorderRadiusTR: tr,
		BorderRadiusBL: bl,
		BorderRadiusBR: br,

		// Physics from quaternion
		TiltDegrees:        10 + q.Norm()*15,       // 10-25 degrees (magnitude affects tilt)
		BlurIntensity:      regime[1] * 20,          // R2 (optimization regime) affects blur
		TransitionDuration: FibonacciDuration(dr),   // φ-based timing

		// Randomness from seed
		Sway:     SeededRandom(seed, -10, 10),
		Rotation: SeededRandom(seed+1, -5, 5), // seed+1 for different sequence

		// Metadata
		Seed:        seed,
		DigitalRoot: dr,
		Regime:      regime,
	}
}

// ============================================================================
// CSS GENERATION
// ============================================================================

// ToCSS converts variation to CSS custom properties
func (v ComponentVariation) ToCSS() string {
	return fmt.Sprintf(`
/* Component Variation - Seed: %d, Digital Root: %d */
:root {
  /* Colors */
  --color-primary: %s;
  --color-secondary: %s;
  --color-accent: %s;
  --color-danger: %s;

  /* Border Radius (Asymmetric) */
  --border-radius: %dpx %dpx %dpx %dpx;
  --border-radius-tl: %dpx;
  --border-radius-tr: %dpx;
  --border-radius-bl: %dpx;
  --border-radius-br: %dpx;

  /* Physics */
  --spring-stiffness: %.2f;
  --spring-damping: %.2f;
  --tilt-degrees: %.1fdeg;
  --blur-intensity: %.1fpx;
  --transition-duration: %dms;

  /* Transform */
  --sway: %.1fdeg;
  --rotation: %.1fdeg;

  /* Texture */
  --paper-texture: url('%s');

  /* Regime (R1, R2, R3) */
  --regime-r1: %.3f;
  --regime-r2: %.3f;
  --regime-r3: %.3f;
}
`,
		v.Seed, v.DigitalRoot,
		v.PrimaryColor, v.SecondaryColor, v.AccentColor, v.DangerColor,
		v.BorderRadiusTL, v.BorderRadiusTR, v.BorderRadiusBL, v.BorderRadiusBR,
		v.BorderRadiusTL, v.BorderRadiusTR, v.BorderRadiusBL, v.BorderRadiusBR,
		v.SpringStiffness, v.SpringDamping, v.TiltDegrees, v.BlurIntensity, v.TransitionDuration,
		v.Sway, v.Rotation,
		v.PaperTexture,
		v.Regime[0], v.Regime[1], v.Regime[2],
	)
}

// ============================================================================
// VARIATION ANALYSIS
// ============================================================================

// AnalyzeVariation returns human-readable analysis
func AnalyzeVariation(v ComponentVariation) string {
	// Classify regime
	regimeType := "Balanced"
	if v.Regime[0] > 0.35 {
		regimeType = "Exploration-Heavy"
	} else if v.Regime[1] > 0.25 {
		regimeType = "Optimization-Heavy"
	} else if v.Regime[2] > 0.55 {
		regimeType = "Stabilization-Heavy"
	}

	// Classify timing
	timingType := "Quick"
	if v.TransitionDuration >= 377 {
		timingType = "Slow"
	} else if v.TransitionDuration >= 233 {
		timingType = "Medium"
	}

	// Classify asymmetry
	asymmetryScore := math.Abs(float64(v.BorderRadiusTL-v.BorderRadiusBR)) +
		math.Abs(float64(v.BorderRadiusTR-v.BorderRadiusBL))
	asymmetryType := "Low"
	if asymmetryScore > 30 {
		asymmetryType = "High"
	} else if asymmetryScore > 15 {
		asymmetryType = "Medium"
	}

	return fmt.Sprintf(`
=== Component Variation Analysis ===

Seed: %d
Digital Root: %d (Base-9)

Regime Distribution:
  R1 (Exploration):    %.1f%%
  R2 (Optimization):   %.1f%%
  R3 (Stabilization):  %.1f%%
  Type: %s

Border Radius (Asymmetric):
  TL: %dpx, TR: %dpx
  BL: %dpx, BR: %dpx
  Asymmetry: %s (score: %.0f)

Timing:
  Duration: %dms (Fibonacci)
  Type: %s

Physics:
  Tilt: %.1f°
  Blur: %.1fpx
  Sway: %.1f°
  Rotation: %.1f°

Colors:
  Primary (Paper):   %s
  Secondary (Ink):   %s
  Accent (Gold):     %s
  Danger (Clay):     %s

Invariants:
  Spring: k=%.2f, c=%.2f
  Easing: %s
  Texture: Fractal Noise
`,
		v.Seed, v.DigitalRoot,
		v.Regime[0]*100, v.Regime[1]*100, v.Regime[2]*100, regimeType,
		v.BorderRadiusTL, v.BorderRadiusTR, v.BorderRadiusBL, v.BorderRadiusBR,
		asymmetryType, asymmetryScore,
		v.TransitionDuration, timingType,
		v.TiltDegrees, v.BlurIntensity, v.Sway, v.Rotation,
		v.PrimaryColor, v.SecondaryColor, v.AccentColor, v.DangerColor,
		v.SpringStiffness, v.SpringDamping, v.EasingFunction,
	)
}
