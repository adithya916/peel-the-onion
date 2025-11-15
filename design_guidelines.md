# TOR Unveil - Design Guidelines

## Design Approach

**System Foundation: Carbon Design System + Cybersecurity Dashboard Patterns**

This forensic analysis tool requires a data-dense, professional interface optimized for investigative workflows. Drawing from IBM Carbon Design (enterprise data applications) combined with modern dashboard patterns from Linear and Grafana, prioritizing information clarity, rapid comprehension, and professional credibility for law enforcement use.

**Core Principles:**
- Information density over decoration
- Immediate data legibility
- Professional, authoritative aesthetic
- Functional hierarchy through typography and spacing
- Minimal animation (data focus)

## Typography System

**Font Stack:** Inter (primary), JetBrains Mono (code/data)

**Hierarchy:**
- Dashboard Title: text-2xl font-semibold (32px)
- Section Headers: text-xl font-semibold (24px)
- Card Headers: text-lg font-medium (20px)
- Body Text: text-sm font-normal (14px)
- Data Labels: text-xs font-medium uppercase tracking-wide (12px)
- Metrics/Numbers: text-3xl font-bold tabular-nums (36px)
- Code/IPs: font-mono text-sm (14px)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Card spacing: space-y-4
- Grid gaps: gap-4 or gap-6

**Grid Structure:**
- Main dashboard: 12-column grid
- Sidebar navigation: 256px fixed width
- Content area: flex-1 with max-w-7xl
- Cards: Grid layouts with grid-cols-1 lg:grid-cols-2 xl:grid-cols-3

## Component Library

### Navigation & Structure

**Sidebar Navigation (Fixed Left):**
- Width: w-64
- Sections: Dashboard, Data Collection, Traffic Analysis, Node Correlation, Visualization, Reports
- Navigation items with icon + label
- Active state indication
- Collapse functionality for mobile

**Top Bar:**
- Height: h-16
- Contains: System status indicator, real-time analysis toggle, user profile, export button
- Fixed position with subtle shadow/border

### Data Display Components

**Metric Cards:**
- Padding: p-6
- Structure: Label (text-xs uppercase), Value (text-3xl font-bold tabular-nums), Change indicator, Mini sparkline chart
- Grid: 3-4 cards per row on desktop
- Example metrics: Total Nodes Analyzed, Active Correlations, Identified Entry Nodes, Confidence Score

**Data Tables:**
- Compact density with text-sm
- Column headers: text-xs font-medium uppercase sticky top
- Row hover states
- Sortable columns with icon indicators
- Action buttons per row (view details, export)
- Pagination at bottom
- Alternating row treatment for readability

**Network Topology Graph (Canvas/SVG):**
- Full-width container with min-h-screen aspect
- Node representations: Circles with size based on importance
- Edge lines showing connections with directional indicators
- Interactive zoom/pan controls in top-right
- Legend panel explaining node types
- Selected node detail panel (slide-in from right)

**Timeline Visualization:**
- Horizontal timeline with packet flow events
- Markers for correlation points
- Zoom controls for time range selection
- Event details on hover
- Playback controls for animated reconstruction

### Analysis Components

**Correlation Matrix:**
- Heat map grid showing entry/exit node correlations
- Cell hover shows detailed statistics
- Color intensity indicates confidence level
- Row/column labels with node identifiers

**Confidence Score Display:**
- Radial progress indicator or horizontal bar
- Numerical percentage
- Classification label (High/Medium/Low)
- Breakdown of contributing factors

**PCAP Upload Zone:**
- Drag-and-drop area with dashed border
- File type indicator (.pcap, .pcapng)
- Upload progress bar
- Parsed file information display post-upload

### Forensic Reporting

**Report Generation Panel:**
- Form inputs: Date range, node filters, report type
- Preview section showing report structure
- Export options: JSON, PDF, CSV
- Template selection (if multiple formats)

**Report Preview Cards:**
- Thumbnail of report content
- Metadata: Generated date, node count, confidence summary
- Download and share buttons

### Forms & Controls

**Input Fields:**
- Standard height: h-10
- Border treatment with focus states
- Label positioning: text-sm font-medium mb-2
- Helper text: text-xs below input
- Validation states with inline messaging

**Buttons:**
- Primary (actions): px-6 py-2.5 text-sm font-medium rounded-md
- Secondary (cancel/alternative): Similar sizing with different treatment
- Icon buttons: Square h-10 w-10 for actions
- Loading states with spinner

**Filters & Search:**
- Search bar: Prominent with icon, placeholder "Search nodes, IPs, fingerprints..."
- Filter dropdowns: Multi-select with checkboxes
- Active filter chips with remove option
- Clear all filters button

### Status Indicators

**Node Status Badges:**
- Pill-shaped: px-3 py-1 text-xs font-medium rounded-full
- Types: Entry/Guard, Middle, Exit, Unknown
- Status: Active, Inactive, Analyzing

**Alert Notifications:**
- Toast notifications (top-right) for system events
- Persistent banner for critical alerts
- Dismissible with icon

## Dashboard Layout Patterns

**Main Dashboard View:**
- Top metrics row (4 cards)
- Middle section: 2-column grid (Recent correlations table + Active analysis status)
- Bottom: Network topology preview with "View Full Graph" button

**Analysis View:**
- Left: Controls panel (filters, PCAP upload)
- Center: Large visualization area
- Right: Details sidebar (selected node info, correlation statistics)

**Reports View:**
- Header with "Generate New Report" button
- Grid of existing reports (cards)
- Filtering and sorting controls

## Data Visualization Principles

- Use D3.js for network graphs with force-directed layout
- Plotly for statistical charts (correlation plots, histograms)
- Real-time updates with smooth transitions
- Interactive legends
- Tooltips with detailed information on hover
- Zoom/pan capabilities for complex graphs
- Export visualization as PNG/SVG option

## Responsive Behavior

- Desktop-first approach (primary use case)
- Tablet: Sidebar collapses to icon-only
- Mobile: Stack all cards to single column, hamburger menu for navigation
- Tables switch to card view on mobile

## Performance Considerations

- Virtualized scrolling for large data tables
- Lazy loading for network graph nodes
- Progressive data loading for real-time analysis
- Skeleton loaders during data fetch

## Accessibility

- High contrast ratios for text
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus indicators on all focusable elements

**No decorative animations** - functional transitions only (data updates, panel slides). Professional, data-focused aesthetic throughout.