// Package component_alchemy - Data Display Component Templates
//
// BRINGING DATA TO LIFE THROUGH GEOMETRY!
//
// Traditional data displays = boring tables and charts
// Component Alchemy data displays = MATHEMATICAL BREATHING VISUALIZATIONS!
//
// Each component:
//   - Uses StyleContext for all colors and spacing
//   - Includes Wabi-Sabi aesthetics (subtle shadows, organic curves)
//   - Supports all seasons and intents
//   - Has breathing animations where appropriate
//   - Uses Fibonacci spacing scale
//   - Three-regime color coding (R1/R2/R3 = Danger/Gold/Safe)
//
// Built with Love × Simplicity × Truth × Joy × DATA IS BEAUTIFUL! 🎨📊✨

package component_alchemy

// loadDataTemplates adds all data display component templates
func (e *ComponentAlchemyEngine) loadDataTemplates() {
	// DATATABLE - Sortable, filterable table with Three-Regime badges
	e.Templates["DataTable"] = ComponentTemplate{
		Name:        "DataTable",
		Category:    "data",
		Description: "Sortable, filterable table with Three-Regime status badges",
		CSSVars:     []string{"--color-surface", "--color-text", "--color-text-muted", "--color-primary", "--color-danger", "--color-gold", "--color-safe"},
		Props: []PropDefinition{
			{Name: "columns", Type: "array", Default: "[]", MathBinding: "", Description: "Column definitions [{key, label, sortable}]"},
			{Name: "data", Type: "array", Default: "[]", MathBinding: "", Description: "Table data rows"},
			{Name: "pageSize", Type: "number", Default: "10", MathBinding: "", Description: "Rows per page"},
			{Name: "selectable", Type: "boolean", Default: "false", MathBinding: "", Description: "Show row checkboxes"},
		},
		Animations: []AnimDefinition{
			{Name: "breathe", Type: "breathing", FreqParam: "breathFrequency", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let columns = [];
	export let data = [];
	export let pageSize = 10;
	export let selectable = false;

	let sortColumn = null;
	let sortDirection = 1; // 1 = asc, -1 = desc
	let currentPage = 0;
	let selected = new Set();

	// Sorting logic
	function sortData(col) {
		if (!col.sortable) return;

		if (sortColumn === col.key) {
			sortDirection *= -1;
		} else {
			sortColumn = col.key;
			sortDirection = 1;
		}

		data = [...data].sort((a, b) => {
			const aVal = a[col.key];
			const bVal = b[col.key];
			if (aVal < bVal) return -1 * sortDirection;
			if (aVal > bVal) return 1 * sortDirection;
			return 0;
		});
	}

	// Pagination
	$: totalPages = Math.ceil(data.length / pageSize);
	$: paginatedData = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

	// Selection
	function toggleRow(rowId) {
		if (selected.has(rowId)) {
			selected.delete(rowId);
		} else {
			selected.add(rowId);
		}
		selected = selected; // Trigger reactivity
	}

	function toggleAll() {
		if (selected.size === data.length) {
			selected.clear();
		} else {
			selected = new Set(data.map((_, i) => i));
		}
	}

	// Three-regime badge variant
	function getBadgeVariant(value) {
		if (typeof value === 'string') {
			const lower = value.toLowerCase();
			if (lower.includes('r1') || lower.includes('exploration') || lower.includes('danger')) return 'r1';
			if (lower.includes('r2') || lower.includes('optimization') || lower.includes('warning')) return 'r2';
			if (lower.includes('r3') || lower.includes('stabilization') || lower.includes('safe')) return 'r3';
		}
		return 'default';
	}
</script>

<div class="wabi-datatable">
	<!-- Table container -->
	<div class="wabi-datatable__container">
		<table class="wabi-datatable__table">
			<thead>
				<tr class="wabi-datatable__header-row">
					{#if selectable}
					<th class="wabi-datatable__header-cell wabi-datatable__header-cell--checkbox">
						<input
							type="checkbox"
							checked={selected.size === data.length && data.length > 0}
							on:change={toggleAll}
						/>
					</th>
					{/if}
					{#each columns as col}
					<th
						class="wabi-datatable__header-cell"
						class:wabi-datatable__header-cell--sortable={col.sortable}
						on:click={() => sortData(col)}
					>
						<div class="wabi-datatable__header-content">
							<span>{col.label}</span>
							{#if col.sortable}
							<span class="wabi-datatable__sort-indicator">
								{#if sortColumn === col.key}
									{sortDirection === 1 ? '↑' : '↓'}
								{:else}
									↕
								{/if}
							</span>
							{/if}
						</div>
					</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each paginatedData as row, i}
				<tr
					class="wabi-datatable__row"
					class:wabi-datatable__row--selected={selected.has(currentPage * pageSize + i)}
				>
					{#if selectable}
					<td class="wabi-datatable__cell wabi-datatable__cell--checkbox">
						<input
							type="checkbox"
							checked={selected.has(currentPage * pageSize + i)}
							on:change={() => toggleRow(currentPage * pageSize + i)}
						/>
					</td>
					{/if}
					{#each columns as col}
					<td class="wabi-datatable__cell">
						{#if col.badge}
							<span class="wabi-badge wabi-badge--{getBadgeVariant(row[col.key])}">
								{row[col.key]}
							</span>
						{:else}
							{row[col.key]}
						{/if}
					</td>
					{/each}
				</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
	<div class="wabi-datatable__pagination">
		<button
			class="wabi-datatable__page-btn"
			disabled={currentPage === 0}
			on:click={() => currentPage--}
		>
			Previous
		</button>
		<span class="wabi-datatable__page-info">
			Page {currentPage + 1} of {totalPages}
		</span>
		<button
			class="wabi-datatable__page-btn"
			disabled={currentPage === totalPages - 1}
			on:click={() => currentPage++}
		>
			Next
		</button>
	</div>
	{/if}
</div>

<style>
	.wabi-datatable {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		overflow: hidden;
		box-shadow: 0 {{multiply .Style.ShadowDepth 2}}px {{multiply .Style.ShadowDepth 4}}px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-datatable__container {
		overflow-x: auto;
	}

	.wabi-datatable__table {
		width: 100%;
		border-collapse: collapse;
		font-family: {{.Style.FontSecondary}};
	}

	.wabi-datatable__header-row {
		background: {{.Style.Colors.Primary}}11;
		border-bottom: 2px solid {{.Style.Colors.Primary}};
	}

	.wabi-datatable__header-cell {
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		text-align: left;
		color: {{.Style.Colors.Text}};
		font-weight: 600;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wabi-datatable__header-cell--sortable {
		cursor: pointer;
		user-select: none;
	}

	.wabi-datatable__header-cell--sortable:hover {
		background: {{.Style.Colors.Primary}}22;
	}

	.wabi-datatable__header-content {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 1}}px;
	}

	.wabi-datatable__sort-indicator {
		color: {{.Style.Colors.TextMuted}};
		font-size: 0.75rem;
	}

	.wabi-datatable__row {
		border-bottom: 1px solid {{.Style.Colors.TextMuted}}22;
		transition: background {{.Style.TransitionDuration}}ms;
	}

	.wabi-datatable__row:nth-child(even) {
		background: {{.Style.Colors.Background}}44;
	}

	.wabi-datatable__row:hover {
		background: {{.Style.Colors.Primary}}11;
	}

	.wabi-datatable__row--selected {
		background: {{.Style.Colors.Accent}}22 !important;
	}

	.wabi-datatable__cell {
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		color: {{.Style.Colors.Text}};
	}

	.wabi-datatable__cell--checkbox {
		width: 40px;
		text-align: center;
	}

	.wabi-badge {
		display: inline-flex;
		align-items: center;
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		border-radius: {{multiply .Style.BorderRadius 0.5}}px;
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wabi-badge--r1 {
		background: {{.Style.Colors.Danger}};
		color: white;
	}

	.wabi-badge--r2 {
		background: {{.Style.Colors.Gold}};
		color: {{.Style.Colors.Background}};
	}

	.wabi-badge--r3 {
		background: {{.Style.Colors.Safe}};
		color: white;
	}

	.wabi-badge--default {
		background: {{.Style.Colors.Secondary}};
		color: white;
	}

	.wabi-datatable__pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		border-top: 1px solid {{.Style.Colors.TextMuted}}22;
		background: {{.Style.Colors.Background}}44;
	}

	.wabi-datatable__page-btn {
		background: {{.Style.Colors.Primary}};
		color: {{.Style.Colors.Surface}};
		border: none;
		padding: {{index .Style.SpacingScale 1}}px {{index .Style.SpacingScale 2}}px;
		border-radius: {{.Style.BorderRadius}}px;
		font-family: {{.Style.FontSecondary}};
		cursor: pointer;
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-datatable__page-btn:hover:not(:disabled) {
		background: {{.Style.Colors.Accent}};
		transform: translateY(-1px);
	}

	.wabi-datatable__page-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.wabi-datatable__page-info {
		color: {{.Style.Colors.Text}};
		font-family: {{.Style.FontMono}};
		font-size: 0.875rem;
	}
</style>`,
	}

	// STATCARD - Metric display with breathing animation
	e.Templates["StatCard"] = ComponentTemplate{
		Name:        "StatCard",
		Category:    "data",
		Description: "Metric display card with trend indicator and breathing animation",
		CSSVars:     []string{"--color-surface", "--color-text", "--color-safe", "--color-danger", "--shadow-depth"},
		Props: []PropDefinition{
			{Name: "value", Type: "string", Default: "0", MathBinding: "", Description: "Main metric value"},
			{Name: "label", Type: "string", Default: "Metric", MathBinding: "", Description: "Metric label"},
			{Name: "trend", Type: "number", Default: "0", MathBinding: "", Description: "Trend percentage (positive or negative)"},
			{Name: "comparison", Type: "string", Default: "", MathBinding: "", Description: "Comparison text (e.g., 'vs last month')"},
			{Name: "icon", Type: "string", Default: "", MathBinding: "", Description: "Icon name"},
		},
		Animations: []AnimDefinition{
			{Name: "breathe", Type: "breathing", FreqParam: "breathFrequency", AmpParam: "breathAmplitude"},
		},
		Template: `<script>
	export let value = "0";
	export let label = "Metric";
	export let trend = 0;
	export let comparison = "";
	export let icon = "";

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

	$: trendDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
	$: trendColor = trend > 0 ? '{{.Style.Colors.Safe}}' : trend < 0 ? '{{.Style.Colors.Danger}}' : '{{.Style.Colors.TextMuted}}';
</script>

<div
	class="wabi-statcard"
	style="transform: scale({breathValue})"
>
	<div class="wabi-statcard__content">
		{#if icon}
		<div class="wabi-statcard__icon">
			<slot name="icon">{icon}</slot>
		</div>
		{/if}

		<div class="wabi-statcard__main">
			<div class="wabi-statcard__value">{value}</div>
			<div class="wabi-statcard__label">{label}</div>
		</div>
	</div>

	{#if trend !== 0 || comparison}
	<div class="wabi-statcard__footer">
		{#if trend !== 0}
		<div class="wabi-statcard__trend" style="color: {trendColor}">
			<span class="wabi-statcard__trend-arrow">
				{#if trendDirection === 'up'}↑{:else if trendDirection === 'down'}↓{:else}→{/if}
			</span>
			<span class="wabi-statcard__trend-value">
				{Math.abs(trend)}%
			</span>
		</div>
		{/if}
		{#if comparison}
		<div class="wabi-statcard__comparison">{comparison}</div>
		{/if}
	</div>
	{/if}
</div>

<style>
	.wabi-statcard {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 3}}px;
		box-shadow: 0 {{multiply .Style.ShadowDepth 2}}px {{multiply .Style.ShadowDepth 4}}px rgba(0,0,0,{{.Style.ShadowDepth}});
		transition: all {{.Style.TransitionDuration}}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.wabi-statcard:hover {
		box-shadow: 0 {{multiply .Style.ShadowDepth 4}}px {{multiply .Style.ShadowDepth 8}}px rgba(0,0,0,{{multiply .Style.ShadowDepth 1.5}});
		transform: translateY(-2px);
	}

	.wabi-statcard__content {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 2}}px;
	}

	.wabi-statcard__icon {
		width: {{index .Style.SpacingScale 4}}px;
		height: {{index .Style.SpacingScale 4}}px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: {{.Style.Colors.Primary}}11;
		border-radius: {{.Style.BorderRadius}}px;
		color: {{.Style.Colors.Primary}};
		font-size: 1.5rem;
	}

	.wabi-statcard__main {
		flex: 1;
	}

	.wabi-statcard__value {
		font-family: {{.Style.FontPrimary}};
		font-size: 2rem;
		font-weight: 700;
		color: {{.Style.Colors.Text}};
		line-height: 1;
	}

	.wabi-statcard__label {
		font-family: {{.Style.FontSecondary}};
		font-size: 0.875rem;
		color: {{.Style.Colors.TextMuted}};
		margin-top: {{index .Style.SpacingScale 0}}px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wabi-statcard__footer {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 2}}px;
		margin-top: {{index .Style.SpacingScale 2}}px;
		padding-top: {{index .Style.SpacingScale 2}}px;
		border-top: 1px solid {{.Style.Colors.TextMuted}}22;
	}

	.wabi-statcard__trend {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 0}}px;
		font-family: {{.Style.FontMono}};
		font-size: 0.875rem;
		font-weight: 600;
	}

	.wabi-statcard__trend-arrow {
		font-size: 1rem;
	}

	.wabi-statcard__comparison {
		font-family: {{.Style.FontSecondary}};
		font-size: 0.75rem;
		color: {{.Style.Colors.TextMuted}};
	}
</style>`,
	}

	// CHART - Simple chart container
	e.Templates["Chart"] = ComponentTemplate{
		Name:        "Chart",
		Category:    "data",
		Description: "Chart container with title, legend, and slot for charting library",
		CSSVars:     []string{"--color-surface", "--color-text", "--shadow-depth"},
		Props: []PropDefinition{
			{Name: "title", Type: "string", Default: "Chart", MathBinding: "", Description: "Chart title"},
			{Name: "description", Type: "string", Default: "", MathBinding: "", Description: "Chart description"},
		},
		Template: `<script>
	export let title = "Chart";
	export let description = "";
</script>

<div class="wabi-chart">
	<div class="wabi-chart__header">
		<h3 class="wabi-chart__title">{title}</h3>
		{#if description}
		<p class="wabi-chart__description">{description}</p>
		{/if}
	</div>

	<div class="wabi-chart__legend">
		<slot name="legend" />
	</div>

	<div class="wabi-chart__area">
		<slot />
	</div>
</div>

<style>
	.wabi-chart {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 3}}px;
		box-shadow: 0 {{multiply .Style.ShadowDepth 2}}px {{multiply .Style.ShadowDepth 4}}px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-chart__header {
		margin-bottom: {{index .Style.SpacingScale 3}}px;
	}

	.wabi-chart__title {
		margin: 0;
		font-family: {{.Style.FontPrimary}};
		font-size: 1.5rem;
		color: {{.Style.Colors.Text}};
	}

	.wabi-chart__description {
		margin: {{index .Style.SpacingScale 1}}px 0 0 0;
		font-family: {{.Style.FontSecondary}};
		font-size: 0.875rem;
		color: {{.Style.Colors.TextMuted}};
	}

	.wabi-chart__legend {
		margin-bottom: {{index .Style.SpacingScale 2}}px;
	}

	.wabi-chart__area {
		min-height: 300px;
		position: relative;
	}

	/* Mathematical color palette for charts */
	.wabi-chart :global(.chart-color-1) { color: {{.Style.Colors.Primary}}; }
	.wabi-chart :global(.chart-color-2) { color: {{.Style.Colors.Accent}}; }
	.wabi-chart :global(.chart-color-3) { color: {{.Style.Colors.Safe}}; }
	.wabi-chart :global(.chart-color-4) { color: {{.Style.Colors.Gold}}; }
	.wabi-chart :global(.chart-color-5) { color: {{.Style.Colors.Danger}}; }
	.wabi-chart :global(.chart-color-6) { color: {{.Style.Colors.Secondary}}; }
</style>`,
	}

	// LIST - Vertical list with icons
	e.Templates["List"] = ComponentTemplate{
		Name:        "List",
		Category:    "data",
		Description: "Vertical list with icons, dividers, and selection",
		CSSVars:     []string{"--color-surface", "--color-text", "--color-primary"},
		Props: []PropDefinition{
			{Name: "items", Type: "array", Default: "[]", MathBinding: "", Description: "List items [{id, label, icon}]"},
			{Name: "selectable", Type: "boolean", Default: "false", MathBinding: "", Description: "Enable selection"},
		},
		Template: `<script>
	export let items = [];
	export let selectable = false;

	let selectedId = null;

	function selectItem(id) {
		if (selectable) {
			selectedId = id;
		}
	}
</script>

<div class="wabi-list">
	{#if items.length === 0}
	<div class="wabi-list__empty">
		<slot name="empty">No items to display</slot>
	</div>
	{:else}
	{#each items as item, i}
		<div
			class="wabi-list__item"
			class:wabi-list__item--selected={selectedId === item.id}
			class:wabi-list__item--selectable={selectable}
			on:click={() => selectItem(item.id)}
			on:keydown={(e) => e.key === 'Enter' && selectItem(item.id)}
			role={selectable ? 'button' : 'listitem'}
			tabindex={selectable ? 0 : -1}
		>
			{#if item.icon}
			<div class="wabi-list__icon">
				<slot name="icon" {item}>{item.icon}</slot>
			</div>
			{/if}

			<div class="wabi-list__content">
				<div class="wabi-list__label">{item.label}</div>
				{#if item.description}
				<div class="wabi-list__description">{item.description}</div>
				{/if}
			</div>

			{#if item.badge}
			<div class="wabi-list__badge">
				<slot name="badge" {item}>{item.badge}</slot>
			</div>
			{/if}
		</div>

		{#if i < items.length - 1}
		<div class="wabi-list__divider"></div>
		{/if}
	{/each}
	{/if}
</div>

<style>
	.wabi-list {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		overflow: hidden;
		box-shadow: 0 {{multiply .Style.ShadowDepth 2}}px {{multiply .Style.ShadowDepth 4}}px rgba(0,0,0,{{.Style.ShadowDepth}});
	}

	.wabi-list__empty {
		padding: {{index .Style.SpacingScale 4}}px;
		text-align: center;
		color: {{.Style.Colors.TextMuted}};
		font-family: {{.Style.FontSecondary}};
		font-style: italic;
	}

	.wabi-list__item {
		display: flex;
		align-items: center;
		gap: {{index .Style.SpacingScale 2}}px;
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		transition: background {{.Style.TransitionDuration}}ms;
	}

	.wabi-list__item--selectable {
		cursor: pointer;
	}

	.wabi-list__item--selectable:hover {
		background: {{.Style.Colors.Primary}}11;
	}

	.wabi-list__item--selected {
		background: {{.Style.Colors.Primary}}22;
		border-left: 4px solid {{.Style.Colors.Primary}};
	}

	.wabi-list__icon {
		width: {{index .Style.SpacingScale 3}}px;
		height: {{index .Style.SpacingScale 3}}px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: {{.Style.Colors.Primary}};
		font-size: 1.25rem;
	}

	.wabi-list__content {
		flex: 1;
	}

	.wabi-list__label {
		font-family: {{.Style.FontSecondary}};
		font-size: 1rem;
		color: {{.Style.Colors.Text}};
	}

	.wabi-list__description {
		font-family: {{.Style.FontSecondary}};
		font-size: 0.875rem;
		color: {{.Style.Colors.TextMuted}};
		margin-top: {{index .Style.SpacingScale 0}}px;
	}

	.wabi-list__badge {
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		background: {{.Style.Colors.Secondary}};
		color: white;
		border-radius: {{multiply .Style.BorderRadius 0.5}}px;
	}

	.wabi-list__divider {
		height: 1px;
		background: {{.Style.Colors.TextMuted}}22;
		margin: 0 {{index .Style.SpacingScale 2}}px;
	}
</style>`,
	}

	// TIMELINE - Vertical timeline with events
	e.Templates["Timeline"] = ComponentTemplate{
		Name:        "Timeline",
		Category:    "data",
		Description: "Vertical timeline with date markers and event cards",
		CSSVars:     []string{"--color-surface", "--color-text", "--color-primary"},
		Props: []PropDefinition{
			{Name: "events", Type: "array", Default: "[]", MathBinding: "", Description: "Timeline events [{date, title, description, side}]"},
		},
		Template: `<script>
	export let events = [];

	// Auto-alternate sides if not specified
	function getSide(event, index) {
		if (event.side) return event.side;
		return index % 2 === 0 ? 'left' : 'right';
	}
</script>

<div class="wabi-timeline">
	{#each events as event, i}
	<div
		class="wabi-timeline__item"
		class:wabi-timeline__item--left={getSide(event, i) === 'left'}
		class:wabi-timeline__item--right={getSide(event, i) === 'right'}
	>
		<div class="wabi-timeline__marker">
			<div class="wabi-timeline__dot"></div>
		</div>

		<div class="wabi-timeline__content">
			<div class="wabi-timeline__date">{event.date}</div>
			<div class="wabi-timeline__card">
				<h4 class="wabi-timeline__title">{event.title}</h4>
				{#if event.description}
				<p class="wabi-timeline__description">{event.description}</p>
				{/if}
				{#if event.tags}
				<div class="wabi-timeline__tags">
					{#each event.tags as tag}
					<span class="wabi-timeline__tag">{tag}</span>
					{/each}
				</div>
				{/if}
			</div>
		</div>
	</div>
	{/each}

	<!-- Vertical connecting line -->
	<div class="wabi-timeline__line"></div>
</div>

<style>
	.wabi-timeline {
		position: relative;
		padding: {{index .Style.SpacingScale 3}}px 0;
	}

	.wabi-timeline__line {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 2px;
		background: {{.Style.Colors.Primary}};
		transform: translateX(-50%);
		z-index: 0;
	}

	.wabi-timeline__item {
		position: relative;
		display: flex;
		align-items: flex-start;
		margin-bottom: {{index .Style.SpacingScale 4}}px;
		z-index: 1;
	}

	.wabi-timeline__item--left {
		flex-direction: row;
	}

	.wabi-timeline__item--left .wabi-timeline__content {
		padding-right: calc(50% + {{index .Style.SpacingScale 3}}px);
	}

	.wabi-timeline__item--right {
		flex-direction: row-reverse;
	}

	.wabi-timeline__item--right .wabi-timeline__content {
		padding-left: calc(50% + {{index .Style.SpacingScale 3}}px);
	}

	.wabi-timeline__marker {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		z-index: 2;
	}

	.wabi-timeline__dot {
		width: {{index .Style.SpacingScale 2}}px;
		height: {{index .Style.SpacingScale 2}}px;
		background: {{.Style.Colors.Primary}};
		border: 3px solid {{.Style.Colors.Surface}};
		border-radius: 50%;
		box-shadow: 0 0 0 4px {{.Style.Colors.Primary}}22;
	}

	.wabi-timeline__content {
		flex: 1;
	}

	.wabi-timeline__date {
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
		color: {{.Style.Colors.TextMuted}};
		margin-bottom: {{index .Style.SpacingScale 1}}px;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.wabi-timeline__card {
		background: {{.Style.Colors.Surface}};
		border-radius: {{.Style.BorderRadius}}px;
		padding: {{index .Style.SpacingScale 2}}px {{index .Style.SpacingScale 3}}px;
		box-shadow: 0 {{multiply .Style.ShadowDepth 2}}px {{multiply .Style.ShadowDepth 4}}px rgba(0,0,0,{{.Style.ShadowDepth}});
		transition: all {{.Style.TransitionDuration}}ms;
	}

	.wabi-timeline__card:hover {
		box-shadow: 0 {{multiply .Style.ShadowDepth 4}}px {{multiply .Style.ShadowDepth 8}}px rgba(0,0,0,{{multiply .Style.ShadowDepth 1.5}});
		transform: translateY(-2px);
	}

	.wabi-timeline__title {
		margin: 0 0 {{index .Style.SpacingScale 1}}px 0;
		font-family: {{.Style.FontPrimary}};
		font-size: 1.125rem;
		color: {{.Style.Colors.Text}};
	}

	.wabi-timeline__description {
		margin: 0;
		font-family: {{.Style.FontSecondary}};
		font-size: 0.875rem;
		color: {{.Style.Colors.TextMuted}};
		line-height: 1.5;
	}

	.wabi-timeline__tags {
		display: flex;
		flex-wrap: wrap;
		gap: {{index .Style.SpacingScale 1}}px;
		margin-top: {{index .Style.SpacingScale 2}}px;
	}

	.wabi-timeline__tag {
		display: inline-flex;
		padding: {{index .Style.SpacingScale 0}}px {{index .Style.SpacingScale 1}}px;
		background: {{.Style.Colors.Primary}}11;
		color: {{.Style.Colors.Primary}};
		border-radius: {{multiply .Style.BorderRadius 0.5}}px;
		font-family: {{.Style.FontMono}};
		font-size: 0.75rem;
	}
</style>`,
	}
}
