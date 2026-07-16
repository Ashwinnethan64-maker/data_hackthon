# AI-CIOS

## Phase 2 - Product Design

**Product:** AI Crime Intelligence Operating System  
**Version:** v1.0 Hackathon MVP  
**Purpose of this phase:** define what the product does, who uses it, how they use it, and why each feature exists.

## 1. Product Vision

AI-CIOS is an AI-powered crime intelligence platform that helps investigators, analysts, supervisors, and policymakers search, analyze, visualize, and understand crime data using natural language, relationship intelligence, and explainable analytics.

The product is outcome-driven: every screen should move the user toward a decision, a report, an investigation lead, or an operational action.

## 2. Product Principle

The core design rule for the whole system is:

**Do not just display data. Guide the user to an outcome.**

Each module must answer one of these questions:

- What should I know right now?
- What case should I inspect next?
- What is connected to this person, place, or FIR?
- What pattern is emerging?
- What action should I take?
- What evidence supports this answer?

## 3. Primary Personas

### Investigator
Primary user. Needs to find FIRs, identify suspects, view case timelines, summarize cases, and discover linked crimes.

### Crime Analyst
Needs to find patterns, compare districts, analyze trends, and generate reports.

### Senior Officer / Supervisor
Needs to monitor ongoing investigations, view high-risk cases, and allocate resources.

### Policy Maker
Needs statewide insights, crime trends, and strategic reports.

## 4. Persona-to-Module Mapping

| Persona | Primary Modules |
| --- | --- |
| Investigator | AI Investigator, Case Explorer, Case Details, Criminal Network, Similar Cases |
| Crime Analyst | Analytics, Crime Map, Reports |
| Senior Officer / Supervisor | Dashboard, Alerts, KPI views, Case Details |
| Policy Maker | Executive Dashboard, Analytics, Reports, Forecasts |

## 5. User Journey

1. Login
2. Dashboard
3. Choose a task
4. Use AI Chat, Search FIR, Crime Map, or Network Graph
5. View results
6. Generate report
7. Export PDF

The journey should always provide a next best action rather than a dead-end view.

## 6. Information Architecture

- Login
- Dashboard
- AI Investigator
- Case Explorer
- Case Details
- Criminal Network
- Crime Map
- Analytics
- Reports
- Settings

## 7. Core Modules

### Module 1 - Dashboard
Purpose: answer “What should I know right now?”

Primary widgets:
- Total FIRs
- Active Cases
- Arrests
- Charge Sheets
- Crime Hotspots
- District Ranking
- AI Insight
- Recent Alerts

Outcome: the user sees immediate operational priorities and can drill into the highest-value item.

### Module 2 - AI Investigator
Purpose: natural-language access to the crime intelligence system.

Example questions:
- Show all robbery cases in Bengaluru.
- Find repeat offenders.
- Summarize FIR 104430006202600001.
- Which police station reported the most cybercrime?
- Show crimes under IPC 302.

Capabilities:
- Conversation history
- Follow-up questions
- Evidence-backed answers
- PDF export
- English support
- Kannada support as stretch
- Voice input as stretch

Outcome: the user gets a direct answer plus supporting evidence and recommended next steps.

### Module 3 - Case Explorer
Purpose: professional search interface for records.

Search fields:
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

Requirements:
- Filterable
- Sortable
- Fast to scan
- Supports drill-down into case details

Outcome: the user finds the right record quickly and opens the case with minimal friction.

### Module 4 - Case Details
Purpose: the full investigation view for one case.

Must show:
- Case summary
- Timeline
- Victims
- Accused
- Applicable Acts
- Investigation status
- AI Summary
- Similar Cases

Outcome: the user understands the case in context and can move from raw record to investigation insight.

### Module 5 - Criminal Network
Purpose: show hidden relationships between entities.

Nodes may include:
- Accused
- Victim
- FIR
- Police Station
- Officer
- Court

Behavior:
- Clicking any node reveals connected information
- The graph should emphasize relationships, not decoration
- The graph should support investigative discovery

Outcome: the user sees links that would be difficult to spot in tables alone.

### Module 6 - Crime Intelligence Map
Purpose: geographic intelligence for Karnataka.

Views:
- District view
- Police station view
- Hotspots
- Time filters
- Crime categories

Outcome: the user identifies where crime is concentrated and how it changes over time.

### Module 7 - Analytics
Purpose: trend and pattern analysis.

Dashboards:
- Crimes by district
- Crimes over time
- Crime categories
- Repeat offenders
- Arrest trends
- Charge sheet status
- Officer workload

Outcome: the user can compare, prioritize, and report on trends.

### Module 8 - Reports
Purpose: turn analysis into usable output.

Report types:
- Investigation summary
- Case summary
- Crime analytics
- AI conversation
- PDF export

Outcome: the user can share a structured report without rebuilding the narrative manually.

## 8. AI Capability Model

Instead of a single generic chatbot, AI-CIOS should expose specialized intelligence functions.

### AI Search
Natural-language retrieval across crime records.

### AI Summarizer
Converts a case into a readable summary.

### AI Relationship Finder
Finds hidden links between people, places, and incidents.

### AI Recommendation
Suggests similar cases and possible investigative leads.

### Explainable AI
Every answer should include the evidence used to produce it.

Rule: if the AI cannot justify an answer with traceable data, it should say so.

## 9. Key Outcomes by Module

| Module | Main Outcome |
| --- | --- |
| Dashboard | Understand the current situation |
| AI Investigator | Get an evidence-backed answer |
| Case Explorer | Find the right record |
| Case Details | Understand one case fully |
| Criminal Network | Reveal hidden relationships |
| Crime Map | See spatial patterns and hotspots |
| Analytics | Understand trends and comparisons |
| Reports | Export decisions into a shareable format |

## 10. Three Demo Moments

These are the most important moments for judges.

### 1. AI Investigator
Type a natural-language question and receive an evidence-backed response.

### 2. Criminal Network Graph
See suspects, victims, FIRs, officers, and locations connect visually.

### 3. Interactive Crime Intelligence Map
See hotspots, filter by district, and drill down to police station level.

## 11. MVP Scope for v1.0

### Must Have
- Login
- Dashboard
- AI Investigator
- Case Explorer
- Case Details
- Criminal Network
- Crime Map
- Analytics
- Reports
- PDF export
- Explainable AI responses

### Stretch Goals
- Kannada language support
- Voice input
- Forecasting
- Advanced recommendations
- Role-based dashboards

## 12. Design Rules for Implementation

- Every page must have a clear primary action.
- Every AI response must include evidence.
- Every search result must be drillable.
- Every graph or map must support filtering.
- Every report must be exportable.
- Empty states should suggest what to do next.
- Loading states should preserve context.

## 13. Suggested Success Metrics

- Time to find a relevant FIR
- Time to summarize a case
- Number of successful AI queries
- Number of cases discovered through related entities
- Number of reports exported
- Reduction in manual search steps

## 14. Open Questions to Resolve Later

- What datasets are available in the hackathon environment?
- Which fields are guaranteed across FIR and case records?
- What evidence format will AI responses cite?
- How much of the Kannada and voice experience is realistic for v1.0?
- Which role-based permissions are required at demo time?

## 15. Product Summary

AI-CIOS is not a dashboard-first crime app. It is an outcome-first intelligence system. The design goal is to help each user move from question to evidence to decision as quickly as possible.

The hackathon story should be simple:

- Ask a question
- Find the case
- Reveal the network
- See the hotspot
- Generate the report
- Export the evidence
