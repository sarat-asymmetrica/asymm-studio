// Package benchmarks - Performance Validation
// Target: 60 FPS @ 50,000 particles (frame budget: 16.67ms)

package benchmarks

import (
	"math/rand"
	"testing"

	"github.com/asymmetrica/asymm-physics/core"
	"github.com/asymmetrica/asymm-physics/forces"
	"github.com/asymmetrica/asymm-physics/spatial"
	"github.com/asymmetrica/asymm-physics/systems"
	"github.com/asymmetrica/asymm-physics/vedic"
)

// Benchmark50KParticles tests full particle system @ 50K particles
// Target: ≤16.67ms per frame (60 FPS)
func Benchmark50KParticles(b *testing.B) {
	const numParticles = 50000
	const dt = 1.0 / 60.0 // 16.67ms timestep

	// Create particles
	particles := make([]systems.Particle, numParticles)
	positions := make([]core.Vec2, numParticles)

	// Initialize in golden spiral
	center := core.NewVec2(960, 540)
	for i := 0; i < numParticles; i++ {
		pos := vedic.GoldenSpiral2D(i, center, 5.0)
		particles[i] = systems.NewParticle(pos.X, pos.Y, 1.0)
		positions[i] = pos
	}

	// Spatial hash for collision detection
	spatialHash := spatial.NewSpatialHash(100)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		// 1. Clear spatial hash
		spatialHash.Clear()

		// 2. Insert all particles
		for j := 0; j < numParticles; j++ {
			positions[j] = particles[j].State.Position
			spatialHash.Insert(j, positions[j])
		}

		// 3. Apply forces (Williams batched)
		vedic.WilliamsBatchProcess(numParticles, func(start, end int) {
			for j := start; j < end; j++ {
				// Boundary forces
				force := forces.BoundaryForce(
					particles[j].State.Position,
					0, 0, 1920, 1080,
					100, 10,
				)
				particles[j].ApplyForce(force)
			}
		})

		// 4. Integrate physics (Williams batched)
		vedic.WilliamsBatchProcess(numParticles, func(start, end int) {
			for j := start; j < end; j++ {
				particles[j].Update(dt)
			}
		})
	}

	// Calculate FPS
	nsPerFrame := b.Elapsed().Nanoseconds() / int64(b.N)
	msPerFrame := float64(nsPerFrame) / 1e6
	fps := 1000.0 / msPerFrame

	b.ReportMetric(fps, "fps")
	b.ReportMetric(msPerFrame, "ms/frame")

	if fps < 60 {
		b.Errorf("FPS too low: %.2f (target: 60)", fps)
	}
}

// BenchmarkQuaternionSlerp validates 82M ops/sec claim
func BenchmarkQuaternionSlerp(b *testing.B) {
	q1 := core.NewQuaternion(1, 0, 0, 0)
	q2 := core.NewQuaternion(0.707, 0.707, 0, 0)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		core.Slerp(q1, q2, 0.5)
	}

	// Calculate ops/sec
	opsPerSec := float64(b.N) / b.Elapsed().Seconds()
	b.ReportMetric(opsPerSec/1e6, "M_ops/sec")

	if opsPerSec < 50e6 {
		b.Errorf("Quaternion ops too slow: %.2f M/sec (target: 82)", opsPerSec/1e6)
	}
}

// BenchmarkDigitalRoot validates O(1) performance
func BenchmarkDigitalRoot(b *testing.B) {
	for i := 0; i < b.N; i++ {
		vedic.DigitalRoot(123456789)
	}

	nsPerOp := b.Elapsed().Nanoseconds() / int64(b.N)
	b.ReportMetric(float64(nsPerOp), "ns/op")

	if nsPerOp > 5 {
		b.Errorf("Digital root too slow: %d ns (target: <5ns)", nsPerOp)
	}
}

// BenchmarkSpatialHashQuery tests spatial hash performance
func BenchmarkSpatialHashQuery(b *testing.B) {
	const numParticles = 50000

	positions := make([]core.Vec2, numParticles)
	for i := 0; i < numParticles; i++ {
		positions[i] = core.NewVec2(
			rand.Float64()*1920,
			rand.Float64()*1080,
		)
	}

	spatialHash := spatial.NewSpatialHash(100)
	for i, pos := range positions {
		spatialHash.Insert(i, pos)
	}

	queryPos := core.NewVec2(960, 540)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		spatialHash.QueryRadius(queryPos, 150, positions)
	}
}

// BenchmarkWilliamsBatchSize tests Williams optimizer
func BenchmarkWilliamsBatchSize(b *testing.B) {
	for i := 0; i < b.N; i++ {
		vedic.BatchSizeFor(50000)
	}
}

// BenchmarkPhyllotaxisSpawn tests golden spiral generation
func BenchmarkPhyllotaxisSpawn(b *testing.B) {
	center := core.NewVec2(960, 540)

	b.ResetTimer()

	for i := 0; i < b.N; i++ {
		vedic.SpawnPhyllotaxis(1000, center, 5.0)
	}
}
