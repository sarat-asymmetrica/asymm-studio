// Package component_alchemy - LAYOUT TEMPLATE DEFINITIONS!
//
// THE VISION: Define reusable layout templates that pages can use!
//
// Layouts = structural patterns (centered, dashboard, landing, etc.)
// Pages = content that fills the layouts
//
// Built with Love × Simplicity × Truth × Joy × REUSABLE LAYOUTS!

package component_alchemy

import (
	"bytes"
	"fmt"
	"text/template"

	"asymm_mathematical_organism/03_ENGINES/style_alchemy"
)

// LayoutTemplate defines a structural pattern
type LayoutTemplate struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Template    string   `json:"template"`
	Slots       []string `json:"slots"` // Available content slots
	CSSClass    string   `json:"cssClass"`
}

// LayoutLibrary holds all available layouts
type LayoutLibrary struct {
	Templates map[string]LayoutTemplate
}

// NewLayoutLibrary creates the layout library
func NewLayoutLibrary() *LayoutLibrary {
	lib := &LayoutLibrary{
		Templates: make(map[string]LayoutTemplate),
	}
	lib.loadBuiltInLayouts()
	return lib
}

// loadBuiltInLayouts initializes the core layout templates
func (l *LayoutLibrary) loadBuiltInLayouts() {
	// CENTERED LAYOUT - Login, forms, simple pages
	l.Templates["centered"] = LayoutTemplate{
		Name:        "Centered",
		Description: "Centered content with max-width constraint",
		CSSClass:    "layout-centered",
		Slots:       []string{"content"},
		Template: `<div class="layout-centered">
	<main class="layout-centered__content">
		<slot name="content" />
	</main>
</div>

<style>
	.layout-centered {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: {{index .Style.SpacingScale 3}}px;
		background: {{.Style.Colors.Background}};
	}

	.layout-centered__content {
		width: 100%;
		max-width: 480px;
	}
</style>`,
	}

	// DEFAULT LAYOUT - Header + main content
	l.Templates["default"] = LayoutTemplate{
		Name:        "Default",
		Description: "Standard layout with header and main content area",
		CSSClass:    "layout-default",
		Slots:       []string{"header", "main"},
		Template: `<div class="layout-default">
	<header class="layout-default__header">
		<slot name="header">
			<h1>{{.PageTitle}}</h1>
		</slot>
	</header>

	<main class="layout-default__main">
		<slot name="main" />
	</main>
</div>

<style>
	.layout-default {
		min-height: 100vh;
		background: {{.Style.Colors.Background}};
	}

	.layout-default__header {
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		background: {{.Style.Colors.Surface}};
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
	}

	.layout-default__header h1 {
		margin: 0;
		font-family: {{.Style.FontPrimary}};
		color: {{.Style.Colors.Text}};
	}

	.layout-default__main {
		padding: {{index .Style.SpacingScale 3}}px;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>`,
	}

	// DASHBOARD LAYOUT - Sidebar + main with header
	l.Templates["dashboard"] = LayoutTemplate{
		Name:        "Dashboard",
		Description: "Dashboard with sidebar navigation and main content",
		CSSClass:    "layout-dashboard",
		Slots:       []string{"header", "sidebar", "main"},
		Template: `<div class="layout-dashboard">
	<header class="layout-dashboard__header">
		<slot name="header">
			<h1>{{.PageTitle}}</h1>
		</slot>
	</header>

	<div class="layout-dashboard__body">
		<aside class="layout-dashboard__sidebar">
			<slot name="sidebar" />
		</aside>

		<main class="layout-dashboard__main">
			<slot name="main" />
		</main>
	</div>
</div>

<style>
	.layout-dashboard {
		min-height: 100vh;
		display: grid;
		grid-template-rows: auto 1fr;
		background: {{.Style.Colors.Background}};
	}

	.layout-dashboard__header {
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		background: {{.Style.Colors.Surface}};
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
	}

	.layout-dashboard__header h1 {
		margin: 0;
		font-family: {{.Style.FontPrimary}};
		color: {{.Style.Colors.Text}};
	}

	.layout-dashboard__body {
		display: grid;
		grid-template-columns: 250px 1fr;
	}

	.layout-dashboard__sidebar {
		background: {{.Style.Colors.Surface}};
		border-right: 1px solid {{.Style.Colors.TextMuted}}22;
		padding: {{index .Style.SpacingScale 2}}px;
	}

	.layout-dashboard__main {
		padding: {{index .Style.SpacingScale 3}}px;
	}
</style>`,
	}

	// LANDING LAYOUT - Full-width hero + sections
	l.Templates["landing"] = LayoutTemplate{
		Name:        "Landing",
		Description: "Landing page with hero and content sections",
		CSSClass:    "layout-landing",
		Slots:       []string{"hero", "content"},
		Template: `<div class="layout-landing">
	<section class="layout-landing__hero">
		<slot name="hero" />
	</section>

	<section class="layout-landing__content">
		<slot name="content" />
	</section>
</div>

<style>
	.layout-landing {
		background: {{.Style.Colors.Background}};
	}

	.layout-landing__hero {
		min-height: 80vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: {{index .Style.SpacingScale 4}}px {{index .Style.SpacingScale 3}}px;
		background: linear-gradient(
			135deg,
			{{.Style.Colors.Background}},
			{{.Style.Colors.Surface}}
		);
	}

	.layout-landing__content {
		padding: {{index .Style.SpacingScale 5}}px {{index .Style.SpacingScale 3}}px;
		max-width: 1200px;
		margin: 0 auto;
	}
</style>`,
	}

	// TWO-COLUMN LAYOUT - Sidebar + content
	l.Templates["two-column"] = LayoutTemplate{
		Name:        "TwoColumn",
		Description: "Two-column layout with sidebar",
		CSSClass:    "layout-two-column",
		Slots:       []string{"sidebar", "main"},
		Template: `<div class="layout-two-column">
	<aside class="layout-two-column__sidebar">
		<slot name="sidebar" />
	</aside>

	<main class="layout-two-column__main">
		<slot name="main" />
	</main>
</div>

<style>
	.layout-two-column {
		display: grid;
		grid-template-columns: 250px 1fr;
		min-height: 100vh;
		background: {{.Style.Colors.Background}};
	}

	.layout-two-column__sidebar {
		background: {{.Style.Colors.Surface}};
		border-right: 1px solid {{.Style.Colors.TextMuted}}22;
		padding: {{index .Style.SpacingScale 3}}px;
	}

	.layout-two-column__main {
		padding: {{index .Style.SpacingScale 3}}px;
		max-width: 800px;
	}
</style>`,
	}

	// SPLIT LAYOUT - 50/50 split (auth pages, comparisons)
	l.Templates["split"] = LayoutTemplate{
		Name:        "Split",
		Description: "50/50 split layout for dual content",
		CSSClass:    "layout-split",
		Slots:       []string{"left", "right"},
		Template: `<div class="layout-split">
	<div class="layout-split__left">
		<slot name="left" />
	</div>

	<div class="layout-split__right">
		<slot name="right" />
	</div>
</div>

<style>
	.layout-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		min-height: 100vh;
	}

	.layout-split__left {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: {{index .Style.SpacingScale 4}}px;
		background: {{.Style.Colors.Background}};
	}

	.layout-split__right {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: {{index .Style.SpacingScale 4}}px;
		background: {{.Style.Colors.Surface}};
	}

	@media (max-width: 768px) {
		.layout-split {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}
	}
</style>`,
	}
}

// RenderLayout renders a layout template with style context
func (l *LayoutLibrary) RenderLayout(
	layoutName string,
	style style_alchemy.StyleContext,
	pageTitle string,
) (string, error) {
	tmpl, ok := l.Templates[layoutName]
	if !ok {
		return "", fmt.Errorf("layout not found: %s", layoutName)
	}

	// Prepare template data
	data := struct {
		Style     style_alchemy.StyleContext
		PageTitle string
	}{
		Style:     style,
		PageTitle: pageTitle,
	}

	// Create template functions
	funcMap := template.FuncMap{
		"multiply": func(a, b float64) float64 { return a * b },
		"add":      func(a, b float64) float64 { return a + b },
	}

	// Parse and execute template
	t, err := template.New(layoutName).Funcs(funcMap).Parse(tmpl.Template)
	if err != nil {
		return "", fmt.Errorf("template parse error: %w", err)
	}

	var buf bytes.Buffer
	if err := t.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("template execution error: %w", err)
	}

	return buf.String(), nil
}

// GetLayoutNames returns all available layout names
func (l *LayoutLibrary) GetLayoutNames() []string {
	names := make([]string, 0, len(l.Templates))
	for name := range l.Templates {
		names = append(names, name)
	}
	return names
}

// GetLayoutSlots returns the slot names for a layout
func (l *LayoutLibrary) GetLayoutSlots(layoutName string) []string {
	if tmpl, ok := l.Templates[layoutName]; ok {
		return tmpl.Slots
	}
	return nil
}

// WrapPageInLayout wraps page content in a layout
func (l *LayoutLibrary) WrapPageInLayout(
	pageContent string,
	layoutName string,
	style style_alchemy.StyleContext,
	pageTitle string,
) (string, error) {
	layoutHTML, err := l.RenderLayout(layoutName, style, pageTitle)
	if err != nil {
		return "", err
	}

	// Simple slot replacement (in production, use proper Svelte slot mechanism)
	// This is a simplified version - real implementation would preserve slots
	wrapped := fmt.Sprintf(`<!-- Layout: %s -->
%s

<!-- Page Content -->
%s
`, layoutName, layoutHTML, pageContent)

	return wrapped, nil
}
