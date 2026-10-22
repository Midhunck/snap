# SNAP - Interactive Mobile Mockup

An interactive, responsive mobile web prototype built with pure **HTML, CSS, and JavaScript**, based directly on the SNAP mobile application design.

---

## 🚀 How to Run & View

You can open the mockup immediately in any web browser without needing any build tools:

1. Double-click or open [index.html](file:///z:/SNAP%20New%20Mobile/index.html) in your browser (Chrome, Edge, Safari, Firefox).
2. Alternatively, right-click `index.html` > **Open with** > **Google Chrome** (or your preferred browser).

---

## 📱 Features & Interactions Implemented

### 1. Mobile Home Screen (Image 1 Architecture)
- **Top Header**:
  - **Hamburger Drawer Button**: Quick access to open the slide-out navigation drawer.
  - **SNAP Brand Logo**: Crisp yellow folder icon and typography.
  - **Teamspace Selector Pill**: Dynamic indicator (`Test Teamspace ▾`) that also opens the Navigation Drawer.
  - **Profile Avatar**: Quick access to inspector profile and settings.
- **Hero Check-in Card**: "Start your day" with interactive GPS arrival flow and live on-site crew counter.
- **Home Dashboard Sections (Image 1)**:
  - **PEOPLE**:
    - 👤 **Employees** (24 active) → opens the team directory modal sheet.
  - **WORK MANAGEMENT**:
    - 📁 **Projects** (5 sites, highlighted pill row) → opens the active sites panel.
    - 📄 **Snaps** (18 photos) → photo sync status and gallery.
    - 📋 **Tasks** (5 open) → interactive checkable task list with real-time counter updates.
  - **STATISTICS AND REPORTS**:
    - 🕒 **Time tracking** (38.5 hrs) → shift timer and weekly breakdown sheet.
    - ☑️ **Project attendance** (94% roll) → site arrival and roll call headcount.

---

### 2. Navigation Drawer Menu (Image 2 Architecture)
Slides smoothly from the left over the home screen with backdrop blur overlay, accessible via the hamburger button, header teamspace pill, or left-edge swipe gesture:
- **Drawer Header**: SNAP Spaces branding, workspace context, and close button (`✕`).
- **Live Search**: *"Search spaces and projects"* with instant filtering and clear (`✕`) button.
- **TEAMSPACES Accordion & Toggle**: Expandable section with toggle switch.
- **Tree Structure**:
  - ☀️ **Test Teamspace** (expandable)
    - 📁 **AME Estimation** (active highlighted pill, matching Image 2)
    - 📁 **Development Testing**
    - 📁 **Fitout work**
  - 🏢 **Products** (Commercial Catalog)
  - 💼 **CR Testing** (Field QA Suite)
  - 🏠 **IT Department** (Network & Devices)
- **Space Selection**: Tap any space to set it as active, update the header label, close the drawer, and open its Project Details.
- **Drawer Footer**: "+ Create New Space" action.

---

### 3. SNAP Web Projects View
Directly adapted from the SNAP Web Projects screen:
- **Header**: "Projects" with subtitle *"Every project you can see, across all teamspaces."* and dynamic counter badge (*"9 projects"*).
- **Search & Filters**:
  - Search bar with instant real-time filtering across titles, descriptions, and teamspaces.
  - Teamspace cycle dropdown pill (`All teamspaces` ➔ `Test Teamspace` ➔ `Products` ➔ `CR Testing` ➔ `IT Department`).
  - Status filter pill (`Active` / `All`).
  - Starred / Favorites filter chip.
- **The 9 Web Projects with Tailored Descriptions**:
  1. **Fitout work** (*Test Teamspace · Owner*, Starred): *"Interior fitout, drywall partitions, ceiling grid installation, and electrical rough-in."* (2 members, 18 tasks)
  2. **garage360 support** (*Products · Owner*, Starred): *"Customer automotive workshop support tickets, diagnostics, and shop management."* (1 member, 1 task)
  3. **IT Operations** (*IT Department · Member*, Starred): *"Core infrastructure monitoring, network security, firewall rules, and nightly backups."* (2 members, 2 tasks)
  4. **Table Ping** (*Products · Member*): *"Table queue management in a simple way with SMS seating alerts and waitlist sync."* (2 members, 12 tasks)
  5. **AME Estimation** (*Test Teamspace · Owner*): *"Architectural, mechanical, and electrical cost estimation & quantity takeoffs."* (1 member, 6 tasks)
  6. **Development Testing** (*Test Teamspace · Owner*): *"Sprint feature integration tests, automated cross-browser validation, and bug triage."* (8 members, 73 tasks)
  7. **IT Service Requests** (*IT Department · Member*): *"Hardware provisioning, laptop setups, employee software licenses, and IT helpdesk."* (2 members, 4 tasks)
  8. **Table Ping** (*CR Testing · Owner*): *"Change Request sandbox and regression testing pipeline for Table Ping deployments."* (1 member, 0 tasks)
  9. **Testing the CR field** (*CR Testing · Owner*): *"Validation testing for dynamic Change Request custom fields and schema updates."* (1 member, 0 tasks)

---

### 4. Project Details: Kanban Task Board & Supervisor Attendance (Web View Adapted)
Tapping any project (e.g. *Table Ping*) opens the full web project workspace adapted for mobile:
- **Project Header**:
  - Project Initial avatar badge (e.g. `T` for Table Ping).
  - Project Title & Assignee member avatars (`RK`, `MC`).
  - Star favorite toggle button & `+ New Task` action.
- **5 Navigation Tabs**:
  - 📋 **Task (12)**:
    - **Status Stage Selector**: `All (9)` · `Not started (5)` · `In progress (0)` · `Done (4)` · `On hold (0)`.
    - **View Mode Switcher**: `Board` (horizontal swipeable Kanban columns) or `List` view.
    - **Task Cards Matching Web Screenshot**:
      - *Not started (5)*: "Web request with JWT need to implement" (Due Oct 3, RK), "Daily report" (Sep 22, Sep 29, Oct 21), "Hello world suport TT" (High, Oct 9).
      - *Done (4)*: "Discussions" (Medium, Oct 31, RK), "Semaless sync is required" (Sep 27, 💬 1, 📋 1, ☑️ 4), "Untitled task" (Sep 28), "Hello" (Medium, Oct 9, MC).
      - Interactive tap to transition task stages or add tasks via `+ Add task`.
  - 🕒 **Attendance**:
    - Daily roll check with date navigation (`Today, Oct 15, 2026`).
    - Quick metrics: `14 Present` · `2 Absent` · `1 Late` · `88% Rate`.
    - Crew roster with 1-tap `Present` / `Late` / `Absent` status toggling.
    - Quick add worker button (`+ Add worker`).
    - Supervisor Daily Roll Approval & Lock sign-off.
  - 📹 **Meetings**: Daily sprint standup join link & scheduled sessions.
  - 📄 **Documents**: Architectural blueprints, backlog spreadsheets, and upload doc.
  - 📎 **Uploads**: Site photo log and attachment gallery.

---

### 5. Interactive Workflows

| Interaction | Action | Result |
| :--- | :--- | :--- |
| **Open Navigation Drawer** | Tap hamburger icon (☰), header teamspace pill (`Test Teamspace ▾`), or swipe from left edge | Opens drawer menu with live search and teamspaces tree. |
| **Open Projects Subview** | Tap "Projects (9 projects)" on Home dashboard | Opens the SNAP Web Projects screen with 9 projects, live search, and filter pills. |
| **Enter Project Details** | Tap any project card (e.g. *Table Ping*) | Opens the full web workspace with Kanban task board, Attendance roll, Meetings, Docs, and Uploads. |
| **Take Attendance** | In project view, switch to "Attendance" tab | Mark workers Present/Late/Absent, add new crew members, and lock roll check. |
| **Manage Tasks** | In project view, under "Task" tab | Filter stages, switch between Kanban Board and List mode, add new tasks, and move cards across columns. |
| **Device Frame Toggle** | Click "Toggle Frame" in top toolbar | Switch between realistic iPhone 15 frame and fluid responsive mode. |
| **Reset Demo** | Click "Reset State" in top toolbar | Restores all states, projects, check-in status, and tasks to default. |
