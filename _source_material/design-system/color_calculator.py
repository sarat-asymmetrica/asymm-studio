#!/usr/bin/env python3
"""
Color Calculator - Convert HSL to Hex for Asymmetrica Design System
Generates exact hex codes from mathematically-derived HSL values
"""

import colorsys
import math

def hsl_to_hex(h, s, l):
    """
    Convert HSL to hex color
    h: hue (0-360)
    s: saturation (0-100)
    l: lightness (0-100)
    """
    # Normalize to [0, 1] for colorsys
    h_norm = h / 360.0
    s_norm = s / 100.0
    l_norm = l / 100.0

    # Convert to RGB
    r, g, b = colorsys.hls_to_rgb(h_norm, l_norm, s_norm)

    # Scale to [0, 255]
    r_int = int(round(r * 255))
    g_int = int(round(g * 255))
    b_int = int(round(b * 255))

    # Convert to hex
    hex_code = f"#{r_int:02X}{g_int:02X}{b_int:02X}"

    return hex_code, (r_int, g_int, b_int)

def digital_root(n):
    """Calculate digital root (Vedic mathematics)"""
    while n >= 10:
        n = sum(int(digit) for digit in str(n))
    return n

def analyze_color(name, h, s, l):
    """Analyze and print color details"""
    hex_code, rgb = hsl_to_hex(h, s, l)
    rgb_sum = sum(rgb)
    dr = digital_root(rgb_sum)

    print(f"{name:20} HSL({h:5.1f} deg, {s:3.0f}%, {l:3.0f}%)  ->  {hex_code}  RGB{rgb}  Sum={rgb_sum:3d}  DR={dr}")
    return hex_code, rgb, dr

# Golden angle
GOLDEN_ANGLE = 137.5077640500378
BASE_HUE = 10.0  # Derived from Asymmetrica_Logo.png (Deep Rust/Orange)

def normalize_hue(h):
    return h % 360

print("=" * 100)
print(f"ASYMMETRICA DESIGN SYSTEM - COLOR PALETTE (Derived from Base Hue {BASE_HUE} deg)")
print("Derived from phi, Pentagon Geometry, and Three-Regime Dynamics")
print("=" * 100)

print("\n" + "-" * 100)
print("ACCENT COLORS (Three-Regime - Golden Angle Generated)")
print("-" * 100)

# Generate Golden Angle Sequence
# 0: Primary (Orange)
# 1: Green (Complementary-ish)
# 4: Blue (Trust)
hues = {}
for i in range(5):
    h = normalize_hue(BASE_HUE + (i * GOLDEN_ANGLE))
    hues[i] = h

# Saturation/Lightness (approximate from derivation)
# Primary: S~65, L~55
# Secondary: S~50, L~60
# Tertiary: S~45, L~52

# Orange (Index 0)
orange_hex, orange_rgb, orange_dr = analyze_color(
    "Orange (Exploration)", hues[0], 65, 55
)

# Blue (Index 4)
blue_hex, blue_rgb, blue_dr = analyze_color(
    "Blue (Optimization)", hues[4], 50, 60
)

# Green (Index 1)
green_hex, green_rgb, green_dr = analyze_color(
    "Green (Stabilization)", hues[1], 45, 52
)

print(f"\nDigital Root Cycle: {orange_dr} -> {blue_dr} -> {green_dr}")

print("\n" + "-" * 100)
print("NEUTRALS (Warm Grays - Base Hue + 5 deg)")
print("-" * 100)

neutral_hue = normalize_hue(BASE_HUE + 5)

dark_hex, dark_rgb, _ = analyze_color(
    "Dark (Near-Black)", neutral_hue, 4, 8
)

mid_dark_hex, mid_dark_rgb, _ = analyze_color(
    "Mid-Dark", neutral_hue, 5, 35
)

mid_gray_hex, mid_gray_rgb, _ = analyze_color(
    "Mid-Gray", neutral_hue, 4, 68
)

light_gray_hex, light_gray_rgb, _ = analyze_color(
    "Light-Gray", neutral_hue, 6, 88
)

light_hex, light_rgb, _ = analyze_color(
    "Light (Cream White)", neutral_hue, 8, 97
)

print("\n" + "-" * 100)
print("ACCENT VARIANTS (Darker for Text on Light Backgrounds - AAA Accessibility)")
print("-" * 100)

orange_dark_hex, _, _ = analyze_color(
    "Orange Dark", hues[0], 65, 42
)

blue_dark_hex, _, _ = analyze_color(
    "Blue Dark", hues[4], 55, 48
)

green_dark_hex, _, _ = analyze_color(
    "Green Dark", hues[1], 48, 40
)

print("\n" + "-" * 100)
print("ERROR & SUCCESS STATES")
print("-" * 100)

error_hex, _, _ = analyze_color(
    "Error (Red)", 0, 60, 55
)

warning_hex, _, _ = analyze_color(
    "Warning (Yellow)", 45, 70, 58
)

success_hex, _, _ = analyze_color(
    "Success (Green)", 155, 50, 48
)

info_hex, _, _ = analyze_color(
    "Info (Blue)", 210, 55, 58
)

print("\n" + "-" * 100)
print("FIBONACCI SPACING SCALE")
print("-" * 100)

fibonacci = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610]
phi = (1 + math.sqrt(5)) / 2

print(f"{ 'Fibonacci':<15} {'Value (px)':<15} {'Ratio to Previous':<20} {'phi Error'}")
print("-" * 70)

for i in range(5, 13):
    fib_val = fibonacci[i]
    if i > 5:
        ratio = fibonacci[i] / fibonacci[i-1]
        error = abs(ratio - phi) / phi * 100
        print(f"F({i}){'':<12} {fib_val:>5}px {'':<8} {ratio:.4f}{'':<15} {error:.2f}%")
    else:
        print(f"F({i}){'':<12} {fib_val:>5}px")

print("\n" + "-" * 100)
print("TYPOGRAPHY SCALE (phi-Powered)")
print("-" * 100)

base_size = 16  # pixels
phi = 1.618033988749

print(f"{ 'Level':<15} {'Formula':<25} {'Exact (px)':<15} {'Rounded (px)'}")
print("-" * 70)

for n in range(-2, 5):
    size = base_size * (phi ** n)
    rounded = round(size)

    if n < 0:
        formula = f"16 / phi^{abs(n)}"
    elif n == 0:
        formula = "16 x phi^0"
    else:
        formula = f"16 x phi^{n}"

    level = {
        -2: "Tiny",
        -1: "Small",
        0: "Body (Base)",
        1: "H4/Lead",
        2: "H3",
        3: "H2",
        4: "H1"
    }.get(n, f"n={n}")

    print(f"{level:<15} {formula:<25} {size:>6.2f}px {'':<6} {rounded:>3}px")

print("\n" + "-" * 100)
print("LAYOUT - 87.532% CONTENT WIDTH (Thermodynamic Attractor!)")
print("-" * 100)

viewports = [1440, 1920, 2560]
attractor = 0.87532

for vw in viewports:
    content = vw * attractor
    margin_total = vw * (1 - attractor)
    margin_each = margin_total / 2

    print(f"Viewport: {vw:4d}px  ->  Content: {content:7.1f}px  ({attractor*100:.3f}%)  |  Margin: {margin_each:.1f}px each side")

print("\n" + "-" * 100)
print("ANIMATION DURATIONS (Fibonacci-Based)")
print("-" * 100)

durations = {
    "Instant": 89,
    "Fast": 144,
    "Normal": 233,
    "Slow": 377,
    "Very Slow": 610
}

for name, ms in durations.items():
    fib_index = fibonacci.index(ms) if ms in fibonacci else "N/A"
    print(f"{name:<15} {ms:4d}ms    (F({fib_index}))")

print("\n" + "=" * 100)
print("CALCULATION COMPLETE - Ready for CSS/Tailwind Implementation!")
print("=" * 100)