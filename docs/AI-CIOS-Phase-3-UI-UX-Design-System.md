# AI-CIOS

## Phase 3 - UI/UX Design System

**Product:** AI Crime Intelligence Operating System  
**Version:** v1.0 Hackathon MVP  
**Purpose of this phase:** define the visual identity, layout system, navigation model, component language, and page composition so the product feels like real police intelligence software.

This phase intentionally avoids generic admin-dashboard styling. The goal is a Mission Control experience that communicates intelligence, trust, speed, and operational seriousness.

## 1. Design Direction

AI-CIOS should look like software used in a Police Intelligence Command Center.

The interface should feel:

- Enterprise-grade
- Secure
- Fast
- High signal
- Operational
- Calm under pressure

It should not feel like:

- A student project
- A generic chatbot
- A standard CRM/admin dashboard
- A marketing website

## 2. Visual Inspiration

Use the design language of systems such as:

- Microsoft Security Copilot
- Palantir Gotham
- IBM i2 Analyst Notebook
- Splunk
- Azure Sentinel
- ArcGIS Intelligence

These references imply dense information, strong hierarchy, dark command surfaces, and confidence in the data.

## 3. Core Design Principles

1. Every screen must answer the question: what matters right now?
2. The UI should guide action, not just display information.
3. High-priority items should be visually dominant.
4. Deep analysis views should reveal detail progressively.
5. AI output must always be paired with evidence.
6. Visual clutter should be removed aggressively.
7. Interactive data views should feel precise and professional.
8. Motion should support comprehension, not entertainment.

## 4. Color System

### Primary Surface
- Deep Navy: `#081120`
- Use for sidebar, top navbar, main dark command surfaces, and high-trust background regions.

### Secondary
- Police Blue: `#1D4ED8`
- Use for buttons, key highlights, links, active states, and primary actions.

### Accent
- Cyan: `#06B6D4`
- Use for AI moments, charts, graphs, signals, and analytic emphasis.

### Status Colors
- Success Green: `#22C55E`
- Warning Orange: `#F59E0B`
- Danger Red: `#EF4444`

### Light Background
- Background: `#F8FAFC`
- Use for lighter analytics canvases, cards, tables, and supporting panels.

### Usage Rules
- Navy should anchor the experience.
- Blue should indicate action and selection.
- Cyan should signal intelligence and system insight.
- Red should be reserved for risk, alerts, and crimes requiring attention.
- Do not use colors decoratively without meaning.

## 5. Typography

### Headings
- Inter Bold

### Body
- Inter Regular

### Numeric / Data Display
- JetBrains Mono

### Typography Rules
- Headings should be concise and operational.
- Numbers should feel precise and machine-like.
- Do not use playful display fonts.
- Data tables and KPI cards should use clear hierarchy and tight spacing.

## 6. Iconography

Use Lucide React across the project.

### Icon Rules
- Keep icons consistent in stroke style and weight.
- Use icons to support scanability, not decoration.
- Match icon meaning to the underlying action or data type.

## 7. Layout System

### App Shell
- Top navbar spans the full width.
- Sidebar is fixed at `280px`.
- Main workspace occupies the remaining space.
- Desktop-first layout is the default.

### Core Shell Structure
- Sidebar on the left
- Mission-control workspace in the center
- Context and quick actions in the top and right zones as needed

### Layout Behavior
- The shell should support dense information without feeling crowded.
- Each page should have a clear primary region and supporting regions.
- Secondary information should collapse or stack on smaller screens.

## 8. Navigation Model

### Sidebar Items
- Dashboard
- AI Investigator
- Case Explorer
- Criminal Network
- Crime Map
- Analytics
- Reports
- Settings

### Sidebar Behavior
- Fixed width: `280px`
- Current section should be visibly active
- Bottom area should contain user profile and logout
- Use compact labels with clear icons

### Navbar Contents
- Search
- Notifications
- Language selector
- Profile menu
- Current time
- Quick actions

### Quick Actions
- Ask AI
- Search FIR
- Generate Report
- Open Alerts

## 9. Mission Control Dashboard

The dashboard should not look like a normal admin home page. It should feel like an operational command center.

### Dashboard Goal
Answer: “What should I know right now?”

### Suggested Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ AI-CIOS                                      Officer Ash     │
├──────────────────────────────────────────────────────────────┤
│ Sidebar │ KPI Cards                                      🔔 │
│         ├───────────────────────────────────────────────────┤
│         │ Crime Trend │ Karnataka Heatmap │ AI Insights     │
│         ├───────────────────────────────────────────────────┤
│         │ Criminal Network │ Recent Cases │ Alerts          │
│         ├───────────────────────────────────────────────────┤
│         │ Quick AI Actions                                  │
│         │ • Ask AI                                           │
│         │ • Search FIR                                       │
│         │ • Generate Report                                  │
└──────────────────────────────────────────────────────────────┘
```

### Dashboard Modules
- KPI Cards
- Crime Trend
- Heatmap
- AI Insights
- Recent Alerts
- Criminal Network Preview
- Recent Cases
- Quick AI Actions

### Dashboard Rules
- The most important item should have the strongest visual weight.
- KPI cards should be readable at a glance.
- AI insight should feel like a command recommendation.
- Alerts should be visible but not noisy.
- The dashboard should always suggest the next step.

## 10. KPI Card Design

### Key Metrics
- Total FIRs
- Active Cases
- Repeat Offenders
- Crime Hotspots
- Charge Sheets
- Pending Investigations

### KPI Card Rules
- Large numeric value
- Short label
- Small trend indicator
- Optional delta or status chip
- Clean icon or micro-chart where relevant

### Visual Style
- Dark or light card depending on section context
- Strong contrast
- Tight padding
- No decorative clutter

## 11. AI Investigator Experience

The AI Investigator is the centerpiece of the product.

### Layout Structure
- Conversation panel
- AI response panel
- Evidence panel
- Related cases panel
- Suggested questions panel

### Required Response Sections
- Summary
- Evidence
- Confidence
- Related cases
- Suggested next questions

### AI UX Rules
- The AI should never feel like a generic chat bubble thread.
- Every answer should look like an intelligence briefing.
- Evidence must be visually separated from the summary.
- Suggested follow-up questions should keep the user moving.

## 12. Case Explorer

### Purpose
Professional search and filtering interface for records.

### Layout
- Advanced search area at the top
- Filter row or filter drawer
- Results table below

### Table Columns
- FIR
- Crime
- Victim
- Accused
- Station
- Officer
- Status
- Actions

### Table Rules
- Results must be sortable.
- Filters must be clear and easy to reset.
- Actions should be visible without overwhelming the row.
- The table should feel like a high-performance operational tool.

## 13. Case Details

### Required Sections
- Case summary header
- Timeline
- Victims
- Accused
- Applicable acts
- Evidence
- AI summary
- Similar cases

### Case Detail Rules
- The header should immediately identify the case.
- The timeline should show progression clearly.
- Related entities should be scannable and clickable.
- AI summary should complement the raw case data.

## 14. Criminal Network

This is the strongest visual wow moment.

### Experience Requirements
- Dark background
- Interactive network graph
- Hover state
- Zoom
- Pan
- Expand nodes
- Click-through on any node

### Node Categories
- People: blue
- Crime: red
- Police: green
- Acts: orange

### Graph Rules
- The graph should emphasize relationships, not aesthetics alone.
- Node labels should remain readable.
- Interactions should be immediate and fluid.
- The user should be able to move from graph to case detail quickly.

## 15. Crime Intelligence Map

### Experience Requirements
- Full-screen or near full-screen canvas
- District filters
- Police station filters
- Crime type filters
- Date filters
- Heatmap layer
- Clusters
- Pins

### Map Rules
- Default view should show the most relevant intelligence layer.
- Filters should be quick to change.
- Spatial hotspots should be visually obvious.
- The map should support drill-down into district and station-level views.

## 16. Analytics Design

### Core Views
- Bar charts
- Pie charts
- Timeline charts
- District comparison
- Forecast panels
- Heatmaps
- Trend analysis views

### Analytics Rules
- Use charts only when they reveal a pattern.
- Keep labels explicit and readable.
- Pair charts with short interpretive captions when helpful.
- Do not overload the page with chart types that say the same thing.

## 17. Reports Design

### Report Types
- Case PDF
- Analytics PDF
- Conversation PDF
- Executive report

### Report Workflow
- Select report type
- Preview content
- Export PDF
- Share or download

### Report Rules
- Reports should look formal and readable.
- The PDF output should preserve hierarchy.
- Report generation should feel like the final step of a real investigation workflow.

## 18. Motion and Interaction

Motion must be subtle and functional.

### Allowed Motion
- Card fade-in
- Chart grow-in
- Sidebar slide
- Button hover
- Panel reveal

### Motion Rules
- No flashy transitions
- No gimmicky easing effects
- Motion should help users understand hierarchy and change
- Animations should feel professional and restrained

## 19. Accessibility

### Requirements
- High contrast
- Readable fonts
- Large click targets
- Keyboard navigation where practical
- Clear focus states
- Avoid relying on color alone

### Accessibility Rules
- Critical alerts must not depend only on color.
- Tables, charts, and graph labels should remain legible.
- Interactive elements should remain usable in a dense enterprise layout.

## 20. Responsive Strategy

### Desktop
Primary target. Full command-center experience.

### Tablet
Supported. Should retain key workflows and responsive panels.

### Mobile
Demo-friendly only. The app should remain usable, but mobile is not the primary story.

## 21. Reusable Component Library

- Sidebar
- Top Navbar
- KPI Cards
- Data Tables
- Search Bar
- Filters
- Chat Window
- Timeline
- Network Graph
- Heatmap
- Charts
- PDF Button
- Alert Cards
- Loading Skeletons
- Empty States
- Modal Dialogs

### Component Rules
- Keep styles consistent across modules.
- Prefer reusable patterns over one-off page-specific designs.
- Make each component visually strong enough for enterprise use.

## 22. Final Experience Goal

When a judge opens the application, the first impression should be:

- This is real software.
- This is built for operations.
- This looks trustworthy.
- This can support decision-making.

The best framing for the product is not “chat plus dashboard.”
It is a **Mission Control intelligence system**.

## 23. Phase 3 Deliverables

- Visual identity
- Color palette
- Typography
- Layout structure
- Navigation
- Dashboard composition
- AI chat experience
- Network graph concept
- Crime map concept
- Analytics design
- Report workflow
- UX principles
