// Package component_alchemy - APPLICATION GENERATOR ENGINE!
//
// THE DEATH OF MANUAL APP CREATION, THE BIRTH OF MATHEMATICAL GENERATION!
//
// Generate COMPLETE, RUNNABLE APPLICATIONS from a single seed:
//   App = f(seed, season, intent, template)
//
// Same seed = Same app EVERYWHERE, FOREVER!
// Different seed = Harmonically related variant!
//
// Built with Love × Simplicity × Truth × Joy × INFINITE APPLICATIONS!

package component_alchemy

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	// "text/template" // Unused for now

	"asymm_mathematical_organism/03_ENGINES/style_alchemy"
)

// AppPageSpec defines a single page in the complete app
type AppPageSpec struct {
	Name        string            `json:"name"`
	Route       string            `json:"route"`        // e.g., "/dashboard"
	Title       string            `json:"title"`        // Page title
	Template    string            `json:"template"`     // Svelte template
	Components  []string          `json:"components"`   // Component templates to include
	Layout      string            `json:"layout"`       // Layout structure
	Protected   bool              `json:"protected"`    // Requires auth?
	Metadata    map[string]string `json:"metadata"`     // SEO, meta tags
}

// AppTemplate defines a complete application
type AppTemplate struct {
	Name         string                   `json:"name"`
	Description  string                   `json:"description"`
	Pages        []AppPageSpec            `json:"pages"`
	Routes       map[string]string        `json:"routes"`        // Route mappings
	SharedLayout string                   `json:"sharedLayout"`  // Root layout
	Navigation   []AppNavItem             `json:"navigation"`    // Nav structure
	GlobalCSS    string                   `json:"globalCSS"`     // App-wide styles
	Config       map[string]interface{}   `json:"config"`        // App configuration
}

// AppNavItem represents a navigation menu item
type AppNavItem struct {
	Label string `json:"label"`
	Route string `json:"route"`
	Icon  string `json:"icon"`
}

// GeneratedApp is the complete output
type GeneratedApp struct {
	Name         string                    `json:"name"`
	OutputDir    string                    `json:"outputDir"`
	Pages        []AppGeneratedPage        `json:"pages"`
	Style        style_alchemy.StyleContext `json:"style"`
	Manifest     AppManifest               `json:"manifest"`
	FileTree     map[string]string         `json:"fileTree"` // path -> content
}

// AppGeneratedPage is a rendered page
type AppGeneratedPage struct {
	Name      string `json:"name"`
	Route     string `json:"route"`
	FilePath  string `json:"filePath"`
	Code      string `json:"code"`
}

// AppManifest describes the application
type AppManifest struct {
	Name        string                 `json:"name"`
	Version     string                 `json:"version"`
	Description string                 `json:"description"`
	Author      string                 `json:"author"`
	Pages       int                    `json:"pages"`
	Components  int                    `json:"components"`
	Seed        int                    `json:"seed"`
	Style       string                 `json:"style"`
	Generated   string                 `json:"generated"`
	Config      map[string]interface{} `json:"config"`
}

// AppGenerator creates complete applications
type AppGenerator struct {
	OutputBaseDir     string
	ComponentEngine   *ComponentAlchemyEngine
	Templates         map[string]AppTemplate
}

// NewAppGenerator creates the application generator
func NewAppGenerator(outputDir string) *AppGenerator {
	gen := &AppGenerator{
		OutputBaseDir:   outputDir,
		ComponentEngine: NewComponentAlchemyEngine(outputDir),
		Templates:       make(map[string]AppTemplate),
	}
	gen.loadBuiltInAppTemplates()
	return gen
}

// loadBuiltInAppTemplates initializes the app template library
func (g *AppGenerator) loadBuiltInAppTemplates() {
	// BUSINESS DASHBOARD - Professional business analytics app
	g.Templates["BusinessDashboard"] = AppTemplate{
		Name:        "BusinessDashboard",
		Description: "Professional business analytics dashboard with Wabi-Sabi aesthetics",
		Pages: []AppPageSpec{
			{
				Name:       "Login",
				Route:      "/",
				Title:      "Sign In",
				Components: []string{"Input", "Button"},
				Layout:     "centered",
				Protected:  false,
				Template: `<script>
	import { Input, Button } from '$lib/components';

	let email = '';
	let password = '';

	function handleLogin() {
		// Handle login logic
		console.log('Logging in:', email);
	}
</script>

<div class="login-container">
	<h1>Welcome Back</h1>
	<form on:submit|preventDefault={handleLogin}>
		<Input type="email" bind:value={email} placeholder="Email" />
		<Input type="password" bind:value={password} placeholder="Password" />
		<Button label="Sign In" variant="primary" on:click={handleLogin} />
	</form>
</div>

<style>
	.login-container {
		max-width: 400px;
		margin: 0 auto;
		padding: var(--spacing-unit) * 3;
	}

	h1 {
		font-family: var(--font-primary);
		color: var(--color-text);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing-unit) * 2px);
	}
</style>`,
			},
			{
				Name:       "Dashboard",
				Route:      "/dashboard",
				Title:      "Dashboard",
				Components: []string{"Card", "Badge"},
				Layout:     "default",
				Protected:  true,
				Template: `<script>
	import { Card, Badge } from '$lib/components';

	const stats = [
		{ label: 'Revenue', value: '$24,500', status: 'success' },
		{ label: 'Customers', value: '1,240', status: 'default' },
		{ label: 'Orders', value: '342', status: 'warning' }
	];
</script>

<div class="dashboard">
	<h1>Dashboard Overview</h1>

	<div class="stats-grid">
		{#each stats as stat}
		<Card title={stat.label}>
			<div class="stat-value">
				{stat.value}
				<Badge variant={stat.status} label={stat.status.toUpperCase()} />
			</div>
		</Card>
		{/each}
	</div>
</div>

<style>
	.dashboard {
		padding: calc(var(--spacing-unit) * 3px);
	}

	h1 {
		font-family: var(--font-primary);
		color: var(--color-text);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: calc(var(--spacing-unit) * 2px);
	}

	.stat-value {
		font-size: 2rem;
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: calc(var(--spacing-unit) * 1px);
	}
</style>`,
			},
			{
				Name:       "Reports",
				Route:      "/reports",
				Title:      "Reports",
				Components: []string{"Card", "Button"},
				Layout:     "default",
				Protected:  true,
				Template: `<script>
	import { Card, Button } from '$lib/components';

	const reports = [
		{ name: 'Monthly Sales Report', date: '2025-11-01' },
		{ name: 'Customer Analytics', date: '2025-11-15' },
		{ name: 'Inventory Summary', date: '2025-11-20' }
	];
</script>

<div class="reports">
	<h1>Reports</h1>

	<div class="reports-list">
		{#each reports as report}
		<Card title={report.name}>
			<p>Generated: {report.date}</p>
			<Button label="Download" variant="primary" />
		</Card>
		{/each}
	</div>
</div>

<style>
	.reports {
		padding: calc(var(--spacing-unit) * 3px);
	}

	h1 {
		font-family: var(--font-primary);
		color: var(--color-text);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}

	.reports-list {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing-unit) * 2px);
	}
</style>`,
			},
			{
				Name:       "Settings",
				Route:      "/settings",
				Title:      "Settings",
				Components: []string{"Card", "Toggle", "Button"},
				Layout:     "default",
				Protected:  true,
				Template: `<script>
	import { Card, Toggle, Button } from '$lib/components';

	let notifications = true;
	let darkMode = false;
	let autoSave = true;
</script>

<div class="settings">
	<h1>Settings</h1>

	<Card title="Preferences">
		<div class="settings-group">
			<Toggle bind:checked={notifications} label="Enable Notifications" />
			<Toggle bind:checked={darkMode} label="Dark Mode" />
			<Toggle bind:checked={autoSave} label="Auto-save" />
		</div>
		<Button label="Save Changes" variant="primary" />
	</Card>
</div>

<style>
	.settings {
		padding: calc(var(--spacing-unit) * 3px);
	}

	h1 {
		font-family: var(--font-primary);
		color: var(--color-text);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}

	.settings-group {
		display: flex;
		flex-direction: column;
		gap: calc(var(--spacing-unit) * 2px);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}
</style>`,
			},
		},
		Navigation: []AppNavItem{
			{Label: "Dashboard", Route: "/dashboard", Icon: "LayoutDashboard"},
			{Label: "Reports", Route: "/reports", Icon: "FileText"},
			{Label: "Settings", Route: "/settings", Icon: "Settings"},
		},
		Routes: map[string]string{
			"/":         "Login",
			"/dashboard": "Dashboard",
			"/reports":   "Reports",
			"/settings":  "Settings",
		},
	}

	// INVOICE MANAGER - Business invoice management
	g.Templates["InvoiceManager"] = AppTemplate{
		Name:        "InvoiceManager",
		Description: "Invoice management system with quaternion-powered OCR",
		Pages: []AppPageSpec{
			{
				Name:       "Login",
				Route:      "/",
				Title:      "Sign In",
				Components: []string{"Input", "Button"},
				Layout:     "centered",
				Protected:  false,
			},
			{
				Name:       "InvoiceList",
				Route:      "/invoices",
				Title:      "Invoices",
				Components: []string{"Card", "Badge", "Button"},
				Layout:     "default",
				Protected:  true,
			},
			{
				Name:       "InvoiceDetail",
				Route:      "/invoices/:id",
				Title:      "Invoice Detail",
				Components: []string{"Card", "Button"},
				Layout:     "default",
				Protected:  true,
			},
			{
				Name:       "CreateInvoice",
				Route:      "/invoices/new",
				Title:      "New Invoice",
				Components: []string{"Input", "Button", "Card"},
				Layout:     "default",
				Protected:  true,
			},
		},
		Navigation: []AppNavItem{
			{Label: "Invoices", Route: "/invoices", Icon: "FileText"},
			{Label: "Create", Route: "/invoices/new", Icon: "Plus"},
		},
		Routes: map[string]string{
			"/":             "Login",
			"/invoices":     "InvoiceList",
			"/invoices/:id": "InvoiceDetail",
			"/invoices/new": "CreateInvoice",
		},
	}

	// PORTFOLIO SITE - Personal/professional portfolio
	g.Templates["PortfolioSite"] = AppTemplate{
		Name:        "PortfolioSite",
		Description: "Beautiful portfolio website with Wabi-Sabi design",
		Pages: []AppPageSpec{
			{
				Name:       "Landing",
				Route:      "/",
				Title:      "Home",
				Components: []string{"Card", "Button"},
				Layout:     "landing",
				Protected:  false,
			},
			{
				Name:       "About",
				Route:      "/about",
				Title:      "About",
				Components: []string{"Card"},
				Layout:     "default",
				Protected:  false,
			},
			{
				Name:       "Projects",
				Route:      "/projects",
				Title:      "Projects",
				Components: []string{"Card", "Badge"},
				Layout:     "default",
				Protected:  false,
			},
			{
				Name:       "Contact",
				Route:      "/contact",
				Title:      "Contact",
				Components: []string{"Input", "Button", "Card"},
				Layout:     "default",
				Protected:  false,
			},
		},
		Navigation: []AppNavItem{
			{Label: "Home", Route: "/", Icon: "Home"},
			{Label: "About", Route: "/about", Icon: "User"},
			{Label: "Projects", Route: "/projects", Icon: "Briefcase"},
			{Label: "Contact", Route: "/contact", Icon: "Mail"},
		},
		Routes: map[string]string{
			"/":         "Landing",
			"/about":    "About",
			"/projects": "Projects",
			"/contact":  "Contact",
		},
	}

	// ADMIN PANEL - Full-featured admin interface
	g.Templates["AdminPanel"] = AppTemplate{
		Name:        "AdminPanel",
		Description: "Comprehensive admin panel with analytics and user management",
		Pages: []AppPageSpec{
			{
				Name:       "Login",
				Route:      "/",
				Title:      "Admin Login",
				Components: []string{"Input", "Button"},
				Layout:     "centered",
				Protected:  false,
			},
			{
				Name:       "Users",
				Route:      "/users",
				Title:      "User Management",
				Components: []string{"Card", "Button", "Badge"},
				Layout:     "default",
				Protected:  true,
			},
			{
				Name:       "Content",
				Route:      "/content",
				Title:      "Content Management",
				Components: []string{"Card", "Button", "Input"},
				Layout:     "default",
				Protected:  true,
			},
			{
				Name:       "Analytics",
				Route:      "/analytics",
				Title:      "Analytics",
				Components: []string{"Card", "Badge"},
				Layout:     "default",
				Protected:  true,
			},
			{
				Name:       "Settings",
				Route:      "/settings",
				Title:      "System Settings",
				Components: []string{"Card", "Toggle", "Button"},
				Layout:     "default",
				Protected:  true,
			},
		},
		Navigation: []AppNavItem{
			{Label: "Users", Route: "/users", Icon: "Users"},
			{Label: "Content", Route: "/content", Icon: "FileText"},
			{Label: "Analytics", Route: "/analytics", Icon: "BarChart"},
			{Label: "Settings", Route: "/settings", Icon: "Settings"},
		},
		Routes: map[string]string{
			"/":          "Login",
			"/users":     "Users",
			"/content":   "Content",
			"/analytics": "Analytics",
			"/settings":  "Settings",
		},
	}
}

// GenerateApp creates a complete SvelteKit application
func (g *AppGenerator) GenerateApp(
	appName string,
	seed int,
	season style_alchemy.Season,
	intent style_alchemy.Intent,
	templateName string,
) (*GeneratedApp, error) {
	tmpl, ok := g.Templates[templateName]
	if !ok {
		return nil, fmt.Errorf("app template not found: %s", templateName)
	}

	// Generate style from seed
	style := style_alchemy.GenerateVariation(seed, season, intent)

	// Create output directory
	outputDir := filepath.Join(g.OutputBaseDir, appName)

	// Generate all components used by pages
	componentsUsed := g.collectComponentsUsed(tmpl)
	generatedComponents := make(map[string]*GeneratedComponent)

	for compName := range componentsUsed {
		comp, err := g.ComponentEngine.GenerateComponent(compName, seed, season, intent)
		if err != nil {
			continue
		}
		generatedComponents[compName] = comp
	}

	// Generate all pages
	pages := make([]AppGeneratedPage, len(tmpl.Pages))
	for i, pageTmpl := range tmpl.Pages {
		page, err := g.generatePage(pageTmpl, style, generatedComponents)
		if err != nil {
			return nil, fmt.Errorf("failed to generate page %s: %w", pageTmpl.Name, err)
		}
		pages[i] = page
	}

	// Build file tree
	fileTree := make(map[string]string)

	// Root layout
	fileTree["src/routes/+layout.svelte"] = g.generateRootLayout(tmpl, style)
	fileTree["src/routes/+layout.ts"] = g.generateLayoutTS(tmpl)

	// Global CSS
	fileTree["src/app.css"] = style.ToCSS() + "\n\n" + g.generateGlobalCSS(style)

	// App HTML template
	fileTree["src/app.html"] = g.generateAppHTML()

	// Package.json
	fileTree["package.json"] = g.generatePackageJSON(appName, tmpl)

	// SvelteKit config
	fileTree["svelte.config.js"] = g.generateSvelteConfig()
	fileTree["vite.config.js"] = g.generateViteConfig()

	// Components
	for name, comp := range generatedComponents {
		fileTree[fmt.Sprintf("src/lib/components/%s.svelte", name)] = comp.Code
	}
	fileTree["src/lib/components/index.ts"] = g.generateComponentIndex(generatedComponents)

	// Pages
	for _, page := range pages {
		fileTree[page.FilePath] = page.Code
	}

	// Manifest
	manifest := AppManifest{
		Name:        appName,
		Version:     "1.0.0",
		Description: tmpl.Description,
		Author:      "Component Alchemy Engine",
		Pages:       len(pages),
		Components:  len(generatedComponents),
		Seed:        seed,
		Style:       style.Name,
		Generated:   "2025-11-29",
		Config: map[string]interface{}{
			"season":   season.String(),
			"intent":   intent.String(),
			"template": templateName,
		},
	}
	fileTree["manifest.json"] = g.manifestToJSON(manifest)

	return &GeneratedApp{
		Name:      appName,
		OutputDir: outputDir,
		Pages:     pages,
		Style:     style,
		Manifest:  manifest,
		FileTree:  fileTree,
	}, nil
}

// generatePage renders a single page
func (g *AppGenerator) generatePage(
	pageTmpl AppPageSpec,
	style style_alchemy.StyleContext,
	components map[string]*GeneratedComponent,
) (AppGeneratedPage, error) {
	// If no template provided, generate default
	code := pageTmpl.Template
	if code == "" {
		code = g.generateDefaultPageTemplate(pageTmpl, components)
	}

	// Determine file path based on route
	filePath := g.routeToFilePath(pageTmpl.Route)

	return AppGeneratedPage{
		Name:     pageTmpl.Name,
		Route:    pageTmpl.Route,
		FilePath: filePath,
		Code:     code,
	}, nil
}

// generateDefaultPageTemplate creates a basic page template
func (g *AppGenerator) generateDefaultPageTemplate(
	pageTmpl AppPageSpec,
	components map[string]*GeneratedComponent,
) string {
	var buf bytes.Buffer
	buf.WriteString("<script>\n")
	if len(pageTmpl.Components) > 0 {
		buf.WriteString(fmt.Sprintf("\timport { %s } from '$lib/components';\n",
			strings.Join(pageTmpl.Components, ", ")))
	}
	buf.WriteString("</script>\n\n")
	buf.WriteString(fmt.Sprintf("<div class=\"page-%s\">\n", strings.ToLower(pageTmpl.Name)))
	buf.WriteString(fmt.Sprintf("\t<h1>%s</h1>\n", pageTmpl.Title))
	buf.WriteString("\t<p>Generated page content</p>\n")
	buf.WriteString("</div>\n\n")
	buf.WriteString("<style>\n")
	buf.WriteString(fmt.Sprintf("\t.page-%s {\n", strings.ToLower(pageTmpl.Name)))
	buf.WriteString("\t\tpadding: calc(var(--spacing-unit) * 3px);\n")
	buf.WriteString("\t}\n")
	buf.WriteString("</style>\n")
	return buf.String()
}

// generateRootLayout creates the app's root layout
func (g *AppGenerator) generateRootLayout(tmpl AppTemplate, style style_alchemy.StyleContext) string {
	var buf bytes.Buffer

	buf.WriteString(`<script>
	import '../app.css';
	import { page } from '$app/stores';

	const navigation = `)
	navJSON, _ := json.Marshal(tmpl.Navigation)
	buf.Write(navJSON)
	buf.WriteString(`;
</script>

<div class="app">
	<nav class="main-nav">
		<h2>` + tmpl.Name + `</h2>
		<ul>
			{#each navigation as item}
			<li>
				<a href={item.route} class:active={$page.url.pathname === item.route}>
					{item.label}
				</a>
			</li>
			{/each}
		</ul>
	</nav>

	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		min-height: 100vh;
		background: var(--color-bg);
		color: var(--color-text);
	}

	.main-nav {
		width: 250px;
		background: var(--color-surface);
		padding: calc(var(--spacing-unit) * 3px);
		border-right: 1px solid var(--color-text-muted);
	}

	.main-nav h2 {
		font-family: var(--font-primary);
		margin-bottom: calc(var(--spacing-unit) * 3px);
	}

	.main-nav ul {
		list-style: none;
		padding: 0;
	}

	.main-nav li {
		margin-bottom: calc(var(--spacing-unit) * 1px);
	}

	.main-nav a {
		display: block;
		padding: calc(var(--spacing-unit) * 1px);
		color: var(--color-text);
		text-decoration: none;
		border-radius: var(--border-radius);
		transition: all var(--transition-duration)ms;
	}

	.main-nav a:hover,
	.main-nav a.active {
		background: var(--color-primary);
		color: var(--color-bg);
	}

	main {
		flex: 1;
	}
</style>
`)

	return buf.String()
}

// generateLayoutTS creates the layout TypeScript file
func (g *AppGenerator) generateLayoutTS(tmpl AppTemplate) string {
	return `export const prerender = true;
export const ssr = true;
`
}

// generateGlobalCSS creates app-wide CSS
func (g *AppGenerator) generateGlobalCSS(style style_alchemy.StyleContext) string {
	return `
/* Global Reset */
* {
	margin: 0;
	padding: 0;
	box-sizing: border-box;
}

body {
	font-family: var(--font-secondary);
	background: var(--color-bg);
	color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
	font-family: var(--font-primary);
}

/* Breathing animation (if enabled) */
@keyframes breathe {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(calc(1 + var(--breath-amp))); }
}

.breathe {
	animation: breathe calc(1 / var(--breath-freq) * 1s) ease-in-out infinite;
}
`
}

// generatePackageJSON creates package.json
func (g *AppGenerator) generatePackageJSON(appName string, tmpl AppTemplate) string {
	pkg := map[string]interface{}{
		"name":    appName,
		"version": "1.0.0",
		"private": true,
		"type":    "module",
		"scripts": map[string]string{
			"dev":     "vite dev",
			"build":   "vite build",
			"preview": "vite preview",
		},
		"devDependencies": map[string]string{
			"@sveltejs/adapter-auto": "^2.1.0",
			"@sveltejs/kit":          "^1.27.0",
			"@sveltejs/vite-plugin-svelte": "^2.5.0",
			"svelte":                 "^4.2.0",
			"vite":                   "^4.5.0",
		},
	}
	data, _ := json.MarshalIndent(pkg, "", "  ")
	return string(data)
}

// generateSvelteConfig creates svelte.config.js
func (g *AppGenerator) generateSvelteConfig() string {
	return `import adapter from '@sveltejs/adapter-auto';

const config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
`
}

// generateViteConfig creates vite.config.js
func (g *AppGenerator) generateViteConfig() string {
	return `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});
`
}

// generateAppHTML creates src/app.html
func (g *AppGenerator) generateAppHTML() string {
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>
`
}

// generateComponentIndex creates barrel export for components
func (g *AppGenerator) generateComponentIndex(components map[string]*GeneratedComponent) string {
	var buf bytes.Buffer
	buf.WriteString("// Auto-generated by Component Alchemy Engine\n\n")
	for name := range components {
		buf.WriteString(fmt.Sprintf("export { default as %s } from './%s.svelte';\n", name, name))
	}
	return buf.String()
}

// routeToFilePath converts route to SvelteKit file path
func (g *AppGenerator) routeToFilePath(route string) string {
	if route == "/" {
		return "src/routes/+page.svelte"
	}

	// Handle dynamic params like :id -> [id]
	parts := strings.Split(route, "/")
	for i, part := range parts {
		if strings.HasPrefix(part, ":") {
			parts[i] = "[" + strings.TrimPrefix(part, ":") + "]"
		}
	}
	route = strings.Join(parts, "/")

	return fmt.Sprintf("src/routes%s/+page.svelte", route)
}

// collectComponentsUsed finds all unique components across pages
func (g *AppGenerator) collectComponentsUsed(tmpl AppTemplate) map[string]bool {
	components := make(map[string]bool)
	for _, page := range tmpl.Pages {
		for _, comp := range page.Components {
			components[comp] = true
		}
	}
	return components
}

// manifestToJSON converts manifest to JSON
func (g *AppGenerator) manifestToJSON(manifest AppManifest) string {
	data, _ := json.MarshalIndent(manifest, "", "  ")
	return string(data)
}

// WriteApp writes the complete application to disk
func (g *AppGenerator) WriteApp(app *GeneratedApp) error {
	// Create output directory
	if err := os.MkdirAll(app.OutputDir, 0755); err != nil {
		return err
	}

	// Write all files
	for path, content := range app.FileTree {
		fullPath := filepath.Join(app.OutputDir, path)

		// Create parent directories
		dir := filepath.Dir(fullPath)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return err
		}

		// Write file
		if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
			return err
		}
	}

	// Write README
	readme := g.generateREADME(app)
	readmePath := filepath.Join(app.OutputDir, "README.md")
	if err := os.WriteFile(readmePath, []byte(readme), 0644); err != nil {
		return err
	}

	return nil
}

// generateREADME creates README for the app
func (g *AppGenerator) generateREADME(app *GeneratedApp) string {
	return fmt.Sprintf(`# %s

Generated by Component Alchemy Engine

## About

%s

## Details

- **Pages**: %d
- **Components**: %d
- **Seed**: %d
- **Style**: %s
- **Generated**: %s

## Development

` + "```bash" + `
npm install
npm run dev
` + "```" + `

## Build

` + "```bash" + `
npm run build
` + "```" + `

## Mathematical Foundation

This application was generated using quaternion-based style transformations
on the Wabi-Sabi aesthetic manifold. The seed (%d) determines the exact
position on this manifold, ensuring deterministic and reproducible styling.

Same seed = Same app, forever!

Built with Love × Simplicity × Truth × Joy × MATH!
`,
		app.Manifest.Name,
		app.Manifest.Description,
		app.Manifest.Pages,
		app.Manifest.Components,
		app.Manifest.Seed,
		app.Manifest.Style,
		app.Manifest.Generated,
		app.Manifest.Seed,
	)
}

// GetAppTemplates returns all available app template names
func (g *AppGenerator) GetAppTemplates() []string {
	names := make([]string, 0, len(g.Templates))
	for name := range g.Templates {
		names = append(names, name)
	}
	return names
}

// Stats returns generation statistics
func (g *AppGenerator) Stats() map[string]interface{} {
	return map[string]interface{}{
		"appTemplates":        len(g.Templates),
		"componentTemplates":  len(g.ComponentEngine.Templates),
		"componentCategories": g.ComponentEngine.getCategories(),
	}
}
