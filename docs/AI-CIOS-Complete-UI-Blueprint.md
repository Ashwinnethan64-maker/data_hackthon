# AI-CIOS

## Complete UI Blueprint

**Product:** AI Crime Intelligence Operating System  
**Version:** v1.0 Hackathon MVP  
**Purpose:** single source of truth for every screen, card, chart, table, button, popup, and interaction before implementation begins.

This blueprint sits on top of the product design, design system, and system architecture documents. It defines what the interface contains and how the user moves through it.

## 1. Blueprint Objective

The UI must feel like a real Police Intelligence Command Center.

The interface should:

- Prioritize operational clarity
- Keep the most important action visible
- Guide users toward outcomes
- Support fast scanning and drill-down
- Make AI feel embedded across the platform
- Stay polished enough for a judge-facing demo

## 2. Source Documents

This blueprint is aligned with:

- Phase 2 - Product Design
- Phase 3 - UI/UX Design System
- Phase 4 - System Architecture and Technical Blueprint

## 3. Global UI Rules

1. Every page must have one primary action.
2. Every page must answer what matters right now.
3. AI output must include evidence.
4. Tables, graphs, and maps must support drill-down.
5. Empty states must suggest what to do next.
6. Loading states must preserve context.
7. Popups should be rare and purposeful.
8. The UI should stay dense but readable.

## 4. Application Shell

### Shell Layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Top Navbar                                                   │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│   Sidebar     │               Main Workspace                 │
│               │                                              │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Shell Components
- Sidebar
- Top Navbar
- Page Header
- Main Workspace
- Context Panel when needed

### Shell Behavior
- Sidebar stays fixed on desktop.
- Navbar stays visible for search and quick actions.
- Main workspace changes based on route.
- Secondary context panels appear only when useful.

## 5. Routing Blueprint

### Routes
- `/` redirect to dashboard or login depending on auth state
- `/login`
- `/dashboard`
- `/ai`
- `/cases`
- `/case/:id`
- `/network`
- `/map`
- `/analytics`
- `/reports`
- `/settings`

### Routing Rules
- Each route must map to a clear task.
- Deep links should open the correct focused view.
- Return navigation should preserve the previous context where possible.

## 6. Global Navigation Model

### Sidebar Items
- Dashboard
- AI Investigator
- Case Explorer
- Criminal Network
- Crime Map
- Analytics
- Reports
- Settings

### Sidebar Footer
- User profile
- Logout

### Navbar Items
- Search
- Notifications
- Language
- User menu
- Quick actions

### Quick Actions
- Ask AI
- Search FIR
- Generate Report
- Open Alerts

## 7. Screen Inventory

### Primary Screens
- Login
- Dashboard
- AI Investigator
- Case Explorer
- Case Details
- Criminal Network
- Crime Intelligence Map
- Analytics
- Reports
- Settings

### Supporting States
- Loading state
- Empty state
- Error state
- No results state
- Permission denied state
- Offline or degraded state

## 8. Login Screen Blueprint

### Screen Goal
Authenticate the user and set a serious, enterprise tone.

### Layout
- Product logo / title
- Short mission statement
- Username / password or Catalyst auth flow
- Role hint or access context when available
- Submit button

### Elements
- Login card
- Remember me toggle if needed
- Forgot password link if supported
- Error message region

### Interactions
- Validation on submit
- Loading state while authenticating
- Clear message on failure
- Redirect to dashboard on success

## 9. Dashboard Blueprint

### Screen Goal
Answer: what should I know right now?

### Layout Sections
- Morning / greeting header
- KPI cards row
- Trend and heatmap row
- AI insight and alerts row
- Network preview and recent cases row
- Quick AI actions panel

### Cards and Widgets
- Total FIRs
- Active Cases
- Repeat Offenders
- Crime Hotspots
- Charge Sheets
- Pending Investigations
- Crime Trend chart
- Karnataka heatmap
- AI Insight card
- Recent Alerts card
- Criminal Network preview
- Recent Cases table
- Quick Actions card

### Interactions
- Clicking a KPI opens filtered analytics or case explorer
- Clicking an alert opens relevant case or alert detail
- Clicking the network preview opens the Criminal Network screen
- Quick AI actions open the AI Investigator with a prefilled prompt

### Dashboard States
- Skeleton loading for cards and charts
- Empty insight state when data is unavailable
- Highlighted urgent alert when critical incidents exist

## 10. AI Investigator Blueprint

### Screen Goal
Let the user ask natural language questions and get evidence-backed answers.

### Layout Sections
- Conversation timeline
- Prompt input area
- AI response block
- Evidence block
- Related cases block
- Suggested questions block

### UI Elements
- Chat input
- Send button
- Prompt chips
- Conversation history list
- Response summary card
- Evidence list
- Confidence indicator
- Related cases cards
- Suggested follow-up question chips
- Export PDF button

### Response Structure
- Summary
- Evidence
- Confidence
- Related cases
- Suggested next questions

### Interactions
- Enter key submits prompt
- Follow-up chips append new queries
- Evidence items open source records
- Export button generates report from conversation

### AI States
- Typing indicator
- Streaming response state
- No-answer state with explanation
- Error state when no traceable evidence exists

## 11. Case Explorer Blueprint

### Screen Goal
Find the right record fast.

### Layout Sections
- Advanced search bar
- Filter panel or filter row
- Result count and sort controls
- Results table

### Search Inputs
- FIR Number
- Crime Number
- Victim
- Accused
- Officer
- District
- Station
- Crime Head
- Status
- Date

### Table Columns
- FIR
- Crime
- Victim
- Accused
- Station
- Officer
- Status
- Actions

### Actions
- View case
- Open AI summary
- Add to report
- Open network view

### Interactions
- Search should update results without friction
- Filters should be clearable individually and globally
- Row click should open case details
- Action buttons should not overwhelm the row

## 12. Case Details Blueprint

### Screen Goal
Give a full investigation view of one case.

### Layout Sections
- Case header
- Summary panel
- Timeline panel
- Victims panel
- Accused panel
- Applicable acts panel
- Evidence panel
- AI summary panel
- Similar cases panel

### Header Elements
- FIR number
- Crime number
- Status chip
- District / station
- Date
- Primary actions

### Primary Actions
- Ask AI
- Export PDF
- Open network
- Add to report

### Interactions
- Clicking a person opens a focused entity view
- Clicking a related case opens the new case detail page
- Timeline nodes expand case history
- Evidence opens source record references

## 13. Criminal Network Blueprint

### Screen Goal
Reveal hidden relationships between people, incidents, places, and institutions.

### Layout
- Full-screen graph canvas
- Left filter drawer or top filter bar
- Right detail panel on node selection

### Node Types
- People
- Crime
- Police
- Acts
- Courts
- Locations

### Node Colors
- People: blue
- Crime: red
- Police: green
- Acts: orange

### Graph Controls
- Zoom
- Pan
- Expand node
- Collapse node
- Fit to screen
- Search entity

### Interactions
- Hover highlights connected edges
- Click opens details panel
- Double click expands relationships if supported
- Ask AI action can explain the visible network

### Required Behavior
- Graph must remain readable.
- Graph must prioritize relationship clarity over visual flair.
- The right panel should summarize why the connection matters.

## 14. Crime Intelligence Map Blueprint

### Screen Goal
Show where crime is concentrated and how it changes over time.

### Layout
- Full or near full-screen map canvas
- Top filter bar
- Optional side legend panel
- Drill-down panel on selection

### Filters
- District
- Police station
- Crime type
- Date

### Map Layers
- Heatmap
- Clusters
- Pins
- District boundaries
- Police station overlays when relevant

### Interactions
- Filter changes update the visible layer
- Clicking a hotspot opens detail drill-down
- Clicking a district reveals aggregated stats
- Ask AI action explains the current hotspot pattern

## 15. Analytics Blueprint

### Screen Goal
Help the user understand patterns and comparisons.

### Layout Sections
- KPI summary cards
- Bar chart section
- Pie chart section
- Timeline section
- District comparison section
- Forecast section
- Heatmap section

### Core Charts
- Crimes by district
- Crimes over time
- Crime categories
- Repeat offenders
- Arrest trends
- Charge sheet status
- Officer workload

### Interactions
- Chart clicks should filter other panels where relevant
- Hover should reveal concise detail
- Ask AI action should explain anomalies or spikes

### Analytics Principle
A chart should exist only if it reveals a pattern or supports a decision.

## 16. Reports Blueprint

### Screen Goal
Turn analysis into formal output.

### Report Types
- Case PDF
- Analytics PDF
- Conversation PDF
- Executive report

### Layout Sections
- Report type selector
- Content preview
- Filters or scope selection
- Export controls
- Status feedback

### Interactions
- Generate preview before export when possible
- Download PDF after generation
- Reuse AI summaries and evidence in report content

## 17. Settings Blueprint

### Screen Goal
Manage user preferences and operational settings.

### Sections
- Profile details
- Role context
- Language preferences
- Theme preferences if any
- Notification preferences
- Security or session settings

### Interaction Rules
- Keep settings minimal for the hackathon
- Do not create unnecessary configuration depth

## 18. Shared Components

### Navigation Components
- Sidebar
- Navbar
- Breadcrumbs
- Quick action bar

### Data Components
- KPI cards
- Tables
- Filter chips
- Search bar
- Pagination
- Sort controls

### Intelligence Components
- AI response card
- Evidence list
- Confidence chip
- Suggested question chips
- Relationship summary panel

### Visualization Components
- Line chart
- Bar chart
- Pie chart
- Heatmap
- Network graph
- Map canvas

### Feedback Components
- Loading skeletons
- Empty states
- Error banners
- Toast notifications
- Modal dialogs

## 19. Popups and Modals

### Allowed Popups
- Export confirmation
- Filter reset confirmation when needed
- Node details expansion
- Report generation status
- Role or session warnings

### Modal Rules
- Use modals only when the task cannot be handled inline
- Keep content focused
- Avoid modal chains

## 20. Button System

### Button Types
- Primary button
- Secondary button
- Ghost button
- Danger button
- Icon button

### Button Rules
- Primary actions should be visually obvious
- Buttons should remain large enough for enterprise usage
- Icon-only actions should always have a tooltip or label

## 21. Workflow Blueprint

### Core Workflow 1
Login -> Dashboard -> Ask AI -> View evidence -> Export report

### Core Workflow 2
Login -> Case Explorer -> Open case -> View summary -> Open network -> Drill down

### Core Workflow 3
Login -> Crime Map -> Apply filters -> Review hotspot -> Ask AI -> Export insight

### Core Workflow 4
Login -> Analytics -> Review patterns -> Open related cases -> Generate report

### Workflow Rule
Every workflow should end in a decision, report, or investigation lead.

## 22. Interaction Rules

- Keep motion subtle.
- Keep transitions short.
- Keep action feedback immediate.
- Keep the primary focus visible.
- Avoid decorative interactions that do not help comprehension.

## 23. Responsive Behavior

### Desktop
Full mission-control layout.

### Tablet
Stack secondary panels and preserve the main workflow.

### Mobile
Support essential browsing and demo viewing, but not as the primary operating mode.

## 24. Accessibility Rules

- High contrast text and controls
- Clear focus states
- Large clickable targets
- Keyboard navigable where practical
- No color-only meaning for critical states

## 25. Implementation Priority Order

### Sprint 1 Foundation
- App shell
- Routing
- Sidebar
- Navbar
- Placeholder pages
- Theme

### Sprint 2 Core Data Views
- Dashboard
- Case Explorer
- Case Details

### Sprint 3 Intelligence
- AI Investigator
- Evidence view
- Suggested questions

### Sprint 4 Visualization
- Criminal Network
- Crime Intelligence Map
- Analytics

### Sprint 5 Output
- Reports
- PDF export
- Polish and integration

## 26. Definition of Done for the UI Blueprint

This blueprint is complete when every page has:

- A clear purpose
- A required layout
- A defined primary action
- A set of reusable components
- A planned empty state
- A planned loading state
- A drill-down path

## 27. Final Statement

This blueprint is the implementation contract for AI-CIOS.

If the team follows it, the product will stay aligned across design, frontend, backend, and demo presentation, and the result will feel like one coherent intelligence system instead of disconnected screens.