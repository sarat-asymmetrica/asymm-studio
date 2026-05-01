// Package vedic - Digital Root Mathematics
// O(1) classification using ancient Vedic techniques

package vedic

// DigitalRoot computes the digital root of a number
// O(1) complexity using Vedic formula
//
// Formula: DR(n) = 1 + ((n - 1) mod 9)
// Range: 1-9 (never 0)
func DigitalRoot(n int) int {
	if n < 0 {
		n = -n
	}
	if n == 0 {
		return 9
	}
	return 1 + ((n - 1) % 9)
}

// DigitalRootColor maps digital root (1-9) to color
func DigitalRootColor(n int) string {
	colors := []string{
		"#DC2626", // 1: Red
		"#EA580C", // 2: Deep orange
		"#F97316", // 3: Orange
		"#84CC16", // 4: Lime
		"#10B981", // 5: Emerald
		"#06B6D4", // 6: Cyan
		"#3B82F6", // 7: Blue
		"#8B5CF6", // 8: Violet
		"#FBBF24", // 9: Gold
	}
	root := DigitalRoot(n)
	return colors[root-1]
}
