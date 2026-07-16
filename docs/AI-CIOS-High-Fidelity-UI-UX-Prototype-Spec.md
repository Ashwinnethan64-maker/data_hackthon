# AI-CIOS

## High-Fidelity UI/UX Prototype Spec

**Product:** AI Crime Intelligence Operating System  
**Version:** v1.0 Hackathon MVP  
**Purpose:** convert the product vision, design system, and blueprint into a concrete, high-fidelity design reference that can guide implementation screen by screen.

This is the first tangible asset after the planning phases. It defines how the product should look and feel before the first line of frontend code is written.

## 1. Design Objective

AI-CIOS should feel like a polished police intelligence SaaS product, not a student dashboard.

The interface must communicate:
- Trust
- Intelligence
- Security
- Speed
- Professionalism
- Operational seriousness

## 2. Brand Direction

### Brand Positioning
AI-CIOS is a command-center style intelligence platform for investigators, analysts, supervisors, and policymakers.

### Brand Personality
- Authoritative
- Calm
- Precise
- Modern
- Evidence-driven
- Enterprise-grade

### Visual Story
The user should feel like they are operating inside a secure intelligence suite, not browsing a web app.

## 3. Visual Identity

### Logo Direction
- Use a shield, radar, or command-grid motif.
- Avoid cartoon or playful imagery.
- Keep the mark geometric and minimal.
- Pair the icon with a strong wordmark.

### Icon Style
- Lucide React icon style
- Thin, consistent strokes
- No decorative or filled icons unless status-driven

### Typography
- Headings: Inter Bold
- Body: Inter Regular
- Numbers: JetBrains Mono

### Color System
- Deep Navy: `#081120`
- Police Blue: `#1D4ED8`
- Cyan: `#06B6D4`
- Success Green: `#22C55E`
- Warning Orange: `#F59E0B`
- Danger Red: `#EF4444`
- Background: `#F8FAFC`

### Brand Rule
Color must always carry meaning. Red means risk. Blue means action. Cyan means intelligence.

## 4. High-Fidelity Layout Language

### Overall Structure
- Desktop-first
- Persistent sidebar
- Persistent top navbar
- Command-center style workspace
- Strong card hierarchy
- Dense but readable information architecture

### Layout Grid
- 12-column desktop grid
- 8-column tablet grid
- Single-column mobile fallback
- Cards should align to a predictable rhythm with consistent spacing

### Spacing System
- Base spacing: 8px
- Section spacing: 24px to 32px
- Card padding: 20px to 24px
- Dense data areas may reduce padding slightly but must remain readable

### Border and Radius Style
- Rounded medium corners
- Clean edges
- No overly soft consumer-style shapes
- Shadows should be subtle and controlled

## 5. Shell Prototype

### Sidebar
- Width: 280px
- Dark navy background
- Active item highlighted in police blue
- Each item has an icon and label
- Footer includes user profile and logout

### Top Navbar
- Search field
- Notification icon
- Language selector
- Quick actions button
- Time display
- Profile menu

### Shell Behavior
- Sidebar fixed on desktop
- Navbar fixed at top
- Main workspace changes by route
- Context panels appear only when needed

## 6. Screen-by-Screen High-Fidelity Direction

## 6.1 Login Screen

### Purpose
Create immediate trust and a secure first impression.

### Layout
- Full-screen dark or split background
- Left side: brand story and mission statement
- Right side: login card

### Components
- Logo
- Product title
- Short tagline
- Username/password fields or Catalyst auth entry
- Role hint
- Login button
- Error state area

### Visual Style
- High contrast
- Minimal but premium
- Strong focus ring on inputs
- One primary action only

### Sample Copy
AI-CIOS
AI Crime Intelligence Operating System
Secure intelligence for investigators and analysts.

## 6.2 Mission Control Dashboard

### Purpose
Answer: what should I know right now?

### Layout
- Hero greeting row
- KPI cards row
- Trend and heatmap row
- AI Insight and alerts row
- Network preview and recent cases row
- Quick AI actions row

### Priority Hierarchy
1. KPI cards
2. AI Insight
3. Alerts
4. Trends
5. Recent cases
6. Quick actions

### KPI Cards
- Total FIRs
- Active Cases
- Repeat Offenders
- Crime Hotspots
- Charge Sheets
- Pending Investigations

### Visual Style
- KPI cards in a bright surface area or elevated glass-like panel
- Numbers large and mono-spaced
- Trend chips small and color-coded
- Each card clickable for drill-down

### Hero Copy
Good Morning, Officer
Here’s the current intelligence picture.

### Dashboard Widgets
- KPI cards
- Crime trend chart
- Karnataka heatmap preview
- AI Insight card
- Recent alerts
- Recent FIRs
- Criminal network preview
- Quick actions panel

### Dashboard Quick Actions
- Ask AI
- Search FIR
- Generate Report
- Open Alerts

## 6.3 AI Investigator

### Purpose
Provide the main natural-language investigation experience.

### Layout
- Left: conversation history
- Center: AI response stream
- Right: evidence and related cases

### Response Card Structure
- Answer summary
- Confidence badge
- Evidence list
- Related cases
- Suggested next questions

### Visual Style
- Responses should feel like intelligence briefings
- Evidence section visually separated from the answer
- Suggested questions presented as clickable chips
- The input box should feel prominent and immediate

### Sample Prompt Area
Ask AI about cases, suspects, trends, or locations.

### Sample Response Layout
Answer
Evidence
Related Cases
Suggested Next Questions

## 6.4 Case Explorer

### Purpose
Help users search, filter, sort, and open records quickly.

### Layout
- Advanced search header
- Filter strip or drawer
- Result count and sort controls
- Dense data table

### Table Style
- Strong header row
- Alternating or subtle row separation
- Clear status pills
- Compact but readable actions column

### Table Columns
- FIR
- Crime
- Victim
- Accused
- Station
- Officer
- Status
- Actions

### Interaction Style
- Hover row highlight
- Click row to open details
- Clear filter reset
- Pagination at bottom or sticky control area

## 6.5 Case Details

### Purpose
Show one case as a complete investigation story.

### Layout
- Header summary row
- Main summary panel
- Timeline panel
- Victims panel
- Accused panel
- Acts panel
- Evidence panel
- AI summary panel
- Similar cases panel

### Header Data
- FIR number
- Crime number
- Status chip
- District and station
- Registered date
- Primary actions

### Primary Actions
- Ask AI
- Export PDF
- Open network
- Add to report

### Visual Style
- Header should feel like a case file cover sheet
- Timeline should be visually clear and step-based
- Entity chips should be interactive and scan-friendly

## 6.6 Criminal Network

### Purpose
This is the strongest visual wow moment.

### Layout
- Full-screen or near full-screen dark canvas
- Filter bar
- Node legend
- Right details panel

### Node Color Language
- People: blue
- Crime: red
- Police: green
- Acts: orange
- Courts and locations: neutral accent tones as needed

### Interaction
- Zoom and pan
- Node hover
- Node click for details
- Expand/collapse relationships
- Ask AI action for explanation

### Visual Rule
The graph should feel precise and operational, not decorative.

## 6.7 Crime Intelligence Map

### Purpose
Reveal hotspots and geography-driven intelligence.

### Layout
- Full-screen map canvas
- Filter bar
- Legend
- Drill-down drawer or side panel

### Map Layers
- Heatmap
- District boundaries
- Station markers
- Cluster markers
- Time overlay if useful

### Interaction
- Filter changes update the view immediately
- Clicking a hotspot reveals local intelligence
- AI action explains why a district is high risk

## 6.8 Analytics

### Purpose
Show patterns, comparisons, and trend signals.

### Layout
- KPI strip
- Chart grid
- Comparison section
- Trend panels

### Chart Set
- Crime trends
- Crime categories
- District comparison
- Repeat offenders
- Arrest trends

### Visual Rule
Each chart must communicate one insight, not repeat the others.

## 6.9 Reports

### Purpose
Turn intelligence into formal output.

### Layout
- Report type selector
- Preview panel
- Export controls
- Status feedback

### Report Types
- Case PDF
- Analytics PDF
- AI conversation PDF
- Executive summary

### Visual Style
- Formal, document-like, dependable
- Minimal distractions
- Clear preview-to-export progression

## 6.10 Settings

### Purpose
Keep configuration simple and operational.

### Sections
- Profile
- Role context
- Language
- Notifications
- Session settings

### Visual Style
- Minimal
- Functional
- No unnecessary density

## 7. Component-Level Design Spec

### Core Components
- Sidebar
- Navbar
- KPI Card
- Search Bar
- Filter Panel
- Table
- Badge
- Modal
- Empty State
- Loading Skeleton
- Chart Card
- Map Container
- Graph Container
- AI Response Card
- Evidence Panel
- Report Preview Card

### Component Rules
- All buttons must have clear hierarchy
- All cards should align to the same border radius system
- All empty states must guide action
- All loading states should preserve layout dimensions
- All AI cards must include evidence and next steps

## 8. States and Feedback

### Loading States
- Skeleton cards on dashboard
- Table loading shimmer
- AI typing indicator
- Map and graph loading placeholders

### Empty States
- No results found
- No alerts yet
- No similar cases found
- No network relationship available

### Error States
- Clear, friendly, and actionable
- Avoid technical stack traces
- Keep internal errors hidden from users

## 9. Interaction Quality Rules

- Hover states must feel subtle and responsive.
- Buttons should feel tactile, not flashy.
- Charts should animate gently into view.
- Page transitions should be quick and restrained.
- AI response updates should feel like controlled streaming.

## 10. Accessibility Rules

- High contrast
- Large click targets
- Readable line length
- Keyboard-friendly interactions where practical
- Clear focus states
- No meaning conveyed by color alone

## 11. Responsive Behavior

### Desktop
Primary and fully detailed.

### Tablet
Stack secondary areas without breaking the main workflow.

### Mobile
Minimum viable reading and demo viewing support.

## 12. High-Fidelity Content Strategy

### Tone of Copy
- Short
- Operational
- Direct
- Evidence-oriented

### Avoid
- Casual marketing copy
- Overly friendly UI language
- Generic dashboard filler text

### Example Microcopy
- No cases found for this filter.
- Evidence available for 3 records.
- This response is based on structured records.
- Suggested follow-up questions.

## 13. Build Order Impact

This high-fidelity prototype should guide the first implementation milestones:
- Brand identity
- Layout shell
- Design system components
- Dashboard
- AI Investigator
- Case Explorer
- Case Details
- Criminal Network
- Crime Map
- Analytics
- Reports

## 14. Definition of Done

This prototype spec is complete when:
- Every major screen has a visual direction
- Every core component has a consistent style
- The AI experience feels integrated
- The mission-control dashboard is clearly defined
- The product reads like a real police intelligence SaaS app

## 15. Final Statement

This is the first tangible deliverable that turns AI-CIOS from a plan into a product direction.

It gives us a visual contract for implementation and ensures the frontend, AI flow, and presentation story all feel like one cohesive intelligence platform.