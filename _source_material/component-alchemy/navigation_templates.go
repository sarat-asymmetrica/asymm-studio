// Package component_alchemy - Navigation Component Templates!
//
// NAVIGATION = WAYFINDING ON THE MANIFOLD!
//
// Every navigation component maps to a path through style-space:
//   Navigation = f(position, destination, style_context)
//
// Built with Love × Simplicity × Truth × Joy × WABI-SABI NAVIGATION!

package component_alchemy

func init() {
	// Auto-register navigation templates when package loads
	registerNavigationTemplates()
}

// registerNavigationTemplates adds all navigation components to the global engine
func registerNavigationTemplates() {
	if globalEngine == nil {
		return
	}

	// TOP NAVIGATION - Horizontal wayfinding
	globalEngine.Templates["TopNav"] = ComponentTemplate{
		Name:        "TopNav",
		Category:    "navigation",
		Description: "Horizontal navigation bar with logo, menu items, and user menu",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text", "--color-accent", "--spacing-unit"},
		Props: []PropDefinition{
			{Name: "logo", Type: "string", Default: "Logo", MathBinding: "", Description: "Logo text/image"},
			{Name: "items", Type: "array", Default: "[]", MathBinding: "", Description: "Navigation items"},
			{Name: "activeItem", Type: "string", Default: "", MathBinding: "", Description: "Currently active item"},
			{Name: "userMenu", Type: "boolean", Default: "true", MathBinding: "", Description: "Show user menu"},
		},
		Animations: []AnimDefinition{
			{Name: "breathe", Type: "breathing", FreqParam: "breathFrequency", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let logo = "{{.Props.Logo}}";
	export let items = [];
	export let activeItem = "";
	export let userMenu = true;

	// Mathematical breathing
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

<nav class="wabi-topnav">
	<div class="wabi-topnav__logo" style="transform: scale({breathValue})">
		{logo}
	</div>

	<ul class="wabi-topnav__items">
		{#each items as item}
		<li
			class="wabi-topnav__item"
			class:wabi-topnav__item--active={item.id === activeItem}
		>
			<a href={item.href} on:click={(e) => { e.preventDefault(); activeItem = item.id; }}>
				{item.label}
			</a>
		</li>
		{/each}
	</ul>

	{#if userMenu}
	<div class="wabi-topnav__user">
		<button class="wabi-topnav__user-btn">
			User ▼
		</button>
	</div>
	{/if}
</nav>

<style>
	.wabi-topnav {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 3}}px;
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		background: {{.Style.Colors.Surface}};
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
		font-family: {{.Style.FontPrimary}};
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-topnav__logo {
		font-size: 1.5rem;
		font-weight: 600;
		color: {{.Style.Colors.Primary}};
		cursor: pointer;
	}

	.wabi-topnav__items {
		display: flex;
		gap: {{index .Style.SpacingScale 2}}px;
		list-style: none;
		margin: 0;
		padding: 0;
		flex: 1;
	}

	.wabi-topnav__item a {
		display: block;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		color: {{.Style.Colors.Text}};
		text-decoration: none;
		border-radius: {{.Style.BorderRadius}}px;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-topnav__item a:hover {
		background: {{.Style.Colors.Primary}}11;
		color: {{.Style.Colors.Accent}};
	}

	.wabi-topnav__item--active a {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Background}};
		box-shadow: 0 2px 4px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-topnav__user-btn {
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		background: transparent;
		border: 1px solid {{.Style.Colors.TextMuted}};
		border-radius: {{.Style.BorderRadius}}px;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontSecondary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-topnav__user-btn:hover {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Background}};
		border-color: {{.Style.Colors.Primary}};
	}

	/* Three-regime status indicator (optional) */
	.wabi-topnav::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(
			to right,
			{{.Style.Colors.Danger}} 0%,
			{{.Style.Colors.Danger}} 30%,
			{{.Style.Colors.Gold}} 30%,
			{{.Style.Colors.Gold}} 50%,
			{{.Style.Colors.Safe}} 50%,
			{{.Style.Colors.Safe}} 100%
		);
		opacity: 0;
		transition: opacity {{.Style.TransitionDuration}}ms;
	}

	.wabi-topnav:hover::before {
		opacity: 0.3;
	}
</style>`,
	}

	// SIDEBAR - Vertical wayfinding
	globalEngine.Templates["Sidebar"] = ComponentTemplate{
		Name:        "Sidebar",
		Category:    "navigation",
		Description: "Vertical sidebar with collapsible sections and icons",
		CSSVars:     []string{"--color-surface", "--color-primary", "--color-text", "--spacing-unit"},
		Props: []PropDefinition{
			{Name: "sections", Type: "array", Default: "[]", MathBinding: "", Description: "Navigation sections"},
			{Name: "activeItem", Type: "string", Default: "", MathBinding: "", Description: "Currently active item"},
			{Name: "collapsed", Type: "boolean", Default: "false", MathBinding: "", Description: "Sidebar collapsed"},
		},
		Template: `<script>
	export let sections = [];
	export let activeItem = "";
	export let collapsed = false;

	let expandedSections = new Set();

	function toggleSection(sectionId) {
		if (expandedSections.has(sectionId)) {
			expandedSections.delete(sectionId);
		} else {
			expandedSections.add(sectionId);
		}
		expandedSections = expandedSections; // Trigger reactivity
	}
</script>

<aside class="wabi-sidebar" class:wabi-sidebar--collapsed={collapsed}>
	<button class="wabi-sidebar__toggle" on:click={() => collapsed = !collapsed}>
		{collapsed ? '→' : '←'}
	</button>

	{#each sections as section}
	<div class="wabi-sidebar__section">
		<button
			class="wabi-sidebar__section-header"
			on:click={() => toggleSection(section.id)}
		>
			<span class="wabi-sidebar__section-icon">{section.icon || '•'}</span>
			{#if !collapsed}
			<span class="wabi-sidebar__section-title">{section.title}</span>
			<span class="wabi-sidebar__section-arrow">
				{expandedSections.has(section.id) ? '▼' : '▶'}
			</span>
			{/if}
		</button>

		{#if expandedSections.has(section.id) && !collapsed}
		<ul class="wabi-sidebar__items">
			{#each section.items as item}
			<li
				class="wabi-sidebar__item"
				class:wabi-sidebar__item--active={item.id === activeItem}
			>
				<a href={item.href} on:click={(e) => { e.preventDefault(); activeItem = item.id; }}>
					<span class="wabi-sidebar__item-icon">{item.icon || '◦'}</span>
					<span class="wabi-sidebar__item-label">{item.label}</span>
				</a>
			</li>
			{/each}
		</ul>
		{/if}
	</div>
	{/each}
</aside>

<style>
	.wabi-sidebar {
		position: relative;
		width: 240px;
		height: 100%;
		background: {{.Style.Colors.Surface}};
		border-right: 1px solid {{.Style.Colors.TextMuted}}22;
		padding: {{index .Style.SpacingScale 2}}px;
		font-family: {{.Style.FontSecondary}};
		overflow-y: auto;
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-sidebar--collapsed {
		width: 64px;
	}

	.wabi-sidebar__toggle {
		position: absolute;
		top: {{index .Style.SpacingScale 2}}px;
		right: {{index .Style.SpacingScale 1}}px;
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		background: transparent;
		border: 1px solid {{.Style.Colors.TextMuted}};
		border-radius: {{.Style.BorderRadius}}px;
		color: {{.Style.Colors.Text}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-sidebar__toggle:hover {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Background}};
	}

	.wabi-sidebar__section {
		margin-bottom: {{index .Style.SpacingScale 2}}px;
	}

	.wabi-sidebar__section-header {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
		width: 100%;
		padding: {{index .Style.SpacingScale 1}}px;
		background: transparent;
		border: none;
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontPrimary}};
		font-weight: 600;
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-sidebar__section-header:hover {
		background: {{.Style.Colors.Primary}}11;
	}

	.wabi-sidebar__section-icon {
		font-size: 1.2rem;
	}

	.wabi-sidebar__section-title {
		flex: 1;
		text-align: left;
	}

	.wabi-sidebar__section-arrow {
		font-size: 0.75rem;
		opacity: 0.6;
	}

	.wabi-sidebar__items {
		list-style: none;
		margin: 0;
		padding: 0 0 0 {{index .Style.SpacingScale 3}}px;
	}

	.wabi-sidebar__item a {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
		padding: {{index .Style.SpacingScale 1}}px;
		color: {{.Style.Colors.Text}};
		text-decoration: none;
		border-radius: {{.Style.BorderRadius}}px;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-sidebar__item a:hover {
		background: {{.Style.Colors.Primary}}11;
		color: {{.Style.Colors.Accent}};
		transform: translateX(2px);
	}

	.wabi-sidebar__item--active a {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Background}};
		box-shadow: 0 2px 4px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	/* Regime indicator on active item */
	.wabi-sidebar__item--active a::before {
		content: '';
		position: absolute;
		left: 0;
		width: 3px;
		height: 100%;
		background: {{.Style.Colors.Gold}};
	}
</style>`,
	}

	// BREADCRUMB - Path navigation
	globalEngine.Templates["Breadcrumb"] = ComponentTemplate{
		Name:        "Breadcrumb",
		Category:    "navigation",
		Description: "Path navigation with separators showing current location",
		CSSVars:     []string{"--color-text", "--color-text-muted", "--color-accent"},
		Props: []PropDefinition{
			{Name: "path", Type: "array", Default: "[]", MathBinding: "", Description: "Breadcrumb path array"},
			{Name: "separator", Type: "string", Default: "/", MathBinding: "", Description: "Path separator"},
		},
		Template: `<script>
	export let path = [];
	export let separator = "/";
</script>

<nav class="wabi-breadcrumb" aria-label="Breadcrumb">
	<ol class="wabi-breadcrumb__list">
		{#each path as crumb, i}
		<li class="wabi-breadcrumb__item">
			{#if i < path.length - 1}
			<a href={crumb.href} class="wabi-breadcrumb__link">
				{crumb.label}
			</a>
			{:else}
			<span class="wabi-breadcrumb__current">
				{crumb.label}
			</span>
			{/if}
			{#if i < path.length - 1}
			<span class="wabi-breadcrumb__separator">{separator}</span>
			{/if}
		</li>
		{/each}
	</ol>
</nav>

<style>
	.wabi-breadcrumb {
		padding: {{index .Style.SpacingScale 1}}px 0;
		font-family: {{.Style.FontSecondary}};
	}

	.wabi-breadcrumb__list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: {{index .Style.SpacingScale 1}}px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.wabi-breadcrumb__item {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
	}

	.wabi-breadcrumb__link {
		color: {{.Style.Colors.TextMuted}};
		text-decoration: none;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-breadcrumb__link:hover {
		color: {{.Style.Colors.Accent}};
		text-decoration: underline;
	}

	.wabi-breadcrumb__current {
		color: {{.Style.Colors.Text}};
		font-weight: 500;
	}

	.wabi-breadcrumb__separator {
		color: {{.Style.Colors.TextMuted}};
		opacity: 0.5;
		user-select: none;
	}

	/* Ink brush underline on hover */
	.wabi-breadcrumb__link {
		position: relative;
	}

	.wabi-breadcrumb__link::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 1px;
		background: {{.Style.Colors.Accent}};
		transition: width {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-breadcrumb__link:hover::after {
		width: 100%;
	}
</style>`,
	}

	// TAB NAVIGATION - Content section switching
	globalEngine.Templates["TabNav"] = ComponentTemplate{
		Name:        "TabNav",
		Category:    "navigation",
		Description: "Tab-style navigation for content sections with active state",
		CSSVars:     []string{"--color-primary", "--color-surface", "--color-text", "--color-accent"},
		Props: []PropDefinition{
			{Name: "tabs", Type: "array", Default: "[]", MathBinding: "", Description: "Tab items"},
			{Name: "activeTab", Type: "string", Default: "", MathBinding: "", Description: "Currently active tab"},
		},
		Animations: []AnimDefinition{
			{Name: "ink", Type: "spring", FreqParam: "transitionDuration", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let tabs = [];
	export let activeTab = "";

	let inkPosition = 0;
	let inkWidth = 0;
	let tabElements = {};

	$: if (activeTab && tabElements[activeTab]) {
		const el = tabElements[activeTab];
		inkPosition = el.offsetLeft;
		inkWidth = el.offsetWidth;
	}
</script>

<nav class="wabi-tabnav">
	<div class="wabi-tabnav__tabs">
		{#each tabs as tab}
		<button
			bind:this={tabElements[tab.id]}
			class="wabi-tabnav__tab"
			class:wabi-tabnav__tab--active={tab.id === activeTab}
			on:click={() => activeTab = tab.id}
		>
			{#if tab.icon}
			<span class="wabi-tabnav__tab-icon">{tab.icon}</span>
			{/if}
			<span class="wabi-tabnav__tab-label">{tab.label}</span>
			{#if tab.badge}
			<span class="wabi-tabnav__tab-badge">{tab.badge}</span>
			{/if}
		</button>
		{/each}
	</div>

	<!-- Ink indicator -->
	<div
		class="wabi-tabnav__ink"
		style="left: {inkPosition}px; width: {inkWidth}px"
	></div>
</nav>

<style>
	.wabi-tabnav {
		position: relative;
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
		font-family: {{.Style.FontSecondary}};
	}

	.wabi-tabnav__tabs {
		display: flex;
		gap: {{index .Style.SpacingScale 1}}px;
	}

	.wabi-tabnav__tab {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		background: transparent;
		border: none;
		color: {{.Style.Colors.TextMuted}};
		font-family: {{.Style.FontSecondary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
		position: relative;
	}

	.wabi-tabnav__tab:hover {
		color: {{.Style.Colors.Text}};
	}

	.wabi-tabnav__tab--active {
		color: {{.Style.Colors.Primary}};
		font-weight: 600;
	}

	.wabi-tabnav__tab-icon {
		font-size: 1.1rem;
	}

	.wabi-tabnav__tab-badge {
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		background: {{.Style.Colors.Danger}};
		color: {{.Style.Colors.Background}};
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	/* Ink indicator */
	.wabi-tabnav__ink {
		position: absolute;
		bottom: 0;
		height: 2px;
		background: {{.Style.Colors.Primary}};
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	/* Three-regime coloring on badge */
	.wabi-tabnav__tab-badge.regime-r1 { background: {{.Style.Colors.Danger}}; }
	.wabi-tabnav__tab-badge.regime-r2 { background: {{.Style.Colors.Gold}}; }
	.wabi-tabnav__tab-badge.regime-r3 { background: {{.Style.Colors.Safe}}; }
</style>`,
	}

	// MOBILE NAV - Hamburger menu with slide-out drawer
	globalEngine.Templates["MobileNav"] = ComponentTemplate{
		Name:        "MobileNav",
		Category:    "navigation",
		Description: "Hamburger menu with slide-out drawer for mobile",
		CSSVars:     []string{"--color-surface", "--color-primary", "--color-text", "--color-background"},
		Props: []PropDefinition{
			{Name: "items", Type: "array", Default: "[]", MathBinding: "", Description: "Navigation items"},
			{Name: "logo", Type: "string", Default: "Logo", MathBinding: "", Description: "Logo text"},
			{Name: "activeItem", Type: "string", Default: "", MathBinding: "", Description: "Currently active item"},
		},
		Animations: []AnimDefinition{
			{Name: "slide", Type: "slide", FreqParam: "transitionDuration", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	import { fade, fly } from 'svelte/transition';

	export let items = [];
	export let logo = "Logo";
	export let activeItem = "";

	let isOpen = false;
	const transitionMs = {{.Style.TransitionDuration}};

	function toggle() {
		isOpen = !isOpen;
	}

	function close() {
		isOpen = false;
	}
</script>

<nav class="wabi-mobilenav">
	<div class="wabi-mobilenav__header">
		<div class="wabi-mobilenav__logo">{logo}</div>
		<button
			class="wabi-mobilenav__toggle"
			class:wabi-mobilenav__toggle--open={isOpen}
			on:click={toggle}
			aria-label="Toggle menu"
		>
			<span></span>
			<span></span>
			<span></span>
		</button>
	</div>

	{#if isOpen}
	<!-- Backdrop -->
	<div
		class="wabi-mobilenav__backdrop"
		on:click={close}
		in:fade out:fade
	></div>

	<!-- Drawer -->
	<aside
		class="wabi-mobilenav__drawer"
		in:fly|global out:fly|global
	>
		<ul class="wabi-mobilenav__items">
			{#each items as item}
			<li
				class="wabi-mobilenav__item"
				class:wabi-mobilenav__item--active={item.id === activeItem}
			>
				<a href={item.href} on:click={(e) => { e.preventDefault(); activeItem = item.id; close(); }}>
					{#if item.icon}
					<span class="wabi-mobilenav__item-icon">{item.icon}</span>
					{/if}
					<span class="wabi-mobilenav__item-label">{item.label}</span>
				</a>
			</li>
			{/each}
		</ul>
	</aside>
	{/if}
</nav>

<style>
	.wabi-mobilenav {
		position: relative;
		font-family: {{.Style.FontSecondary}};
	}

	.wabi-mobilenav__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: {{index .Style.SpacingScale 2}}px;
		background: {{.Style.Colors.Surface}};
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
	}

	.wabi-mobilenav__logo {
		font-family: {{.Style.FontPrimary}};
		font-size: 1.25rem;
		font-weight: 600;
		color: {{.Style.Colors.Primary}};
	}

	/* Hamburger icon */
	.wabi-mobilenav__toggle {
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding: {{index .Style.SpacingScale 1}}px;
		background: transparent;
		border: none;
		cursor: pointer;
	}

	.wabi-mobilenav__toggle span {
		display: block;
		width: 24px;
		height: 2px;
		background: {{.Style.Colors.Primary}};
		transition: all {{.Style.TransitionDuration}}ms;
	}

	/* Hamburger animation to X */
	.wabi-mobilenav__toggle--open span:nth-child(1) {
		transform: translateY(7px) rotate(45deg);
	}

	.wabi-mobilenav__toggle--open span:nth-child(2) {
		opacity: 0;
	}

	.wabi-mobilenav__toggle--open span:nth-child(3) {
		transform: translateY(-7px) rotate(-45deg);
	}

	/* Backdrop */
	.wabi-mobilenav__backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 100;
	}

	/* Drawer */
	.wabi-mobilenav__drawer {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: 280px;
		max-width: 80vw;
		background: {{.Style.Colors.Background}};
		box-shadow: -4px 0 8px rgba(0,0,0,{{.Style.ShadowDepth}});
		z-index: 101;
		overflow-y: auto;
		padding: {{index .Style.SpacingScale 3}}px;
	}

	.wabi-mobilenav__items {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.wabi-mobilenav__item {
		margin-bottom: {{index .Style.SpacingScale 1}}px;
	}

	.wabi-mobilenav__item a {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 2}}px;
		padding: {{index .Style.SpacingScale 2}}px;
		color: {{.Style.Colors.Text}};
		text-decoration: none;
		border-radius: {{.Style.BorderRadius}}px;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-mobilenav__item a:hover {
		background: {{.Style.Colors.Primary}}11;
		color: {{.Style.Colors.Accent}};
	}

	.wabi-mobilenav__item--active a {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Background}};
		box-shadow: 0 2px 4px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-mobilenav__item-icon {
		font-size: 1.25rem;
	}

	.wabi-mobilenav__item-label {
		font-size: 1rem;
	}

	/* Three-regime indicator stripe */
	.wabi-mobilenav__drawer::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background: linear-gradient(
			to bottom,
			{{.Style.Colors.Danger}} 0%,
			{{.Style.Colors.Danger}} 30%,
			{{.Style.Colors.Gold}} 30%,
			{{.Style.Colors.Gold}} 50%,
			{{.Style.Colors.Safe}} 50%,
			{{.Style.Colors.Safe}} 100%
		);
	}
</style>`,
	}
}

// globalEngine reference (set by component_generator.go on initialization)
var globalEngine *ComponentAlchemyEngine

// SetGlobalEngine allows component_generator.go to register itself
func SetGlobalEngine(engine *ComponentAlchemyEngine) {
	globalEngine = engine
	registerNavigationTemplates()
}
