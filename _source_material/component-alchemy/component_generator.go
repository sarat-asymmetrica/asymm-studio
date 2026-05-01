// Package component_alchemy - Deterministic UI Component Generation via Mathematics!
//
// THE DEATH OF SSOT, THE BIRTH OF MATH!
//
// Instead of static style guides, we have EQUATIONS:
//   Component = f(seed, season, intent, template)
//
// Same seed = Same component EVERYWHERE, FOREVER!
// Different seed = Harmonically related variant!
//
// Built with Love × Simplicity × Truth × Joy × INFINITE COMPONENTS!

package component_alchemy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	// Import our style alchemy engine!
	"asymm_mathematical_organism/03_ENGINES/style_alchemy"
)

// ComponentTemplate represents a base component that can be parameterized
type ComponentTemplate struct {
	Name        string            `json:"name"`
	Category    string            `json:"category"`
	Description string            `json:"description"`
	Template    string            `json:"template"`    // Svelte template with placeholders
	CSSVars     []string          `json:"cssVars"`     // CSS variables it uses
	Props       []PropDefinition  `json:"props"`       // Component props
	Animations  []AnimDefinition  `json:"animations"`  // Animation patterns
	Variants    map[string]string `json:"variants"`    // Named variant templates
}

// PropDefinition describes a component prop
type PropDefinition struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Default      string `json:"default"`
	MathBinding  string `json:"mathBinding"`  // Which style param controls this
	Description  string `json:"description"`
}

// AnimDefinition describes an animation
type AnimDefinition struct {
	Name      string  `json:"name"`
	Type      string  `json:"type"`      // "breathing", "spring", "fade", "slide"
	FreqParam string  `json:"freqParam"` // Style param for frequency
	AmpParam  string  `json:"ampParam"`  // Style param for amplitude
}

// GeneratedComponent is the output
type GeneratedComponent struct {
	Name        string                    `json:"name"`
	FileName    string                    `json:"fileName"`
	Code        string                    `json:"code"`
	CSS         string                    `json:"css"`
	Style       style_alchemy.StyleContext `json:"style"`
	Seed        int                       `json:"seed"`
	Category    string                    `json:"category"`
	Description string                    `json:"description"`
}

// ComponentAlchemyEngine generates UI components from mathematical parameters
type ComponentAlchemyEngine struct {
	Templates map[string]ComponentTemplate
	OutputDir string
}

// NewComponentAlchemyEngine creates a new generator
func NewComponentAlchemyEngine(outputDir string) *ComponentAlchemyEngine {
	engine := &ComponentAlchemyEngine{
		Templates: make(map[string]ComponentTemplate),
		OutputDir: outputDir,
	}
	engine.loadBuiltInTemplates()

	// Register navigation templates from separate file
	SetGlobalEngine(engine)

	return engine
}

// loadBuiltInTemplates initializes the template library
func (e *ComponentAlchemyEngine) loadBuiltInTemplates() {
	// Load data display templates first!
	e.loadDataTemplates()

	// BUTTON - The fundamental interactive element
	e.Templates["Button"] = ComponentTemplate{
		Name:        "Button",
		Category:    "interactive",
		Description: "Wabi-Sabi button with mathematical styling",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text", "--border-radius", "--transition-duration"},
		Props: []PropDefinition{
			{Name: "label", Type: "string", Default: "Click", MathBinding: "", Description: "Button text"},
			{Name: "variant", Type: "string", Default: "primary", MathBinding: "energy", Description: "Visual variant"},
			{Name: "disabled", Type: "boolean", Default: "false", MathBinding: "", Description: "Disabled state"},
		},
		Animations: []AnimDefinition{
			{Name: "breathe", Type: "breathing", FreqParam: "breathFrequency", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let label = "{{.Props.Label}}";
	export let variant = "{{.Props.Variant}}";
	export let disabled = false;

	// Mathematical breathing from style context
	let breathValue = 1;
	const breathFreq = {{.Style.BreathFrequency}};
	const breathAmp = {{.Style.BreathAmplitude}};

	if (breathFreq > 0) {
		let startTime = performance.now();
		function animate() {
			const elapsed = (performance.now() - startTime) / 1000;
			breathValue = 1 + breathAmp * Math.sin(2 * Math.PI * breathFreq * elapsed);
			requestAnimationFrame(animate);
		}
		animate();
	}
</script>

<button
	class="wabi-button wabi-button--{variant}"
	class:wabi-button--disabled={disabled}
	style="transform: scale({breathValue})"
	{disabled}
	on:click
>
	{label}
</button>

<style>
	.wabi-button {
		/* Mathematical styling */
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Text}};
		border: none;
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		font-family: {{.Style.FontPrimary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);

		/* Contrast-based shadow */
		box-shadow: 0 {{multiply .Style.ShadowDepth 4}}px {{multiply .Style.ShadowDepth 8}}px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-button:hover:not(.wabi-button--disabled) {
		background: {{.Style.Colors.Accent}};
		transform: translateY(-2px);
	}

	.wabi-button--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Energy-based glow */
	{{if gt .Style.GlowIntensity 0}}
	.wabi-button:focus {
		box-shadow: 0 0 {{multiply .Style.GlowIntensity 20}}px {{.Style.Colors.Accent}};
	}
	{{end}}
</style>`,
	}

	// CARD - Container with depth and breathing
	e.Templates["Card"] = ComponentTemplate{
		Name:        "Card",
		Category:    "layout",
		Description: "Content card with Ma (negative space) principles",
		CSSVars:     []string{"--color-surface", "--color-text", "--shadow-depth", "--border-radius"},
		Props: []PropDefinition{
			{Name: "title", Type: "string", Default: "", MathBinding: "", Description: "Card title"},
			{Name: "elevation", Type: "number", Default: "1", MathBinding: "shadowDepth", Description: "Shadow depth"},
		},
		Animations: []AnimDefinition{
			{Name: "breathe", Type: "breathing", FreqParam: "breathFrequency", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let title = "{{.Props.Title}}";
	export let elevation = {{multiply .Style.ShadowDepth 3}};
</script>

<div class="wabi-card" style="--elevation: {elevation}">
	{{if .Props.Title}}
	<header class="wabi-card__header">
		<h3>{title}</h3>
	</header>
	{{end}}
	<div class="wabi-card__content">
		<slot />
	</div>
</div>

<style>
	.wabi-card {
		/* Ma - sacred negative space */
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 3}}px;

		/* Depth from mathematical shadow */
		box-shadow:
			0 calc(var(--elevation) * 2px) calc(var(--elevation) * 4px) rgba(0,0,0,0.1),
			0 calc(var(--elevation) * 4px) calc(var(--elevation) * 8px) rgba(0,0,0,0.05);

		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-card__header {
		margin-bottom: {{index .Style.SpacingScale 2}}px;
		padding-bottom: {{index .Style.SpacingScale 1}}px;
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
	}

	.wabi-card__header h3 {
		margin: 0;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontPrimary}};
		font-size: 1.25rem;
	}

	.wabi-card__content {
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
	}
</style>`,
	}

	// ALERT - Kintsugi-style notification
	e.Templates["Alert"] = ComponentTemplate{
		Name:        "Alert",
		Category:    "feedback",
		Description: "Alert with Kintsugi gold repair aesthetic",
		CSSVars:     []string{"--color-danger", "--color-safe", "--color-gold", "--color-surface"},
		Props: []PropDefinition{
			{Name: "type", Type: "string", Default: "info", MathBinding: "", Description: "Alert type: info, success, warning, error"},
			{Name: "message", Type: "string", Default: "", MathBinding: "", Description: "Alert message"},
			{Name: "dismissible", Type: "boolean", Default: "true", MathBinding: "", Description: "Can be dismissed"},
		},
		Template: `<script>
	import { fade } from 'svelte/transition';

	export let type = "{{.Props.Type}}";
	export let message = "{{.Props.Message}}";
	export let dismissible = true;

	let visible = true;
	let repaired = false;

	const typeColors = {
		info: "{{.Style.Colors.Secondary}}",
		success: "{{.Style.Colors.Safe}}",
		warning: "{{.Style.Colors.Gold}}",
		error: "{{.Style.Colors.Danger}}"
	};

	function dismiss() {
		repaired = true;
		setTimeout(() => visible = false, {{.Style.TransitionDuration}});
	}
</script>

{#if visible}
<div
	class="wabi-alert wabi-alert--{type}"
	class:wabi-alert--repaired={repaired}
	transition:fade={{duration: {{.Style.TransitionDuration}}}}
	style="--alert-color: {typeColors[type]}"
>
	<!-- Kintsugi crack SVG -->
	<svg class="wabi-alert__crack" viewBox="0 0 400 100" preserveAspectRatio="none">
		<path
			d="M -10 50 L 80 45 L 140 60 L 220 40 L 300 55 L 410 48"
			fill="none"
			stroke={repaired ? "{{.Style.Colors.Gold}}" : "currentColor"}
			stroke-width={repaired ? 3 : 1}
			stroke-linecap="round"
			style={repaired ? "filter: drop-shadow(0 0 5px {{.Style.Colors.Gold}});" : ""}
		/>
	</svg>

	<div class="wabi-alert__content">
		<p>{message}</p>
	</div>

	{#if dismissible && !repaired}
	<button class="wabi-alert__mend" on:click={dismiss}>
		MEND
	</button>
	{:else if repaired}
	<span class="wabi-alert__healed">Repaired with Gold ✨</span>
	{/if}
</div>
{/if}

<style>
	.wabi-alert {
		position: relative;
		background: {{.Style.Colors.Surface}};
		border-left: 4px solid var(--alert-color);
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 2}}px;
		overflow: hidden;
	}

	.wabi-alert__crack {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		opacity: 0.3;
	}

	.wabi-alert--repaired .wabi-alert__crack {
		opacity: 0.8;
	}

	.wabi-alert__content {
		flex: 1;
		z-index: 1;
	}

	.wabi-alert__content p {
		margin: 0;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
	}

	.wabi-alert__mend {
		background: transparent;
		border: 1px solid {{.Style.Colors.TextMuted}};
		color: {{.Style.Colors.Text}};
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
		z-index: 1;
	}

	.wabi-alert__mend:hover {
		background: {{.Style.Colors.Gold}};
		border-color: {{.Style.Colors.Gold}};
		color: {{.Style.Colors.Background}};
	}

	.wabi-alert__healed {
		color: {{.Style.Colors.Gold}};
		font-family: {{.Style.FontPrimary}};
		font-style: italic;
		z-index: 1;
	}
</style>`,
	}

	// INPUT - Ink brush style input
	e.Templates["Input"] = ComponentTemplate{
		Name:        "Input",
		Category:    "form",
		Description: "Text input with ink brush animation",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text", "--color-accent"},
		Props: []PropDefinition{
			{Name: "placeholder", Type: "string", Default: "", MathBinding: "", Description: "Placeholder text"},
			{Name: "value", Type: "string", Default: "", MathBinding: "", Description: "Input value"},
			{Name: "type", Type: "string", Default: "text", MathBinding: "", Description: "Input type"},
		},
		Template: `<script>
	export let placeholder = "{{.Props.Placeholder}}";
	export let value = "";
	export let type = "text";

	let focused = false;
	let inkWidth = 0;

	$: if (focused || value) {
		inkWidth = 100;
	} else {
		inkWidth = 0;
	}
</script>

<div class="wabi-input" class:wabi-input--focused={focused}>
	<input
		type="text"
		{placeholder}
		bind:value
		on:focus={() => focused = true}
		on:blur={() => focused = false}
	/>
	<div class="wabi-input__ink" style="width: {inkWidth}%"></div>
</div>

<style>
	.wabi-input {
		position: relative;
		width: 100%;
	}

	.wabi-input input {
		width: 100%;
		background: transparent;
		border: none;
		border-bottom: 1px solid {{.Style.Colors.TextMuted}};
		padding: {{index .Style.SpacingScale 1}}px 0;
		font-family: {{.Style.FontPrimary}};
		font-size: 1rem;
		color: {{.Style.Colors.Text}};
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-input input:focus {
		outline: none;
		border-bottom-color: transparent;
	}

	.wabi-input input::placeholder {
		color: {{.Style.Colors.TextMuted}};
		font-style: italic;
	}

	.wabi-input__ink {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 2px;
		background: {{.Style.Colors.Primary}};
		transition: width {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-input--focused .wabi-input__ink {
		background: {{.Style.Colors.Accent}};
	}
</style>`,
	}

	// TOGGLE - Stone switch
	e.Templates["Toggle"] = ComponentTemplate{
		Name:        "Toggle",
		Category:    "form",
		Description: "Toggle switch with stone/zen aesthetic",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-accent"},
		Props: []PropDefinition{
			{Name: "checked", Type: "boolean", Default: "false", MathBinding: "", Description: "Toggle state"},
			{Name: "label", Type: "string", Default: "", MathBinding: "", Description: "Label text"},
		},
		Template: `<script>
	export let checked = false;
	export let label = "";
</script>

<label class="wabi-toggle">
	{#if label}
	<span class="wabi-toggle__label">{label}</span>
	{/if}
	<div class="wabi-toggle__track" class:wabi-toggle__track--checked={checked}>
		<input type="checkbox" bind:checked />
		<div class="wabi-toggle__stone"></div>
	</div>
</label>

<style>
	.wabi-toggle {
		display: inline-flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
		cursor: pointer;
	}

	.wabi-toggle__label {
		font-family: {{.Style.FontSecondary}};
		color: {{.Style.Colors.Text}};
	}

	.wabi-toggle__track {
		position: relative;
		width: 50px;
		height: 26px;
		background: {{.Style.Colors.TextMuted}}44;
		border-radius: 13px;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-toggle__track--checked {
		background: {{.Style.Colors.Safe}};
	}

	.wabi-toggle__track input {
		position: absolute;
		opacity: 0;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.wabi-toggle__stone {
		position: absolute;
		top: 1px;
		left: 1px;
		width: 24px;
		height: 24px;
		background: {{.Style.Colors.Surface}};
		border-radius: 50%;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-toggle__track--checked .wabi-toggle__stone {
		left: 25px;
	}
</style>`,
	}

	// BADGE - Status indicator
	e.Templates["Badge"] = ComponentTemplate{
		Name:        "Badge",
		Category:    "display",
		Description: "Status badge with regime colors",
		CSSVars:     []string{"--color-danger", "--color-safe", "--color-gold"},
		Props: []PropDefinition{
			{Name: "variant", Type: "string", Default: "default", MathBinding: "", Description: "Badge variant"},
			{Name: "label", Type: "string", Default: "", MathBinding: "", Description: "Badge text"},
		},
		Template: `<script>
	export let variant = "default";
	export let label = "";

	const variantColors = {
		default: "{{.Style.Colors.Secondary}}",
		success: "{{.Style.Colors.Safe}}",
		warning: "{{.Style.Colors.Gold}}",
		danger: "{{.Style.Colors.Danger}}",
		// Three-regime mapping!
		r1: "{{.Style.Colors.Danger}}",   // Exploration
		r2: "{{.Style.Colors.Gold}}",     // Optimization
		r3: "{{.Style.Colors.Safe}}"      // Stabilization
	};
</script>

<span
	class="wabi-badge"
	style="--badge-color: {variantColors[variant] || variantColors.default}"
>
	{label}
</span>

<style>
	.wabi-badge {
		display: inline-flex;
		align-items: center;
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		background: var(--badge-color);
		color: {{.Style.Colors.Background}};
		border-radius: {{.Style.BorderRadius}}px;
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
</style>`,
	}

	// Load advanced Gemini-inspired templates
	e.loadAdvancedTemplates()
}

// loadAdvancedTemplates adds Da Vinci Atelier advanced components
func (e *ComponentAlchemyEngine) loadAdvancedTemplates() {
	// SHOJI MODAL - Japanese sliding door aesthetic
	e.Templates["ShojiModal"] = ComponentTemplate{
		Name:        "ShojiModal",
		Category:    "modal",
		Description: "Japanese screen modal with paper texture and sliding animation",
		CSSVars:     []string{"--color-surface", "--color-text", "--border-radius"},
		Props: []PropDefinition{
			{Name: "title", Type: "string", Default: "", MathBinding: "", Description: "Modal title"},
			{Name: "open", Type: "boolean", Default: "false", MathBinding: "", Description: "Modal visibility"},
		},
		Animations: []AnimDefinition{
			{Name: "slide", Type: "slide", FreqParam: "transitionDuration", AmpParam: ""},
		},
		Template: `<script>
	import { fade, fly } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	export let title = "{{.Props.Title}}";
	export let open = false;

	function closeModal() {
		open = false;
	}
</script>

{#if open}
<div class="shoji-backdrop" transition:fade={{duration: {{.Style.TransitionDuration}}}} on:click={closeModal}>
	<div
		class="shoji-modal"
		transition:fly={{x: '100%', duration: {{multiply .Style.TransitionDuration 2}}, easing: elasticOut}}
		on:click|stopPropagation
	>
		<!-- Paper texture grid -->
		<div class="shoji-grid"></div>

		<!-- Paper noise texture -->
		<svg class="shoji-texture" width="0" height="0">
			<defs>
				<filter id="paper-noise-{{.Style.Seed}}">
					<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
				</filter>
			</defs>
		</svg>

		<button class="shoji-close" on:click={closeModal}>×</button>

		<div class="shoji-content">
			{#if title}
			<h2>{title}</h2>
			{/if}
			<slot />
		</div>
	</div>
</div>
{/if}

<style>
	.shoji-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(13, 13, 13, 0.618);
		backdrop-filter: blur(8px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9000;
	}

	.shoji-modal {
		position: relative;
		background: {{.Style.Colors.Surface}};
		border: 8px solid {{.Style.Colors.TextMuted}};
		border-radius: {{.Style.BorderRadius}}px;
		max-width: 610px;
		width: 87.532%;
		max-height: 80vh;
		overflow: hidden;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
	}

	.shoji-grid {
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient({{.Style.Colors.TextMuted}} 2px, transparent 2px),
			linear-gradient(90deg, {{.Style.Colors.TextMuted}} 2px, transparent 2px);
		background-size: 100px 100px;
		opacity: 0.1;
		pointer-events: none;
		filter: url(#paper-noise-{{.Style.Seed}});
	}

	.shoji-texture {
		position: absolute;
		width: 0;
		height: 0;
	}

	.shoji-close {
		position: absolute;
		top: {{index .Style.SpacingScale 2}}px;
		right: {{index .Style.SpacingScale 2}}px;
		width: 34px;
		height: 34px;
		border: none;
		background: transparent;
		color: {{.Style.Colors.Text}};
		font-size: 24px;
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
		z-index: 10;
	}

	.shoji-close:hover {
		background: {{.Style.Colors.Background}};
		border-radius: 50%;
	}

	.shoji-content {
		position: relative;
		z-index: 1;
		padding: {{index .Style.SpacingScale 3}}px;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
		overflow-y: auto;
		max-height: calc(80vh - {{multiply (index .Style.SpacingScale 3) 2}}px);
	}

	.shoji-content h2 {
		font-family: {{.Style.FontPrimary}};
		margin-bottom: {{index .Style.SpacingScale 2}}px;
	}
</style>`,
	}

	// FALLING LEAF TOAST - Nature-inspired notification
	e.Templates["FallingLeafToast"] = ComponentTemplate{
		Name:        "FallingLeafToast",
		Category:    "toast",
		Description: "Toast that falls like a leaf with random sway",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text"},
		Props: []PropDefinition{
			{Name: "message", Type: "string", Default: "", MathBinding: "", Description: "Toast message"},
			{Name: "type", Type: "string", Default: "info", MathBinding: "", Description: "Toast type"},
			{Name: "duration", Type: "number", Default: "5000", MathBinding: "", Description: "Display duration"},
		},
		Template: `<script>
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let message = "{{.Props.Message}}";
	export let type = "info";
	export let duration = 5000;

	let visible = true;

	// Random sway offset for each toast
	const swayOffset = (Math.random() - 0.5) * 100;

	// Auto-dismiss
	setTimeout(() => visible = false, duration);

	const typeColors = {
		info: "{{.Style.Colors.Secondary}}",
		success: "{{.Style.Colors.Safe}}",
		warning: "{{.Style.Colors.Gold}}",
		error: "{{.Style.Colors.Danger}}"
	};
</script>

{#if visible}
<div
	class="leaf-toast leaf-toast--{type}"
	transition:fly={{
		y: -100,
		x: swayOffset,
		duration: {{multiply .Style.TransitionDuration 3}},
		easing: quintOut
	}}
	style="--toast-color: {typeColors[type]}"
>
	<div class="leaf-toast__content">
		{message}
	</div>
	<button class="leaf-toast__close" on:click={() => visible = false}>×</button>

	<!-- Progress bar -->
	<div class="leaf-toast__progress" style="animation-duration: {duration}ms"></div>
</div>
{/if}

<style>
	.leaf-toast {
		position: fixed;
		top: {{index .Style.SpacingScale 2}}px;
		right: {{index .Style.SpacingScale 2}}px;
		max-width: 377px;
		background: {{.Style.Colors.Surface}};
		border-left: 4px solid var(--toast-color);
		border-radius: {{.Style.BorderRadius}}px;
		box-shadow: 0 8px 34px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		z-index: 9999;
		/* Leaf-like sway animation */
		animation: leafSway {{multiply .Style.TransitionDuration 10}}ms ease-in-out infinite;
	}

	@keyframes leafSway {
		0%, 100% { transform: rotate(0deg) translateX(0); }
		25% { transform: rotate({{multiply .Style.Energy 2}}deg) translateX(3px); }
		75% { transform: rotate({{multiply .Style.Energy -2}}deg) translateX(-3px); }
	}

	.leaf-toast__content {
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
		padding-right: 50px;
	}

	.leaf-toast__close {
		position: absolute;
		top: {{index .Style.SpacingScale 1}}px;
		right: {{index .Style.SpacingScale 1}}px;
		width: 34px;
		height: 34px;
		border: none;
		background: transparent;
		color: {{.Style.Colors.TextMuted}};
		font-size: 20px;
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.leaf-toast__close:hover {
		background: {{.Style.Colors.Background}};
		color: {{.Style.Colors.Text}};
		border-radius: 50%;
	}

	.leaf-toast__progress {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 3px;
		background: var(--toast-color);
		animation: toastProgress linear forwards;
		transform-origin: left;
	}

	@keyframes toastProgress {
		from { transform: scaleX(1); }
		to { transform: scaleX(0); }
	}
</style>`,
	}

	// HOLO CARD - 3D holographic card with spring physics
	e.Templates["HoloCard"] = ComponentTemplate{
		Name:        "HoloCard",
		Category:    "display",
		Description: "3D tilt card with holographic effect",
		CSSVars:     []string{"--color-surface", "--color-text", "--shadow-depth"},
		Props: []PropDefinition{
			{Name: "title", Type: "string", Default: "", MathBinding: "", Description: "Card title"},
			{Name: "interactive", Type: "boolean", Default: "true", MathBinding: "", Description: "Enable 3D tilt"},
		},
		Template: `<script>
	export let title = "{{.Props.Title}}";
	export let interactive = true;

	let rotateX = 0;
	let rotateY = 0;
	let isHovering = false;

	function handleMouseMove(e) {
		if (!interactive) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		const centerX = rect.width / 2;
		const centerY = rect.height / 2;

		// Maximum tilt based on energy (0-1 range = 0-20deg)
		const maxTilt = {{multiply .Style.Energy 20}};

		rotateY = ((x - centerX) / centerX) * maxTilt;
		rotateX = ((centerY - y) / centerY) * maxTilt;
	}

	function handleMouseLeave() {
		rotateX = 0;
		rotateY = 0;
		isHovering = false;
	}

	function handleMouseEnter() {
		isHovering = true;
	}
</script>

<div
	class="holo-card"
	class:holo-card--hovering={isHovering}
	style="transform: perspective(1000px) rotateX({rotateX}deg) rotateY({rotateY}deg)"
	on:mousemove={handleMouseMove}
	on:mouseleave={handleMouseLeave}
	on:mouseenter={handleMouseEnter}
>
	<div class="holo-card__glow"></div>

	{#if title}
	<h3 class="holo-card__title">{title}</h3>
	{/if}

	<div class="holo-card__content">
		<slot />
	</div>
</div>

<style>
	.holo-card {
		position: relative;
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 3}}px;
		transition: transform {{.Style.TransitionDuration}}ms cubic-bezier(0.23, 1, 0.32, 1),
		            box-shadow {{.Style.TransitionDuration}}ms;
		box-shadow: 0 {{multiply .Style.ShadowDepth 4}}px {{multiply .Style.ShadowDepth 8}}px rgba(0,0,0,{{.Style.ShadowDepth}});
		overflow: hidden;
	}

	.holo-card__glow {
		position: absolute;
		inset: -50%;
		background: radial-gradient(
			circle at 50% 50%,
			{{.Style.Colors.Accent}}{{multiply .Style.GlowIntensity 30 | printf "%.0f"}}%,
			transparent 70%
		);
		opacity: 0;
		transition: opacity {{.Style.TransitionDuration}}ms;
		pointer-events: none;
	}

	.holo-card--hovering .holo-card__glow {
		opacity: 1;
	}

	.holo-card:hover {
		box-shadow: 0 {{multiply .Style.ShadowDepth 12}}px {{multiply .Style.ShadowDepth 24}}px rgba(0,0,0,{{multiply .Style.ShadowDepth 1.5}});
	}

	.holo-card__title {
		font-family: {{.Style.FontPrimary}};
		font-size: 1.25rem;
		margin-bottom: {{index .Style.SpacingScale 2}}px;
		color: {{.Style.Colors.Text}};
	}

	.holo-card__content {
		position: relative;
		z-index: 1;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
	}
</style>`,
	}

	// VOID TERMINAL - Cyberpunk terminal with scanlines
	e.Templates["VoidTerminal"] = ComponentTemplate{
		Name:        "VoidTerminal",
		Category:    "display",
		Description: "Cyberpunk-style terminal with scanline effects",
		CSSVars:     []string{"--color-primary", "--color-background", "--color-text"},
		Props: []PropDefinition{
			{Name: "title", Type: "string", Default: "VOID_KERNEL", MathBinding: "", Description: "Terminal title"},
		},
		Template: `<script>
	export let title = "VOID_KERNEL_V0.9";
</script>

<div class="void-terminal">
	<!-- Fog effect -->
	<div class="void-fog"></div>

	<!-- Scanline effect -->
	<div class="void-scanline"></div>

	<div class="void-content">
		<div class="void-header">
			<span class="void-title">{title}</span>
			<div class="void-dots">
				<div class="void-dot void-dot--active"></div>
				<div class="void-dot"></div>
				<div class="void-dot"></div>
			</div>
		</div>

		<div class="void-code">
			<slot />
		</div>

		<div class="void-footer">
			<span>MEM: 0x7F_FF_A2</span>
			<span>UPTIME: {Math.floor(Date.now() / 1000)}s</span>
		</div>
	</div>
</div>

<style>
	.void-terminal {
		position: relative;
		background: {{.Style.Colors.Background}};
		border: 1px solid {{.Style.Colors.Primary}}44;
		border-radius: {{.Style.BorderRadius}}px;
		overflow: hidden;
		font-family: {{.Style.FontMono}};
		box-shadow:
			0 0 {{multiply .Style.GlowIntensity 20}}px {{.Style.Colors.Primary}}22,
			inset 0 0 {{multiply .Style.GlowIntensity 10}}px {{.Style.Colors.Primary}}11;
	}

	.void-fog {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			180deg,
			transparent 0%,
			{{.Style.Colors.Primary}}08 50%,
			transparent 100%
		);
		animation: fogDrift {{multiply .Style.TransitionDuration 20}}ms linear infinite;
		pointer-events: none;
	}

	@keyframes fogDrift {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}

	.void-scanline {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent 0px,
			{{.Style.Colors.Primary}}05 1px,
			transparent 2px
		);
		pointer-events: none;
		animation: scanline {{multiply .Style.TransitionDuration 40}}ms linear infinite;
	}

	@keyframes scanline {
		0% { transform: translateY(0); }
		100% { transform: translateY(8px); }
	}

	.void-content {
		position: relative;
		z-index: 1;
		padding: {{index .Style.SpacingScale 2}}px;
	}

	.void-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: {{index .Style.SpacingScale 1}}px;
		border-bottom: 1px solid {{.Style.Colors.Primary}}44;
		margin-bottom: {{index .Style.SpacingScale 2}}px;
	}

	.void-title {
		color: {{.Style.Colors.Primary}};
		font-size: 0.875rem;
		letter-spacing: 0.1em;
	}

	.void-dots {
		display: flex;
		gap: {{index .Style.SpacingScale 0}}px;
	}

	.void-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: {{.Style.Colors.TextMuted}};
		opacity: 0.3;
	}

	.void-dot--active {
		background: {{.Style.Colors.Primary}};
		opacity: 1;
		animation: dotPulse {{multiply .Style.TransitionDuration 5}}ms ease-in-out infinite;
	}

	@keyframes dotPulse {
		0%, 100% { transform: scale(1); opacity: 1; }
		50% { transform: scale(1.2); opacity: 0.7; }
	}

	.void-code {
		color: {{.Style.Colors.Text}};
		font-size: 0.875rem;
		line-height: 1.5;
		min-height: 100px;
	}

	.void-footer {
		display: flex;
		justify-content: space-between;
		padding-top: {{index .Style.SpacingScale 1}}px;
		border-top: 1px solid {{.Style.Colors.Primary}}44;
		margin-top: {{index .Style.SpacingScale 2}}px;
		font-size: 0.75rem;
		color: {{.Style.Colors.TextMuted}};
	}
</style>`,
	}

	// TEXT BLOOM - Letter-by-letter reveal animation
	e.Templates["TextBloom"] = ComponentTemplate{
		Name:        "TextBloom",
		Category:    "animation",
		Description: "Text that reveals letter by letter",
		CSSVars:     []string{"--color-text", "--color-accent"},
		Props: []PropDefinition{
			{Name: "text", Type: "string", Default: "", MathBinding: "", Description: "Text to animate"},
			{Name: "delayPerChar", Type: "number", Default: "50", MathBinding: "", Description: "Delay between letters (ms)"},
		},
		Template: `<script>
	import { onMount } from 'svelte';

	export let text = "{{.Props.Text}}";
	export let delayPerChar = 50;

	let revealedChars = 0;

	onMount(() => {
		const interval = setInterval(() => {
			if (revealedChars < text.length) {
				revealedChars++;
			} else {
				clearInterval(interval);
			}
		}, delayPerChar);

		return () => clearInterval(interval);
	});
</script>

<span class="text-bloom">
	{#each text.split('') as char, i}
		<span
			class="text-bloom__char"
			class:text-bloom__char--revealed={i < revealedChars}
			style="transition-delay: {i * delayPerChar}ms"
		>
			{char === ' ' ? '\u00A0' : char}
		</span>
	{/each}
</span>

<style>
	.text-bloom {
		display: inline-block;
		font-family: {{.Style.FontPrimary}};
		color: {{.Style.Colors.Text}};
	}

	.text-bloom__char {
		display: inline-block;
		opacity: 0;
		transform: translateY({{multiply .Style.Energy 10}}px);
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	.text-bloom__char--revealed {
		opacity: 1;
		transform: translateY(0);
	}
</style>`,
	}

	// KOTO SLIDER - Musical slider with φ-based knob
	e.Templates["KotoSlider"] = ComponentTemplate{
		Name:        "KotoSlider",
		Category:    "input",
		Description: "Slider with golden ratio knob and musical feel",
		CSSVars:     []string{"--color-primary", "--color-accent", "--color-gold"},
		Props: []PropDefinition{
			{Name: "value", Type: "number", Default: "0", MathBinding: "", Description: "Slider value (0-100)"},
			{Name: "label", Type: "string", Default: "", MathBinding: "", Description: "Slider label"},
		},
		Template: `<script>
	export let value = 50;
	export let label = "{{.Props.Label}}";

	let isDragging = false;

	// φ-based knob size
	const knobSize = {{multiply (index .Style.SpacingScale 2) 1.618}};
</script>

<div class="koto-slider">
	{#if label}
	<label class="koto-slider__label">{label}</label>
	{/if}

	<div class="koto-slider__container">
		<div class="koto-slider__track">
			<div
				class="koto-slider__fill"
				style="width: {value}%"
			></div>
		</div>

		<input
			type="range"
			min="0"
			max="100"
			bind:value
			class="koto-slider__input"
			class:koto-slider__input--dragging={isDragging}
			on:mousedown={() => isDragging = true}
			on:mouseup={() => isDragging = false}
			on:mouseleave={() => isDragging = false}
		/>

		<div
			class="koto-slider__knob"
			style="left: {value}%; width: {knobSize}px; height: {knobSize}px"
			class:koto-slider__knob--dragging={isDragging}
		></div>
	</div>

	<div class="koto-slider__value">{Math.round(value)}</div>
</div>

<style>
	.koto-slider {
		font-family: {{.Style.FontSecondary}};
	}

	.koto-slider__label {
		display: block;
		color: {{.Style.Colors.Text}};
		margin-bottom: {{index .Style.SpacingScale 1}}px;
		font-size: 0.875rem;
	}

	.koto-slider__container {
		position: relative;
		height: {{index .Style.SpacingScale 2}}px;
		margin-bottom: {{index .Style.SpacingScale 1}}px;
	}

	.koto-slider__track {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 100%;
		height: 4px;
		background: {{.Style.Colors.TextMuted}}33;
		border-radius: 2px;
		overflow: hidden;
	}

	.koto-slider__fill {
		height: 100%;
		background: linear-gradient(90deg, {{.Style.Colors.Primary}}, {{.Style.Colors.Accent}});
		transition: width 100ms;
	}

	.koto-slider__input {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
		z-index: 2;
	}

	.koto-slider__knob {
		position: absolute;
		top: 50%;
		transform: translate(-50%, -50%);
		background: {{.Style.Colors.Gold}};
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
		pointer-events: none;
	}

	.koto-slider__knob--dragging {
		transform: translate(-50%, -50%) scale(1.2);
		box-shadow: 0 0 {{multiply .Style.GlowIntensity 20}}px {{.Style.Colors.Gold}};
	}

	.koto-slider__value {
		text-align: right;
		color: {{.Style.Colors.TextMuted}};
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
	}
</style>`,
	}

	// BIOMIMETIC CHART - Nature-inspired data visualization
	e.Templates["BiomimeticChart"] = ComponentTemplate{
		Name:        "BiomimeticChart",
		Category:    "chart",
		Description: "Organic chart with nature-inspired curves",
		CSSVars:     []string{"--color-primary", "--color-secondary", "--color-accent"},
		Props: []PropDefinition{
			{Name: "data", Type: "array", Default: "[]", MathBinding: "", Description: "Chart data points"},
			{Name: "title", Type: "string", Default: "", MathBinding: "", Description: "Chart title"},
		},
		Template: `<script>
	export let data = [];
	export let title = "{{.Props.Title}}";

	// Three-regime color mapping
	const regimeColors = [
		"{{.Style.Colors.Danger}}",  // R1: Exploration
		"{{.Style.Colors.Gold}}",    // R2: Optimization
		"{{.Style.Colors.Safe}}"     // R3: Stabilization
	];

	// Generate SVG path with smooth curves
	function generatePath(points, width, height) {
		if (points.length < 2) return '';

		const maxVal = Math.max(...points);
		const normalized = points.map(v => (v / maxVal) * height * 0.8);

		let path = "M 0," + (height - normalized[0]);

		for (let i = 1; i < points.length; i++) {
			const x = (i / (points.length - 1)) * width;
			const y = height - normalized[i];
			const prevX = ((i - 1) / (points.length - 1)) * width;
			const prevY = height - normalized[i - 1];

			// Smooth Bezier curves
			const cpX = (x + prevX) / 2;
			path += " Q " + cpX + "," + prevY + " " + x + "," + y;
		}

		return path;
	}

	// Determine regime based on value
	function getRegimeColor(value, max) {
		const ratio = value / max;
		if (ratio < 0.3) return regimeColors[0];
		if (ratio < 0.5) return regimeColors[1];
		return regimeColors[2];
	}

	$: chartWidth = 400;
	$: chartHeight = 200;
	$: pathData = generatePath(data, chartWidth, chartHeight);
	$: maxValue = Math.max(...data);
</script>

<div class="bio-chart">
	{#if title}
	<h3 class="bio-chart__title">{title}</h3>
	{/if}

	<svg class="bio-chart__svg" viewBox="0 0 {chartWidth} {chartHeight}" preserveAspectRatio="none">
		<!-- Grid lines -->
		<g class="bio-chart__grid">
			{#each [0, 0.25, 0.5, 0.75, 1.0] as line}
			<line
				x1="0"
				y1={chartHeight * line}
				x2={chartWidth}
				y2={chartHeight * line}
				stroke="{{.Style.Colors.TextMuted}}"
				stroke-width="1"
				opacity="0.1"
			/>
			{/each}
		</g>

		<!-- Area under curve -->
		<path
			d="{pathData} L {chartWidth},{chartHeight} L 0,{chartHeight} Z"
			fill="url(#gradient-{{.Style.Seed}})"
			opacity="0.3"
		/>

		<!-- Line path -->
		<path
			d={pathData}
			fill="none"
			stroke="{{.Style.Colors.Primary}}"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Data points -->
		{#each data as point, i}
		{@const x = (i / (data.length - 1)) * chartWidth}
		{@const y = chartHeight - (point / maxValue) * chartHeight * 0.8}
		<circle
			cx={x}
			cy={y}
			r="{{multiply .Style.BorderRadius 0.5}}"
			fill={getRegimeColor(point, maxValue)}
			stroke="{{.Style.Colors.Surface}}"
			stroke-width="2"
		/>
		{/each}

		<!-- Gradient definition -->
		<defs>
			<linearGradient id="gradient-{{.Style.Seed}}" x1="0%" y1="0%" x2="0%" y2="100%">
				<stop offset="0%" stop-color="{{.Style.Colors.Primary}}" />
				<stop offset="100%" stop-color="{{.Style.Colors.Accent}}" />
			</linearGradient>
		</defs>
	</svg>
</div>

<style>
	.bio-chart {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 2}}px;
	}

	.bio-chart__title {
		font-family: {{.Style.FontPrimary}};
		color: {{.Style.Colors.Text}};
		margin-bottom: {{index .Style.SpacingScale 2}}px;
		font-size: 1rem;
	}

	.bio-chart__svg {
		width: 100%;
		height: auto;
		display: block;
	}
</style>`,
	}

	// DROPDOWN - Origami-fold dropdown menu
	e.Templates["Dropdown"] = ComponentTemplate{
		Name:        "Dropdown",
		Category:    "input",
		Description: "Dropdown that unfolds like origami",
		CSSVars:     []string{"--color-surface", "--color-text", "--border-radius"},
		Props: []PropDefinition{
			{Name: "options", Type: "array", Default: "[]", MathBinding: "", Description: "Dropdown options"},
			{Name: "placeholder", Type: "string", Default: "Select", MathBinding: "", Description: "Placeholder text"},
		},
		Template: `<script>
	import { scale, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let options = [];
	export let placeholder = "Select...";
	export let value = null;

	let isOpen = false;

	function toggleOpen() {
		isOpen = !isOpen;
	}

	function selectOption(option) {
		value = option;
		isOpen = false;
	}
</script>

<div class="dropdown">
	<button
		class="dropdown__trigger"
		class:dropdown__trigger--open={isOpen}
		on:click={toggleOpen}
	>
		<span>{value || placeholder}</span>
		<span class="dropdown__arrow" class:dropdown__arrow--open={isOpen}>▼</span>
	</button>

	{#if isOpen}
	<div
		class="dropdown__menu"
		transition:fly={{y: -10, duration: {{.Style.TransitionDuration}}, easing: quintOut}}
	>
		{#each options as option, i}
		<button
			class="dropdown__item"
			style="transition-delay: {i * 50}ms"
			on:click={() => selectOption(option)}
		>
			{option}
		</button>
		{/each}
	</div>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
		width: 100%;
	}

	.dropdown__trigger {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		background: {{.Style.Colors.Surface}};
		border: 1px solid {{.Style.Colors.TextMuted}};
		border-radius: {{.Style.BorderRadius}}px;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.dropdown__trigger:hover {
		border-color: {{.Style.Colors.Primary}};
	}

	.dropdown__trigger--open {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}

	.dropdown__arrow {
		transition: transform {{.Style.TransitionDuration}}ms;
		font-size: 0.75rem;
		color: {{.Style.Colors.TextMuted}};
	}

	.dropdown__arrow--open {
		transform: rotate(180deg);
	}

	.dropdown__menu {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: {{.Style.Colors.Surface}};
		border: 1px solid {{.Style.Colors.Primary}};
		border-top: none;
		border-bottom-left-radius: {{.Style.BorderRadius}}px;
		border-bottom-right-radius: {{.Style.BorderRadius}}px;
		box-shadow: 0 8px 34px rgba(0, 0, 0, 0.2);
		z-index: 100;
		overflow: hidden;
	}

	.dropdown__item {
		width: 100%;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		background: transparent;
		border: none;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
		text-align: left;
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
		opacity: 0;
		transform: translateY(-10px);
		animation: dropdownItemReveal {{.Style.TransitionDuration}}ms forwards;
	}

	@keyframes dropdownItemReveal {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown__item:hover {
		background: {{.Style.Colors.Primary}}22;
		color: {{.Style.Colors.Primary}};
	}
</style>`,
	}

	// TABS - Sacred geometry tabs
	e.Templates["Tabs"] = ComponentTemplate{
		Name:        "Tabs",
		Category:    "navigation",
		Description: "Tabs with SLERP-based selection indicator",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text"},
		Props: []PropDefinition{
			{Name: "tabs", Type: "array", Default: "[]", MathBinding: "", Description: "Tab labels"},
		},
		Template: `<script>
	export let tabs = ["Tab 1", "Tab 2", "Tab 3"];
	export let activeIndex = 0;

	let tabElements = [];
	let indicatorStyle = '';

	function selectTab(index) {
		activeIndex = index;
		updateIndicator();
	}

	function updateIndicator() {
		if (tabElements[activeIndex]) {
			const tab = tabElements[activeIndex];
			const width = tab.offsetWidth;
			const left = tab.offsetLeft;
			indicatorStyle = "width: " + width + "px; left: " + left + "px";
		}
	}

	$: if (tabElements.length > 0) {
		updateIndicator();
	}
</script>

<div class="tabs">
	<div class="tabs__header">
		{#each tabs as tab, i}
		<button
			bind:this={tabElements[i]}
			class="tabs__tab"
			class:tabs__tab--active={i === activeIndex}
			on:click={() => selectTab(i)}
		>
			{tab}
		</button>
		{/each}

		<div class="tabs__indicator" style={indicatorStyle}></div>
	</div>

	<div class="tabs__content">
		<slot name="tab-{activeIndex}">
			<p>Content for {tabs[activeIndex]}</p>
		</slot>
	</div>
</div>

<style>
	.tabs {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		overflow: hidden;
	}

	.tabs__header {
		position: relative;
		display: flex;
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}33;
	}

	.tabs__tab {
		flex: 1;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		background: transparent;
		border: none;
		color: {{.Style.Colors.TextMuted}};
		font-family: {{.Style.FontPrimary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
		position: relative;
	}

	.tabs__tab:hover {
		color: {{.Style.Colors.Text}};
		background: {{.Style.Colors.Background}}44;
	}

	.tabs__tab--active {
		color: {{.Style.Colors.Primary}};
	}

	.tabs__indicator {
		position: absolute;
		bottom: 0;
		height: 2px;
		background: {{.Style.Colors.Primary}};
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}

	.tabs__content {
		padding: {{index .Style.SpacingScale 2}}px;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
	}
</style>`,
	}

	// TABLE - Data table with three-regime row coloring
	e.Templates["Table"] = ComponentTemplate{
		Name:        "Table",
		Category:    "data",
		Description: "Table with regime-based row highlighting",
		CSSVars:     []string{"--color-surface", "--color-text", "--color-danger", "--color-gold", "--color-safe"},
		Props: []PropDefinition{
			{Name: "headers", Type: "array", Default: "[]", MathBinding: "", Description: "Table headers"},
			{Name: "rows", Type: "array", Default: "[]", MathBinding: "", Description: "Table rows"},
		},
		Template: `<script>
	export let headers = [];
	export let rows = [];

	// Regime detection based on value patterns
	function detectRegime(row) {
		// Placeholder logic - customize based on data
		const avgValue = row.reduce((sum, val) => sum + (parseFloat(val) || 0), 0) / row.length;
		if (avgValue < 30) return 'r1'; // Exploration
		if (avgValue < 70) return 'r2'; // Optimization
		return 'r3'; // Stabilization
	}
</script>

<div class="data-table">
	<table class="data-table__table">
		<thead class="data-table__head">
			<tr>
				{#each headers as header}
				<th class="data-table__header">{header}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="data-table__body">
			{#each rows as row, i}
			{@const regime = detectRegime(row)}
			<tr class="data-table__row data-table__row--{regime}">
				{#each row as cell}
				<td class="data-table__cell">{cell}</td>
				{/each}
			</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.data-table {
		width: 100%;
		overflow-x: auto;
		border-radius: {{.Style.BorderRadius}}px;
		background: {{.Style.Colors.Surface}};
	}

	.data-table__table {
		width: 100%;
		border-collapse: collapse;
		font-family: {{.Style.FontSecondary}};
	}

	.data-table__head {
		background: {{.Style.Colors.Background}};
	}

	.data-table__header {
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		text-align: left;
		font-family: {{.Style.FontPrimary}};
		font-weight: 600;
		color: {{.Style.Colors.Text}};
		border-bottom: 2px solid {{.Style.Colors.TextMuted}}33;
	}

	.data-table__row {
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.data-table__row:hover {
		background: {{.Style.Colors.Background}}22;
	}

	.data-table__row--r1 {
		border-left: 3px solid {{.Style.Colors.Danger}};
	}

	.data-table__row--r2 {
		border-left: 3px solid {{.Style.Colors.Gold}};
	}

	.data-table__row--r3 {
		border-left: 3px solid {{.Style.Colors.Safe}};
	}

	.data-table__cell {
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		color: {{.Style.Colors.Text}};
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}11;
	}
</style>`,
	}
}

// GenerateComponent creates a component from template and style
func (e *ComponentAlchemyEngine) GenerateComponent(
	templateName string,
	seed int,
	season style_alchemy.Season,
	intent style_alchemy.Intent,
) (*GeneratedComponent, error) {
	tmpl, ok := e.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("template not found: %s", templateName)
	}

	// Generate style from mathematical parameters
	style := style_alchemy.GenerateVariation(seed, season, intent)

	// Generate unique component name
	componentName := fmt.Sprintf("%s_%s_%s_%d",
		templateName,
		season.String(),
		intent.String(),
		seed)

	// Prepare template data
	data := struct {
		Style style_alchemy.StyleContext
		Props map[string]interface{}
	}{
		Style: style,
		Props: make(map[string]interface{}),
	}

	// Set default props
	for _, prop := range tmpl.Props {
		data.Props[prop.Name] = prop.Default
	}

	// Create template functions
	funcMap := template.FuncMap{
		"multiply": func(a, b float64) float64 { return a * b },
		"add":      func(a, b float64) float64 { return a + b },
		"gt":       func(a, b float64) bool { return a > b },
		"lt":       func(a, b float64) bool { return a < b },
	}

	// Parse and execute template
	t, err := template.New(templateName).Funcs(funcMap).Parse(tmpl.Template)
	if err != nil {
		return nil, fmt.Errorf("template parse error: %w", err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return nil, fmt.Errorf("template execution error: %w", err)
	}

	return &GeneratedComponent{
		Name:        componentName,
		FileName:    componentName + ".svelte",
		Code:        buf.String(),
		CSS:         style.ToCSS(),
		Style:       style,
		Seed:        seed,
		Category:    tmpl.Category,
		Description: tmpl.Description,
	}, nil
}

// GenerateLibrary creates a full component library
func (e *ComponentAlchemyEngine) GenerateLibrary(
	startSeed int,
	seasons []style_alchemy.Season,
	intents []style_alchemy.Intent,
	seedCount int,
) ([]*GeneratedComponent, error) {
	var components []*GeneratedComponent

	for _, tmplName := range e.GetTemplateNames() {
		for _, season := range seasons {
			for _, intent := range intents {
				for i := 0; i < seedCount; i++ {
					// Golden ratio distribution of seeds
					seed := startSeed + int(float64(i)*style_alchemy.PHI*1000)%10000

					comp, err := e.GenerateComponent(tmplName, seed, season, intent)
					if err != nil {
						continue
					}
					components = append(components, comp)
				}
			}
		}
	}

	return components, nil
}

// GetTemplateNames returns all available template names
func (e *ComponentAlchemyEngine) GetTemplateNames() []string {
	names := make([]string, 0, len(e.Templates))
	for name := range e.Templates {
		names = append(names, name)
	}
	return names
}

// WriteComponent saves a component to disk
func (e *ComponentAlchemyEngine) WriteComponent(comp *GeneratedComponent) error {
	// Create output directory structure
	dir := filepath.Join(e.OutputDir, comp.Category)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	// Write Svelte file
	path := filepath.Join(dir, comp.FileName)
	return os.WriteFile(path, []byte(comp.Code), 0644)
}

// WriteLibrary saves entire library to disk
func (e *ComponentAlchemyEngine) WriteLibrary(components []*GeneratedComponent) error {
	for _, comp := range components {
		if err := e.WriteComponent(comp); err != nil {
			return err
		}
	}

	// Write index file
	index := e.generateIndexFile(components)
	indexPath := filepath.Join(e.OutputDir, "index.ts")
	if err := os.WriteFile(indexPath, []byte(index), 0644); err != nil {
		return err
	}

	// Write manifest
	manifest, _ := json.MarshalIndent(components, "", "  ")
	manifestPath := filepath.Join(e.OutputDir, "manifest.json")
	return os.WriteFile(manifestPath, manifest, 0644)
}

// generateIndexFile creates TypeScript barrel export
func (e *ComponentAlchemyEngine) generateIndexFile(components []*GeneratedComponent) string {
	var sb strings.Builder
	sb.WriteString("// Auto-generated by Component Alchemy Engine\n")
	sb.WriteString("// DO NOT EDIT - Generated via mathematical transformation!\n\n")

	categories := make(map[string][]string)
	for _, comp := range components {
		categories[comp.Category] = append(categories[comp.Category], comp.Name)
	}

	for category, names := range categories {
		sb.WriteString(fmt.Sprintf("// === %s ===\n", strings.ToUpper(category)))
		for _, name := range names {
			sb.WriteString(fmt.Sprintf("export { default as %s } from './%s/%s.svelte';\n",
				name, category, name))
		}
		sb.WriteString("\n")
	}

	return sb.String()
}

// Stats returns generation statistics
func (e *ComponentAlchemyEngine) Stats() map[string]interface{} {
	return map[string]interface{}{
		"templates":  len(e.Templates),
		"categories": e.getCategories(),
		"cssVars":    e.getAllCSSVars(),
	}
}

func (e *ComponentAlchemyEngine) getCategories() []string {
	cats := make(map[string]bool)
	for _, tmpl := range e.Templates {
		cats[tmpl.Category] = true
	}
	result := make([]string, 0, len(cats))
	for cat := range cats {
		result = append(result, cat)
	}
	return result
}

func (e *ComponentAlchemyEngine) getAllCSSVars() []string {
	vars := make(map[string]bool)
	for _, tmpl := range e.Templates {
		for _, v := range tmpl.CSSVars {
			vars[v] = true
		}
	}
	result := make([]string, 0, len(vars))
	for v := range vars {
		result = append(result, v)
	}
	return result
}
