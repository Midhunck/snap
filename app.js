/**
 * SNAP Interactive Mobile Mockup Logic
 * Full state management and responsive interactions
 */

document.addEventListener('DOMContentLoaded', () => {

  function askEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function closeMobileAsk() {
    const root = document.getElementById('mobileAsk');
    if (root) root.hidden = true;
  }

  function openMobileChoice({ title, options, selected, onPick }) {
    const root = document.getElementById('mobileAsk');
    const titleEl = document.getElementById('mobileAskTitle');
    const body = document.getElementById('mobileAskBody');
    if (!root || !titleEl || !body) return;
    titleEl.textContent = title || 'Choose';
    body.innerHTML = options.map(option => `
      <button type="button" class="mobile-ask-option ${String(option.value) === String(selected) ? 'is-selected' : ''}" data-ask-value="${askEscape(option.value)}">
        ${option.icon || ''}
        <span class="mobile-ask-label">${askEscape(option.label)}</span>
        ${option.hint === 'more' ? '<span class="mobile-ask-chevron" aria-hidden="true">›</span>' : ''}
        ${option.hint === 'dot' ? '<span class="mobile-ask-dot" aria-hidden="true"></span>' : ''}
      </button>
    `).join('');
    root.hidden = false;
    body.querySelectorAll('[data-ask-value]').forEach(button => {
      button.addEventListener('click', () => {
        const value = button.dataset.askValue;
        closeMobileAsk();
        if (onPick) onPick(value);
      });
    });
  }

  function openMobilePrompt({ title, placeholder, value, submitLabel, allowEmpty, onSubmit }) {
    const root = document.getElementById('mobileAsk');
    const titleEl = document.getElementById('mobileAskTitle');
    const body = document.getElementById('mobileAskBody');
    if (!root || !titleEl || !body) return;
    titleEl.textContent = title || 'Add';
    body.innerHTML = `
      <label class="mobile-ask-field">
        <input id="mobileAskInput" type="text" value="${askEscape(value || '')}" placeholder="${askEscape(placeholder || '')}" aria-label="${askEscape(title || 'Value')}">
      </label>
      <button type="button" class="primary-pill-btn" id="mobileAskSubmit">${askEscape(submitLabel || 'Save')}</button>
    `;
    root.hidden = false;
    const input = document.getElementById('mobileAskInput');
    const submit = () => {
      const text = input ? input.value : '';
      if (!allowEmpty && !text.trim()) return;
      closeMobileAsk();
      if (onSubmit) onSubmit(text);
    };
    document.getElementById('mobileAskSubmit')?.addEventListener('click', submit);
    input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    });
    input?.focus();
    input?.select();
  }

  function openMobileNotice({ title, message, action, onAction }) {
    const root = document.getElementById('mobileAsk');
    const titleEl = document.getElementById('mobileAskTitle');
    const body = document.getElementById('mobileAskBody');
    if (!root || !titleEl || !body) return;
    titleEl.textContent = title || 'Attendance';
    body.innerHTML = `
      <p class="mobile-ask-message">${askEscape(message || '')}</p>
      <button type="button" class="primary-pill-btn" id="mobileAskSubmit">${askEscape(action || 'OK')}</button>
    `;
    root.hidden = false;
    document.getElementById('mobileAskSubmit')?.addEventListener('click', () => {
      closeMobileAsk();
      if (onAction) onAction();
    });
  }

  document.getElementById('mobileAskBackdrop')?.addEventListener('click', closeMobileAsk);

  const phoneFrame = document.querySelector('.phone-screen');
  let selectSheetLock = false;
  const openSelectSheet = (select) => {
    if (!select || select.disabled || selectSheetLock) return;
    selectSheetLock = true;
    const options = [...select.options].map(option => ({
      value: option.value,
      label: option.textContent.trim()
    }));
    openMobileChoice({
      title: select.getAttribute('aria-label') || 'Choose',
      options,
      selected: select.value,
      onPick: (value) => {
        select.value = value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        selectSheetLock = false;
      }
    });
    setTimeout(() => { selectSheetLock = false; }, 400);
  };
  if (phoneFrame) {
    const guardSelect = (event, open) => {
      const select = event.target.closest('select');
      if (!select || !phoneFrame.contains(select) || select.disabled) return;
      event.preventDefault();
      event.stopPropagation();
      if (open) openSelectSheet(select);
    };
    phoneFrame.addEventListener('mousedown', (event) => guardSelect(event, true), true);
    phoneFrame.addEventListener('pointerdown', (event) => guardSelect(event, event.pointerType !== 'mouse'), true);
  }

  // Initial Mock State
  const state = {
    currentSite: null,
    isOnSite: false,
    crewCount: 14,
    hasPhoto: false,
    selectedArrivalSiteIndex: 0,
    activeSpace: {
      parent: 'Test Teamspace',
      name: 'AME Estimation'
    },
    isClockedIn: true,
    checkedInProjectIds: [],
    pendingGeoProjectId: null,
    projectFilters: {
      search: '',
      teamspace: 'All teamspaces',
      status: 'Active',
      starredOnly: false
    },
    projects: [
      {
        id: 1,
        name: 'Fitout work',
        teamspace: 'Test Teamspace',
        role: 'Owner',
        starred: true,
        description: 'Interior fitout, drywall partitions, ceiling grid installation, and electrical rough-in.',
        members: 2,
        tasks: 18,
        status: 'Active',
        company: 'Test Teamspace',
        address: '12 Harbour Yard, Site Gate A',
        distance: '0.1 km away',
        workers: 2,
        openTasks: 18,
        // Demo: geo-fenced — open/operate only after on-site check-in
        geoFenced: true,
        requiresCheckIn: true,
        geoRadius: '150 m',
        geoInside: true
      },
      {
        id: 2,
        name: 'garage360 support',
        teamspace: 'Products',
        role: 'Owner',
        starred: true,
        description: 'Customer automotive workshop support tickets, diagnostics, and shop management.',
        members: 1,
        tasks: 1,
        status: 'Active',
        company: 'Products',
        address: 'Products · Owner',
        distance: '0.4 km away',
        workers: 1,
        openTasks: 1,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 3,
        name: 'IT Operations',
        teamspace: 'IT Department',
        role: 'Member',
        starred: true,
        description: 'Core infrastructure monitoring, network security, firewall rules, and nightly backups.',
        members: 2,
        tasks: 2,
        status: 'Active',
        company: 'IT Department',
        address: 'IT Department · Member',
        distance: '0.9 km away',
        workers: 2,
        openTasks: 2,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 4,
        name: 'Table Ping',
        teamspace: 'Products',
        role: 'Member',
        starred: false,
        description: 'Table queue management in a simple way with SMS seating alerts and waitlist sync.',
        members: 2,
        tasks: 12,
        status: 'Active',
        company: 'Products',
        address: 'Products · Member',
        distance: '1.2 km away',
        workers: 2,
        openTasks: 12,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 5,
        name: 'AME Estimation',
        teamspace: 'Test Teamspace',
        role: 'Owner',
        starred: false,
        description: 'Architectural, mechanical, and electrical cost estimation & quantity takeoffs.',
        members: 1,
        tasks: 6,
        status: 'Active',
        company: 'Test Teamspace',
        address: 'Test Teamspace · Owner',
        distance: '1.8 km away',
        workers: 1,
        openTasks: 6,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 6,
        name: 'Development Testing',
        teamspace: 'Test Teamspace',
        role: 'Owner',
        starred: false,
        description: 'Sprint feature integration tests, automated cross-browser validation, and bug triage.',
        members: 8,
        tasks: 73,
        status: 'Active',
        company: 'Test Teamspace',
        address: 'QA Lab · Building C (Restricted Zone)',
        distance: '2.5 km away',
        workers: 8,
        openTasks: 73,
        // Demo: geo-fenced but currently OUTSIDE fence — check-in blocked until inside
        geoFenced: true,
        requiresCheckIn: true,
        geoRadius: '100 m',
        geoInside: false
      },
      {
        id: 7,
        name: 'IT Service Requests',
        teamspace: 'IT Department',
        role: 'Member',
        starred: false,
        description: 'Hardware provisioning, laptop setups, employee software licenses, and IT helpdesk.',
        members: 2,
        tasks: 4,
        status: 'Active',
        company: 'IT Department',
        address: 'IT Department · Member',
        distance: '3.1 km away',
        workers: 2,
        openTasks: 4,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 8,
        name: 'Table Ping',
        teamspace: 'CR Testing',
        role: 'Owner',
        starred: false,
        description: 'Change Request sandbox and regression testing pipeline for Table Ping deployments.',
        members: 1,
        tasks: 0,
        status: 'Active',
        company: 'CR Testing',
        address: 'CR Testing · Owner',
        distance: '4.0 km away',
        workers: 1,
        openTasks: 0,
        geoFenced: false,
        requiresCheckIn: false
      },
      {
        id: 9,
        name: 'Testing the CR field',
        teamspace: 'CR Testing',
        role: 'Owner',
        starred: false,
        description: 'Validation testing for dynamic Change Request custom fields and schema updates.',
        members: 1,
        tasks: 0,
        status: 'Active',
        company: 'CR Testing',
        address: 'CR Field Yard · East Compound',
        distance: '4.6 km away',
        workers: 1,
        openTasks: 0,
        // Demo: another geo-fenced site (inside fence, ready to check in)
        geoFenced: true,
        requiresCheckIn: true,
        geoRadius: '200 m',
        geoInside: true
      }
    ],
    get sites() {
      return this.projects;
    },
    tasks: [
      {
        id: 100,
        token: 'TASK-000288',
        title: 'ANNUAL MAINTENANCE CONTRACT AUTHORITY CHARGES',
        site: 'AME Estimation',
        priority: 'Normal',
        completed: false
      },
      {
        id: 101,
        title: 'Conduct morning safety briefing & gear check',
        site: 'Apex Towers - Phase 2',
        priority: 'Urgent',
        completed: false
      },
      {
        id: 102,
        title: 'Verify rebar placement on 4th floor slab',
        site: 'Metro Center Expansion',
        priority: 'Urgent',
        completed: false
      },
      {
        id: 103,
        title: 'Document concrete pour slump test',
        site: 'Apex Towers - Phase 2',
        priority: 'Normal',
        completed: false
      },
      {
        id: 104,
        title: 'Confirm delivery of HVAC ducting unit A',
        site: 'Elmwood Logistics Park',
        priority: 'Normal',
        completed: false
      },
      {
        id: 105,
        title: 'Electrical conduit sign-off with council inspector',
        site: 'Horizon Ridge Residential',
        priority: 'Normal',
        completed: false
      }
    ],
    notes: [
      {
        id: 201,
        title: 'Foundation Pour Slump Test Completed',
        tag: 'Progress',
        author: 'Midhun Raj',
        time: '2 hours ago',
        site: 'Apex Towers',
        content: 'Slump reading measured 110mm, well within tolerance. 6 test cylinders cast for 7-day and 28-day compression testing. Pour completed without air voids.'
      },
      {
        id: 202,
        title: 'Scaffold Safety Netting Clearance',
        tag: 'Safety',
        author: 'Midhun Raj',
        time: 'Yesterday',
        site: 'Metro Center Expansion',
        content: 'Level 3 perimeter safety netting inspected and tensioned following high wind advisory. Safe clearances verified for facade installation crew.'
      }
    ],
    snaps: [
      {
        id: 's1',
        title: 'Untitled spreadsheet',
        subtitle: '1 sheet',
        kind: 'sheet',
        cover: 'green',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 5 days ago',
        editedDays: 5,
        version: 'v2',
        project: 'Table Ping'
      },
      {
        id: 's2',
        title: 'Minutes of Meeting (MoM)',
        subtitle: 'Date: 22 September 2026 Attendees: Anish, Leeba, Ankur, Ankita, Uma…',
        kind: 'people',
        cover: 'photo',
        photo: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop&q=70',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 5 days ago',
        editedDays: 5,
        version: 'v47',
        project: 'Fitout work'
      },
      {
        id: 's3',
        title: 'Untitled spreadsheet',
        subtitle: '1 sheet',
        kind: 'sheet',
        cover: 'green',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 8 days ago',
        editedDays: 8,
        version: 'v13',
        project: 'garage360 support'
      },
      {
        id: 's4',
        title: 'Untitled spreadsheet',
        subtitle: '2 sheets',
        kind: 'sheet',
        cover: 'green',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 8 days ago',
        editedDays: 8,
        version: 'v5',
        project: 'AME Estimation'
      },
      {
        id: 's5',
        title: 'Minutes of Meeting (MoM)',
        subtitle: 'Date: 22 September 2026 Attendees: Anish, Leeba, Ankur, Ankita, Uma…',
        kind: 'star',
        cover: 'slate',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 12 days ago',
        editedDays: 12,
        version: 'v9',
        project: 'IT Operations'
      },
      {
        id: 's6',
        title: 'Support queue',
        subtitle: 'Open tickets and shop diagnostics',
        kind: 'sheet',
        cover: 'green',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 2 days ago',
        editedDays: 2,
        version: 'v4',
        project: 'garage360 support'
      },
      {
        id: 's7',
        title: 'Site measure sheet',
        subtitle: '1 sheet',
        kind: 'sheet',
        cover: 'green',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 3 days ago',
        editedDays: 3,
        version: 'v2',
        project: 'Development Testing'
      },
      {
        id: 's8',
        title: 'Service request log',
        subtitle: 'Document',
        kind: 'doc',
        cover: 'purple',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 4 days ago',
        editedDays: 4,
        version: 'v1',
        project: 'IT Service Requests'
      },
      {
        id: 's9',
        title: 'CR field notes',
        subtitle: 'Document',
        kind: 'doc',
        cover: 'slate',
        owner: 'MC',
        ownerName: 'Midhun Raj',
        edited: 'Edited 6 days ago',
        editedDays: 6,
        version: 'v3',
        project: 'Testing the CR field'
      }
    ],
    snapFilters: {
      search: '',
      owner: 'All owners',
      sort: 'Recently updated',
      view: 'grid'
    }
  };

  // Top desktop bar & notifications
  const deviceFrame = document.getElementById('deviceFrame');
  const toggleFrameBtn = document.getElementById('toggleFrameBtn');
  const resetDemoBtn = document.getElementById('resetDemoBtn');
  const toastMessage = document.getElementById('toastMessage');
  const toastText = document.getElementById('toastText');
  const statusClock = document.getElementById('statusClock');

  // Modals & Bottom Sheets
  const arriveSiteModal = document.getElementById('arriveSiteModal');
  const quickActionsModal = document.getElementById('quickActionsModal');
  const addTaskModal = document.getElementById('addTaskModal');
  const addNoteModal = document.getElementById('addNoteModal');
  const spaceContextMenuModal = document.getElementById('spaceContextMenuModal');
  const employeesModal = document.getElementById('employeesModal');
  const timeTrackingModal = document.getElementById('timeTrackingModal');

  // Header Elements
  const headerSpaceSelectorBtn = document.getElementById('headerSpaceSelectorBtn');
  const headerSpaceName = document.getElementById('headerSpaceName');
  const openProfileBtn = document.getElementById('openProfileBtn');
  const openDrawerBtn = document.getElementById('openDrawerBtn');

  // Navigation Drawer Elements (Image 2)
  const phoneScreen = document.getElementById('phoneScreen');
  const sideDrawer = document.getElementById('sideDrawer');
  const drawerOverlay = document.getElementById('drawerOverlay');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerAddSpaceBtn = document.getElementById('drawerAddSpaceBtn');

  // Hero Card & Site Arrival
  const arriveSiteBtn = document.getElementById('arriveSiteBtn');
  const checkoutSiteBtn = document.getElementById('checkoutSiteBtn');

  // Spaces Search Inside Drawer
  const spacesSearchInput = document.getElementById('spacesSearchInput');
  const clearSpacesSearchBtn = document.getElementById('clearSpacesSearchBtn');

  // Projects View Elements (SNAP Web Controls)
  const projectsSearchInput = document.getElementById('projectsSearchInput');
  const clearProjectsSearchBtn = document.getElementById('clearProjectsSearchBtn');
  const teamspaceFilterBtn = document.getElementById('teamspaceFilterBtn');
  const selectedTeamspaceLabel = document.getElementById('selectedTeamspaceLabel');
  const statusFilterBtn = document.getElementById('statusFilterBtn');
  const selectedStatusLabel = document.getElementById('selectedStatusLabel');
  const starredFilterBtn = document.getElementById('starredFilterBtn');
  const sitesCountBadge = document.getElementById('sitesCountBadge');

  // Subview Panels
  const viewSites = document.getElementById('viewSites');
  const viewTasks = document.getElementById('viewTasks');
  const viewNotes = document.getElementById('viewNotes');
  const viewSnaps = document.getElementById('viewSnaps');
  const viewSnapDetail = document.getElementById('viewSnapDetail');
  const viewSettings = document.getElementById('viewSettings');
  const viewTimeTracking = document.getElementById('viewTimeTracking');
  const viewProjectDetails = document.getElementById('viewProjectDetails');
  const viewTaskDetail = document.getElementById('viewTaskDetail');
  const manageFieldsModal = document.getElementById('manageFieldsModal');

  // Back Buttons
  const backFromSites = document.getElementById('backFromSites');
  const backFromSnaps = document.getElementById('backFromSnaps');
  const backFromTasks = document.getElementById('backFromTasks');
  const backFromNotes = document.getElementById('backFromNotes');
  const backFromSettings = document.getElementById('backFromSettings');
  const backFromProjectDetails = document.getElementById('backFromProjectDetails');

  // Floating Dock
  const dockHomeBtn = document.getElementById('dockHomeBtn');
  const dockPlusBtn = document.getElementById('dockPlusBtn');
  const dockSettingsBtn = document.getElementById('dockSettingsBtn');

  // Arrival Modal Elements
  const siteSelectionOptions = document.getElementById('siteSelectionOptions');
  const crewCountDisplay = document.getElementById('crewCountDisplay');
  const crewRollSummary = document.getElementById('crewRollSummary');
  const stepMinusBtn = document.getElementById('stepMinusBtn');
  const stepPlusBtn = document.getElementById('stepPlusBtn');
  const sitePhotoSlot = document.getElementById('sitePhotoSlot');
  const simulatePhotoSnap = document.getElementById('simulatePhotoSnap');
  const confirmArrivalBtn = document.getElementById('confirmArrivalBtn');

  // ==========================================
  // Helper Functions
  // ==========================================
  function showToast(message) {
    if (!toastMessage || !toastText) return;
    toastText.textContent = message;
    toastMessage.classList.add('show');
    setTimeout(() => {
      toastMessage.classList.remove('show');
    }, 2400);
  }

  function closeAllPanels() {
    [viewSites, viewTasks, viewNotes, viewSnaps, viewSnapDetail, viewSettings, viewProjectDetails, viewTaskDetail, viewTimeTracking].forEach(panel => {
      if (panel) panel.classList.remove('open');
    });
    clearProjectActionLocks();
    closeAllModals();
    closeDrawer();
    // Restore home active styling on dock
    if (dockHomeBtn) {
      const wrapper = dockHomeBtn.querySelector('.dock-icon-wrapper');
      if (wrapper) wrapper.classList.add('active-pill');
    }
    if (dockSettingsBtn) {
      const wrapper = dockSettingsBtn.querySelector('.dock-icon-wrapper');
      if (wrapper) wrapper.classList.remove('active-pill');
    }
  }

  function openPanel(panel) {
    if (!panel) return;
    closeAllPanels();
    panel.classList.add('open');
    if (dockHomeBtn) {
      const wrapper = dockHomeBtn.querySelector('.dock-icon-wrapper');
      if (wrapper) wrapper.classList.remove('active-pill');
    }
    if (panel === viewSettings && dockSettingsBtn) {
      const wrapper = dockSettingsBtn.querySelector('.dock-icon-wrapper');
      if (wrapper) wrapper.classList.add('active-pill');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop.active').forEach(m => {
      m.classList.remove('active');
    });
  }

  function openModal(modal) {
    // Always clear other overlays first so the UI never stays blocked
    closeAllModals();
    if (modal) modal.classList.add('active');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('active');
  }

  function clearProjectActionLocks() {
    const lockBanner = document.getElementById('projectGeoLockBanner');
    const scrollBody = document.getElementById('mobileProjScrollBody');
    if (lockBanner) lockBanner.classList.add('hidden');
    if (scrollBody) scrollBody.classList.remove('actions-locked');
    if (viewProjectDetails) viewProjectDetails.classList.remove('project-actions-locked');
  }

  // Live status bar clock
  function updateClock() {
    if (!statusClock) return;
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    statusClock.textContent = `${hours}:${minutes}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // ==========================================
  // Render Dynamic Content
  // ==========================================
  function updateCounters() {
    const openTasksCount = state.tasks.filter(t => !t.completed).length;
    const completedTasksCount = state.tasks.filter(t => t.completed).length;

    // Tasks screen badges (guarded)
    const taskCountAll = document.getElementById('taskCountAll');
    if (taskCountAll) taskCountAll.textContent = state.tasks.length;
    const taskCountPending = document.getElementById('taskCountPending');
    if (taskCountPending) taskCountPending.textContent = openTasksCount;
    const taskCountDone = document.getElementById('taskCountDone');
    if (taskCountDone) taskCountDone.textContent = completedTasksCount;

    // Home dashboard tasks meta badge
    const homeTasksMeta = document.getElementById('homeTasksMeta');
    if (homeTasksMeta) homeTasksMeta.textContent = String(openTasksCount);
    const moreTasksMeta = document.getElementById('moreTasksMeta');
    if (moreTasksMeta) moreTasksMeta.textContent = `${openTasksCount} open`;
  }

  function renderSites() {
    const container = document.getElementById('sitesContainer');
    if (!container) return;
    container.innerHTML = '';

    const query = (state.projectFilters.search || '').toLowerCase().trim();
    const currentTeamspace = state.projectFilters.teamspace;
    const starredOnly = state.projectFilters.starredOnly;
    const currentStatus = state.projectFilters.status;

    let filtered = state.projects.filter(project => {
      // Search filter
      if (query) {
        const matchName = project.name.toLowerCase().includes(query);
        const matchTeamspace = project.teamspace.toLowerCase().includes(query);
        const matchDesc = (project.description || '').toLowerCase().includes(query);
        const matchRole = (project.role || '').toLowerCase().includes(query);
        if (!matchName && !matchTeamspace && !matchDesc && !matchRole) return false;
      }
      // Teamspace filter
      if (currentTeamspace && currentTeamspace !== 'All teamspaces') {
        if (project.teamspace !== currentTeamspace) return false;
      }
      // Status filter
      if (currentStatus && currentStatus !== 'All') {
        if (project.status !== currentStatus) return false;
      }
      // Starred filter
      if (starredOnly && !project.starred) {
        return false;
      }
      return true;
    });

    // Update badges and meta
    if (sitesCountBadge) {
      sitesCountBadge.textContent = `${filtered.length} projects`;
    }
    const homeProjectsMeta = document.getElementById('homeProjectsMeta');
    if (homeProjectsMeta) {
      homeProjectsMeta.textContent = String(state.projects.length);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: #8E8D95;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" stroke-width="1.8" style="margin-bottom: 12px; display: inline-block;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div style="font-weight: 700; font-size: 15px; color: #1E293B; margin-bottom: 4px;">No projects found</div>
          <p style="font-size: 13px; color: #64748B; margin: 0;">Try adjusting your search terms or filter selection.</p>
        </div>
      `;
      return;
    }

    filtered.forEach(project => {
      const card = document.createElement('div');
      const locked = isProjectAccessLocked(project);
      card.className = 'project-web-card' + (locked ? ' project-locked' : '') + (project.geoFenced ? ' project-geofenced' : '');
      card.setAttribute('data-id', project.id);
      card.setAttribute('aria-disabled', locked ? 'true' : 'false');
      if (locked) {
        card.title = 'Geo-fenced — check in at this site to unlock access';
      }

      card.innerHTML = `
        <div class="project-card-header">
          <div class="project-card-header-left">
            <div class="project-folder-badge ${locked ? 'locked-badge' : ''}">
              ${locked
                ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3.75 6.75C3.75 5.50736 4.75736 4.5 6 4.5H9.41421C9.81204 4.5 10.1936 4.65804 10.4749 4.93934L11.8107 6.27513C12.092 6.55643 12.4735 6.71447 12.8714 6.71447H18C19.2426 6.71447 20.25 7.72183 20.25 8.96447V17.25C20.25 18.4926 19.2426 19.5 18 19.5H6C4.75736 19.5 3.75 18.4926 3.75 17.25V6.75Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`}
            </div>
            <div class="project-card-title-group">
              <button type="button" class="project-card-name project-title-btn">${project.name}</button>
              <span class="project-card-teamspace-role">
                <span class="project-card-space">${project.teamspace}</span>
                <span class="project-card-role">${project.role}</span>
              </span>
            </div>
          </div>
          <div class="project-card-header-right">
            <button type="button" class="project-info-btn" title="Project info" aria-label="Project info">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="9"></circle>
                <line x1="12" y1="11" x2="12" y2="16"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </button>
            <button class="project-star-btn ${project.starred ? 'starred' : ''}" title="${project.starred ? 'Starred favorite' : 'Add to favorites'}" aria-label="Star Project">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${project.starred ? '#FFFFFF' : 'none'}" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
            <button class="project-card-dots-btn" title="More options" aria-label="Project Options">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>
          </div>
        </div>
        <p class="project-card-desc">${project.description || 'No description'}</p>
        <div class="project-card-footer">
          <span class="project-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>${project.members} members</span>
          </span>
          <span class="project-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            <span>${project.tasks} tasks</span>
          </span>
        </div>
      `;

      const titleBtn = card.querySelector('.project-title-btn');
      const infoBtn = card.querySelector('.project-info-btn');
      const openSettings = (e) => {
        e.stopPropagation();
        openProjectSettings(project);
      };
      if (titleBtn) titleBtn.addEventListener('click', openSettings);
      if (infoBtn) infoBtn.addEventListener('click', openSettings);

      const starBtn = card.querySelector('.project-star-btn');
      if (starBtn) {
        starBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          project.starred = !project.starred;
          renderSites();
          showToast(project.starred ? `Starred "${project.name}" ★` : `Unstarred "${project.name}"`);
        });
      }

      const dotsBtn = card.querySelector('.project-card-dots-btn');
      if (dotsBtn) {
        dotsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (locked) {
            openGeoCheckInGate(project);
            showToast('Check in at the site before using this project.');
            return;
          }
          selectedCtxItem = project.name;
          const titleElem = document.getElementById('ctxMenuTitle');
          if (titleElem) titleElem.textContent = project.name;
          openModal(spaceContextMenuModal);
        });
      }

      card.addEventListener('click', () => {
        state.activeSpace = { parent: project.teamspace, name: project.name };
        if (headerSpaceName) headerSpaceName.textContent = project.teamspace;
        attemptOpenProject(project.name, project.teamspace);
      });

      container.appendChild(card);
    });
  }

  function renderTasks(filter = 'all') {
    const container = document.getElementById('tasksListContainer');
    if (!container) return;
    container.innerHTML = '';

    let filtered = state.tasks;
    if (filter === 'pending') filtered = state.tasks.filter(t => !t.completed);
    if (filter === 'completed') filtered = state.tasks.filter(t => t.completed);

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 30px; color: #8E8D95;">No tasks found in this section.</div>`;
      return;
    }

    filtered.forEach(task => {
      const item = document.createElement('div');
      item.className = `task-item ${task.completed ? 'completed' : ''}`;
      item.innerHTML = `
        <button class="task-checkbox-btn" aria-label="Mark task done">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <div class="task-details">
          <div class="task-title">${task.title}</div>
          <div class="task-sub">${task.site}</div>
        </div>
        <span class="priority-tag ${task.priority === 'Urgent' ? 'priority-urgent' : 'priority-normal'}">
          ${task.priority}
        </span>
      `;

      const checkBtn = item.querySelector('.task-checkbox-btn');
      if (checkBtn) {
        checkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          task.completed = !task.completed;
          showToast(task.completed ? 'Task completed ✓' : 'Task marked pending');
          const activeFilterTab = document.querySelector('.filter-tab.active');
          renderTasks(activeFilterTab ? activeFilterTab.dataset.filter : 'all');
          updateCounters();
        });
      }

      // Clicking task opens its full mobile Task Detail view
      item.addEventListener('click', (e) => {
        if (e.target.closest('.task-checkbox-btn')) return;
        const matched = projectTasks.find(pt => pt.title === task.title || pt.token === task.token);
        if (matched) {
          openTaskDetail(matched);
        } else {
          openTaskDetail(projectTasks[0]);
        }
      });

      container.appendChild(item);
    });
  }

  function renderNotes() {
    const container = document.getElementById('notesFeedContainer');
    if (!container) return;
    container.innerHTML = '';

    state.notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <div class="note-card-top">
          <span class="note-tag">${note.tag}</span>
          <span class="note-time">${note.time}</span>
        </div>
        <h4 class="note-title">${note.title}</h4>
        <p class="note-snippet">${note.content}</p>
        <div class="note-footer">
          <span>📍 ${note.site}</span>
          <span>👤 ${note.author}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function findProject(projectName, teamspace) {
    if (!projectName) return null;
    const name = projectName.toLowerCase();
    const ts = (teamspace || '').toLowerCase();
    return state.projects.find(p => {
      const nameMatch = p.name.toLowerCase() === name;
      if (!ts) return nameMatch;
      return nameMatch && p.teamspace.toLowerCase() === ts;
    }) || state.projects.find(p => p.name.toLowerCase() === name) || null;
  }

  function isProjectCheckedIn(project) {
    if (!project) return true;
    if (!project.requiresCheckIn && !project.geoFenced) return true;
    return state.checkedInProjectIds.includes(project.id);
  }

  function isProjectAccessLocked(project) {
    if (!project) return false;
    return !!(project.requiresCheckIn || project.geoFenced) && !isProjectCheckedIn(project);
  }

  function markProjectCheckedIn(project) {
    if (!project) return;
    const already = state.checkedInProjectIds.includes(project.id);
    if (!already) state.checkedInProjectIds.push(project.id);
    if (!already || !project.checkedInAt) project.checkedInAt = new Date();
  }

  function formatCheckInTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function refreshProjectSubtitle() {
    const subtitleEl = document.getElementById('projectDetailsSubtitle');
    if (!subtitleEl) return;
    const matched = findProject(currentProject.name, currentProject.parent);
    const parts = [currentProject.parent || ''];
    if (matched && (matched.geoFenced || matched.requiresCheckIn)) {
      if (isProjectCheckedIn(matched)) {
        const time = formatCheckInTime(matched.checkedInAt);
        parts.push(time ? `Checked in · ${time}` : 'Checked in');
      } else {
        parts.push('Check-in required');
      }
    }
    subtitleEl.textContent = parts.filter(Boolean).join(' · ');
  }

  function openGeoCheckInGate(project) {
    if (!project) return;
    state.pendingGeoProjectId = project.id;
    updateGeoCheckInModal(project);
    const geoModal = document.getElementById('geoCheckInModal');
    openModal(geoModal);
  }

  function updateGeoCheckInModal(project) {
    const titleEl = document.getElementById('geoGateProjectName');
    const addrEl = document.getElementById('geoGateAddress');
    const radiusEl = document.getElementById('geoGateRadius');
    const statusEl = document.getElementById('geoGateStatus');
    const statusDescEl = document.getElementById('geoGateStatusDesc');
    const checkInBtn = document.getElementById('confirmGeoCheckInBtn');
    const simBtn = document.getElementById('simulateGeoEnterBtn');
    const banner = document.getElementById('geoGateStatusBanner');

    if (titleEl) titleEl.textContent = project.name;
    if (addrEl) addrEl.textContent = project.address || `${project.teamspace} · ${project.role}`;
    if (radiusEl) radiusEl.textContent = project.geoRadius || '150 m';

    const inside = !!project.geoInside;
    if (banner) banner.classList.toggle('outside', !inside);
    if (statusEl) {
      statusEl.textContent = inside ? 'At the site' : 'Away from the site';
    }
    if (statusDescEl) {
      statusDescEl.textContent = inside
        ? 'You can check in and open this project.'
        : 'Move inside the site boundary to check in.';
    }
    if (checkInBtn) {
      checkInBtn.disabled = !inside;
      checkInBtn.classList.toggle('is-disabled', !inside);
      checkInBtn.querySelector('span') && (checkInBtn.querySelector('span').textContent = inside
        ? 'Check in and open'
        : 'Check-in unavailable');
    }
    if (simBtn) {
      simBtn.textContent = inside ? 'Demo: leave the site' : 'Demo: enter the site';
    }
  }

  function attemptOpenProject(projectName, parentTeamspace) {
    const project = findProject(projectName, parentTeamspace);
    if (project && isProjectAccessLocked(project)) {
      openGeoCheckInGate(project);
      showToast(`${project.name} requires a site check-in`);
      return false;
    }
    openProjectDetails(projectName, parentTeamspace);
    return true;
  }

  const SITE_FENCE_M = 500;

  function siteDistanceMeters(site) {
    const text = String(site.distance || '').replace(/\s*away\s*$/i, '').trim();
    const value = parseFloat(text);
    if (!Number.isFinite(value)) return Infinity;
    return /km/i.test(text) ? Math.round(value * 1000) : Math.round(value);
  }

  function siteWithinFence(site) {
    return siteDistanceMeters(site) <= SITE_FENCE_M;
  }

  function formatSiteDistance(value) {
    const text = String(value || '').replace(/\s*away\s*$/i, '').trim();
    const km = parseFloat(text);
    if (!Number.isFinite(km)) return text;
    if (km < 1) return `${Math.round(km * 1000)} m`;
    const rounded = Math.round(km * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} km`;
  }

  const sitePickIcon = `<span class="site-pick-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3.75 6.75C3.75 5.50736 4.75736 4.5 6 4.5H9.41421C9.81204 4.5 10.1936 4.65804 10.4749 4.93934L11.8107 6.27513C12.092 6.55643 12.4735 6.71447 12.8714 6.71447H18C19.2426 6.71447 20.25 7.72183 20.25 8.96447V17.25C20.25 18.4926 19.2426 19.5 18 19.5H6C4.75736 19.5 3.75 18.4926 3.75 17.25V6.75Z" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>`;

  function renderArrivalSiteOptions() {
    if (!siteSelectionOptions) return;
    const indexed = state.sites.map((site, index) => ({ site, index }));
    const nearby = indexed.filter(item => siteWithinFence(item.site));
    const outside = indexed.filter(item => !siteWithinFence(item.site));
    const rowHtml = ({ site, index }, blocked) => `
      <button type="button" class="site-pick-row${blocked ? ' is-away' : ''}" data-site-index="${index}">
        ${sitePickIcon}
        <span class="site-pick-copy">
          <strong>${site.name}</strong>
          <span>${site.teamspace || site.company || ''}</span>
        </span>
        <em>${formatSiteDistance(site.distance)}</em>
      </button>`;
    const groupHtml = (label, items, blocked) => {
      if (!items.length) return '';
      return `
        <section class="site-fence-group">
          <p class="site-fence-label">${label}</p>
          ${items.map(item => rowHtml(item, blocked)).join('')}
        </section>`;
    };
    siteSelectionOptions.innerHTML = groupHtml('Within 500 m', nearby, false) + groupHtml('Out of range', outside, true);
    siteSelectionOptions.querySelectorAll('.site-pick-row').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.siteIndex);
        const site = state.sites[index];
        if (!site) return;
        if (!siteWithinFence(site)) {
          showToast('This site is outside the 500 m boundary');
          return;
        }
        state.selectedArrivalSiteIndex = index;
        completeSiteCheckIn(site, { openProject: true });
      });
    });
  }

  // ==========================================
  // SPACES & MORE NAVIGATION & TABS LOGIC
  // ==========================================

  // ==========================================
  // NAVIGATION DRAWER LOGIC (IMAGE 2)
  // ==========================================
  function openDrawer() {
    if (sideDrawer) sideDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('active');
  }

  function closeDrawer() {
    if (sideDrawer) sideDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
  }

  if (openDrawerBtn) openDrawerBtn.addEventListener('click', openDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  if (drawerAddSpaceBtn) {
    drawerAddSpaceBtn.addEventListener('click', () => {
      closeDrawer();
      showToast('New Space creator ready');
    });
  }

  function switchToSpacesTab(tabIndex, animated = true) {
    closeAllPanels();
    closeDrawer();
  }

  // ==========================================
  // ACCORDIONS: TREE EXPAND / COLLAPSE
  // ==========================================
  const treeGroups = document.querySelectorAll('.tree-group');
  treeGroups.forEach(group => {
    const parentRow = group.querySelector('.tree-parent-row');
    const chevron = group.querySelector('.chevron-rotatable');
    const childrenContainer = group.querySelector('.tree-children-container');

    if (parentRow && childrenContainer) {
      parentRow.addEventListener('click', (e) => {
        // Prevent toggle if dots menu was clicked
        if (e.target.closest('.tree-dots-btn')) return;

        const isCurrentlyCollapsed = childrenContainer.classList.contains('collapsed');

        if (isCurrentlyCollapsed) {
          // EXPAND
          childrenContainer.classList.remove('collapsed');
          group.classList.add('open');
          if (chevron) chevron.classList.add('expanded');
        } else {
          // COLLAPSE
          childrenContainer.classList.add('collapsed');
          group.classList.remove('open');
          if (chevron) chevron.classList.remove('expanded');
        }
      });
    }
  });

  // Toggle entire TEAMSPACES section
  const toggleTeamspacesSection = document.getElementById('toggleTeamspacesSection');
  const teamspacesToggle = document.getElementById('teamspacesToggle');
  const teamspacesTreeList = document.getElementById('teamspacesTreeList');

  function setTeamspacesVisibility(visible) {
    if (teamspacesTreeList) {
      teamspacesTreeList.style.display = visible ? 'flex' : 'none';
    }
    if (toggleTeamspacesSection) {
      const chevron = toggleTeamspacesSection.querySelector('.chevron-rotatable');
      if (chevron) chevron.classList.toggle('expanded', visible);
    }
    if (teamspacesToggle) {
      teamspacesToggle.checked = visible;
    }
  }

  if (toggleTeamspacesSection) {
    toggleTeamspacesSection.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = teamspacesTreeList && teamspacesTreeList.style.display !== 'none';
      setTeamspacesVisibility(!isVisible);
    });
  }

  if (teamspacesToggle) {
    teamspacesToggle.addEventListener('change', () => {
      setTeamspacesVisibility(teamspacesToggle.checked);
    });
  }

  // Active space selection in tree list -> Opens Project Details
  const childRows = document.querySelectorAll('.tree-child-row');
  let selectedCtxItem = 'AME Estimation';

  childRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.tree-dots-btn')) return;

      const spaceName = row.dataset.space || row.querySelector('.tree-child-title')?.textContent || 'Space';
      const parentName = row.dataset.parent || 'Test Teamspace';

      // Update UI active pills
      childRows.forEach(r => r.classList.remove('active-space-pill'));
      row.classList.add('active-space-pill');

      // Update State
      state.activeSpace = { parent: parentName, name: spaceName };

      // Update Header label
      if (headerSpaceName) headerSpaceName.textContent = parentName;

      // Close drawer after selection and provide feedback
      closeDrawer();
      showToast(`Selected: ${spaceName} (${parentName})`);

      // Geo-fenced projects require check-in before opening
      attemptOpenProject(spaceName, parentName);
    });
  });

  // Live search input filter
  if (spacesSearchInput) {
    spacesSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (clearSpacesSearchBtn) {
        clearSpacesSearchBtn.classList.toggle('hidden', query.length === 0);
      }

      childRows.forEach(row => {
        const title = (row.dataset.space || '').toLowerCase();
        const parent = (row.dataset.parent || '').toLowerCase();
        const isMatch = title.includes(query) || parent.includes(query);
        row.style.display = isMatch ? 'flex' : 'none';
      });

      // Auto-expand all containers during active search
      if (query.length > 0) {
        document.querySelectorAll('.tree-children-container').forEach(c => {
          c.classList.remove('collapsed');
        });
        document.querySelectorAll('.tree-group').forEach(g => {
          g.classList.add('open');
          const ch = g.querySelector('.chevron-rotatable');
          if (ch) ch.classList.add('expanded');
        });
      }
    });
  }

  if (clearSpacesSearchBtn) {
    clearSpacesSearchBtn.addEventListener('click', () => {
      if (spacesSearchInput) spacesSearchInput.value = '';
      clearSpacesSearchBtn.classList.add('hidden');
      childRows.forEach(row => row.style.display = 'flex');
    });
  }

  // Context Menu (...) handlers
  const dotsButtons = document.querySelectorAll('.tree-dots-btn');
  dotsButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.name || 'Space';
      selectedCtxItem = name;
      const titleElem = document.getElementById('ctxMenuTitle');
      if (titleElem) titleElem.textContent = name;
      openModal(spaceContextMenuModal);
    });
  });

  const closeSpaceCtxMenuBtn = document.getElementById('closeSpaceCtxMenuBtn');
  if (closeSpaceCtxMenuBtn) {
    closeSpaceCtxMenuBtn.addEventListener('click', () => closeModal(spaceContextMenuModal));
  }

  const ctxSelectSpaceBtn = document.getElementById('ctxSelectSpaceBtn');
  if (ctxSelectSpaceBtn) {
    ctxSelectSpaceBtn.addEventListener('click', () => {
      closeModal(spaceContextMenuModal);
      showToast(`Active Working Space: ${selectedCtxItem}`);
    });
  }

  const ctxRenameSpaceBtn = document.getElementById('ctxRenameSpaceBtn');
  if (ctxRenameSpaceBtn) {
    ctxRenameSpaceBtn.addEventListener('click', () => {
      closeModal(spaceContextMenuModal);
      showToast(`Rename modal ready for "${selectedCtxItem}"`);
    });
  }

  const ctxManageMembersBtn = document.getElementById('ctxManageMembersBtn');
  if (ctxManageMembersBtn) {
    ctxManageMembersBtn.addEventListener('click', () => {
      closeModal(spaceContextMenuModal);
      openModal(employeesModal);
    });
  }

  const ctxArchiveSpaceBtn = document.getElementById('ctxArchiveSpaceBtn');
  if (ctxArchiveSpaceBtn) {
    ctxArchiveSpaceBtn.addEventListener('click', () => {
      closeModal(spaceContextMenuModal);
      showToast(`Archived space "${selectedCtxItem}"`);
    });
  }

  // ==========================================
  // HOME DASHBOARD ACTIONS (IMAGE 1)
  // ==========================================
  const homeRows = document.querySelectorAll('.home-nav-row, .more-row-item');
  homeRows.forEach(item => {
    item.addEventListener('click', () => {
      homeRows.forEach(r => r.classList.remove('active-pill-row'));
      item.classList.add('active-pill-row');
    });
  });

  const drawerEmployeesItem = document.getElementById('drawerEmployeesItem');
  if (drawerEmployeesItem) {
    drawerEmployeesItem.addEventListener('click', () => {
      closeDrawer();
      openModal(employeesModal);
    });
  }

  const homeProjectsItem = document.getElementById('homeProjectsItem') || document.getElementById('moreProjectsItem');
  if (homeProjectsItem) {
    homeProjectsItem.addEventListener('click', () => {
      renderSites();
      openPanel(viewSites);
    });
  }

  const projectsNewFabBtn = document.getElementById('projectsNewFabBtn');
  if (projectsNewFabBtn) {
    projectsNewFabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMobilePrompt({
        title: 'New project',
        placeholder: 'Project name',
        submitLabel: 'Create',
        onSubmit: (text) => {
          const name = text.trim();
          if (!name) return;
          const teamspace = state.projectFilters.teamspace && state.projectFilters.teamspace !== 'All teamspaces'
            ? state.projectFilters.teamspace
            : 'Test Teamspace';
          const nextId = state.projects.reduce((max, project) => Math.max(max, Number(project.id) || 0), 0) + 1;
          state.projects.unshift({
            id: nextId,
            name,
            teamspace,
            role: 'Owner',
            starred: false,
            description: '',
            members: 1,
            tasks: 0,
            status: 'Active',
            company: teamspace,
            address: teamspace,
            distance: '0.2 km away',
            workers: 1,
            openTasks: 0,
            geoFenced: false,
            requiresCheckIn: false
          });
          renderSites();
          const list = document.getElementById('sitesContainer');
          if (list) list.scrollTop = 0;
          const body = document.querySelector('#viewSites .projects-subview-body');
          if (body) body.scrollTop = 0;
          showToast(`Created "${name}"`);
        }
      });
    });
  }

  // Projects View Search & Filter Controls
  if (projectsSearchInput) {
    projectsSearchInput.addEventListener('input', (e) => {
      state.projectFilters.search = e.target.value;
      if (clearProjectsSearchBtn) {
        clearProjectsSearchBtn.classList.toggle('hidden', e.target.value.length === 0);
      }
      renderSites();
    });
  }

  if (clearProjectsSearchBtn) {
    clearProjectsSearchBtn.addEventListener('click', () => {
      if (projectsSearchInput) projectsSearchInput.value = '';
      state.projectFilters.search = '';
      clearProjectsSearchBtn.classList.add('hidden');
      renderSites();
      projectsSearchInput?.focus();
    });
  }

  const projectsToolbar = document.getElementById('projectsToolbar');
  const openProjectsSearchBtn = document.getElementById('openProjectsSearchBtn');
  const closeProjectsSearchBtn = document.getElementById('closeProjectsSearchBtn');
  const closeProjectsSearch = () => {
    projectsToolbar?.classList.remove('is-searching');
    if (projectsSearchInput) projectsSearchInput.value = '';
    state.projectFilters.search = '';
    clearProjectsSearchBtn?.classList.add('hidden');
    renderSites();
  };
  openProjectsSearchBtn?.addEventListener('click', () => {
    projectsToolbar?.classList.add('is-searching');
    projectsSearchInput?.focus();
  });
  closeProjectsSearchBtn?.addEventListener('click', closeProjectsSearch);

  const teamspacesCycleList = ['All teamspaces', 'Test Teamspace', 'Products', 'CR Testing', 'IT Department'];
  let teamspaceCycleIndex = 0;

  if (teamspaceFilterBtn) {
    teamspaceFilterBtn.addEventListener('click', () => {
      openMobileChoice({
        title: 'Teamspace',
        options: teamspacesCycleList.map(name => ({ value: name, label: name })),
        selected: state.projectFilters.teamspace,
        onPick: (selected) => {
          teamspaceCycleIndex = Math.max(0, teamspacesCycleList.indexOf(selected));
          state.projectFilters.teamspace = selected;
          if (selectedTeamspaceLabel) selectedTeamspaceLabel.textContent = selected;
          teamspaceFilterBtn.classList.toggle('active', selected !== 'All teamspaces');
          renderSites();
        }
      });
    });
  }

  if (statusFilterBtn) {
    statusFilterBtn.addEventListener('click', () => {
      openMobileChoice({
        title: 'Projects',
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'All', label: 'All' }
        ],
        selected: state.projectFilters.status,
        onPick: (selected) => {
          state.projectFilters.status = selected;
          if (selectedStatusLabel) selectedStatusLabel.textContent = selected;
          statusFilterBtn.classList.toggle('active', selected === 'All');
          renderSites();
        }
      });
    });
  }

  if (starredFilterBtn) {
    starredFilterBtn.addEventListener('click', () => {
      state.projectFilters.starredOnly = !state.projectFilters.starredOnly;
      starredFilterBtn.classList.toggle('active', state.projectFilters.starredOnly);
      renderSites();
      showToast(state.projectFilters.starredOnly ? 'Showing Favorites Only ★' : 'Showing All Projects');
    });
  }

  const sheetIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="9" x2="9" y2="21"></line><line x1="15" y1="9" x2="15" y2="21"></line></svg>`;
  const docIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C6BF2" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`;
  const peopleIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  const starIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

  const momDiscussion = [
    'Reviewed Qating CR changes, My TM report, Block Point report, Auto JMS testing, ERP testing, Temp DS and CR 10003 status.',
    'Focus remains on completing testing, internal reviews, report readiness and pending timelines.',
    'Carry-over design queries to be considered with report readiness and pending timelines.',
    'Block Point report data insertion to be completed and shared before testing today.',
    'Auto JMS report transaction testing is dependent on the DS final CRD.',
    'ERP testing is in progress, with the updated output targeted for tomorrow first half.',
    'Pending priority timelines to be shared, then a status to close.'
  ];

  const momUpdates = [
    { area: 'C rating reset and CRs', status: 'Changes currently in PROD to be reverted', owner: 'Sheeba / Ravi', target: 'Priority' },
    { area: 'My TM Report · CR-10389', status: 'Report to be shared with the team', owner: 'Sheeba / Ravi', target: 'Today' },
    { area: 'Block Point · CR-10314', status: 'Data insertion to be completed and offered for testing', owner: 'Ramesh / Anish', target: 'Today' },
    { area: 'Auto JMS · CR-12356', status: 'Major transaction testing pending. DS final output from RD', owner: 'Jishnu (TG)', target: 'Priority' },
    { area: 'ERP', status: 'Testing in progress, output for RD', owner: 'Anish', target: 'Tomorrow · first half' },
    { area: 'CR-10003', status: 'Internal items to be extracted', owner: 'Anish', target: 'Today' },
    { area: 'Temp DS · CR-10102', status: 'Internal data to be extracted', owner: 'Anish', target: 'Today' },
    { area: 'Mega site Audit', status: 'Audit point status to continued tracking', owner: 'Leeba / Anish', target: 'Priority' }
  ];

  const momActions = [
    { action: 'Revert Qating-related CR changes from PROD', owner: 'Sheeba / Ravi', target: 'Priority' },
    { action: 'Share My TM report with the team', owner: 'Sheeba / Ravi', target: 'Today' },
    { action: 'Complete Block Point data insertion and offer for testing', owner: 'Ramesh / Anish', target: 'Today' },
    { action: 'Arrange DS / RD for Auto JMS report transaction testing', owner: 'Ankita (TG)', target: 'Priority' },
    { action: 'Complete ERP testing and share output', owner: 'Anish', target: 'Tomorrow · first half' },
    { action: 'Extract CR Temp DS internal items', owner: 'Anish', target: 'Today' },
    { action: 'Share timelines for all pending activities', owner: 'Anish / Leeba', target: 'Today' },
    { action: 'Confirm JMS-related dependencies', owner: 'Ramesh / Anish', target: 'Today' },
    { action: 'Continue follow-up on Mega site audit points', owner: 'Leeba / Anish', target: 'Today' }
  ];

  let snapDocSeconds = 0;
  let snapDocTimerId = null;
  let openSnap = null;
  let snapOpenedFrom = 'snaps';

  function formatSnapTimer(total) {
    const h = String(Math.floor(total / 3600)).padStart(2, '0');
    const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const s = String(total % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function stopSnapTimer() {
    if (snapDocTimerId) {
      clearInterval(snapDocTimerId);
      snapDocTimerId = null;
    }
  }

  function startSnapTimer() {
    stopSnapTimer();
    snapDocSeconds = 0;
    const timerEl = document.getElementById('snapDocTimer');
    if (timerEl) timerEl.textContent = '00:00:00';
    snapDocTimerId = setInterval(() => {
      snapDocSeconds += 1;
      if (timerEl) timerEl.textContent = formatSnapTimer(snapDocSeconds);
    }, 1000);
  }

  function matchesQuery(text, query) {
    if (!query) return true;
    return String(text || '').toLowerCase().includes(query);
  }

  const SHEET_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const SHEET_ROWS = 18;
  let sheetCursor = { col: 0, row: 1 };

  function ensureSheetModel(snap) {
    if (snap.sheets) return;
    const sheetCount = /2\s*sheet/i.test(snap.subtitle || '') ? 2 : 1;
    snap.sheets = { Sheet1: {} };
    if (sheetCount > 1) snap.sheets.Sheet2 = {};
    snap.activeSheet = 'Sheet1';
  }

  function sheetCellKey(colIndex, row) {
    return `${SHEET_COLS[colIndex]}${row}`;
  }

  function sheetEscape(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderSpreadsheetSnap(query) {
    const body = document.getElementById('snapDocBody');
    if (!body || !openSnap) return;
    ensureSheetModel(openSnap);
    const q = (query || '').trim().toLowerCase();
    const sheetName = openSnap.activeSheet || 'Sheet1';
    const cells = openSnap.sheets[sheetName] || {};
    const activeKey = sheetCellKey(sheetCursor.col, sheetCursor.row);

    body.innerHTML = `
      <div class="sheet-app">
        <div class="sheet-menubar">
          <button type="button" class="sheet-menu active">Start</button>
          <button type="button" class="sheet-menu">Formulas</button>
          <button type="button" class="sheet-menu">View</button>
          <span class="sheet-saved">Saved just now</span>
        </div>
        <div class="sheet-formula">
          <span class="sheet-ref" id="sheetCellRef">${activeKey}</span>
          <span class="sheet-fx">fx</span>
          <input id="sheetFormulaInput" type="text" value="${sheetEscape(cells[activeKey] || '')}" aria-label="Cell value">
        </div>
        <div class="sheet-grid-scroll">
          <table class="sheet-grid">
            <thead>
              <tr>
                <th class="sheet-corner"></th>
                ${SHEET_COLS.map((col, i) => `<th class="${i === sheetCursor.col ? 'is-active-col' : ''}">${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${Array.from({ length: SHEET_ROWS }, (_, index) => {
                const row = index + 1;
                return `<tr>
                  <th class="${row === sheetCursor.row ? 'is-active-row' : ''}">${row}</th>
                  ${SHEET_COLS.map((col, colIndex) => {
                    const key = `${col}${row}`;
                    const value = cells[key] || '';
                    const selected = key === activeKey ? ' is-selected' : '';
                    const hit = q && value.toLowerCase().includes(q) ? ' is-hit' : '';
                    return `<td class="sheet-cell${selected}${hit}" data-col="${colIndex}" data-row="${row}">${sheetEscape(value)}</td>`;
                  }).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="sheet-tabs">
          <button type="button" class="sheet-add" id="sheetAddBtn" aria-label="Add sheet">+</button>
          ${Object.keys(openSnap.sheets).map(name => `
            <button type="button" class="sheet-tab ${name === sheetName ? 'active' : ''}" data-sheet="${name}">${name}</button>
          `).join('')}
        </div>
      </div>
    `;

    const formulaInput = document.getElementById('sheetFormulaInput');
    const refEl = document.getElementById('sheetCellRef');

    function selectCell(col, row) {
      sheetCursor = { col, row };
      renderSpreadsheetSnap(query);
      const input = document.getElementById('sheetFormulaInput');
      if (input) input.focus();
    }

    body.querySelectorAll('.sheet-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        selectCell(Number(cell.dataset.col), Number(cell.dataset.row));
      });
    });

    if (formulaInput) {
      formulaInput.addEventListener('input', (e) => {
        const key = sheetCellKey(sheetCursor.col, sheetCursor.row);
        openSnap.sheets[sheetName][key] = e.target.value;
        const live = body.querySelector(`.sheet-cell[data-col="${sheetCursor.col}"][data-row="${sheetCursor.row}"]`);
        if (live) live.textContent = e.target.value;
        if (refEl) refEl.textContent = key;
      });
    }

    body.querySelectorAll('.sheet-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        openSnap.activeSheet = tab.dataset.sheet;
        sheetCursor = { col: 0, row: 1 };
        renderSpreadsheetSnap('');
      });
    });

    const addBtn = document.getElementById('sheetAddBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const next = `Sheet${Object.keys(openSnap.sheets).length + 1}`;
        openSnap.sheets[next] = {};
        openSnap.activeSheet = next;
        openSnap.subtitle = `${Object.keys(openSnap.sheets).length} sheets`;
        sheetCursor = { col: 0, row: 1 };
        renderSpreadsheetSnap('');
        renderSnaps();
      });
    }

    body.querySelectorAll('.sheet-menu').forEach(btn => {
      btn.addEventListener('click', () => {
        body.querySelectorAll('.sheet-menu').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        showToast(`${btn.textContent} tools`);
      });
    });
  }

  const SNAP_BLOCK_CATALOG = [
    { group: 'BASIC', type: 'text', label: 'Text', hint: 'Just start writing with plain text', mark: 'T' },
    { group: 'HEADINGS', type: 'h1', label: 'Heading 1', hint: 'Big section heading', mark: 'H1' },
    { group: 'HEADINGS', type: 'h2', label: 'Heading 2', hint: 'Medium section heading', mark: 'H2' },
    { group: 'HEADINGS', type: 'h3', label: 'Heading 3', hint: 'Small section heading', mark: 'H3' },
    { group: 'LISTS', type: 'bullet', label: 'Bullet list', hint: 'Create a simple bullet list', mark: '•' },
    { group: 'LISTS', type: 'numbered', label: 'Numbered list', hint: 'Create a list with numbering', mark: '1.' },
    { group: 'CONTENT', type: 'quote', label: 'Quote', hint: 'Add a callout or citation block', mark: '“' },
    { group: 'CONTENT', type: 'code', label: 'Code block', hint: 'Create a formatted code snippet', mark: '</>' },
    { group: 'CONTENT', type: 'table', label: 'Table', hint: 'Add a structured data grid', mark: '⊞' },
    { group: 'WORK', type: 'task', label: 'Task', hint: 'Capture a line you can turn into a task', mark: '☑' }
  ];
  const SNAP_TASK_STATUSES = [
    { label: 'Not started', value: 'not_started' },
    { label: 'In progress', value: 'in_progress' },
    { label: 'Done', value: 'done' }
  ];
  const SNAP_ASSIGNEES = ['Unassigned', 'RK', 'MC', 'SC'];
  let blockMenuMode = { action: 'insert', id: null };
  let pendingDocFocus = '';
  let snapTaskDraft = {
    blockId: null,
    project: 'Table Ping',
    statusLabel: 'Not started',
    status: 'not_started',
    assignee: 'Unassigned',
    due: '',
    dueLabel: 'Due date'
  };

  function blockPlainText(block) {
    if (!block) return '';
    if (block.type === 'table') return (block.cells || []).flat().join(' ');
    return block.text || '';
  }

  function makeSnapBlock(type) {
    return {
      id: 'b_' + Date.now() + Math.floor(Math.random() * 1000),
      type,
      text: '',
      cells: type === 'table' ? [['', '', ''], ['', '', '']] : null,
      taskId: null,
      taskTitle: '',
      taskProject: ''
    };
  }

  function createSnap(kind, projectName) {
    const isSheet = kind === 'sheet';
    const snap = {
      id: 's_' + Date.now(),
      title: isSheet ? 'Untitled spreadsheet' : 'Untitled snap',
      subtitle: isSheet ? '1 sheet' : 'Document',
      kind: isSheet ? 'sheet' : 'doc',
      cover: isSheet ? 'green' : 'purple',
      owner: 'MC',
      ownerName: 'Midhun Raj',
      edited: 'Edited just now',
      editedDays: 0,
      version: 'v1',
      project: projectName || '',
      blocks: []
    };
    state.snaps.unshift(snap);
    if (projectName) {
      renderProjectDocs();
      openSnapDetail(snap, 'project');
    } else {
      renderSnaps();
      openSnapDetail(snap);
    }
  }

  function renderBlockMenu(query) {
    const list = document.getElementById('snapBlockList');
    if (!list) return;
    const q = (query || '').trim().toLowerCase();
    const items = SNAP_BLOCK_CATALOG.filter(item =>
      !q || item.label.toLowerCase().includes(q) || item.hint.toLowerCase().includes(q) || item.group.toLowerCase().includes(q)
    );
    let lastGroup = '';
    list.innerHTML = items.map(item => {
      const heading = item.group !== lastGroup ? `<div class="snap-block-group">${item.group}</div>` : '';
      lastGroup = item.group;
      return `${heading}
        <button type="button" class="snap-block-item" data-block-type="${item.type}">
          <span class="snap-block-mark">${item.mark}</span>
          <span class="snap-block-copy"><strong>${item.label}</strong><span>${item.hint}</span></span>
        </button>`;
    }).join('') || '<p class="snaps-empty">No matching blocks.</p>';
    list.querySelectorAll('[data-block-type]').forEach(btn => {
      btn.addEventListener('click', () => applySnapBlock(btn.dataset.blockType));
    });
  }

  function openBlockMenu(action, id) {
    blockMenuMode = { action, id };
    const search = document.getElementById('snapBlockSearch');
    if (search) search.value = '';
    renderBlockMenu('');
    openModal(document.getElementById('snapBlockModal'));
    if (search) setTimeout(() => search.focus(), 180);
  }

  function applySnapBlock(type) {
    if (!openSnap) return;
    if (!openSnap.blocks) openSnap.blocks = [];
    if (blockMenuMode.action === 'convert' && blockMenuMode.id) {
      const existing = openSnap.blocks.find(block => block.id === blockMenuMode.id);
      if (existing) {
        existing.type = type;
        if (type === 'table' && !existing.cells) existing.cells = [['', '', ''], ['', '', '']];
        pendingDocFocus = existing.id;
      }
    } else {
      const block = makeSnapBlock(type);
      if (blockMenuMode.id) {
        const idx = openSnap.blocks.findIndex(item => item.id === blockMenuMode.id);
        openSnap.blocks.splice(Math.max(idx, 0) + 1, 0, block);
      } else {
        openSnap.blocks.push(block);
      }
      pendingDocFocus = block.id;
    }
    closeModal(document.getElementById('snapBlockModal'));
    renderDocSnap('');
  }

  function refreshSnapTaskLabel() {
    const label = document.getElementById('snapTaskProjectLabel');
    if (label) label.textContent = `${snapTaskDraft.project} / ${snapTaskDraft.statusLabel}`;
    const dueLabel = document.getElementById('snapTaskDueLabel');
    if (dueLabel) dueLabel.textContent = snapTaskDraft.dueLabel;
    const assigneeLabel = document.getElementById('snapTaskAssigneeLabel');
    if (assigneeLabel) assigneeLabel.textContent = snapTaskDraft.assignee;
  }

  function openSnapTask(block) {
    snapTaskDraft = {
      blockId: block.id,
      project: block.taskProject || 'Table Ping',
      statusLabel: block.taskStatusLabel || 'Not started',
      status: block.taskStatus || 'not_started',
      assignee: block.taskAssignee || 'Unassigned',
      due: block.taskDue || '',
      dueLabel: block.taskDueLabel || 'Due date'
    };
    const title = document.getElementById('snapTaskTitle');
    if (title) title.value = block.taskTitle || blockPlainText(block).trim();
    const due = document.getElementById('snapTaskDue');
    if (due) due.value = snapTaskDraft.due;
    const existing = document.getElementById('snapTaskExisting');
    const picker = document.getElementById('snapTaskProjectList');
    if (existing) existing.classList.add('hidden');
    if (picker) picker.classList.add('hidden');
    refreshSnapTaskLabel();
    openModal(document.getElementById('snapTaskModal'));
  }

  function renderDocSnap(query) {
    const body = document.getElementById('snapDocBody');
    if (!body || !openSnap) return;
    if (!openSnap.blocks) openSnap.blocks = [];
    const q = (query || '').trim().toLowerCase();
    const firstLine = openSnap.blocks.map(blockPlainText).find(text => String(text).trim());
    openSnap.subtitle = firstLine ? String(firstLine).trim().slice(0, 72) : 'Document';
    let number = 0;
    const blocksHtml = openSnap.blocks.filter(block => {
      if (!q) return true;
      return blockPlainText(block).toLowerCase().includes(q) || block.type.includes(q);
    }).map(block => {
      const text = sheetEscape(block.text || '');
      const hasValue = blockPlainText(block).trim().length > 0 || !!block.taskId;
      const tickClass = `doc-tick${hasValue ? ' is-visible' : ''}${block.taskId ? ' is-on' : ''}`;
      const linked = block.taskId ? `<p class="doc-linked">Linked · ${sheetEscape(block.taskTitle || 'Task')}</p>` : '';
      let main = '';
      if (block.type === 'table') {
        main = `<table class="doc-table">${(block.cells || []).map((row, rowIndex) => `
          <tr>${row.map((cell, colIndex) => `<td><input class="doc-cell" data-row="${rowIndex}" data-col="${colIndex}" data-focus="${rowIndex === 0 && colIndex === 0 ? block.id : ''}" value="${sheetEscape(cell)}"></td>`).join('')}</tr>
        `).join('')}</table>`;
      } else if (block.type === 'code') {
        main = `<textarea class="doc-code" data-focus="${block.id}" rows="3" placeholder="Code">${text}</textarea>`;
      } else if (block.type === 'bullet' || block.type === 'numbered' || block.type === 'task') {
        const mark = block.type === 'bullet' ? '•' : (block.type === 'task' ? '☐' : `${++number}.`);
        const placeholder = block.type === 'task' ? 'Task' : 'List item';
        main = `<div class="doc-list"><span class="doc-list-mark">${mark}</span><input class="doc-input" data-focus="${block.id}" value="${text}" placeholder="${placeholder}"></div>`;
      } else if (block.type === 'quote') {
        main = `<div class="doc-quote"><input class="doc-input" data-focus="${block.id}" value="${text}" placeholder="Quote"></div>`;
      } else {
        const heading = block.type === 'h1' || block.type === 'h2' || block.type === 'h3' ? ` is-${block.type}` : '';
        const placeholder = block.type === 'h1' ? 'Heading 1' : block.type === 'h2' ? 'Heading 2' : block.type === 'h3' ? 'Heading 3' : 'Type / or click + to add a block...';
        main = `<input class="doc-input${heading}" data-focus="${block.id}" value="${text}" placeholder="${placeholder}">`;
      }
      return `
        <div class="doc-block" data-block-id="${block.id}">
          <button type="button" class="doc-plus" data-plus="${block.id}" aria-label="Add block">+</button>
          <span class="doc-grip" aria-hidden="true">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><circle cx="2" cy="2" r="1.2"></circle><circle cx="8" cy="2" r="1.2"></circle><circle cx="2" cy="7" r="1.2"></circle><circle cx="8" cy="7" r="1.2"></circle><circle cx="2" cy="12" r="1.2"></circle><circle cx="8" cy="12" r="1.2"></circle></svg>
          </span>
          <div class="doc-block-main">${main}${linked}</div>
          <button type="button" class="${tickClass}" data-tick="${block.id}" aria-label="Create or link task">
            ${block.taskId ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </button>
        </div>`;
    }).join('');

    body.innerHTML = `
      <div class="doc-editor">
        <div class="doc-banner"><span class="doc-saved">Saved just now</span></div>
        <div class="doc-badge" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
        <input class="doc-title" id="docSnapTitle" value="${sheetEscape(openSnap.title)}" aria-label="Snap title">
        <div class="doc-blocks">
          ${blocksHtml || ''}
          <div class="doc-block doc-composer">
            <button type="button" class="doc-plus" id="docComposerPlus" aria-label="Add block">+</button>
            <span class="doc-grip" aria-hidden="true"></span>
            <div class="doc-block-main">
              <input class="doc-input" id="docComposerInput" placeholder="Type / or click + to add a block...">
            </div>
          </div>
        </div>
      </div>`;

    const titleInput = document.getElementById('docSnapTitle');
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        openSnap.title = titleInput.value.trim() || 'Untitled snap';
        const header = document.getElementById('snapDocHeaderTitle');
        if (header) header.textContent = openSnap.title;
      });
    }

    const bindField = (block, field) => {
      const tick = body.querySelector(`[data-tick="${block.id}"]`);
      const write = () => {
        if (tick) tick.classList.toggle('is-visible', blockPlainText(block).trim().length > 0 || !!block.taskId);
      };
      if (field.tagName === 'TEXTAREA' || field.classList.contains('doc-input')) {
        field.addEventListener('input', () => {
          if (field.value === '/') {
            field.value = '';
            block.text = '';
            openBlockMenu('convert', block.id);
            return;
          }
          block.text = field.value;
          write();
        });
        field.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && block.type !== 'code') {
            e.preventDefault();
            const next = makeSnapBlock(block.type === 'code' ? 'text' : block.type);
            const idx = openSnap.blocks.findIndex(item => item.id === block.id);
            openSnap.blocks.splice(idx + 1, 0, next);
            pendingDocFocus = next.id;
            renderDocSnap('');
          } else if (e.key === 'Backspace' && !field.value) {
            openSnap.blocks = openSnap.blocks.filter(item => item.id !== block.id);
            renderDocSnap('');
          }
        });
      }
    };

    openSnap.blocks.forEach(block => {
      const row = body.querySelector(`[data-block-id="${block.id}"]`);
      if (!row) return;
      row.querySelectorAll('.doc-input, .doc-code').forEach(field => bindField(block, field));
      row.querySelectorAll('.doc-cell').forEach(cell => {
        cell.addEventListener('input', () => {
          const r = Number(cell.dataset.row);
          const c = Number(cell.dataset.col);
          if (!block.cells[r]) return;
          block.cells[r][c] = cell.value;
          const tick = row.querySelector('[data-tick]');
          if (tick) tick.classList.toggle('is-visible', blockPlainText(block).trim().length > 0 || !!block.taskId);
        });
      });
    });

    body.querySelectorAll('[data-plus]').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = openSnap.blocks.find(item => item.id === btn.dataset.plus);
        if (block && !blockPlainText(block).trim()) openBlockMenu('convert', block.id);
        else openBlockMenu('insert', btn.dataset.plus);
      });
    });
    body.querySelectorAll('[data-tick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const block = openSnap.blocks.find(item => item.id === btn.dataset.tick);
        if (!block || (!blockPlainText(block).trim() && !block.taskId)) return;
        openSnapTask(block);
      });
    });

    const composerPlus = document.getElementById('docComposerPlus');
    const composer = document.getElementById('docComposerInput');
    if (composerPlus) composerPlus.addEventListener('click', () => openBlockMenu('insert', null));
    if (composer) {
      composer.addEventListener('input', () => {
        const value = composer.value;
        if (!value) return;
        if (value === '/') {
          composer.value = '';
          openBlockMenu('insert', null);
          return;
        }
        const block = makeSnapBlock('text');
        block.text = value.replace(/^\//, '');
        openSnap.blocks.push(block);
        pendingDocFocus = block.id;
        renderDocSnap('');
      });
    }

    if (pendingDocFocus) {
      const focusEl = body.querySelector(`[data-focus="${pendingDocFocus}"]`);
      pendingDocFocus = '';
      if (focusEl) {
        focusEl.focus();
        if (typeof focusEl.setSelectionRange === 'function') {
          const len = focusEl.value.length;
          focusEl.setSelectionRange(len, len);
        }
      }
    }
  }

  function renderSnapDocument(query) {
    const body = document.getElementById('snapDocBody');
    const titleEl = document.getElementById('snapDocHeaderTitle');
    if (!body || !openSnap) return;
    if (titleEl) titleEl.textContent = openSnap.title;
    const q = (query || '').trim().toLowerCase();
    const isMeeting = /meeting|mom/i.test(openSnap.title) || openSnap.kind === 'people' || openSnap.kind === 'star';

    body.classList.remove('is-sheet', 'is-doc');
    const snapFab = document.getElementById('snapSideFab');
    const snapMenu = document.getElementById('snapSideMenu');
    if (snapFab) {
      snapFab.hidden = !isMeeting;
      snapFab.classList.remove('is-open');
    }
    if (snapMenu) snapMenu.hidden = true;
    const snapBackdrop = document.getElementById('snapFabBackdrop');
    if (snapBackdrop) snapBackdrop.hidden = true;
    document.getElementById('snapSideFabBtn')?.setAttribute('aria-expanded', 'false');
    if (openSnap.kind === 'doc') {
      body.classList.add('is-doc');
      renderDocSnap(q);
      return;
    }
    if (!isMeeting) {
      body.classList.add('is-sheet');
      renderSpreadsheetSnap(q);
      return;
    }

    const bullets = momDiscussion.filter(line => matchesQuery(line, q));
    const updates = momUpdates.filter(row => matchesQuery(`${row.area} ${row.status} ${row.owner} ${row.target}`, q));
    const actions = momActions.filter(row => matchesQuery(`${row.action} ${row.owner} ${row.target}`, q));
    const cover = openSnap.photo
      ? `style="background-image:url('${openSnap.photo}')"`
      : '';
    const attendees = ['Anish', 'Leeba', 'Ankur', 'Ankita', 'Uma'];

    body.innerHTML = `
      <div class="snap-doc-cover cover-${openSnap.cover}" ${cover}></div>
      <div class="snap-doc-page">
        <h1 class="snap-doc-title">${openSnap.title}</h1>
        <p class="snap-doc-meta">Date: 22 September 2026</p>
        <div class="snap-attendees">
          <span class="snap-attendees-label">Attendees</span>
          ${attendees.map(name => `<span class="snap-attendee">${name}</span>`).join('')}
        </div>

        <h3 class="snap-doc-section">Discussion Summary</h3>
        <ul class="snap-doc-list">
          ${bullets.map(line => `<li>${line}</li>`).join('') || '<li>No matching notes.</li>'}
        </ul>

        <h3 class="snap-doc-section">CR / Project Updates</h3>
        <div class="snap-record-list">
          ${updates.map(row => `
            <article class="snap-record">
              <strong>${row.area}</strong>
              <p>${row.status}</p>
              <div class="snap-record-grid">
                <span><em>Owner</em>${row.owner}</span>
                <span><em>Target</em>${row.target}</span>
              </div>
            </article>
          `).join('') || '<p class="snaps-empty">No matching updates.</p>'}
        </div>

        <h3 class="snap-doc-section">Key Action Items / Priorities</h3>
        <div class="snap-record-list">
          ${actions.map((row, index) => `
            <article class="snap-record">
              <div class="snap-record-index">${index + 1}</div>
              <strong>${row.action}</strong>
              <div class="snap-record-grid">
                <span><em>Owner</em>${row.owner}</span>
                <span><em>Target</em>${row.target}</span>
              </div>
            </article>
          `).join('') || '<p class="snaps-empty">No matching actions.</p>'}
        </div>
      </div>
    `;
  }

  function openSnapDetail(snap, from) {
    snapOpenedFrom = from || 'snaps';
    openSnap = snap;
    sheetCursor = { col: 0, row: 1 };
    const searchInput = document.getElementById('snapDocSearchInput');
    const searchWrap = document.getElementById('snapDocSearchWrap');
    const backBtn = document.getElementById('snapDetailBackBtn');
    if (searchInput) searchInput.value = '';
    if (searchWrap) searchWrap.classList.add('hidden');
    if (backBtn) backBtn.setAttribute('aria-label', snapOpenedFrom === 'project' ? 'Back to docs' : 'Back to snaps');
    renderSnapDocument('');
    startSnapTimer();
    openPanel(viewSnapDetail);
  }

  function closeSnapDetail() {
    stopSnapTimer();
    openSnap = null;
    if (snapOpenedFrom === 'project') {
      snapOpenedFrom = 'snaps';
      openPanel(viewProjectDetails);
      switchProjectTab('documents');
      return;
    }
    renderSnaps();
    openPanel(viewSnaps);
  }

  function snapTypeIcon(snap) {
    if (snap.kind === 'people') return peopleIcon;
    if (snap.kind === 'star') return starIcon;
    if (snap.kind === 'doc') return docIcon;
    return sheetIcon;
  }

  function filterSnapList(list, filters) {
    let next = list.slice();
    if (filters.search) {
      const q = filters.search.toLowerCase();
      next = next.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle || '').toLowerCase().includes(q) ||
        (s.ownerName || '').toLowerCase().includes(q)
      );
    }
    if (filters.owner && filters.owner !== 'All owners') {
      next = next.filter(s => s.ownerName === filters.owner || s.owner === filters.owner);
    }
    if (filters.sort === 'Oldest') {
      next.sort((a, b) => b.editedDays - a.editedDays);
    } else if (filters.sort === 'Title') {
      next.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      next.sort((a, b) => a.editedDays - b.editedDays);
    }
    return next;
  }

  function fillSnapGrid(grid, list, from) {
    grid.innerHTML = '';
    if (!list.length) {
      grid.innerHTML = `<p class="snaps-empty">${from === 'project' ? 'No docs for this project.' : 'No snaps match this search.'}</p>`;
      return;
    }
    list.forEach(snap => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'snap-card';
      const coverStyle = snap.cover === 'photo' && snap.photo
        ? `background-image:url('${snap.photo}')`
        : '';
      card.innerHTML = `
        <div class="snap-cover cover-${snap.cover}" style="${coverStyle}">
          <span class="snap-type-badge">${snapTypeIcon(snap)}</span>
        </div>
        <div class="snap-card-body">
          <h4 class="snap-card-title">${snap.title}</h4>
          <p class="snap-card-sub">${snap.subtitle}</p>
          <div class="snap-card-foot">
            <span class="snap-owner">${snap.owner}</span>
            <span class="snap-edited">${snap.edited}</span>
            <span class="snap-version">${snap.version}</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => openSnapDetail(snap, from));
      grid.appendChild(card);
    });
  }

  const projectDocFilters = {
    search: '',
    owner: 'All owners',
    sort: 'Recently updated',
    view: 'grid'
  };

  function renderProjectDocs() {
    const grid = document.getElementById('projectDocsGrid');
    const countEl = document.getElementById('projectDocsCount');
    if (!grid) return;
    const projectName = currentProject.name || '';
    const list = filterSnapList(
      state.snaps.filter(snap => snap.project === projectName),
      projectDocFilters
    );
    if (countEl) countEl.textContent = `${list.length} doc${list.length === 1 ? '' : 's'}`;
    grid.classList.toggle('is-list', projectDocFilters.view === 'list');
    fillSnapGrid(grid, list, 'project');
  }

  function renderSnaps() {
    const grid = document.getElementById('snapsGrid');
    const countEl = document.getElementById('snapsCountLabel');
    const homeMeta = document.getElementById('homeSnapsMeta');
    if (!grid) return;

    const list = filterSnapList(state.snaps, state.snapFilters);
    const label = `${list.length} snap${list.length === 1 ? '' : 's'}`;
    if (countEl) countEl.textContent = label;
    if (homeMeta) homeMeta.textContent = String(state.snaps.length);

    grid.classList.toggle('is-list', state.snapFilters.view === 'list');
    fillSnapGrid(grid, list, 'snaps');
  }

  const snapSideFab = document.getElementById('snapSideFab');
  const snapSideMenu = document.getElementById('snapSideMenu');
  const snapSideFabBtn = document.getElementById('snapSideFabBtn');
  const snapFabBackdrop = document.getElementById('snapFabBackdrop');
  const setSnapMenuOpen = (open) => {
    if (!snapSideFab || !snapSideMenu || !snapSideFabBtn) return;
    snapSideFab.classList.toggle('is-open', open);
    snapSideMenu.hidden = !open;
    if (snapFabBackdrop) snapFabBackdrop.hidden = !open;
    snapSideFabBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (snapFabBackdrop) {
    snapFabBackdrop.addEventListener('click', () => setSnapMenuOpen(false));
  }
  if (snapSideFabBtn) {
    snapSideFabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setSnapMenuOpen(snapSideMenu.hidden);
    });
  }
  if (snapSideMenu) {
    snapSideMenu.addEventListener('click', (e) => {
      const item = e.target.closest('[data-snap-action]');
      if (!item) return;
      e.stopPropagation();
      setSnapMenuOpen(false);
      showToast(item.dataset.snapAction);
    });
  }

  const snapDetailBackBtn = document.getElementById('snapDetailBackBtn');
  if (snapDetailBackBtn) snapDetailBackBtn.addEventListener('click', closeSnapDetail);

  const snapSaveCloseBtn = document.getElementById('snapSaveCloseBtn');
  if (snapSaveCloseBtn) {
    snapSaveCloseBtn.addEventListener('click', () => {
      showToast('Snap saved');
      closeSnapDetail();
    });
  }

  const snapDocSearchBtn = document.getElementById('snapDocSearchBtn');
  const snapDocSearchWrap = document.getElementById('snapDocSearchWrap');
  const snapDocSearchInput = document.getElementById('snapDocSearchInput');
  if (snapDocSearchBtn && snapDocSearchWrap) {
    snapDocSearchBtn.addEventListener('click', () => {
      snapDocSearchWrap.classList.toggle('hidden');
      if (!snapDocSearchWrap.classList.contains('hidden') && snapDocSearchInput) snapDocSearchInput.focus();
    });
  }
  if (snapDocSearchInput) {
    snapDocSearchInput.addEventListener('input', (e) => renderSnapDocument(e.target.value));
  }

  const homeSnapsItem = document.getElementById('homeSnapsItem') || document.getElementById('moreSnapsItem');
  if (homeSnapsItem) {
    homeSnapsItem.addEventListener('click', () => {
      renderSnaps();
      openPanel(viewSnaps);
    });
  }

  const snapsSearchInput = document.getElementById('snapsSearchInput');
  if (snapsSearchInput) {
    snapsSearchInput.addEventListener('input', (e) => {
      state.snapFilters.search = e.target.value.trim();
      renderSnaps();
    });
  }

  const snapsOwnerFilterBtn = document.getElementById('snapsOwnerFilterBtn');
  const snapsOwnerLabel = document.getElementById('snapsOwnerLabel');
  const ownerCycle = ['All owners', 'Midhun Raj'];
  if (snapsOwnerFilterBtn) {
    snapsOwnerFilterBtn.addEventListener('click', () => {
      const idx = ownerCycle.indexOf(state.snapFilters.owner);
      state.snapFilters.owner = ownerCycle[(idx + 1) % ownerCycle.length];
      if (snapsOwnerLabel) snapsOwnerLabel.textContent = state.snapFilters.owner;
      renderSnaps();
    });
  }

  const snapsSortFilterBtn = document.getElementById('snapsSortFilterBtn');
  const snapsSortLabel = document.getElementById('snapsSortLabel');
  const sortCycle = ['Recently updated', 'Oldest', 'Title'];
  if (snapsSortFilterBtn) {
    snapsSortFilterBtn.addEventListener('click', () => {
      const idx = sortCycle.indexOf(state.snapFilters.sort);
      state.snapFilters.sort = sortCycle[(idx + 1) % sortCycle.length];
      if (snapsSortLabel) snapsSortLabel.textContent = state.snapFilters.sort;
      renderSnaps();
    });
  }

  const snapsGridBtn = document.getElementById('snapsGridBtn');
  const snapsListBtn = document.getElementById('snapsListBtn');
  function setSnapView(mode) {
    state.snapFilters.view = mode;
    if (snapsGridBtn) snapsGridBtn.classList.toggle('active', mode === 'grid');
    if (snapsListBtn) snapsListBtn.classList.toggle('active', mode === 'list');
    renderSnaps();
  }
  if (snapsGridBtn) snapsGridBtn.addEventListener('click', () => setSnapView('grid'));
  if (snapsListBtn) snapsListBtn.addEventListener('click', () => setSnapView('list'));

  const projectDocsSearch = document.getElementById('projectDocsSearch');
  const projectDocsOwnerBtn = document.getElementById('projectDocsOwnerBtn');
  const projectDocsOwnerLabel = document.getElementById('projectDocsOwnerLabel');
  const projectDocsSortBtn = document.getElementById('projectDocsSortBtn');
  const projectDocsSortLabel = document.getElementById('projectDocsSortLabel');
  const projectDocsGridBtn = document.getElementById('projectDocsGridBtn');
  const projectDocsListBtn = document.getElementById('projectDocsListBtn');
  const projectDocsNewBtn = document.getElementById('projectDocsNewBtn');
  const projectDocsNewMenu = document.getElementById('projectDocsNewMenu');

  function setProjectDocsMenu(open) {
    if (!projectDocsNewMenu || !projectDocsNewBtn) return;
    projectDocsNewMenu.classList.toggle('hidden', !open);
    projectDocsNewBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (projectDocsSearch) {
    projectDocsSearch.addEventListener('input', (e) => {
      projectDocFilters.search = e.target.value.trim();
      renderProjectDocs();
    });
  }
  if (projectDocsOwnerBtn) {
    projectDocsOwnerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = ownerCycle.indexOf(projectDocFilters.owner);
      projectDocFilters.owner = ownerCycle[(idx + 1) % ownerCycle.length];
      if (projectDocsOwnerLabel) projectDocsOwnerLabel.textContent = projectDocFilters.owner;
      renderProjectDocs();
    });
  }
  if (projectDocsSortBtn) {
    projectDocsSortBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = sortCycle.indexOf(projectDocFilters.sort);
      projectDocFilters.sort = sortCycle[(idx + 1) % sortCycle.length];
      if (projectDocsSortLabel) projectDocsSortLabel.textContent = projectDocFilters.sort;
      renderProjectDocs();
    });
  }
  function setProjectDocsView(mode) {
    projectDocFilters.view = mode;
    if (projectDocsGridBtn) projectDocsGridBtn.classList.toggle('active', mode === 'grid');
    if (projectDocsListBtn) projectDocsListBtn.classList.toggle('active', mode === 'list');
    renderProjectDocs();
  }
  if (projectDocsGridBtn) projectDocsGridBtn.addEventListener('click', () => setProjectDocsView('grid'));
  if (projectDocsListBtn) projectDocsListBtn.addEventListener('click', () => setProjectDocsView('list'));
  if (projectDocsNewBtn) {
    projectDocsNewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setProjectDocsMenu(projectDocsNewMenu.classList.contains('hidden'));
    });
  }
  if (projectDocsNewMenu) {
    projectDocsNewMenu.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-snap-kind]');
      if (!choice) return;
      e.stopPropagation();
      setProjectDocsMenu(false);
      createSnap(choice.dataset.snapKind, currentProject.name);
    });
  }
  document.addEventListener('click', () => setProjectDocsMenu(false));

  const newSnapFab = document.getElementById('snapsNewFab');
  const newSnapBtn = document.getElementById('snapsNewFabBtn');
  const newSnapMenu = document.getElementById('snapsNewMenu');
  const newSnapBackdrop = document.getElementById('snapsNewBackdrop');
  function setNewSnapMenu(open) {
    if (!newSnapFab || !newSnapMenu || !newSnapBtn) return;
    newSnapFab.classList.toggle('is-open', open);
    newSnapMenu.hidden = !open;
    if (newSnapBackdrop) newSnapBackdrop.hidden = !open;
    newSnapBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (newSnapBackdrop) {
    newSnapBackdrop.addEventListener('click', () => setNewSnapMenu(false));
  }
  if (newSnapBtn) {
    newSnapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setNewSnapMenu(newSnapMenu.hidden);
    });
  }
  if (newSnapMenu) {
    newSnapMenu.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-snap-kind]');
      if (!choice) return;
      e.stopPropagation();
      setNewSnapMenu(false);
      createSnap(choice.dataset.snapKind);
    });
  }
  document.addEventListener('click', () => setNewSnapMenu(false));

  const snapBlockModal = document.getElementById('snapBlockModal');
  const snapTaskModal = document.getElementById('snapTaskModal');
  const closeSnapBlockBtn = document.getElementById('closeSnapBlockBtn');
  const snapBlockSearch = document.getElementById('snapBlockSearch');
  if (closeSnapBlockBtn) closeSnapBlockBtn.addEventListener('click', () => closeModal(snapBlockModal));
  if (snapBlockSearch) snapBlockSearch.addEventListener('input', (e) => renderBlockMenu(e.target.value));
  if (snapBlockModal) {
    snapBlockModal.addEventListener('click', (e) => {
      if (e.target === snapBlockModal) closeModal(snapBlockModal);
    });
  }

  const closeSnapTaskBtn = document.getElementById('closeSnapTaskBtn');
  const snapTaskProjectBtn = document.getElementById('snapTaskProjectBtn');
  const snapTaskProjectList = document.getElementById('snapTaskProjectList');
  const snapTaskDueBtn = document.getElementById('snapTaskDueBtn');
  const snapTaskDue = document.getElementById('snapTaskDue');
  const snapTaskAssigneeBtn = document.getElementById('snapTaskAssigneeBtn');
  const snapTaskCreateBtn = document.getElementById('snapTaskCreateBtn');
  const snapTaskLinkBtn = document.getElementById('snapTaskLinkBtn');
  const snapTaskExisting = document.getElementById('snapTaskExisting');

  function renderSnapTaskProjects() {
    if (!snapTaskProjectList) return;
    const statuses = SNAP_TASK_STATUSES.map(status =>
      `<button type="button" data-task-status="${status.value}" data-task-status-label="${status.label}">${status.label}</button>`
    ).join('');
    const projects = state.projects.map(project =>
      `<button type="button" data-task-project="${sheetEscape(project.name)}">${sheetEscape(project.name)}</button>`
    ).join('');
    snapTaskProjectList.innerHTML = `<div class="snap-block-group">STATUS</div>${statuses}<div class="snap-block-group">PROJECT</div>${projects}`;
  }

  if (snapTaskProjectBtn && snapTaskProjectList) {
    snapTaskProjectBtn.addEventListener('click', () => {
      const opening = snapTaskProjectList.classList.contains('hidden');
      if (opening) renderSnapTaskProjects();
      snapTaskProjectList.classList.toggle('hidden', !opening);
    });
    snapTaskProjectList.addEventListener('click', (e) => {
      const statusBtn = e.target.closest('[data-task-status]');
      const projectBtn = e.target.closest('[data-task-project]');
      if (statusBtn) {
        snapTaskDraft.status = statusBtn.dataset.taskStatus;
        snapTaskDraft.statusLabel = statusBtn.dataset.taskStatusLabel;
      }
      if (projectBtn) snapTaskDraft.project = projectBtn.dataset.taskProject;
      if (statusBtn || projectBtn) {
        refreshSnapTaskLabel();
        snapTaskProjectList.classList.add('hidden');
      }
    });
  }
  if (snapTaskDueBtn && snapTaskDue) {
    snapTaskDueBtn.addEventListener('click', () => {
      if (typeof snapTaskDue.showPicker === 'function') snapTaskDue.showPicker();
      else snapTaskDue.focus();
    });
    snapTaskDue.addEventListener('change', () => {
      snapTaskDraft.due = snapTaskDue.value;
      if (!snapTaskDue.value) {
        snapTaskDraft.dueLabel = 'Due date';
      } else {
        const date = new Date(`${snapTaskDue.value}T00:00:00`);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        snapTaskDraft.dueLabel = `${months[date.getMonth()]} ${date.getDate()}`;
      }
      refreshSnapTaskLabel();
    });
  }
  if (snapTaskAssigneeBtn) {
    snapTaskAssigneeBtn.addEventListener('click', () => {
      const idx = SNAP_ASSIGNEES.indexOf(snapTaskDraft.assignee);
      snapTaskDraft.assignee = SNAP_ASSIGNEES[(idx + 1) % SNAP_ASSIGNEES.length];
      refreshSnapTaskLabel();
    });
  }
  if (closeSnapTaskBtn) closeSnapTaskBtn.addEventListener('click', () => closeModal(snapTaskModal));
  if (snapTaskModal) {
    snapTaskModal.addEventListener('click', (e) => {
      if (e.target === snapTaskModal) closeModal(snapTaskModal);
    });
  }
  if (snapTaskCreateBtn) {
    snapTaskCreateBtn.addEventListener('click', () => {
      const block = openSnap && openSnap.blocks && openSnap.blocks.find(item => item.id === snapTaskDraft.blockId);
      const titleInput = document.getElementById('snapTaskTitle');
      const title = titleInput ? titleInput.value.trim() : '';
      if (!block || !title) {
        showToast('Add a task title');
        return;
      }
      const task = {
        id: 't_' + Date.now(),
        token: 'TASK-' + String(300 + projectTasks.length).padStart(6, '0'),
        title,
        project: snapTaskDraft.project,
        parentTeamspace: 'Products',
        description: `Created from snap “${openSnap.title}”.`,
        due: snapTaskDraft.dueLabel === 'Due date' ? '' : snapTaskDraft.dueLabel,
        dueType: 'clock',
        priority: 'None',
        assignee: snapTaskDraft.assignee === 'Unassigned' ? null : snapTaskDraft.assignee,
        stage: snapTaskDraft.status,
        status: snapTaskDraft.status,
        dueDate: snapTaskDraft.due,
        completed: snapTaskDraft.status === 'done',
        customFields: [],
        checklists: [],
        subtasks: [],
        files: [],
        comments: []
      };
      projectTasks.unshift(task);
      block.taskId = task.id;
      block.taskTitle = title;
      block.taskProject = snapTaskDraft.project;
      block.taskStatus = snapTaskDraft.status;
      block.taskStatusLabel = snapTaskDraft.statusLabel;
      block.taskAssignee = snapTaskDraft.assignee;
      block.taskDue = snapTaskDraft.due;
      block.taskDueLabel = snapTaskDraft.dueLabel;
      closeModal(snapTaskModal);
      renderDocSnap('');
      showToast(`Task created · ${title}`);
    });
  }
  if (snapTaskLinkBtn && snapTaskExisting) {
    snapTaskLinkBtn.addEventListener('click', () => {
      const tasks = projectTasks.filter(task => task.project === snapTaskDraft.project);
      snapTaskExisting.classList.remove('hidden');
      snapTaskExisting.innerHTML = tasks.length
        ? tasks.slice(0, 8).map(task => `<button type="button" data-link-task="${task.id}">${sheetEscape(task.title)}</button>`).join('')
        : '<p class="snaps-empty">No tasks in this project yet.</p>';
      snapTaskExisting.querySelectorAll('[data-link-task]').forEach(btn => {
        btn.addEventListener('click', () => {
          const block = openSnap && openSnap.blocks && openSnap.blocks.find(item => item.id === snapTaskDraft.blockId);
          const task = projectTasks.find(item => item.id === btn.dataset.linkTask);
          if (!block || !task) return;
          block.taskId = task.id;
          block.taskTitle = task.title;
          block.taskProject = task.project;
          closeModal(snapTaskModal);
          renderDocSnap('');
          showToast(`Linked · ${task.title}`);
        });
      });
    });
  }

  const homeTasksItem = document.getElementById('homeTasksItem') || document.getElementById('moreTasksItem');
  if (homeTasksItem) {
    homeTasksItem.addEventListener('click', () => {
      renderTasks();
      openPanel(viewTasks);
    });
  }

  const homeTimeTrackingItem = document.getElementById('homeTimeTrackingItem') || document.getElementById('moreTimeTrackingItem');
  if (homeTimeTrackingItem) {
    homeTimeTrackingItem.addEventListener('click', () => openPanel(viewTimeTracking));
  }

  const homeAttendanceItem = document.getElementById('homeAttendanceItem') || document.getElementById('moreAttendanceItem');
  if (homeAttendanceItem) {
    homeAttendanceItem.addEventListener('click', () => {
      openSiteCheckInPicker();
    });
  }

  // ==========================================
  // DRAWER SWIPE GESTURES (TOUCH & DRAG)
  // ==========================================
  if (phoneScreen) {
    let touchStartX = 0;
    let touchStartY = 0;

    phoneScreen.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    phoneScreen.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Check for horizontal swipe gesture
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        // Swipe right from left edge (within 55px of phone screen left edge) -> Open Drawer
        if (touchStartX < 60 && diffX > 0) {
          openDrawer();
        }
        // Swipe left when drawer is open -> Close Drawer
        else if (sideDrawer && sideDrawer.classList.contains('open') && diffX < -35) {
          closeDrawer();
        }
      }
    }, { passive: true });
  }

  // ==========================================
  // DESKTOP & SHELL CONTROLS
  // ==========================================
  if (toggleFrameBtn && deviceFrame) {
    toggleFrameBtn.addEventListener('click', () => {
      deviceFrame.classList.toggle('fluid-mode');
      showToast(deviceFrame.classList.contains('fluid-mode') ? 'Fluid responsive view' : 'iPhone 15 frame view');
    });
  }

  function getSelectedArrivalSite() {
    const idx = state.selectedArrivalSiteIndex || 0;
    return state.projects[idx] || state.projects[0] || null;
  }

  function openSiteCheckInPicker() {
    renderArrivalSiteOptions();
    openModal(arriveSiteModal);
  }

  function completeSiteCheckIn(site, options = {}) {
    if (!site) {
      showToast('Select a site to check in');
      return false;
    }

    // Geo-fenced sites require being inside the fence first
    if (site.geoFenced && !site.geoInside) {
      showToast('You are outside the site boundary.');
      closeModal(arriveSiteModal);
      openGeoCheckInGate(site);
      return false;
    }

    // One active site: leaving the previous site locks it again
    if (state.currentSite && state.currentSite.id != null && state.currentSite.id !== site.id) {
      state.checkedInProjectIds = state.checkedInProjectIds.filter(id => id !== state.currentSite.id);
      state.currentSite.checkedInAt = null;
    }

    state.currentSite = site;
    state.isOnSite = true;
    site.workers = state.crewCount;
    markProjectCheckedIn(site);
    closeModal(arriveSiteModal);
    closeModal(document.getElementById('geoCheckInModal'));
    updateHeroSiteDisplay();
    renderSites();
    showToast(`Checked in at ${site.name}`);

    if (options.openProject) {
      openProjectDetails(site.name, site.teamspace);
    }
    return true;
  }

  function checkoutFromSite() {
    const site = state.currentSite;
    const siteName = site ? site.name : 'site';
    if (site && site.id != null) {
      state.checkedInProjectIds = state.checkedInProjectIds.filter(id => id !== site.id);
      site.checkedInAt = null;
    }
    state.currentSite = null;
    state.isOnSite = false;
    updateHeroSiteDisplay();
    renderSites();
    refreshProjectSubtitle();
    if (viewProjectDetails && viewProjectDetails.classList.contains('open')) {
      updateProjectAccessLockUI(findProject(currentProject.name, currentProject.parent));
    }
    showToast(`Checked out of ${siteName}`);
  }

  // Update hero card — Check out only when already checked in
  function updateHeroSiteDisplay() {
    const heroTag = document.getElementById('heroSiteReachedTag');
    const heroSiteName = document.getElementById('heroReachedSiteName');
    const heroSitePrefix = heroTag ? heroTag.querySelector('.site-tag-prefix') : null;
    const arriveBtn = document.getElementById('arriveSiteBtn');
    const checkoutBtn = document.getElementById('checkoutSiteBtn');
    const heroTitle = document.getElementById('heroCardTitle');
    const heroDesc = document.getElementById('heroCardDesc');
    const heroAction = document.getElementById('heroSiteAction');
    const heroCard = document.getElementById('heroStartDayCard');
    const onSite = !!(state.isOnSite && state.currentSite);

    if (heroCard) heroCard.classList.toggle('is-checked-in', onSite);

    if (onSite) {
      if (heroTitle) heroTitle.textContent = 'Start your day';
      if (heroDesc) heroDesc.textContent = `On site · ${state.currentSite.name}`;
      if (heroSiteName) heroSiteName.textContent = state.currentSite.name;
      if (heroSitePrefix) heroSitePrefix.textContent = 'On site';
      if (heroAction) heroAction.textContent = 'Switch site';
      if (arriveBtn) arriveBtn.classList.add('hidden');
      if (checkoutBtn) checkoutBtn.classList.remove('hidden');
    } else {
      const selected = getSelectedArrivalSite();
      if (heroTitle) heroTitle.textContent = 'Start your day';
      if (heroDesc) heroDesc.textContent = 'Choose your work location to record attendance and access assigned tasks.';
      if (heroSiteName) heroSiteName.textContent = selected ? selected.name : 'Fitout work';
      if (heroSitePrefix) heroSitePrefix.textContent = '';
      if (heroAction) heroAction.textContent = 'Change site';
      if (arriveBtn) {
        arriveBtn.classList.remove('hidden');
        const label = arriveBtn.querySelector('#arriveBtnLabel');
        if (label) label.textContent = 'Check In to a Site';
      }
      if (checkoutBtn) checkoutBtn.classList.add('hidden');
    }
  }

  if (resetDemoBtn) {
    resetDemoBtn.addEventListener('click', () => {
      state.currentSite = null;
      state.isOnSite = false;
      state.crewCount = 14;
      state.hasPhoto = false;
      state.checkedInProjectIds = [];
      state.pendingGeoProjectId = null;
      // Restore demo geo states
      state.projects.forEach(p => {
        if (p.name === 'Fitout work' || p.name === 'Testing the CR field') p.geoInside = true;
        if (p.name === 'Development Testing') p.geoInside = false;
      });
      state.tasks.forEach(t => t.completed = false);
      updateHeroSiteDisplay();
      updateCounters();
      renderTasks();
      renderSites();
      closeAllPanels();
      closeDrawer();
      showToast('Reset to original demo state');
    });
  }

  // Hero site pill — choose which site to check in to
  const heroSiteReachedTag = document.getElementById('heroSiteReachedTag');
  if (heroSiteReachedTag) {
    heroSiteReachedTag.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSiteCheckInPicker();
    });
  }

  // Hero primary — choose a site, then check in and open it
  if (arriveSiteBtn) {
    arriveSiteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSiteCheckInPicker();
    });
  }

  // Check out from hero card when already on site
  if (checkoutSiteBtn) {
    checkoutSiteBtn.addEventListener('click', () => {
      checkoutFromSite();
    });
  }

  if (headerSpaceSelectorBtn) {
    headerSpaceSelectorBtn.addEventListener('click', () => {
      openDrawer();
    });
  }

  if (openProfileBtn) {
    openProfileBtn.addEventListener('click', () => {
      openPanel(viewSettings);
    });
  }

  // Back buttons from subviews
  if (backFromSites) backFromSites.addEventListener('click', closeAllPanels);
  if (backFromSnaps) backFromSnaps.addEventListener('click', closeAllPanels);
  if (backFromTasks) backFromTasks.addEventListener('click', closeAllPanels);
  if (backFromNotes) backFromNotes.addEventListener('click', closeAllPanels);
  if (backFromSettings) backFromSettings.addEventListener('click', closeAllPanels);
  const backFromTimeTracking = document.getElementById('backFromTimeTracking');
  if (backFromTimeTracking) backFromTimeTracking.addEventListener('click', closeAllPanels);

  const tdayLog = {
    '23-5': [
      { client: "Jack Rabbit Slim's", tone: 'client', time: '00:00:23', task: 'New website project', started: '15:11', tag: 'Development' },
      { client: "Jack Rabbit Slim's", tone: 'client', time: '00:05:11', task: 'Social media management', started: '13:00', tag: 'Development' },
      { client: 'Quentin', tone: 'person', time: '00:02:00', task: 'New design', started: '08:00' }
    ]
  };
  const tdayDow = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const tdayDowLong = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const tdayMonthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const tdayMonthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const tdayWeeks = Array.from({ length: 3 }, (_, week) => {
    const start = new Date(2025, 5, 16 + week * 7);
    return Array.from({ length: 7 }, (_, col) => {
      const date = new Date(start);
      date.setDate(start.getDate() + col);
      const id = `${date.getDate()}-${date.getMonth()}`;
      const today = id === '23-5';
      return {
        id,
        col,
        dow: tdayDow[col],
        num: String(date.getDate()),
        hours: today ? '4:00' : '0:00',
        label: today ? 'Today, 23 June' : `${tdayDowLong[col]} ${date.getDate()} ${tdayMonthLong[date.getMonth()]}`,
        short: `${date.getDate()} ${tdayMonthShort[date.getMonth()]} ${date.getFullYear()}`,
        kicker: today ? 'TODAY' : tdayDow[col],
        clock: today ? '07:23:15' : '00:00:00'
      };
    });
  });
  const tdayDays = tdayWeeks.flat();
  let tdaySelected = '23-5';
  let tdayWeekIndex = 1;
  let tdayCol = 0;

  const tdayTrack = document.getElementById('tdayWeekTrack');
  const tdayWeek = document.getElementById('tdayWeek');
  const placeTdayTrack = (offset, animate) => {
    if (!tdayTrack) return;
    tdayTrack.style.transition = animate ? '' : 'none';
    tdayTrack.style.transform = `translateX(calc(${-tdayWeekIndex * 100}% + ${offset}px))`;
  };

  if (tdayTrack) {
    tdayTrack.innerHTML = tdayWeeks.map(page => `
      <div class="tday-week-page">
        ${page.map(day => `
          <button type="button" class="tday-day" data-day="${day.id}" data-col="${day.col}">
            <span>${day.dow}</span><strong>${day.num}</strong><em>${day.hours}</em>
          </button>
        `).join('')}
      </div>
    `).join('');
  }

  const renderTimeDay = (dayId) => {
    const day = tdayDays.find(item => item.id === dayId) || tdayDays[7];
    tdaySelected = day.id;
    tdayWeekIndex = Math.floor(tdayDays.indexOf(day) / 7);
    tdayCol = day.col;
    placeTdayTrack(0, true);
    document.querySelectorAll('.tday-day').forEach(button => {
      button.classList.toggle('is-on', button.dataset.day === day.id);
    });
    const dateLabel = document.getElementById('tdayDateLabel');
    const nowDate = document.getElementById('tdayNowDate');
    const clock = document.getElementById('tdayClock');
    const kicker = document.querySelector('.tday-kicker');
    const list = document.getElementById('tdayList');
    const empty = document.getElementById('tdayEmpty');
    if (dateLabel) dateLabel.textContent = day.label;
    if (nowDate) nowDate.textContent = day.short;
    if (clock) clock.textContent = day.clock;
    if (kicker) kicker.textContent = day.kicker;
    const rows = tdayLog[day.id] || [];
    if (empty) empty.hidden = rows.length > 0;
    if (!list) return;
    list.innerHTML = rows.map(row => `
      <article class="tday-entry">
        <span class="tday-user" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"></circle><path d="M5 19a7 7 0 0 1 14 0"></path></svg>
        </span>
        <div class="tday-entry-copy">
          <div class="tday-entry-top">
            <strong class="tday-client ${row.tone === 'client' ? 'is-client' : ''}">${row.client}</strong>
            <span class="tday-duration">${row.time}</span>
          </div>
          <div class="tday-entry-sub">
            <p class="tday-entry-meta">${row.task}${row.tag ? ` · ${row.tag}` : ''}</p>
            <span class="tday-started">Started ${row.started}</span>
          </div>
        </div>
      </article>
    `).join('');
  };

  renderTimeDay('23-5');
  let tdayDrag = null;
  let tdaySuppressClick = false;
  if (tdayWeek) {
    tdayWeek.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      tdayDrag = { id: event.pointerId, x: event.clientX, dx: 0 };
      tdayWeek.setPointerCapture(event.pointerId);
      placeTdayTrack(0, false);
    });
    tdayWeek.addEventListener('pointermove', (event) => {
      if (!tdayDrag || event.pointerId !== tdayDrag.id) return;
      tdayDrag.dx = event.clientX - tdayDrag.x;
      placeTdayTrack(tdayDrag.dx, false);
    });
    const finishTdayDrag = (event) => {
      if (!tdayDrag || event.pointerId !== tdayDrag.id) return;
      const dx = tdayDrag.dx;
      tdayDrag = null;
      const threshold = Math.max(48, (tdayWeek.clientWidth || 1) * 0.18);
      if (dx <= -threshold && tdayWeekIndex < tdayWeeks.length - 1) tdayWeekIndex += 1;
      else if (dx >= threshold && tdayWeekIndex > 0) tdayWeekIndex -= 1;
      if (Math.abs(dx) > 8) {
        tdaySuppressClick = true;
        renderTimeDay(tdayWeeks[tdayWeekIndex][tdayCol].id);
      } else {
        placeTdayTrack(0, true);
      }
    };
    tdayWeek.addEventListener('pointerup', finishTdayDrag);
    tdayWeek.addEventListener('pointercancel', finishTdayDrag);
    tdayWeek.addEventListener('click', (event) => {
      if (tdaySuppressClick) {
        tdaySuppressClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const button = event.target.closest('.tday-day');
      if (!button) return;
      renderTimeDay(button.dataset.day);
    });
  }
  document.getElementById('tdayDateBtn')?.addEventListener('click', () => {
    openMobileChoice({
      title: 'Choose a day',
      selected: tdaySelected,
      options: tdayDays.map(day => ({ value: day.id, label: day.label })),
      onPick: (value) => renderTimeDay(value)
    });
  });
  document.getElementById('tdayStar')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    const on = button.classList.toggle('is-on');
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    showToast(on ? 'Day marked' : 'Mark removed');
  });
  if (backFromProjectDetails) {
    backFromProjectDetails.addEventListener('click', () => {
      closeProjectFab();
      closeAllPanels();
    });
  }

  // Floating dock
  if (dockHomeBtn) {
    dockHomeBtn.addEventListener('click', () => {
      closeProjectFab();
      closeAllPanels();
      switchToSpacesTab(0);
    });
  }

  if (dockSettingsBtn) {
    dockSettingsBtn.addEventListener('click', () => {
      openPanel(viewSettings);
    });
  }

  if (dockPlusBtn) {
    dockPlusBtn.addEventListener('click', () => {
      if (viewProjectDetails && viewProjectDetails.classList.contains('open')) {
        toggleProjectFab();
        return;
      }
      openModal(quickActionsModal);
    });
  }

  const closeQuickActionsBtn = document.getElementById('closeQuickActionsBtn');
  if (closeQuickActionsBtn) {
    closeQuickActionsBtn.addEventListener('click', () => closeModal(quickActionsModal));
  }

  // Quick Action Tiles
  const quickArriveTile = document.getElementById('quickArriveTile');
  if (quickArriveTile) {
    quickArriveTile.addEventListener('click', () => {
      closeModal(quickActionsModal);
      openSiteCheckInPicker();
    });
  }

  const quickTaskTile = document.getElementById('quickTaskTile');
  if (quickTaskTile) {
    quickTaskTile.addEventListener('click', () => {
      closeModal(quickActionsModal);
      openModal(addTaskModal);
    });
  }

  const quickNoteTile = document.getElementById('quickNoteTile');
  if (quickNoteTile) {
    quickNoteTile.addEventListener('click', () => {
      closeModal(quickActionsModal);
      openModal(addNoteModal);
    });
  }

  const quickPhotoTile = document.getElementById('quickPhotoTile');
  if (quickPhotoTile) {
    quickPhotoTile.addEventListener('click', () => {
      closeModal(quickActionsModal);
      showToast('Camera opened · Photo logged to active site');
    });
  }

  // Arrive Site Modal Controls
  const closeArriveModalBtn = document.getElementById('closeArriveModalBtn');
  if (closeArriveModalBtn) {
    closeArriveModalBtn.addEventListener('click', () => closeModal(arriveSiteModal));
  }

  if (stepMinusBtn && crewCountDisplay && crewRollSummary) {
    stepMinusBtn.addEventListener('click', () => {
      if (state.crewCount > 1) {
        state.crewCount--;
        crewCountDisplay.textContent = state.crewCount;
        crewRollSummary.textContent = `${state.crewCount} of 16 present today`;
      }
    });
  }

  if (stepPlusBtn && crewCountDisplay && crewRollSummary) {
    stepPlusBtn.addEventListener('click', () => {
      state.crewCount++;
      crewCountDisplay.textContent = state.crewCount;
      crewRollSummary.textContent = `${state.crewCount} of 16 present today`;
    });
  }

  if (simulatePhotoSnap && sitePhotoSlot) {
    simulatePhotoSnap.addEventListener('click', () => {
      state.hasPhoto = true;
      sitePhotoSlot.classList.add('has-image');
      sitePhotoSlot.style.backgroundImage = 'url("https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=400&auto=format&fit=crop&q=80")';
      sitePhotoSlot.innerHTML = `<span style="background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 6px; font-size: 11px;">✓ Photo Captured</span>`;
      showToast('Arrival photo captured!');
    });
  }

  if (confirmArrivalBtn) {
    confirmArrivalBtn.addEventListener('click', () => {
      completeSiteCheckIn(getSelectedArrivalSite());
    });
  }

  // Geo-fence check-in gate modal (demo)
  const geoCheckInModal = document.getElementById('geoCheckInModal');
  const closeGeoCheckInModalBtn = document.getElementById('closeGeoCheckInModalBtn');
  if (closeGeoCheckInModalBtn) {
    closeGeoCheckInModalBtn.addEventListener('click', () => {
      closeModal(geoCheckInModal);
      state.pendingGeoProjectId = null;
    });
  }

  const simulateGeoEnterBtn = document.getElementById('simulateGeoEnterBtn');
  if (simulateGeoEnterBtn) {
    simulateGeoEnterBtn.addEventListener('click', () => {
      const project = state.projects.find(p => p.id === state.pendingGeoProjectId);
      if (!project) return;
      project.geoInside = !project.geoInside;
      updateGeoCheckInModal(project);
      renderSites();
      showToast(project.geoInside
        ? `Demo: you are at ${project.name}`
        : `Demo: you left ${project.name}`);
    });
  }

  const confirmGeoCheckInBtn = document.getElementById('confirmGeoCheckInBtn');
  if (confirmGeoCheckInBtn) {
    confirmGeoCheckInBtn.addEventListener('click', () => {
      const project = state.projects.find(p => p.id === state.pendingGeoProjectId);
      if (!project) return;
      if (!project.geoInside) {
        showToast('You are still outside the site boundary.');
        return;
      }

      completeSiteCheckIn(project, { openProject: true });
    });
  }

  const projectGeoLockCheckInBtn = document.getElementById('projectGeoLockCheckInBtn');
  if (projectGeoLockCheckInBtn) {
    projectGeoLockCheckInBtn.addEventListener('click', () => {
      const project = findProject(currentProject.name, currentProject.parent);
      if (project) openGeoCheckInGate(project);
    });
  }

  // Tasks Filter tabs
  const filterTabs = document.querySelectorAll('.filter-tab');
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTasks(tab.dataset.filter);
    });
  });

  // Task Creation
  const openAddTaskModalBtn = document.getElementById('openAddTaskModalBtn');
  if (openAddTaskModalBtn) {
    openAddTaskModalBtn.addEventListener('click', () => openModal(addTaskModal));
  }

  const closeAddTaskModalBtn = document.getElementById('closeAddTaskModalBtn');
  if (closeAddTaskModalBtn) {
    closeAddTaskModalBtn.addEventListener('click', () => closeModal(addTaskModal));
  }

  const newTaskLabels = [];
  const newTaskLabelsEl = document.getElementById('newTaskLabels');
  const newTaskLabelInput = document.getElementById('newTaskLabelInput');
  const newTaskAddLabelBtn = document.getElementById('newTaskAddLabelBtn');

  function renderNewTaskLabels() {
    if (!newTaskLabelsEl) return;
    newTaskLabelsEl.innerHTML = newTaskLabels.map((label, index) =>
      `<span class="label-pill">${label}<button type="button" class="new-task-label-remove" data-label-index="${index}" aria-label="Remove ${label}"> ×</button></span>`
    ).join('');
    newTaskLabelsEl.querySelectorAll('.new-task-label-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        newTaskLabels.splice(Number(btn.dataset.labelIndex), 1);
        renderNewTaskLabels();
      });
    });
  }

  function addNewTaskLabel() {
    const value = newTaskLabelInput ? newTaskLabelInput.value.trim() : '';
    if (!value || newTaskLabels.includes(value)) return;
    newTaskLabels.push(value);
    if (newTaskLabelInput) newTaskLabelInput.value = '';
    renderNewTaskLabels();
  }

  if (newTaskAddLabelBtn) newTaskAddLabelBtn.addEventListener('click', addNewTaskLabel);
  if (newTaskLabelInput) {
    newTaskLabelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addNewTaskLabel();
      }
    });
  }

  const newTaskForm = document.getElementById('newTaskForm');
  if (newTaskForm) {
    newTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addNewTaskLabel();
      const title = (document.getElementById('taskTitleInput')?.value || '').trim();
      const status = document.getElementById('newTaskStatus')?.value || '';
      const dueDate = document.getElementById('newTaskDue')?.value || '';
      const priority = document.getElementById('newTaskPriority')?.value || '';
      const assignee = document.getElementById('newTaskAssignee')?.value || '';
      const startDate = document.getElementById('newTaskStart')?.value || '';
      const project = document.getElementById('newTaskProject')?.value || '';
      const description = (document.getElementById('newTaskDescription')?.value || '').trim();
      const missing = [];
      if (!title) missing.push('Title');
      if (!status) missing.push('Status');
      if (!dueDate) missing.push('Due date');
      if (!priority) missing.push('Priority');
      if (!assignee) missing.push('Assigned to');
      if (!startDate) missing.push('Start date');
      if (!project) missing.push('Project');
      if (!newTaskLabels.length) missing.push('Labels');
      if (!description) missing.push('Description');
      if (missing.length) {
        showToast(`Fill ${missing.join(', ')}`);
        return;
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const shortDate = (value) => {
        const parts = value.split('-');
        if (parts.length !== 3) return value;
        return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1] || ''}`;
      };
      const task = {
        id: 't_' + Date.now(),
        token: 'TASK-' + String(300 + projectTasks.length).padStart(6, '0'),
        title,
        project,
        site: project,
        parentTeamspace: 'Products',
        description,
        due: shortDate(dueDate),
        dueDate,
        startDate,
        dueType: 'clock',
        priority,
        assignee: assignee === 'Unassigned' ? null : assignee,
        stage: status,
        status,
        labels: newTaskLabels.slice(),
        completed: status === 'done',
        created: shortDate(new Date().toISOString().slice(0, 10)),
        updated: shortDate(new Date().toISOString().slice(0, 10)),
        customFields: [],
        checklists: [],
        subtasks: [],
        files: [],
        comments: []
      };
      projectTasks.unshift(task);
      state.tasks.unshift({
        id: task.id,
        token: task.token,
        title,
        site: project,
        priority: priority === 'None' ? 'Normal' : priority,
        completed: task.completed
      });
      newTaskForm.reset();
      newTaskLabels.length = 0;
      renderNewTaskLabels();
      closeModal(addTaskModal);
      updateCounters();
      renderTasks();
      openTaskDetail(task);
      if (typeof renderKanbanBoard === 'function') renderKanbanBoard(currentProject.activeStage || 'all');
    });
  }

  // Notes Creation
  const openAddNoteModalBtn = document.getElementById('openAddNoteModalBtn');
  if (openAddNoteModalBtn) {
    openAddNoteModalBtn.addEventListener('click', () => openModal(addNoteModal));
  }

  const closeAddNoteModalBtn = document.getElementById('closeAddNoteModalBtn');
  if (closeAddNoteModalBtn) {
    closeAddNoteModalBtn.addEventListener('click', () => closeModal(addNoteModal));
  }

  const tagChoices = document.querySelectorAll('.tag-choice');
  let selectedTag = 'Safety';
  tagChoices.forEach(choice => {
    choice.addEventListener('click', () => {
      tagChoices.forEach(c => c.classList.remove('active'));
      choice.classList.add('active');
      selectedTag = choice.dataset.tag || 'Safety';
    });
  });

  const newNoteForm = document.getElementById('newNoteForm');
  if (newNoteForm) {
    newNoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const titleInput = document.getElementById('noteTitleInput');
      const contentInput = document.getElementById('noteContentInput');

      const title = titleInput ? titleInput.value.trim() : '';
      const content = contentInput ? contentInput.value.trim() : '';

      if (!title || !content) return;

      state.notes.unshift({
        id: Date.now(),
        title,
        tag: selectedTag,
        author: 'Midhun Raj',
        time: 'Just now',
        site: state.currentSite ? state.currentSite.name : 'Apex Towers - Phase 2',
        content
      });

      if (titleInput) titleInput.value = '';
      if (contentInput) contentInput.value = '';
      closeModal(addNoteModal);
      updateCounters();
      renderNotes();
      showToast('Field note saved!');
    });
  }

  // Employees & Time tracking modal close buttons
  const closeEmployeesModalBtn = document.getElementById('closeEmployeesModalBtn');
  if (closeEmployeesModalBtn) {
    closeEmployeesModalBtn.addEventListener('click', () => closeModal(employeesModal));
  }

  const closeTimeTrackingModalBtn = document.getElementById('closeTimeTrackingModalBtn');
  if (closeTimeTrackingModalBtn) {
    closeTimeTrackingModalBtn.addEventListener('click', () => closeModal(timeTrackingModal));
  }

  // Shift clock toggle
  const toggleShiftClockBtn = document.getElementById('toggleShiftClockBtn');
  if (toggleShiftClockBtn) {
    toggleShiftClockBtn.addEventListener('click', () => {
      state.isClockedIn = !state.isClockedIn;
      toggleShiftClockBtn.textContent = state.isClockedIn ? 'Clock Out' : 'Clock In';
      toggleShiftClockBtn.style.background = state.isClockedIn ? 'var(--brand-navy)' : '#2CB67D';
      showToast(state.isClockedIn ? 'Clocked in to Apex Towers' : 'Clocked out. Hours recorded');
    });
  }

  // Close modals on backdrop click (include geo + manage fields so UI never stays stuck)
  const manageFieldsModalEl = document.getElementById('manageFieldsModal');
  [arriveSiteModal, quickActionsModal, addTaskModal, addNoteModal, spaceContextMenuModal, employeesModal, timeTrackingModal, geoCheckInModal, manageFieldsModalEl].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
          if (modal === geoCheckInModal) state.pendingGeoProjectId = null;
        }
      });
    }
  });

  // Clear cache demo button
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
      showToast('Offline cache cleared');
    });
  }

  // ==========================================
  // PROJECT DETAILS LOGIC (MATCHING SNAP WEB INTERFACE)
  // ==========================================
  let currentProject = {
    name: 'Table Ping',
    parent: 'Products',
    initial: 'T',
    starred: false,
    activeTab: 'task',
    activeStage: 'all',
    viewMode: 'board'
  };

  // Web Tasks Data (Matches Web Screenshot)
  const projectTasks = [
    // Premier Task from Web Screenshot (TASK-000288)
    {
      id: 't_288',
      token: 'TASK-000288',
      title: 'ANNUAL MAINTENANCE CONTRACT AUTHORITY CHARGES',
      project: 'AME Estimation',
      parentTeamspace: 'Test Teamspace',
      description: 'Statutory authority charges for annual electrical, mechanical, and HVAC maintenance contract estimation.',
      due: 'Oct 31',
      dueType: 'clock',
      priority: 'None',
      assignee: 'Unassigned',
      stage: 'not_started',
      status: 'not_started',
      labels: ['Authority', 'Estimation'],
      startDate: '2026-10-13',
      dueDate: '2026-10-31',
      created: 'October 13, 2026',
      updated: 'October 13, 2026',
      completed: false,
      customFields: [
        { id: 'cf_sl', name: 'SL. No.', type: 'number', value: '1', permission: 'all' },
        { id: 'cf_qty', name: 'QUANTITY', type: 'number', value: '1', permission: 'all' },
        { id: 'cf_unit', name: 'UNIT', type: 'select', value: 'Time', options: ['Time', 'Hours', 'Days', 'Nos', 'Sq.Ft', 'Lump Sum'], permission: 'all' },
        { id: 'cf_rate', name: 'RATE', type: 'number', value: '300', permission: 'admin_only' },
        { id: 'cf_subtotal', name: 'SUBTOTAL', type: 'formula', formula: 'QUANTITY * RATE', value: '300', permission: 'admin_only' }
      ],
      checklists: [
        {
          id: 'cl_test',
          name: 'test',
          items: [
            { id: 'cli_1', text: 'Verify authority tariff schedule documentation', done: false },
            { id: 'cli_2', text: 'Check council fee exemption criteria', done: false }
          ]
        }
      ],
      subtasks: [],
      files: [
        {
          id: 'f_photo',
          name: 'Selfie.jpg',
          size: '1.1 MB',
          date: 'Oct 13, 2026',
          kind: 'image',
          preview: 'data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 200'><rect width='160' height='200' fill='#111827'/><rect x='10' y='12' width='140' height='16' rx='8' fill='#ffffff' fill-opacity='.16'/><circle cx='80' cy='78' r='28' fill='#F3C7A6'/><path d='M28 176c8-36 28-54 52-54s44 18 52 54' fill='#334155'/><rect x='18' y='158' width='124' height='28' rx='8' fill='#10B981'/><text x='80' y='176' text-anchor='middle' font-size='11' font-family='Arial' fill='#ffffff'>Confirmed</text></svg>")
        },
        { id: 'f_1', name: 'Authority_Tariff_Schedule_2026.pdf', size: '2.4 MB', date: 'Oct 13, 2026', kind: 'pdf' }
      ],
      assignHistory: [
        { name: 'Midhun Raj', when: 'Oct 13, 2026' },
        { name: 'Unassigned', when: 'Oct 13, 2026' }
      ],
      comments: [
        { id: 'c_1', author: 'Midhun Raj', avatar: 'MC', time: 'Oct 13 at 10:45 AM', text: 'Standard tariff charges applied for AME Estimation project according to latest civic guidelines.' }
      ],
      activity: [
        { id: 'act_1', action: 'Task created with token TASK-000288', user: 'Admin', time: 'October 13, 2026' },
        { id: 'act_2', action: 'Custom field RATE initialized to 300 by Supervisor', user: 'Supervisor', time: 'October 13, 2026' }
      ]
    },
    // Not started (5 tasks)
    {
      id: 't1',
      token: 'TASK-000289',
      title: 'Add JWT authentication to the web request',
      project: 'Table Ping',
      parentTeamspace: 'Products',
      description: 'Implement JWT bearer token authentication for REST endpoints.',
      due: 'Oct 3',
      dueType: 'flame',
      priority: 'High',
      assignee: 'RK',
      stage: 'not_started',
      status: 'not_started',
      labels: ['Backend', 'Security'],
      startDate: '2026-10-01',
      dueDate: '2026-10-03',
      created: 'October 1, 2026',
      updated: 'October 2, 2026',
      completed: false,
      customFields: [
        { id: 'cf_sl_1', name: 'SL. No.', type: 'number', value: '2', permission: 'all' },
        { id: 'cf_qty_1', name: 'QUANTITY', type: 'number', value: '8', permission: 'all' },
        { id: 'cf_unit_1', name: 'UNIT', type: 'select', value: 'Hours', options: ['Time', 'Hours', 'Days', 'Nos'], permission: 'all' },
        { id: 'cf_rate_1', name: 'RATE', type: 'number', value: '120', permission: 'admin_only' },
        { id: 'cf_subtotal_1', name: 'SUB TOTAL', type: 'formula', formula: 'QUANTITY * RATE', value: '960', permission: 'admin_only' }
      ],
      checklists: [
        {
          id: 'cl_jwt',
          name: 'Security Checklist',
          items: [
            { id: 'jwt_1', text: 'Token expiry validation', done: true },
            { id: 'jwt_2', text: 'Refresh token rotation', done: false }
          ]
        }
      ],
      subtasks: [],
      files: [],
      comments: [],
      activity: [{ id: 'act_jwt', action: 'Task assigned to RK', user: 'System', time: 'Oct 1, 2026' }]
    },
    {
      id: 't2',
      token: 'TASK-000290',
      title: 'Daily report',
      project: 'Table Ping',
      parentTeamspace: 'Products',
      description: 'Generate daily site progress and attendance log.',
      due: 'Sep 22',
      dueType: 'flame',
      priority: 'Low',
      assignee: null,
      stage: 'not_started',
      status: 'not_started',
      labels: ['Reporting'],
      startDate: '2026-09-22',
      dueDate: '2026-09-22',
      created: 'Sep 22, 2026',
      updated: 'Sep 22, 2026',
      completed: false,
      customFields: [
        { id: 'cf_sl_2', name: 'SL. No.', type: 'number', value: '3', permission: 'all' },
        { id: 'cf_qty_2', name: 'QUANTITY', type: 'number', value: '1', permission: 'all' },
        { id: 'cf_unit_2', name: 'UNIT', type: 'select', value: 'Days', options: ['Time', 'Hours', 'Days'], permission: 'all' },
        { id: 'cf_rate_2', name: 'RATE', type: 'number', value: '80', permission: 'admin_only' },
        { id: 'cf_subtotal_2', name: 'SUB TOTAL', type: 'formula', formula: 'QUANTITY * RATE', value: '80', permission: 'admin_only' }
      ],
      checklists: [{ id: 'cl_rep', name: 'Report Checks', items: [{ id: 'rc_1', text: 'Attendance count signoff', done: false }] }],
      subtasks: [],
      files: [],
      comments: [],
      activity: []
    },
    { id: 't3', token: 'TASK-000291', title: 'Daily report', project: 'Table Ping', due: 'Sep 29', dueType: 'flame', priority: 'Low', assignee: null, stage: 'not_started', customFields: [], checklists: [] },
    { id: 't4', token: 'TASK-000292', title: 'Daily report', project: 'Table Ping', due: 'Oct 21', dueType: 'clock', priority: 'Medium', assignee: null, stage: 'not_started', customFields: [], checklists: [] },
    { id: 't5', token: 'TASK-000293', title: 'Hello world support', project: 'Table Ping', due: 'Oct 9', dueType: 'flame', priority: 'High', assignee: null, stage: 'not_started', customFields: [], checklists: [] },

    // Done (4 tasks)
    { id: 't6', token: 'TASK-000294', title: 'Discussions', project: 'Table Ping', due: 'Oct 31', dueType: 'clock', priority: 'Medium', assignee: 'RK', stage: 'done', completed: true, customFields: [], checklists: [] },
    {
      id: 't7',
      token: 'TASK-000295',
      title: 'Seamless sync is required',
      project: 'Table Ping',
      due: 'Sep 27',
      dueType: 'flame',
      priority: 'Urgent',
      assignee: null,
      stage: 'done',
      completed: true,
      customFields: [],
      comments: [
        { id: 'c_t7', author: 'Midhun Raj', avatar: 'MC', time: 'Sep 27', text: 'Sync verified after patch.' }
      ],
      checklists: [
        {
          id: 'cl_t7',
          name: 'Sync QA',
          items: [
            { id: 't7i1', text: 'Client reconnect', done: true },
            { id: 't7i2', text: 'Delta sync pass', done: true },
            { id: 't7i3', text: 'Conflict resolve', done: true },
            { id: 't7i4', text: 'Offline queue flush', done: true }
          ]
        }
      ]
    },
    { id: 't8', token: 'TASK-000296', title: 'Untitled task', project: 'Table Ping', due: 'Sep 28', dueType: 'flame', priority: null, assignee: null, stage: 'done', completed: true, customFields: [], checklists: [] },
    { id: 't9', token: 'TASK-000297', title: 'Hello', project: 'Table Ping', due: 'Oct 9', dueType: 'flame', priority: 'Medium', assignee: 'MC', stage: 'done', completed: true, customFields: [], checklists: [] }
  ];

  const KANBAN_STAGES = [
    { key: 'not_started', label: 'Not started', icon: '📬' },
    { key: 'in_progress', label: 'In progress', icon: '🕒' },
    { key: 'done', label: 'Done', icon: '✈️' },
    { key: 'on_hold', label: 'On hold', icon: '⏸' }
  ];

  // Crew roster for attendance roll
  const projectCrewMembers = [
    { id: 1, name: 'Carlos Mendez', role: 'Lead Electrician', time: '08:04 AM', status: 'present', halfDaySlot: null, remark: null, color: '#1E5BF6' },
    { id: 2, name: 'Samir Patel', role: 'Site Foreman', time: '07:55 AM', status: 'present', halfDaySlot: null, remark: null, color: '#10B981' },
    { id: 3, name: 'David Kim', role: 'Masonry Specialist', time: '08:12 AM', status: 'present', halfDaySlot: null, remark: null, color: '#8B5CF6' },
    { id: 4, name: 'Marcus Vance', role: 'Safety Compliance Officer', time: '08:15 AM', status: 'present', halfDaySlot: null, remark: null, color: '#F59E0B' },
    { id: 5, name: 'Elena Rostova', role: 'Quality Inspector', time: '1st Half', status: 'half_day', halfDaySlot: '1st Half', remark: null, color: '#0284C7' },
    { id: 6, name: 'Chen Wei', role: 'HVAC Specialist', time: '08:18 AM', status: 'present', halfDaySlot: null, remark: null, color: '#06B6D4' },
    { id: 7, name: 'Tariq Al-Mansoor', role: 'Structural Tech', time: '--', status: 'absent', halfDaySlot: null, remark: 'Sick Leave', color: '#64748B' },
    { id: 8, name: 'James Wilson', role: 'Electrical Apprentice', time: '08:22 AM', status: 'present', halfDaySlot: null, remark: null, color: '#3B82F6' },
    { id: 9, name: 'Mateo Morales', role: 'Conduit Wireman', time: '08:25 AM', status: 'present', halfDaySlot: null, remark: null, color: '#6366F1' },
    { id: 10, name: 'Lucas Scott', role: 'General Laborer', time: '--', status: 'absent', halfDaySlot: null, remark: null, color: '#94A3B8' }
  ];

  function updateProjectAccessLockUI(project) {
    const lockBanner = document.getElementById('projectGeoLockBanner');
    const scrollBody = document.getElementById('mobileProjScrollBody');
    // Never open a locked project into an interactive panel — gate modal handles access.
    // Keep UI fully clickable; only show an info banner if somehow still locked.
    const locked = project ? isProjectAccessLocked(project) : false;

    if (lockBanner) {
      lockBanner.classList.toggle('hidden', !locked);
      if (locked && project) {
        const msg = document.getElementById('projectGeoLockMsg');
        if (msg) {
          msg.textContent = project.geoInside
            ? `Check in at ${project.name} to use tasks and attendance.`
            : `${project.name} is outside the site boundary. Move closer, then check in.`;
        }
      }
    }
    // Do not apply pointer-events:none — that froze the whole screen
    if (scrollBody) scrollBody.classList.remove('actions-locked');
    if (viewProjectDetails) viewProjectDetails.classList.remove('project-actions-locked');
  }

  const attendanceByProject = {};

  function attendanceToday() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${now.getFullYear()}-${month}-${day}`;
  }

  function currentAttendanceRecord() {
    const key = `${currentProject.parent || ''}::${currentProject.name || ''}`;
    const today = attendanceToday();
    if (!attendanceByProject[key] || attendanceByProject[key].date !== today) {
      attendanceByProject[key] = { date: today, ids: {} };
    }
    return attendanceByProject[key];
  }

  function isWorkerTaggedToday(workerId) {
    return !!currentAttendanceRecord().ids[workerId];
  }

  function tagWorkerToday(workerId) {
    currentAttendanceRecord().ids[workerId] = true;
  }

  function projectHasAttendanceToday() {
    return Object.keys(currentAttendanceRecord().ids).length > 0;
  }

  function openProjectDetails(projectName, parentTeamspace) {
    currentProject.name = projectName || 'Table Ping';
    currentProject.parent = parentTeamspace || 'Products';
    currentProject.initial = (currentProject.name.charAt(0) || 'P').toUpperCase();

    // Find if project is starred in state
    const matched = findProject(currentProject.name, currentProject.parent);
    currentProject.starred = matched ? !!matched.starred : false;

    // Update Header Elements
    const titleEl = document.getElementById('projectDetailsTitle');
    const badgeInitialEl = document.getElementById('projectDetailsBadgeInitial');
    const starBtn = document.getElementById('projDetailsStarBtn');
    const subtitleEl = document.getElementById('projectDetailsSubtitle');

    if (titleEl) titleEl.textContent = currentProject.name;
    if (badgeInitialEl) badgeInitialEl.textContent = currentProject.initial;
    if (subtitleEl) refreshProjectSubtitle();
    if (starBtn) {
      starBtn.classList.toggle('starred', currentProject.starred);
    }

    updateProjectAccessLockUI(matched);

    // Default to Works tab
    switchProjectTab('works');

    // Render Views
    renderKanbanBoard(currentProject.activeStage || 'all');
    renderCrewRoster('all');
    updateAttendanceMetrics();

    // Open panel
    openPanel(viewProjectDetails);
    showToast(`Project: ${currentProject.name}`);
    if (!projectHasAttendanceToday()) {
      switchProjectTab('attendance');
      openMobileNotice({
        title: 'Attendance',
        message: 'Take attendance for this project before you continue. You can tag each person once today.',
        action: 'Take attendance',
        onAction: () => switchProjectTab('attendance')
      });
    }
  }

  let projectSettingsTarget = null;
  let projectSettingsDraft = null;

  function settingsEscape(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  const PILL_PALETTES = [
    { dot: '#9CA3AF', bg: '#F3F4F6', text: '#4B5563' },
    { dot: '#3B82F6', bg: '#DBEAFE', text: '#2563EB' },
    { dot: '#A855F7', bg: '#F3E8FF', text: '#7C3AED' },
    { dot: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
    { dot: '#F59E0B', bg: '#FEF3C7', text: '#B45309' },
    { dot: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' }
  ];

  function defaultTaskStatuses() {
    return [
      { id: 'open', name: 'Not started', dot: '#9CA3AF', bg: '#F3F4F6', text: '#4B5563', extras: [] },
      { id: 'in progress', name: 'In progress', dot: '#3B82F6', bg: '#DBEAFE', text: '#2563EB', extras: [] },
      { id: 'hold', name: 'On hold', dot: '#F59E0B', bg: '#F3E8FF', text: '#7C3AED', extras: [] },
      { id: 'complete', name: 'Done', dot: '#22C55E', bg: '#DCFCE7', text: '#15803D', extras: [] },
      { id: 'archived', name: 'Archived', dot: '#6B7280', bg: '#F3F4F6', text: '#4B5563', extras: [] }
    ];
  }

  const PROJECT_PEOPLE = [
    { id: 'you', name: 'Midhun Raj', email: 'midhun.raj@letmedoit.in', initials: 'MC', color: '#7C3AED', you: true },
    { id: 'albin', name: 'Albin Thomas', email: 'albin.thomas@letmedoit.in', initials: 'AT', color: '#10B981' },
    { id: 'alka', name: 'Alka Suresh', email: 'alka.suresh@letmedoit.in', initials: 'AS', color: '#14B8A6' },
    { id: 'anish', name: 'Anish Thomas', email: 'anish.t@letmedoit.in', initials: 'AT', color: '#8B5CF6' },
    { id: 'athul', name: 'Athul Shaji', email: 'athul.shaji@letmedoit.in', initials: 'AS', color: '#EC4899' },
    { id: 'ravi', name: 'Ravi Kumar', email: 'ravi.kumar@letmedoit.in', initials: 'RK', color: '#2563EB' },
    { id: 'sarah', name: 'Sarah Chen', email: 'sarah.chen@letmedoit.in', initials: 'SC', color: '#F59E0B' },
    { id: 'carlos', name: 'Carlos Mendez', email: 'carlos.mendez@letmedoit.in', initials: 'CM', color: '#1D4ED8' }
  ];

  function ensureProjectSettings(project) {
    if (!project.settings) {
      project.settings = {
        priority: '',
        startDate: '2026-10-21',
        endDate: '',
        timer: false,
        labels: [],
        memberIds: ['you'],
        statuses: defaultTaskStatuses(),
        comments: [],
        problem: ''
      };
    }
    if (!project.settings.statuses || !project.settings.statuses.every(status => Array.isArray(status.extras))) {
      project.settings.statuses = defaultTaskStatuses();
    }
    if (!Array.isArray(project.settings.memberIds) || !project.settings.memberIds.includes('you')) {
      project.settings.memberIds = ['you'];
    }
    return project.settings;
  }

  function renderProjectSettings() {
    const body = document.getElementById('projectSettingsBody');
    const project = projectSettingsTarget;
    const draft = projectSettingsDraft;
    if (!body || !project || !draft) return;
    const initial = (draft.name || project.name || 'P').charAt(0).toUpperCase();
    const statusOptions = ['Not started', 'In progress', 'On hold', 'Done'];
    const priorityOptions = [
      { value: '', label: 'Empty' },
      { value: 'Low', label: 'Low' },
      { value: 'Medium', label: 'Medium' },
      { value: 'High', label: 'High' },
      { value: 'Urgent', label: 'Urgent' }
    ];
    const statusColor = {
      'Not started': '#94A3B8',
      'In progress': '#3B82F6',
      'On hold': '#F59E0B',
      'Done': '#22C55E'
    }[draft.workflow] || '#3B82F6';
    const availablePeople = PROJECT_PEOPLE.filter(person => !person.you && !draft.memberIds.includes(person.id));

    body.innerHTML = `
      <div class="ps-hero">
        <div class="ps-badge">${settingsEscape(initial)}</div>
        <div class="ps-hero-copy">
          <input class="ps-name" id="psName" value="${settingsEscape(draft.name)}" aria-label="Project name">
          <textarea class="ps-desc" id="psDesc" rows="2" placeholder="Add a short description">${settingsEscape(draft.description)}</textarea>
        </div>
      </div>
      <div class="ps-props ${draft.hideProps ? 'is-hidden' : ''}" id="psProps">
        <div class="ps-row">
          <span class="ps-row-icon"><span class="ps-dot" style="background:${statusColor}"></span></span>
          <span class="ps-row-label">Status</span>
          <div class="ps-row-value">
            <button type="button" class="ps-value-btn" id="psStatusBtn" aria-label="Status">
              <span>${settingsEscape(draft.workflow)}</span>
            </button>
          </div>
        </div>
        <div class="ps-row ps-row-members">
          <div class="ps-label-head">
            <span class="ps-row-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="3"></circle><path d="M5 19c1.4-3 4-4.5 7-4.5S17.6 16 19 19"></path></svg>
            </span>
            <span>Members</span>
          </div>
          <div class="ps-member-row">
            ${draft.memberIds.map(id => PROJECT_PEOPLE.find(person => person.id === id)).filter(Boolean).map(person => `
              <span class="ps-member-chip">
                <span class="ps-member-avatar" style="background:${person.color}">${settingsEscape(person.initials)}</span>
                <span>${person.you ? 'You' : settingsEscape(person.name)}</span>
                ${person.you ? '' : `<button type="button" data-remove-member="${person.id}" aria-label="Remove ${settingsEscape(person.name)}">×</button>`}
              </span>
            `).join('')}
            <button type="button" class="ps-add-people" id="psAddPeople" aria-expanded="${draft.sheet === 'people' ? 'true' : 'false'}">+ Add</button>
          </div>
        </div>
        <div class="ps-row">
          <span class="ps-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 15l8-8 8 8"></path></svg>
          </span>
          <span class="ps-row-label">Priority</span>
          <div class="ps-row-value">
            <button type="button" class="ps-value-btn" id="psPriorityBtn" aria-label="Priority">
              <span>${settingsEscape(priorityOptions.find(option => option.value === draft.priority)?.label || 'Empty')}</span>
            </button>
          </div>
        </div>
        <div class="ps-row">
          <span class="ps-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path></svg>
          </span>
          <span class="ps-row-label">Start date</span>
          <div class="ps-row-value"><input class="ps-date" id="psStart" type="date" value="${settingsEscape(draft.startDate)}" aria-label="Start date"></div>
        </div>
        <div class="ps-row">
          <span class="ps-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path></svg>
          </span>
          <span class="ps-row-label">End date</span>
          <div class="ps-row-value"><input class="ps-date" id="psEnd" type="date" value="${settingsEscape(draft.endDate)}" aria-label="End date"></div>
        </div>
        <div class="ps-row">
          <span class="ps-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h10M4 17h7"></path></svg>
          </span>
          <span class="ps-row-label">Teamspace</span>
          <div class="ps-row-value"><span class="ps-select">${settingsEscape(project.teamspace || 'Test Teamspace')}</span></div>
        </div>
        <div class="ps-row ps-row-labels">
          <div class="ps-label-head">
            <span class="ps-row-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.6 13.4L13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"></path><circle cx="7.5" cy="7.5" r="1"></circle></svg>
            </span>
            <span>Labels</span>
          </div>
          <div class="ps-chips" id="psLabelChips">
            ${draft.labels.map((label, index) => `<span class="ps-chip">${settingsEscape(label)}<button type="button" data-remove-label="${index}" aria-label="Remove ${settingsEscape(label)}">×</button></span>`).join('')}
          </div>
          <div class="ps-label-row">
            <input class="ps-label-input" id="psLabelInput" placeholder="Add a label" aria-label="Add a label">
            <button type="button" class="ps-add-label" id="psAddLabel">Add</button>
          </div>
        </div>
        <div class="ps-row">
          <span class="ps-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="13" r="7"></circle><path d="M12 10v4l2 2M9 3h6"></path></svg>
          </span>
          <span class="ps-row-label">Timer</span>
          <div class="ps-row-value">
            <button type="button" class="ps-toggle ${draft.timer ? 'is-on' : ''}" id="psTimer" aria-label="Timer" aria-pressed="${draft.timer ? 'true' : 'false'}"></button>
          </div>
        </div>
      </div>
      <button type="button" class="ps-hide" id="psHideProps">${draft.hideProps ? 'Show properties' : 'Hide properties'}</button>

      <h3 class="ps-section-label">Task statuses</h3>
      <p class="ps-status-hint">Tap a colour dot to change the pill. Add more statuses beside each one.</p>
      <div class="ps-status-list" id="psStatuses">
        ${draft.statuses.map((status, index) => `
          <div class="ps-status-group">
            <span class="ps-status-key"><span class="ps-dot" style="background:${status.dot}"></span>${settingsEscape(status.id)}</span>
            <div class="ps-status-pills">
              <label class="ps-status-pill" style="background:${status.bg};color:${status.text}">
                <button type="button" class="ps-color-dot" data-color-group="${index}" data-color-extra="" style="background:${status.dot}" aria-label="Pill colour for ${settingsEscape(status.name)}"></button>
                <input class="ps-status-name" data-status-name="${index}" value="${settingsEscape(status.name)}" aria-label="Status name" style="color:${status.text}">
              </label>
              ${(status.extras || []).map((extra, extraIndex) => `
                <label class="ps-status-pill" style="background:${extra.bg};color:${extra.text}">
                  <button type="button" class="ps-color-dot" data-color-group="${index}" data-color-extra="${extraIndex}" style="background:${extra.dot}" aria-label="Pill colour for ${settingsEscape(extra.name)}"></button>
                  <input class="ps-status-name" data-status-extra="${index}-${extraIndex}" value="${settingsEscape(extra.name)}" aria-label="Added status" style="color:${extra.text}">
                  <button type="button" class="ps-status-remove" data-remove-status="${index}-${extraIndex}" aria-label="Remove status">×</button>
                </label>
              `).join('')}
            </div>
            <button type="button" class="ps-add-status" data-add-status="${index}">+ Add status</button>
          </div>
        `).join('')}
      </div>

      <h3 class="ps-section-label">Comments</h3>
      <div class="ps-comments" id="psComments">
        ${draft.comments.length ? draft.comments.map(comment => `<div class="ps-comment"><strong>${settingsEscape(comment.author)}</strong><span>${settingsEscape(comment.text)}</span></div>`).join('') : '<p class="ps-empty">No comments yet.</p>'}
      </div>
      <div class="ps-comment-row">
        <input class="ps-comment-input" id="psCommentInput" placeholder="Add a comment" aria-label="Add a comment">
        <button type="button" class="ps-comment-btn" id="psCommentBtn">Comment</button>
      </div>

      <h3 class="ps-section-label">Problem statement</h3>
      <textarea class="ps-problem" id="psProblem" placeholder="Type to add a note">${settingsEscape(draft.problem)}</textarea>
    `;

    const readFields = () => {
      draft.name = document.getElementById('psName')?.value.trim() || draft.name;
      draft.description = document.getElementById('psDesc')?.value || '';
      const workflowEl = document.getElementById('psWorkflow');
      if (workflowEl) draft.workflow = workflowEl.value || draft.workflow;
      const priorityEl = document.getElementById('psPriority');
      if (priorityEl) draft.priority = priorityEl.value || '';
      draft.startDate = document.getElementById('psStart')?.value || '';
      draft.endDate = document.getElementById('psEnd')?.value || '';
      draft.problem = document.getElementById('psProblem')?.value || '';
      body.querySelectorAll('[data-status-name]').forEach(input => {
        const status = draft.statuses[Number(input.dataset.statusName)];
        if (status) status.name = input.value.trim() || status.name;
      });
      body.querySelectorAll('[data-status-extra]').forEach(input => {
        const [groupIndex, extraIndex] = input.dataset.statusExtra.split('-').map(Number);
        const extra = draft.statuses[groupIndex] && draft.statuses[groupIndex].extras[extraIndex];
        if (extra) extra.name = input.value.trim() || extra.name;
      });
    };

    body.querySelectorAll('.ps-status-name').forEach(input => {
      input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        const fields = [...body.querySelectorAll('.ps-status-name')];
        const next = fields[fields.indexOf(input) + 1];
        if (next) next.focus();
        else input.blur();
      });
    });

    document.getElementById('psStatusBtn')?.addEventListener('click', () => {
      readFields();
      draft.sheet = 'status';
      renderProjectSettings();
    });
    document.getElementById('psPriorityBtn')?.addEventListener('click', () => {
      readFields();
      draft.sheet = 'priority';
      renderProjectSettings();
    });
    document.getElementById('psStart')?.addEventListener('change', readFields);
    document.getElementById('psEnd')?.addEventListener('change', readFields);
    document.getElementById('psTimer')?.addEventListener('click', () => {
      readFields();
      draft.timer = !draft.timer;
      renderProjectSettings();
    });
    document.getElementById('psHideProps')?.addEventListener('click', () => {
      readFields();
      draft.hideProps = !draft.hideProps;
      renderProjectSettings();
    });
    document.getElementById('psAddPeople')?.addEventListener('click', () => {
      readFields();
      draft.sheet = draft.sheet === 'people' ? null : 'people';
      if (draft.sheet !== 'people') draft.peopleQuery = '';
      renderProjectSettings();
      if (draft.sheet === 'people') document.getElementById('psPeopleSearch')?.focus();
    });
    body.querySelectorAll('[data-remove-member]').forEach(btn => {
      btn.addEventListener('click', () => {
        readFields();
        draft.memberIds = draft.memberIds.filter(id => id !== btn.dataset.removeMember);
        renderProjectSettings();
      });
    });
    document.getElementById('psAddLabel')?.addEventListener('click', () => {
      readFields();
      const input = document.getElementById('psLabelInput');
      const value = input ? input.value.trim() : '';
      if (value && !draft.labels.includes(value)) draft.labels.push(value);
      renderProjectSettings();
    });
    document.getElementById('psLabelInput')?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('psAddLabel')?.click();
      }
    });
    body.querySelectorAll('[data-remove-label]').forEach(btn => {
      btn.addEventListener('click', () => {
        readFields();
        draft.labels.splice(Number(btn.dataset.removeLabel), 1);
        renderProjectSettings();
      });
    });
    body.querySelectorAll('[data-add-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        readFields();
        const group = draft.statuses[Number(btn.dataset.addStatus)];
        if (!group) return;
        group.extras.push({
          name: 'New status',
          dot: group.dot,
          bg: group.bg,
          text: group.text
        });
        draft.focusExtra = `${btn.dataset.addStatus}-${group.extras.length - 1}`;
        renderProjectSettings();
      });
    });
    body.querySelectorAll('[data-remove-status]').forEach(btn => {
      btn.addEventListener('click', () => {
        readFields();
        const [groupIndex, extraIndex] = btn.dataset.removeStatus.split('-').map(Number);
        draft.statuses[groupIndex].extras.splice(extraIndex, 1);
        renderProjectSettings();
      });
    });
    body.querySelectorAll('.ps-color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        readFields();
        const group = draft.statuses[Number(dot.dataset.colorGroup)];
        if (!group) return;
        const target = dot.dataset.colorExtra === '' ? group : group.extras[Number(dot.dataset.colorExtra)];
        if (!target) return;
        const current = PILL_PALETTES.findIndex(palette => palette.bg === target.bg && palette.dot === target.dot);
        const next = PILL_PALETTES[(current + 1) % PILL_PALETTES.length];
        target.dot = next.dot;
        target.bg = next.bg;
        target.text = next.text;
        renderProjectSettings();
      });
    });
    if (draft.focusExtra) {
      const focusInput = body.querySelector(`[data-status-extra="${draft.focusExtra}"]`);
      draft.focusExtra = '';
      if (focusInput) {
        focusInput.focus();
        focusInput.select();
      }
    }
    document.getElementById('psCommentBtn')?.addEventListener('click', () => {
      readFields();
      const input = document.getElementById('psCommentInput');
      const text = input ? input.value.trim() : '';
      if (!text) return;
      draft.comments.push({ author: 'You', text });
      renderProjectSettings();
    });
    body._readProjectSettings = readFields;

    const picker = document.getElementById('psPicker');
    const pickerTitle = document.getElementById('psPickerTitle');
    const pickerBody = document.getElementById('psPickerBody');
    if (!picker || !pickerTitle || !pickerBody) return;
    if (!draft.sheet) {
      picker.hidden = true;
      pickerBody.innerHTML = '';
      return;
    }
    picker.hidden = false;
    if (draft.sheet === 'status') {
      const choiceColors = {
        'Not started': '#94A3B8',
        'In progress': '#3B82F6',
        'On hold': '#F59E0B',
        'Done': '#22C55E'
      };
      pickerTitle.textContent = 'Status';
      pickerBody.innerHTML = statusOptions.map(option => `
        <button type="button" class="ps-option ${option === draft.workflow ? 'is-selected' : ''}" data-status-option="${settingsEscape(option)}">
          <span class="ps-dot" style="background:${choiceColors[option]}"></span>
          <span>${settingsEscape(option)}</span>
        </button>
      `).join('');
      pickerBody.querySelectorAll('[data-status-option]').forEach(btn => {
        btn.addEventListener('click', () => {
          readFields();
          draft.workflow = btn.dataset.statusOption;
          draft.sheet = null;
          renderProjectSettings();
        });
      });
    } else if (draft.sheet === 'priority') {
      pickerTitle.textContent = 'Priority';
      pickerBody.innerHTML = priorityOptions.map(option => `
        <button type="button" class="ps-option ${option.value === draft.priority ? 'is-selected' : ''}" data-priority-option="${settingsEscape(option.value)}">
          <span>${settingsEscape(option.label)}</span>
        </button>
      `).join('');
      pickerBody.querySelectorAll('[data-priority-option]').forEach(btn => {
        btn.addEventListener('click', () => {
          readFields();
          draft.priority = btn.dataset.priorityOption;
          draft.sheet = null;
          renderProjectSettings();
        });
      });
    } else if (draft.sheet === 'people') {
      pickerTitle.textContent = 'Add people';
      pickerBody.innerHTML = `
        <label class="ps-people-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
          <input id="psPeopleSearch" placeholder="Search people..." aria-label="Search people" value="${settingsEscape(draft.peopleQuery || '')}">
        </label>
        <div class="ps-people-list" id="psPeopleList">
          ${availablePeople.map(person => `
            <button type="button" class="ps-person" data-person-id="${person.id}" data-person-search="${settingsEscape(`${person.name} ${person.email}`.toLowerCase())}">
              <span class="ps-person-avatar" style="background:${person.color}">${settingsEscape(person.initials)}</span>
              <span class="ps-person-copy">
                <span class="ps-person-name">${settingsEscape(person.name)}</span>
                <span class="ps-person-email">${settingsEscape(person.email)}</span>
              </span>
            </button>
          `).join('')}
          <p class="ps-people-empty" id="psPeopleEmpty" ${availablePeople.length ? 'hidden' : ''}>No people found</p>
        </div>
      `;
      const peopleSearch = document.getElementById('psPeopleSearch');
      const filterPeople = () => {
        const query = (peopleSearch?.value || '').trim().toLowerCase();
        draft.peopleQuery = peopleSearch ? peopleSearch.value : '';
        let visible = 0;
        pickerBody.querySelectorAll('[data-person-id]').forEach(row => {
          const show = !query || (row.dataset.personSearch || '').includes(query);
          row.hidden = !show;
          if (show) visible += 1;
        });
        const empty = document.getElementById('psPeopleEmpty');
        if (empty) empty.hidden = visible !== 0;
      };
      peopleSearch?.addEventListener('input', filterPeople);
      filterPeople();
      pickerBody.querySelectorAll('[data-person-id]').forEach(btn => {
        btn.addEventListener('click', () => {
          readFields();
          const id = btn.dataset.personId;
          if (id && !draft.memberIds.includes(id)) draft.memberIds.push(id);
          draft.peopleQuery = document.getElementById('psPeopleSearch')?.value || '';
          draft.sheet = 'people';
          renderProjectSettings();
          const search = document.getElementById('psPeopleSearch');
          if (search) search.focus();
        });
      });
    }
  }

  function openProjectSettings(project) {
    if (!project) return;
    const settings = ensureProjectSettings(project);
    projectSettingsTarget = project;
    projectSettingsDraft = {
      name: project.name,
      description: project.description || '',
      workflow: settings.workflow || (project.status === 'Done' ? 'Done' : 'In progress'),
      priority: settings.priority || '',
      startDate: settings.startDate || '',
      endDate: settings.endDate || '',
      timer: !!settings.timer,
      labels: settings.labels.slice(),
      memberIds: settings.memberIds.slice(),
      sheet: null,
      peopleQuery: '',
      statuses: settings.statuses.map(status => ({
        ...status,
        extras: (status.extras || []).map(extra => ({ ...extra }))
      })),
      comments: settings.comments.slice(),
      problem: settings.problem || '',
      hideProps: false
    };
    renderProjectSettings();
    const panel = document.getElementById('projectSettingsPanel');
    if (panel) {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
    }
  }

  function closeProjectSettings() {
    const panel = document.getElementById('projectSettingsPanel');
    if (panel) {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
    }
    projectSettingsTarget = null;
    projectSettingsDraft = null;
    const picker = document.getElementById('psPicker');
    if (picker) picker.hidden = true;
  }

  function saveProjectSettings() {
    const project = projectSettingsTarget;
    const draft = projectSettingsDraft;
    const body = document.getElementById('projectSettingsBody');
    if (!project || !draft) return;
    if (body && body._readProjectSettings) body._readProjectSettings();
    const previousName = project.name;
    project.name = draft.name || project.name;
    project.description = draft.description;
    project.status = draft.workflow === 'Done' ? 'Done' : 'Active';
    const settings = ensureProjectSettings(project);
    settings.workflow = draft.workflow;
    settings.priority = draft.priority;
    settings.startDate = draft.startDate;
    settings.endDate = draft.endDate;
    settings.timer = draft.timer;
    settings.labels = draft.labels.slice();
    settings.memberIds = draft.memberIds.slice();
    project.members = settings.memberIds.length;
    settings.statuses = draft.statuses.map(status => ({
      ...status,
      extras: (status.extras || []).map(extra => ({ ...extra }))
    }));
    settings.comments = draft.comments.slice();
    settings.problem = draft.problem;
    if (currentProject.name === previousName) {
      currentProject.name = project.name;
      currentProject.initial = project.name.charAt(0).toUpperCase();
      const titleEl = document.getElementById('projectDetailsTitle');
      const badgeEl = document.getElementById('projectDetailsBadgeInitial');
      if (titleEl) titleEl.textContent = project.name;
      if (badgeEl) badgeEl.textContent = currentProject.initial;
    }
    renderSites();
    closeProjectSettings();
    showToast('Project saved');
  }

  const projectInfoBtn = document.getElementById('projectInfoBtn');
  const projectTitleBtn = document.getElementById('projectDetailsTitle');
  const openCurrentProjectSettings = () => {
    const matched = findProject(currentProject.name, currentProject.parent);
    if (matched) openProjectSettings(matched);
  };
  if (projectInfoBtn) projectInfoBtn.addEventListener('click', openCurrentProjectSettings);
  if (projectTitleBtn) projectTitleBtn.addEventListener('click', openCurrentProjectSettings);
  document.getElementById('projMoreOptionsBtn')?.addEventListener('click', (event) => {
    event.stopPropagation();
    const matched = findProject(currentProject.name, currentProject.parent);
    const onThisSite = !!(state.isOnSite && state.currentSite && matched && state.currentSite.id === matched.id);
    openMobileChoice({
      title: currentProject.name || 'Project',
      options: [{ value: 'checkout', label: 'Check out' }],
      onPick: () => {
        if (!onThisSite) {
          showToast('Check in before you check out.');
          return;
        }
        checkoutFromSite();
      }
    });
  });
  document.getElementById('closeProjectSettingsBtn')?.addEventListener('click', closeProjectSettings);
  document.getElementById('projectSettingsBackdrop')?.addEventListener('click', closeProjectSettings);
  document.getElementById('saveProjectSettingsBtn')?.addEventListener('click', saveProjectSettings);
  document.getElementById('psPickerBackdrop')?.addEventListener('click', () => {
    if (!projectSettingsDraft?.sheet) return;
    const body = document.getElementById('projectSettingsBody');
    if (body && body._readProjectSettings) body._readProjectSettings();
    projectSettingsDraft.sheet = null;
    projectSettingsDraft.peopleQuery = '';
    renderProjectSettings();
  });

  // Switch between Project Tabs (Works, Attendance, Meetings, Files)
  function switchProjectTab(tabKey) {
    if (tabKey === 'task') tabKey = 'works';
    currentProject.activeTab = tabKey;

    // Update nav tab buttons (both mobile segmented and legacy web nav if present)
    const navTabs = document.querySelectorAll('.mobile-segmented-tab, .proj-nav-tab');
    navTabs.forEach(tab => {
      const tKey = (tab.dataset.tab === 'task') ? 'works' : tab.dataset.tab;
      tab.classList.toggle('active', tKey === tabKey);
    });

    // Update tab panels
    const panels = {
      works: document.getElementById('projectTasksPanel'),
      task: document.getElementById('projectTasksPanel'),
      attendance: document.getElementById('projectAttendancePanel'),
      meetings: document.getElementById('projectMeetingsPanel'),
      documents: document.getElementById('projectDocumentsPanel'),
      uploads: document.getElementById('projectUploadsPanel')
    };

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.toggle('active', key === tabKey || (key === 'task' && tabKey === 'works') || (key === 'works' && tabKey === 'task'));
      }
    });

    if (tabKey === 'works' || tabKey === 'task') {
      renderKanbanBoard(currentProject.activeStage || 'all');
    } else if (tabKey === 'attendance') {
      renderCrewRoster('all');
      updateAttendanceMetrics();
    } else if (tabKey === 'documents') {
      renderProjectDocs();
    }
  }

  // Wire up tab button clicks for mobile segmented tabs and legacy tabs
  document.querySelectorAll('.mobile-segmented-tab, .proj-nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchProjectTab(tab.dataset.tab);
    });
  });

  // Header star favorite toggle
  const projDetailsStarBtn = document.getElementById('projDetailsStarBtn');
  if (projDetailsStarBtn) {
    projDetailsStarBtn.addEventListener('click', () => {
      currentProject.starred = !currentProject.starred;
      projDetailsStarBtn.classList.toggle('starred', currentProject.starred);

      const matched = state.projects.find(p => p.name.toLowerCase() === currentProject.name.toLowerCase());
      if (matched) matched.starred = currentProject.starred;
      renderSites();
      showToast(currentProject.starred ? `Starred "${currentProject.name}" ★` : `Unstarred "${currentProject.name}"`);
    });
  }

  // "+ Add Task" button and banner button handlers
  function triggerAddNewTask() {
    const matched = findProject(currentProject.name, currentProject.parent);
    if (matched && isProjectAccessLocked(matched)) {
      openGeoCheckInGate(matched);
      showToast('Check in at the site before adding tasks');
      return;
    }
    const projectSelect = document.getElementById('newTaskProject');
    if (projectSelect && currentProject && currentProject.name) {
      const match = [...projectSelect.options].some(option => option.value === currentProject.name);
      if (match) projectSelect.value = currentProject.name;
    }
    openModal(addTaskModal);
  }

  const projNewTaskBtn = document.getElementById('projNewTaskBtn');
  if (projNewTaskBtn) {
    projNewTaskBtn.addEventListener('click', triggerAddNewTask);
  }

  const mobileAddWorkTaskBtn = document.getElementById('mobileAddWorkTaskBtn');
  if (mobileAddWorkTaskBtn) {
    mobileAddWorkTaskBtn.addEventListener('click', triggerAddNewTask);
  }

  const inviteCrewBtn = document.getElementById('inviteCrewBtn');
  if (inviteCrewBtn) {
    inviteCrewBtn.addEventListener('click', () => {
      const name = 'Alex Turner';
      openMobilePrompt({
        title: `Invite to ${currentProject.name}`,
        placeholder: 'Name',
        value: name,
        submitLabel: 'Invite',
        onSubmit: (entered) => {
          if (entered && entered.trim()) showToast(`Invited ${entered.trim()} to project team ✓`);
        }
      });
    });
  }

  // ==========================================
  // PROJECT SPEED DIAL FAB (MATCHING USER REFERENCE)
  // ==========================================
  const projectFabContainer = document.getElementById('projectFabContainer');
  const projectMainFabBtn = document.getElementById('projectMainFabBtn');
  const fabBackdrop = document.getElementById('fabBackdrop');
  const fabActionTask = document.getElementById('fabActionTask');
  const fabActionMeeting = document.getElementById('fabActionMeeting');
  const fabActionDocument = document.getElementById('fabActionDocument');

  function toggleProjectFab(forceState) {
    if (!projectFabContainer) return;
    const shouldOpen = (forceState !== undefined) ? forceState : !projectFabContainer.classList.contains('active');
    projectFabContainer.classList.toggle('active', shouldOpen);
  }

  function closeProjectFab() {
    if (projectFabContainer) {
      projectFabContainer.classList.remove('active');
    }
  }

  if (projectMainFabBtn) {
    projectMainFabBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProjectFab();
    });
  }

  if (fabBackdrop) {
    fabBackdrop.addEventListener('click', () => {
      closeProjectFab();
    });
  }

  // Speed Dial: Create Task
  if (fabActionTask) {
    fabActionTask.addEventListener('click', () => {
      closeProjectFab();
      switchProjectTab('works');
      setTimeout(() => {
        triggerAddNewTask();
      }, 150);
    });
  }

  // Speed Dial: Meetings (Lands on Project Meetings page)
  if (fabActionMeeting) {
    fabActionMeeting.addEventListener('click', () => {
      closeProjectFab();
      switchProjectTab('meetings');
      const scrollBody = document.getElementById('mobileProjScrollBody');
      if (scrollBody) scrollBody.scrollTop = 0;
      showToast('Opened Project Meetings');
    });
  }

  // Back button inside Project Meetings page
  const meetingsBackToWorksBtn = document.getElementById('meetingsBackToWorksBtn');
  if (meetingsBackToWorksBtn) {
    meetingsBackToWorksBtn.addEventListener('click', () => {
      switchProjectTab('works');
    });
  }

  // Speed Dial: Uploads
  if (fabActionDocument) {
    fabActionDocument.addEventListener('click', () => {
      closeProjectFab();
      switchProjectTab('uploads');
      showToast('Opened uploads');
    });
  }

  // ==========================================
  // RENDER KANBAN TASK BOARD (MATCHES WEB SCREENSHOT)
  // ==========================================
  function renderKanbanBoard(stageFilter = 'all') {
    const container = document.getElementById('kanbanBoardContainer');
    if (!container) return;
    container.innerHTML = '';

    // Calculate stage counts
    const boardTasks = projectTasks.filter(t => !t.trashed);
    const counts = {
      not_started: boardTasks.filter(t => t.stage === 'not_started').length,
      in_progress: boardTasks.filter(t => t.stage === 'in_progress').length,
      done: boardTasks.filter(t => t.stage === 'done').length,
      on_hold: boardTasks.filter(t => t.stage === 'on_hold').length
    };
    const totalCount = boardTasks.length;

    // Update count badges in UI
    const countAllEl = document.getElementById('countStageAll');
    const countNotStartedEl = document.getElementById('countStageNotStarted');
    const countInProgressEl = document.getElementById('countStageInProgress');
    const countDoneEl = document.getElementById('countStageDone');
    const countOnHoldEl = document.getElementById('countStageOnHold');
    const tabTasksBadge = document.getElementById('tabTasksBadge');

    if (countAllEl) countAllEl.textContent = totalCount;
    if (countNotStartedEl) countNotStartedEl.textContent = counts.not_started;
    if (countInProgressEl) countInProgressEl.textContent = counts.in_progress;
    if (countDoneEl) countDoneEl.textContent = counts.done;
    if (countOnHoldEl) countOnHoldEl.textContent = counts.on_hold;
    if (tabTasksBadge) tabTasksBadge.textContent = totalCount;

    const taskQuery = (document.getElementById('taskSearchInput')?.value || '').trim().toLowerCase();
    const taskMatchesSearch = (task) => !taskQuery || String(task.title || '').toLowerCase().includes(taskQuery);

    if (taskQuery && !boardTasks.some(task => taskMatchesSearch(task) && (stageFilter === 'all' || task.stage === stageFilter))) {
      container.innerHTML = '<div class="task-search-empty">No tasks found</div>';
      return;
    }

    // Render each of the 4 columns
    KANBAN_STAGES.forEach(stage => {
      const stageTasks = boardTasks.filter(t => t.stage === stage.key && taskMatchesSearch(t));
      const isColumnHidden = (stageFilter !== 'all' && stageFilter !== stage.key) || (taskQuery && stageTasks.length === 0);

      const colEl = document.createElement('div');
      colEl.className = `kanban-column ${isColumnHidden ? 'hidden-by-filter' : ''}`;
      colEl.setAttribute('data-stage', stage.key);

      colEl.innerHTML = `
        <div class="kanban-col-header">
          <div class="kanban-col-title-group">
            <span class="kanban-col-icon">${stage.icon}</span>
            <span>${stage.label}</span>
            <span class="kanban-col-count">${stageTasks.length}</span>
          </div>
          <button class="kanban-col-add-btn" title="Add task in ${stage.label}">+</button>
        </div>
        <div class="kanban-cards-wrapper"></div>
        <button class="kanban-add-bottom-btn">+ Add task</button>
      `;

      const cardsWrapper = colEl.querySelector('.kanban-cards-wrapper');

      if (stageTasks.length === 0) {
        cardsWrapper.innerHTML = `<div class="kanban-empty-slot">${taskQuery ? 'No matching tasks' : 'No tasks in this section'}</div>`;
      } else {
        stageTasks.forEach(task => {
          const card = document.createElement('div');
          card.className = 'kanban-card';
          card.setAttribute('data-task-id', task.id);

          // Build due date badge
          let dueBadgeHtml = '';
          if (task.due) {
            const isClock = task.dueType === 'clock';
            const iconSvg = isClock
              ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`
              : `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.6 3.2-3 5.4-3 8.5a6 6 0 1 0 11.8-1.5C20.2 6.5 15.5 4 12 2z"/></svg>`;
            dueBadgeHtml = `<span class="task-due-pill ${isClock ? 'clock-due' : ''}">${iconSvg}<span>${task.due}</span></span>`;
          }

          // Build priority badge
          let priorityHtml = '';
          if (task.priority) {
            const pClass = task.priority.toLowerCase();
            priorityHtml = `<span class="task-priority-chip ${pClass}">● ${task.priority}</span>`;
          }

          // Build sub-counters (always numbers — never print objects/arrays)
          const commentCount = Array.isArray(task.comments)
            ? task.comments.length
            : (typeof task.comments === 'number' ? task.comments : 0);

          let checklistTotal = 0;
          let checklistDone = 0;
          if (Array.isArray(task.checklists)) {
            task.checklists.forEach(group => {
              const items = Array.isArray(group && group.items) ? group.items : [];
              checklistTotal += items.length;
              checklistDone += items.filter(i => i && i.done).length;
            });
          } else if (typeof task.checklists === 'number') {
            checklistTotal = task.checklists;
            checklistDone = typeof task.doneChecklists === 'number' ? task.doneChecklists : 0;
          }

          let subCountersHtml = '';
          if (commentCount || checklistTotal) {
            subCountersHtml = `
              <div class="task-sub-counters">
                ${commentCount ? `<span title="Comments">💬 ${commentCount}</span>` : ''}
                ${checklistTotal ? `<span title="Checklist">${checklistDone}/${checklistTotal}</span>` : ''}
              </div>
            `;
          }

          // Build assignee circle
          let assigneeHtml = '';
          if (task.assignee) {
            const bg = task.assignee === 'RK' ? '#8B5CF6' : '#6366F1';
            assigneeHtml = `<div class="task-assignee-avatar" style="background-color: ${bg};">${task.assignee}</div>`;
          }

          // Build stage / status pill (kept inside task card for List Mode)
          const stageConfig = {
            not_started: { label: 'Not started', colorClass: 'stage-not-started' },
            in_progress: { label: 'In progress', colorClass: 'stage-in-progress' },
            done: { label: 'Done', colorClass: 'stage-done' },
            on_hold: { label: 'On hold', colorClass: 'stage-on-hold' }
          };
          const stageInfo = stageConfig[task.stage] || stageConfig.not_started;
          const statusBadgeHtml = `<span class="task-status-pill ${stageInfo.colorClass}">● ${stageInfo.label}</span>`;

          card.innerHTML = `
            <button class="list-task-check-circle ${task.stage === 'done' ? 'checked' : ''}" aria-label="Toggle task status" title="${task.stage === 'done' ? 'Mark uncompleted' : 'Mark done'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <div class="card-content-body">
              <div class="kanban-card-top-row">
                <h5 class="kanban-card-title ${task.stage === 'done' ? 'title-completed' : ''}">${task.title}</h5>
              </div>
              ${subCountersHtml}
              <div class="kanban-card-meta-row">
                <div class="kanban-card-left-tags">
                  ${statusBadgeHtml}
                  ${dueBadgeHtml}
                  ${priorityHtml}
                </div>
                ${assigneeHtml}
              </div>
            </div>
            <div class="list-row-chevron" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          `;

          // Quick status toggle via checkbox in List View
          const checkCircle = card.querySelector('.list-task-check-circle');
          if (checkCircle) {
            checkCircle.addEventListener('click', (e) => {
              e.stopPropagation();
              if (task.stage === 'done') {
                task.stage = 'not_started';
                showToast(`Task reopened: "${task.title}"`);
              } else {
                task.stage = 'done';
                showToast(`Task completed ✓: "${task.title}"`);
              }
              renderKanbanBoard(currentProject.activeStage || 'all');
            });
          }

          // Card click: Opens full mobile Task Detail View
          card.addEventListener('click', (e) => {
            if (e.target.closest('.list-task-check-circle')) return;
            openTaskDetail(task);
          });

          cardsWrapper.appendChild(card);
        });
      }

      // Add task button handlers
      const addBtns = colEl.querySelectorAll('.kanban-col-add-btn, .kanban-add-bottom-btn');
      addBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          openMobilePrompt({
            title: `Add task to ${stage.label}`,
            placeholder: 'Task title',
            value: 'Complete inspection checklist',
            submitLabel: 'Add task',
            onSubmit: (newTaskName) => {
              if (!newTaskName || !newTaskName.trim()) return;
              projectTasks.push({
                id: 't_' + Date.now(),
                title: newTaskName.trim(),
                due: 'Today',
                dueType: 'flame',
                priority: 'Medium',
                assignee: 'RK',
                stage: stage.key
              });
              renderKanbanBoard(currentProject.activeStage || 'all');
              showToast(`Added to ${stage.label} ✓`);
            }
          });
        });
      });

      container.appendChild(colEl);
    });
  }

  const worksSubActions = document.getElementById('worksSubActions');
  const taskSearchBtn = document.getElementById('taskSearchBtn');
  const taskSearchInput = document.getElementById('taskSearchInput');
  const taskSearchClose = document.getElementById('taskSearchClose');
  if (taskSearchBtn && worksSubActions && taskSearchInput) {
    taskSearchBtn.addEventListener('click', () => {
      worksSubActions.classList.add('is-searching');
      taskSearchInput.focus();
    });
    taskSearchInput.addEventListener('input', () => {
      renderKanbanBoard(currentProject.activeStage || 'all');
    });
    taskSearchClose?.addEventListener('click', () => {
      taskSearchInput.value = '';
      worksSubActions.classList.remove('is-searching');
      renderKanbanBoard(currentProject.activeStage || 'all');
    });
  }

  // Stage Selector Filter Pills
  document.querySelectorAll('.stage-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.stage-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const stage = pill.dataset.stage;
      currentProject.activeStage = stage;
      renderKanbanBoard(stage);
    });
  });

  // Kanban Board vs List View Toggle
  const btnKanbanView = document.getElementById('btnKanbanView');
  const btnListView = document.getElementById('btnListView');
  const kanbanBoardContainer = document.getElementById('kanbanBoardContainer');

  if (btnKanbanView && btnListView && kanbanBoardContainer) {
    btnKanbanView.addEventListener('click', () => {
      btnKanbanView.classList.add('active');
      btnListView.classList.remove('active');
      kanbanBoardContainer.classList.remove('list-mode');
      showToast('Switched to Board view');
    });

    btnListView.addEventListener('click', () => {
      btnListView.classList.add('active');
      btnKanbanView.classList.remove('active');
      kanbanBoardContainer.classList.add('list-mode');
      showToast('Switched to List view');
    });
  }

  // Task Filter action button
  const taskFilterActionBtn = document.getElementById('taskFilterActionBtn');
  if (taskFilterActionBtn) {
    taskFilterActionBtn.addEventListener('click', () => {
      openMobileChoice({
        title: 'Filter tasks',
        options: [
          { value: 'all', label: 'All' },
          { value: 'not_started', label: 'Not started' },
          { value: 'in_progress', label: 'In progress' },
          { value: 'done', label: 'Done' },
          { value: 'on_hold', label: 'On hold' }
        ],
        selected: currentProject.activeStage || 'all',
        onPick: (stage) => {
          document.querySelector(`.stage-pill[data-stage="${stage}"]`)?.click();
        }
      });
    });
  }

  // ==========================================
  // ATTENDANCE ROLL LOGIC (SUPERVISOR CHECK-IN)
  // ==========================================
  function updateAttendanceMetrics() {
    const present = projectCrewMembers.filter(w => w.status === 'present').length;
    const halfDay = projectCrewMembers.filter(w => w.status === 'half_day').length;
    const absent = projectCrewMembers.filter(w => w.status === 'absent').length;
    const total = projectCrewMembers.length;
    const rate = total > 0 ? Math.round(((present + (halfDay * 0.5)) / total) * 100) : 0;

    const countPresentEl = document.getElementById('attCountPresent');
    const countHalfDayEl = document.getElementById('attCountHalfDay');
    const countAbsentEl = document.getElementById('attCountAbsent');
    const countRateEl = document.getElementById('attCountRate');
    const tabAttendanceBadge = document.getElementById('tabAttendanceBadge');

    const filterCountAll = document.getElementById('filterCountAll');
    const filterCountPresent = document.getElementById('filterCountPresent');
    const filterCountHalfDay = document.getElementById('filterCountHalfDay');
    const filterCountAbsent = document.getElementById('filterCountAbsent');

    if (countPresentEl) countPresentEl.textContent = present;
    if (countHalfDayEl) countHalfDayEl.textContent = halfDay;
    if (countAbsentEl) countAbsentEl.textContent = absent;
    if (countRateEl) countRateEl.textContent = `${rate}%`;
    if (tabAttendanceBadge) tabAttendanceBadge.textContent = `${present + halfDay}/${total}`;

    if (filterCountAll) filterCountAll.textContent = total;
    if (filterCountPresent) filterCountPresent.textContent = present;
    if (filterCountHalfDay) filterCountHalfDay.textContent = halfDay;
    if (filterCountAbsent) filterCountAbsent.textContent = absent;
  }

  function renderCrewRoster(filter = 'all') {
    const container = document.getElementById('crewRosterContainer');
    if (!container) return;
    container.innerHTML = '';

    let list = projectCrewMembers;
    if (filter === 'present') list = projectCrewMembers.filter(w => w.status === 'present');
    else if (filter === 'half_day') list = projectCrewMembers.filter(w => w.status === 'half_day');
    else if (filter === 'absent') list = projectCrewMembers.filter(w => w.status === 'absent');

    const query = (document.getElementById('employeeSearchInput')?.value || '').trim().toLowerCase();
    if (query) {
      list = list.filter(worker =>
        worker.name.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query)
      );
    }

    if (!list.length) {
      container.innerHTML = '<p class="crew-search-empty">No employees found</p>';
      updateAttendanceMetrics();
      return;
    }

    list.forEach(worker => {
      const card = document.createElement('div');
      card.className = `worker-attendance-card status-is-${worker.status}`;
      const initials = worker.name.split(' ').map(n => n[0]).join('').substring(0, 2);

      // Show role cleanly without time clutter
      const subtitleText = worker.role;

      // Build half day sub-row
      let subRowHtml = '';
      if (worker.status === 'half_day') {
        const slot = worker.halfDaySlot || '1st Half';
        subRowHtml = `
          <div class="worker-sub-row halfday-sub-row">
            <span class="sub-row-tag-label">Slot:</span>
            <div class="slot-chips-group">
              <button class="slot-chip ${slot === '1st Half' ? 'active' : ''}" data-slot="1st Half">1st Half</button>
              <button class="slot-chip ${slot === '2nd Half' ? 'active' : ''}" data-slot="2nd Half">2nd Half</button>
            </div>
          </div>
        `;
      } else if (worker.status === 'absent') {
        const remark = worker.remark || '';
        if (remark) {
          subRowHtml = `
            <div class="worker-sub-row absent-sub-row">
              <span class="sub-row-tag-label">Remark:</span>
              <span class="remark-active-badge">
                <span class="remark-badge-text">${remark}</span>
                <button class="remark-clear-btn" title="Remove remark">✕</button>
              </span>
              <button class="remark-edit-btn" data-remark="custom">Edit</button>
            </div>
          `;
        } else {
          subRowHtml = `
            <div class="worker-sub-row absent-sub-row">
              <span class="sub-row-tag-label">Remark:</span>
              <div class="remark-chips-group">
                <button class="remark-chip" data-remark="Sick">Sick</button>
                <button class="remark-chip" data-remark="Casual">Casual</button>
                <button class="remark-chip" data-remark="Emergency">Emergency</button>
                <button class="remark-chip remark-custom-btn" data-remark="custom">+ Custom</button>
              </div>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <div class="worker-card-main-row">
          <div class="worker-info-left">
            <div class="worker-avatar">${initials}</div>
            <div class="worker-details">
              <span class="worker-name">${worker.name}</span>
              <span class="worker-role-time">${subtitleText}</span>
            </div>
          </div>
          <div class="worker-status-pills" role="group" aria-label="Attendance status for ${worker.name}">
            <button class="att-status-pill-btn ${worker.status === 'present' ? 'active status-present' : ''}" data-status="present" title="Present (P)" aria-label="Mark Present">P</button>
            <button class="att-status-pill-btn ${worker.status === 'half_day' ? 'active status-halfday' : ''}" data-status="half_day" title="Half Day (H)" aria-label="Mark Half Day">H</button>
            <button class="att-status-pill-btn ${worker.status === 'absent' ? 'active status-absent' : ''}" data-status="absent" title="Absent (A)" aria-label="Mark Absent">A</button>
          </div>
        </div>
        ${subRowHtml}
      `;

      // Status button click handlers
      card.querySelectorAll('.att-status-pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isWorkerTaggedToday(worker.id)) {
            showToast('Attendance is already tagged for today');
            return;
          }
          const newStatus = btn.dataset.status;
          worker.status = newStatus;

          if (newStatus === 'present') {
            worker.time = '08:15 AM';
            worker.halfDaySlot = null;
          } else if (newStatus === 'half_day') {
            if (!worker.halfDaySlot) worker.halfDaySlot = '1st Half';
            worker.time = worker.halfDaySlot;
          } else if (newStatus === 'absent') {
            worker.time = '--';
          }

          updateAttendanceMetrics();
          const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
          renderCrewRoster(activeFilter);
          tagWorkerToday(worker.id);
          const labelMap = { present: 'Present (P)', half_day: 'Half Day (H)', absent: 'Absent (A)' };
          showToast(`${worker.name}: marked ${labelMap[newStatus] || newStatus}`);
        });
      });

      // Half-day slot click handlers
      card.querySelectorAll('.slot-chip').forEach(slotBtn => {
        slotBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          worker.halfDaySlot = slotBtn.dataset.slot;
          worker.time = worker.halfDaySlot;
          const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
          renderCrewRoster(activeFilter);
          showToast(`${worker.name}: ${worker.halfDaySlot}`);
        });
      });

      // Remark chip click handlers (non-mandatory)
      card.querySelectorAll('.remark-chip, .remark-edit-btn').forEach(remarkBtn => {
        remarkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const tag = remarkBtn.dataset.remark;
          if (tag === 'custom') {
            openMobilePrompt({
              title: `Note for ${worker.name}`,
              placeholder: 'Absent remark',
              value: worker.remark || 'Personal Leave',
              submitLabel: 'Save',
              allowEmpty: true,
              onSubmit: (customVal) => {
                worker.remark = customVal.trim() || null;
                const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
                renderCrewRoster(activeFilter);
              }
            });
          } else {
            worker.remark = tag;
          }
          const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
          renderCrewRoster(activeFilter);
          if (worker.remark) {
            showToast(`Tagged ${worker.name}: ${worker.remark}`);
          }
        });
      });

      // Clear remark button
      const clearBtn = card.querySelector('.remark-clear-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          worker.remark = null;
          const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
          renderCrewRoster(activeFilter);
          showToast(`Cleared remark for ${worker.name}`);
        });
      }

      container.appendChild(card);
    });

    updateAttendanceMetrics();
  }

  // "Mark All Present" Action Handler
  const markAllPresentBtn = document.getElementById('markAllPresentBtn');
  if (markAllPresentBtn) {
    markAllPresentBtn.addEventListener('click', () => {
      let changed = false;
      projectCrewMembers.forEach(w => {
        if (isWorkerTaggedToday(w.id)) return;
        w.status = 'present';
        w.time = '08:15 AM';
        w.halfDaySlot = null;
        w.remark = null;
        tagWorkerToday(w.id);
        changed = true;
      });
      if (!changed) {
        showToast('Attendance is already tagged for today');
        return;
      }
      updateAttendanceMetrics();
      const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
      renderCrewRoster(activeFilter);
      showToast('All crew members marked present');
    });
  }

  const employeeSearchInput = document.getElementById('employeeSearchInput');
  if (employeeSearchInput) {
    employeeSearchInput.addEventListener('input', () => {
      const activeFilter = document.querySelector('.roster-filter-btn.active')?.dataset.filter || 'all';
      renderCrewRoster(activeFilter);
    });
  }

  // Roster Filter buttons
  document.querySelectorAll('.roster-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.roster-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCrewRoster(btn.dataset.filter);
    });
  });

  // Supervisor Sign-off
  const approveAttendanceBtn = document.getElementById('approveAttendanceBtn');
  const signoffBtnText = document.getElementById('signoffBtnText');
  if (approveAttendanceBtn) {
    approveAttendanceBtn.addEventListener('click', () => {
      approveAttendanceBtn.classList.toggle('verified');
      const isVerified = approveAttendanceBtn.classList.contains('verified');
      if (isVerified) {
        if (signoffBtnText) signoffBtnText.textContent = 'Attendance approved';
        showToast('Attendance approved and sent to payroll');
      } else {
        if (signoffBtnText) signoffBtnText.textContent = 'Approve attendance';
        showToast('Attendance is open for editing');
      }
    });
  }

  // Add worker button
  const addCrewWorkerBtn = document.getElementById('addCrewWorkerBtn');
  if (addCrewWorkerBtn) {
    addCrewWorkerBtn.addEventListener('click', () => {
      openMobilePrompt({
        title: 'Add worker',
        placeholder: 'Worker name',
        value: 'Liam Johnson',
        submitLabel: 'Add',
        onSubmit: (workerName) => {
          if (!workerName || !workerName.trim()) return;
          projectCrewMembers.push({
            id: Date.now(),
            name: workerName.trim(),
            role: 'Site Technician',
            time: '08:30 AM',
            status: 'present',
            color: '#10B981'
          });
          renderCrewRoster('all');
          showToast(`Added ${workerName.trim()} to today's roll!`);
        }
      });
    });
  }

  // Date navigation simulation
  const attPrevDayBtn = document.getElementById('attPrevDayBtn');
  const attNextDayBtn = document.getElementById('attNextDayBtn');
  const attCurrentDateLabel = document.getElementById('attCurrentDateLabel');
  let dayOffset = 0;

  function updateDateLabel() {
    if (!attCurrentDateLabel) return;
    if (dayOffset === 0) attCurrentDateLabel.textContent = 'Today, Oct 15, 2026';
    else if (dayOffset === -1) attCurrentDateLabel.textContent = 'Yesterday, Oct 14, 2026';
    else if (dayOffset === 1) attCurrentDateLabel.textContent = 'Tomorrow, Oct 16, 2026';
    else attCurrentDateLabel.textContent = `Oct ${15 + dayOffset}, 2026`;
    showToast(`Viewing date: ${attCurrentDateLabel.textContent}`);
  }

  if (attPrevDayBtn) {
    attPrevDayBtn.addEventListener('click', () => {
      dayOffset--;
      updateDateLabel();
    });
  }
  if (attNextDayBtn) {
    attNextDayBtn.addEventListener('click', () => {
      dayOffset++;
      updateDateLabel();
    });
  }

  // Meetings & Documents Interactive Handlers
  const joinMeetingBtn = document.getElementById('joinMeetingBtn');
  if (joinMeetingBtn) {
    joinMeetingBtn.addEventListener('click', () => {
      showToast('Opening Google Meet video call for Table Ping...');
    });
  }

  const scheduleMeetingBtn = document.getElementById('scheduleMeetingBtn');
  if (scheduleMeetingBtn) {
    scheduleMeetingBtn.addEventListener('click', () => {
      showToast('Meeting scheduler ready for Table Ping team');
    });
  }

  const uploadDocBtn = document.getElementById('uploadDocBtn');
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener('click', () => {
      showToast('Document uploaded & attached to Table Ping ✓');
    });
  }

  const uploadSitePhotoBtn = document.getElementById('uploadSitePhotoBtn');
  if (uploadSitePhotoBtn) {
    uploadSitePhotoBtn.addEventListener('click', () => {
      showToast('Progress photo captured & attached to project log ✓');
    });
  }

  // ==========================================
  // MOBILE TASK DETAIL & CUSTOM FIELDS CONTROLLER
  // (MATCHING SNAP WEB TASK VIEW & MOBILE ADAPTATION)
  // ==========================================

  let currentTaskDetail = projectTasks[0]; // Default to TASK-000288
  let currentUserRole = 'admin'; // 'admin' | 'crew' (Permission Role Simulator)

  // Recalculate auto-computed fields (e.g. SUB TOTAL = QUANTITY * RATE)
  function recalculateCustomFields(task) {
    if (!task || !task.customFields) return;
    const qtyField = task.customFields.find(f => f.name.toUpperCase() === 'QUANTITY');
    const rateField = task.customFields.find(f => f.name.toUpperCase() === 'RATE');
    const subtotalField = task.customFields.find(f => f.name.toUpperCase().includes('SUB TOTAL') || f.name.toUpperCase().includes('SUBTOTAL'));

    if (qtyField && rateField && subtotalField) {
      const q = parseFloat(qtyField.value) || 0;
      const r = parseFloat(rateField.value) || 0;
      subtotalField.value = String(q * r);
    }
  }

  // Open Task Detail View
  function openTaskDetail(taskData) {
    if (!taskData) {
      taskData = projectTasks[0];
    }
    currentTaskDetail = taskData;

    // Ensure custom fields array exists
    if (!currentTaskDetail.customFields || currentTaskDetail.customFields.length === 0) {
      currentTaskDetail.customFields = [
        { id: 'cf_sl_' + Date.now(), name: 'SL. No.', type: 'number', value: '1', permission: 'all' },
        { id: 'cf_qty_' + Date.now(), name: 'QUANTITY', type: 'number', value: '1', permission: 'all' },
        { id: 'cf_unit_' + Date.now(), name: 'UNIT', type: 'select', value: 'Time', options: ['Time', 'Hours', 'Days', 'Nos', 'Sq.Ft', 'Lump Sum'], permission: 'all' },
        { id: 'cf_rate_' + Date.now(), name: 'RATE', type: 'number', value: '300', permission: 'admin_only' },
        { id: 'cf_sub_' + Date.now(), name: 'SUBTOTAL', type: 'formula', formula: 'QUANTITY * RATE', value: '300', permission: 'admin_only' }
      ];
    }

    // Ensure checklists array exists
    if (!currentTaskDetail.checklists || currentTaskDetail.checklists.length === 0) {
      currentTaskDetail.checklists = [
        {
          id: 'cl_' + Date.now(),
          name: 'test',
          items: [
            { id: 'cli_1', text: 'Verify authority tariff schedule documentation', done: false }
          ]
        }
      ];
    }

    if (!currentTaskDetail.subtasks) currentTaskDetail.subtasks = [];
    if (!currentTaskDetail.files) currentTaskDetail.files = [];
    if (!currentTaskDetail.comments) currentTaskDetail.comments = [];
    if (!currentTaskDetail.activity) currentTaskDetail.activity = [
      { id: 'act_init', action: 'Task viewed on mobile', user: 'Midhun Raj', time: 'Just now' }
    ];

    recalculateCustomFields(currentTaskDetail);
    renderTaskDetail();
    switchTaskTab('details');

    if (viewTaskDetail) {
      viewTaskDetail.classList.add('open');
      const scrollBody = document.getElementById('taskDetailScrollBody');
      if (scrollBody) scrollBody.scrollTop = 0;
    }

    showToast(`Opened: ${currentTaskDetail.token || 'Task Detail'}`);
  }

  // Close Task Detail View
  function closeTaskDetail() {
    if (viewTaskDetail) {
      viewTaskDetail.classList.remove('open');
      viewTaskDetail.classList.remove('expanded');
    }
  }

  // Toggle user permission role between 'admin' and 'crew'
  function toggleUserRole() {
    currentUserRole = (currentUserRole === 'admin') ? 'crew' : 'admin';
    updateRoleUI();
    renderCustomFields();
    updateManageFieldsModal();

    if (currentUserRole === 'admin') {
      showToast('Switched to Supervisor (Admin) Role: Full Access 🛡️');
    } else {
      showToast('Switched to Field Crew Role: Restricted Permissions 👷');
    }
  }

  function updateRoleUI() {
    const roleName = document.getElementById('userRoleName');
    const roleDot = document.getElementById('userRoleDot');
    const roleBtn = document.getElementById('toggleUserRoleBtn');

    if (roleName) roleName.textContent = (currentUserRole === 'admin') ? 'Admin' : 'Crew';
    if (roleDot) roleDot.style.color = (currentUserRole === 'admin') ? '#3B82F6' : '#F59E0B';
    if (roleBtn) roleBtn.classList.toggle('crew-role', currentUserRole === 'crew');

    // Update modal banner
    const modalBanner = document.getElementById('modalRoleBanner');
    const modalRoleLabel = document.getElementById('modalRoleLabel');
    const modalRoleDesc = document.getElementById('modalRoleDesc');
    const addCard = document.getElementById('manageFieldsAddCard');

    if (modalBanner) modalBanner.classList.toggle('crew-mode', currentUserRole === 'crew');
    if (modalRoleLabel) modalRoleLabel.textContent = (currentUserRole === 'admin') ? 'Administrator' : 'Field crew';
    if (modalRoleDesc) {
      modalRoleDesc.textContent = (currentUserRole === 'admin')
        ? 'You can add fields, edit values, and choose who can change them.'
        : 'Only administrators can change fields and restricted values.';
    }
    if (addCard) {
      addCard.classList.toggle('disabled-card', currentUserRole === 'crew');
    }
  }

  // Render complete Task Detail Screen
  function renderTaskDetail() {
    if (!currentTaskDetail) return;
    const task = currentTaskDetail;

    // Header Token & Title
    const tokenEl = document.getElementById('taskDetailToken');
    const titleEl = document.getElementById('taskDetailTitle');
    const descEl = document.getElementById('taskDetailDesc');
    const bulletIcon = document.getElementById('taskBulletIcon');

    if (tokenEl) tokenEl.textContent = task.token || 'TASK-000288';
    if (titleEl) {
      titleEl.textContent = task.title || 'ANNUAL MAINTENANCE CONTRACT AUTHORITY CHARGES';
      titleEl.classList.toggle('title-done', task.completed || task.stage === 'done');
    }
    if (bulletIcon) bulletIcon.classList.toggle('completed', task.completed || task.stage === 'done');

    // Sub-header Project link text (AME Estimation ↗)
    const projNameText = document.getElementById('taskProjectNameText');
    if (projNameText) projNameText.textContent = task.project || currentProject.name || 'AME Estimation';

    // Complete status check
    const isDone = task.completed || task.stage === 'done';
    const completeBtn = document.getElementById('taskCompleteToggleBtn');
    const completeBtnText = document.getElementById('taskCompleteBtnText');
    if (completeBtn) completeBtn.classList.toggle('is-completed', isDone);
    if (completeBtnText) completeBtnText.textContent = isDone ? 'Completed ✓' : 'Complete';

    // Quick Chips: Status, Due Date, Priority
    const quickStatusLabel = document.getElementById('quickStatusLabel');
    const quickStatusDot = document.getElementById('quickStatusDot');
    const stageNames = {
      not_started: 'Not started',
      in_progress: 'In progress',
      done: 'Done',
      on_hold: 'On hold'
    };
    const currentStage = task.stage || task.status || 'not_started';
    if (quickStatusLabel) quickStatusLabel.textContent = stageNames[currentStage] || 'Not started';
    if (quickStatusDot) {
      quickStatusDot.className = 'chip-dot';
      if (currentStage === 'not_started') quickStatusDot.classList.add('dot-slate');
      else if (currentStage === 'in_progress') quickStatusDot.classList.add('dot-teal');
      else if (currentStage === 'done') quickStatusDot.classList.add('dot-green');
      else if (currentStage === 'on_hold') quickStatusDot.classList.add('dot-red');
    }

    const quickDueLabel = document.getElementById('quickDueLabel');
    const quickDueDateInput = document.getElementById('quickDueDateInput');
    if (quickDueLabel) {
      if (task.dueDate) {
        let formatted = task.dueDate;
        if (task.dueDate.includes('-')) {
          const parts = task.dueDate.split('-');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          formatted = `${d} ${months[m] || ''}`;
        }
        quickDueLabel.textContent = `Due ${formatted}`;
      } else {
        quickDueLabel.textContent = 'Due 31 Oct';
      }
    }
    if (quickDueDateInput) quickDueDateInput.value = task.dueDate || '2026-10-31';

    const quickStartLabel = document.getElementById('quickStartLabel');
    const startDateInput = document.getElementById('taskStartDateInput');
    const startValue = task.startDate || '2026-10-13';
    if (startDateInput) startDateInput.value = startValue;
    if (quickStartLabel) {
      const parts = startValue.split('-');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formatted = parts.length === 3
        ? `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1] || ''}`
        : startValue;
      quickStartLabel.textContent = `Start ${formatted}`;
    }

    const quickPriorityLabel = document.getElementById('quickPriorityLabel');
    const quickPriorityIcon = document.getElementById('quickPriorityIcon');
    const prio = task.priority || 'None';
    if (quickPriorityLabel) {
      quickPriorityLabel.textContent = (prio === 'None' || !prio) ? 'No priority' : prio;
    }
    if (quickPriorityIcon) {
      quickPriorityIcon.textContent = (prio === 'None' || !prio) ? '◇' : '●';
      quickPriorityIcon.style.color = (prio === 'Urgent') ? '#EF4444' : (prio === 'High') ? '#F97316' : '#64748B';
    }

    // Description text
    if (descEl) {
      if (!task.description && task.token === 'TASK-000288') {
        task.description = 'Statutory authority charges and compliance tariffs for annual electrical, mechanical, and HVAC maintenance contract estimation. Reviewed against municipal civic council schedules.';
      }
      descEl.value = task.description || '';
    }

    // Options Menu items
    const menuCompleteText = document.getElementById('menuCompleteText');
    const menuCompleteIcon = document.getElementById('menuCompleteIcon');
    if (menuCompleteText) menuCompleteText.textContent = isDone ? 'Mark as Incomplete' : 'Mark as Complete';
    if (menuCompleteIcon) menuCompleteIcon.textContent = isDone ? '↩' : '✓';

    // Properties
    const statusSelect = document.getElementById('taskPropStatusSelect');
    const statusDot = document.getElementById('taskStatusDot');
    if (statusSelect) statusSelect.value = task.stage || task.status || 'not_started';
    if (statusDot) {
      statusDot.className = 'status-dot';
      const stage = task.stage || 'not_started';
      if (stage === 'not_started') statusDot.classList.add('dot-orange');
      else if (stage === 'in_progress') statusDot.classList.add('dot-teal');
      else if (stage === 'done') statusDot.classList.add('dot-purple');
      else if (stage === 'on_hold') statusDot.classList.add('dot-red');
    }

    const assigneeSelect = document.getElementById('taskPropAssigneeSelect');
    if (assigneeSelect) assigneeSelect.value = task.assignee || 'Unassigned';

    const prioritySelect = document.getElementById('taskPropPrioritySelect');
    if (prioritySelect) prioritySelect.value = task.priority || 'None';

    const compactDate = (value, fallback) => {
      const source = value || fallback;
      const named = source.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,\s*\d{4})?$/);
      const months = { january: 'Jan', february: 'Feb', march: 'Mar', april: 'Apr', may: 'May', june: 'Jun', july: 'Jul', august: 'Aug', september: 'Sep', october: 'Oct', november: 'Nov', december: 'Dec' };
      if (named) return `${named[2]} ${months[named[1].toLowerCase()] || named[1].slice(0, 3)}`;
      return source.replace(/,?\s*\d{4}$/, '');
    };

    const createdDate = document.getElementById('taskCreatedDate');
    if (createdDate) createdDate.textContent = compactDate(task.created, '13 Oct');

    const updatedDate = document.getElementById('taskUpdatedDate');
    if (updatedDate) updatedDate.textContent = compactDate(task.updated, '13 Oct');

    // Labels
    const labelsContainer = document.getElementById('taskLabelsContainer');
    if (labelsContainer) {
      labelsContainer.innerHTML = '';
      const labels = task.labels || ['Authority', 'Estimation'];
      labels.forEach(lbl => {
        const span = document.createElement('span');
        span.className = 'label-pill';
        span.textContent = lbl;
        labelsContainer.appendChild(span);
      });
      const addBtn = document.createElement('button');
      addBtn.className = 'add-label-btn';
      addBtn.id = 'taskAddLabelBtn';
      addBtn.textContent = 'Add labels +';
      addBtn.addEventListener('click', () => {
        openMobilePrompt({
          title: 'Add label',
          placeholder: 'Label',
          value: '',
          submitLabel: 'Add',
          onSubmit: (newLbl) => {
            if (!newLbl || !newLbl.trim()) return;
            if (!task.labels) task.labels = [];
            task.labels.push(newLbl.trim());
            renderTaskDetail();
            showToast(`Added label: "${newLbl.trim()}"`);
          }
        });
      });
      labelsContainer.appendChild(addBtn);
    }

    updateRoleUI();
    renderCustomFields();
    renderChecklists();
    renderSubtasks();
    renderFiles();
    renderComments();
    renderActivity();
    updateWorkTabCounter();
  }

  // ==========================================
  // RENDER CUSTOM FIELDS & INLINE PERMISSIONS
  // ==========================================
  let cfDragFieldId = null;

  function reorderCustomField(fromId, toId) {
    if (!currentTaskDetail || !currentTaskDetail.customFields || fromId === toId) return;
    const fields = currentTaskDetail.customFields;
    const fromIdx = fields.findIndex(f => f.id === fromId);
    const toIdx = fields.findIndex(f => f.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = fields.splice(fromIdx, 1);
    fields.splice(toIdx, 0, moved);
    renderCustomFields();
    updateManageFieldsModal();
    logTaskActivity(`Reordered custom field "${moved.name}"`);
  }

  function canOperateCustomFields() {
    return currentUserRole === 'admin';
  }

  function getCaptureFieldTypeLabel(type) {
    const map = {
      number: 'Number',
      text: 'Text',
      user: 'Person',
      select: 'Select',
      currency: 'Currency',
      formula: 'Calculated',
      date: 'Date',
      datetime: 'Date-Time',
      file: 'File'
    };
    return map[type] || 'Capture';
  }

  function formatCaptureDateTimeDisplay(value) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dd = String(d.getDate()).padStart(2, '0');
    const mmm = months[d.getMonth()];
    const yyyy = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const hh = String(hours).padStart(2, '0');
    return `${dd}-${mmm}-${yyyy} ${hh}:${minutes} ${ampm}`;
  }

  function captureFieldLabel(name) {
    const raw = String(name || '').trim();
    const key = raw.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
    const known = {
      'SL NO': 'No.',
      'QUANTITY': 'Quantity',
      'UNIT': 'Unit',
      'RATE': 'Rate',
      'SUBTOTAL': 'Subtotal',
      'SUB TOTAL': 'Subtotal'
    };
    if (known[key]) return known[key];
    if (raw && raw === raw.toUpperCase()) {
      return raw.toLowerCase().replace(/\b[a-z]/g, (ch) => ch.toUpperCase());
    }
    return raw;
  }

  function captureOptionLabel(value) {
    const map = {
      'Nos': 'No.',
      'Sq.Ft': 'sq ft',
      'Sq. Ft': 'sq ft',
      'Lump Sum': 'Lump sum'
    };
    return map[value] || value;
  }

  function renderCustomFields() {
    const container = document.getElementById('taskCustomFieldsContainer');
    const countBadge = document.getElementById('customFieldsCountBadge');
    const hintEl = document.getElementById('fieldCaptureHint');
    if (!container || !currentTaskDetail) return;

    container.innerHTML = '';
    const fields = currentTaskDetail.customFields || [];
    if (countBadge) countBadge.textContent = fields.length;

    const canOperate = canOperateCustomFields();
    if (hintEl) {
      hintEl.style.display = 'none';
    }

    if (!fields.length) {
      container.innerHTML = `
        <div class="field-capture-empty">
          <p>No capture fields yet.</p>
          ${canOperate ? '<p class="field-capture-empty-sub">Use Manage to add capture fields.</p>' : ''}
        </div>
      `;
      return;
    }

    const formEl = document.createElement('div');
    formEl.className = 'snap-capture-form';

    const users = [
      { code: 'MC', name: 'Midhun Raj' },
      { code: 'RK', name: 'Ravi Kumar' },
      { code: 'SC', name: 'Sarah Chen' },
      { code: 'CM', name: 'Carlos Mendez' },
      { code: 'SP', name: 'Samir Patel' }
    ];

    fields.forEach(field => {
      const group = document.createElement('div');
      group.className = 'snap-form-group';
      group.dataset.fieldId = field.id;
      const labelText = captureFieldLabel(field.name);

      const isRestrictedForCrew = (field.permission === 'admin_only' || field.permission === 'pm_only' || field.permission === 'readonly');
      const canEdit = (currentUserRole === 'admin') ? (field.permission !== 'readonly') : !isRestrictedForCrew;

      let controlHtml = '';

      if (field.type === 'file') {
        const fileLabel = field.fileName || field.value || 'Choose File';
        const hasFile = !!(field.fileName || field.value);
        controlHtml = `
          <div class="snap-file-upload ${!canEdit ? 'is-locked' : ''}" data-field-id="${field.id}">
            <span class="snap-file-label ${hasFile ? 'has-file' : ''}">${fileLabel}</span>
            <button type="button" class="snap-file-upload-btn" ${canEdit ? '' : 'disabled'} aria-label="Upload file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 16V4"></path>
                <polyline points="7 9 12 4 17 9"></polyline>
                <path d="M4 20h16"></path>
              </svg>
            </button>
            <input type="file" class="cf-file-input" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" hidden ${canEdit ? '' : 'disabled'}>
          </div>
        `;
      } else if (field.type === 'datetime' || field.type === 'date') {
        const isDateTime = field.type === 'datetime';
        const displayVal = isDateTime ? formatCaptureDateTimeDisplay(field.value) : (field.value || '');
        controlHtml = `
          <div class="snap-datetime-wrap ${!canEdit ? 'is-locked' : ''}">
            <input type="text" class="snap-form-input cf-datetime-display" data-field-id="${field.id}" value="${displayVal}" placeholder="" ${canEdit ? 'readonly' : 'disabled'} aria-label="${field.name}">
            <button type="button" class="snap-calendar-btn" ${canEdit ? '' : 'disabled'} aria-label="Pick date and time">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="#9CA3AF" stroke-width="1.6"></rect>
                <path d="M3 9h18" stroke="#9CA3AF" stroke-width="1.6"></path>
                <path d="M8 3v4M16 3v4" stroke="#9CA3AF" stroke-width="1.6" stroke-linecap="round"></path>
                <rect x="7" y="12" width="3.2" height="3.2" rx="0.5" fill="#EF4444"></rect>
                <rect x="11.4" y="12" width="3.2" height="3.2" rx="0.5" fill="#D1D5DB"></rect>
                <rect x="15.8" y="12" width="3.2" height="3.2" rx="0.5" fill="#D1D5DB"></rect>
              </svg>
            </button>
            <input type="${isDateTime ? 'datetime-local' : 'date'}" class="cf-native-datetime" hidden ${canEdit ? '' : 'disabled'}>
          </div>
          ${isDateTime ? '<p class="snap-field-hint">dd-MMM-yyyy HH:MM AM/PM</p>' : ''}
        `;
      } else if (field.type === 'formula') {
        controlHtml = `
          <div class="snap-value-row">
            <span class="cf-subtotal-val" data-field-id="${field.id}">${field.value}</span>
          </div>
        `;
      } else if (!canEdit) {
        controlHtml = `
          <div class="snap-value-row">
            <span class="snap-locked-value">${field.value || '—'}</span>
            <span class="snap-trail-icon" title="Administrators only" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 8 0v3"></path></svg>
            </span>
          </div>
        `;
      } else if (field.type === 'user') {
        const optHtml = users.map(u => `<option value="${u.code}" ${(u.code === field.value || u.name === field.value) ? 'selected' : ''}>${u.name}</option>`).join('');
        controlHtml = `
          <div class="snap-value-row">
            <select class="snap-form-input cf-user-select-val" data-field-id="${field.id}" aria-label="${field.name}">${optHtml}</select>
            <span class="snap-trail-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19.2c1.2-2.6 3.5-3.8 6.5-3.8s5.3 1.2 6.5 3.8"></path></svg>
            </span>
          </div>
        `;
      } else if (field.type === 'select') {
        const opts = field.options || ['Time', 'Hours', 'Days', 'Nos', 'Sq.Ft', 'Lump Sum'];
        const optHtml = opts.map(o => `<option value="${o}" ${o === field.value ? 'selected' : ''}>${captureOptionLabel(o)}</option>`).join('');
        controlHtml = `
          <div class="snap-value-row">
            <select class="snap-form-input cf-select-val" data-field-id="${field.id}" aria-label="${field.name}">${optHtml}</select>
            <span class="snap-trail-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
          </div>
        `;
      } else if (field.type === 'currency') {
        controlHtml = `
          <div class="snap-value-row">
            <span class="capture-currency-prefix">₹</span>
            <input type="text" inputmode="decimal" class="snap-form-input cf-input-val" data-field-id="${field.id}" value="${field.value || ''}" aria-label="${field.name}">
          </div>
        `;
      } else if (field.type === 'number') {
        controlHtml = `
          <div class="snap-field-control">
            <div class="snap-stepper">
              <button type="button" class="snap-step-btn" data-step="-1" aria-label="Decrease ${labelText}">−</button>
              <input type="text" inputmode="decimal" class="snap-form-input cf-input-val snap-step-input" data-field-id="${field.id}" value="${field.value || '0'}" aria-label="${labelText}">
              <button type="button" class="snap-step-btn" data-step="1" aria-label="Increase ${labelText}">+</button>
            </div>
          </div>
        `;
      } else {
        const inputMode = field.name.toLowerCase().includes('phone') ? 'tel' : 'text';
        controlHtml = `
          <div class="snap-value-row">
            <input type="text" inputmode="${inputMode}" class="snap-form-input cf-input-val" data-field-id="${field.id}" value="${field.value || ''}" aria-label="${field.name}">
            <span class="snap-trail-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.6"></circle><circle cx="12" cy="12" r="1.6"></circle><circle cx="18" cy="12" r="1.6"></circle></svg>
            </span>
          </div>
        `;
      }

      group.innerHTML = `<label class="snap-form-label" for="cap_${field.id}">${labelText}</label>${controlHtml}`;

      group.querySelectorAll('.snap-step-btn').forEach(stepBtn => {
        stepBtn.addEventListener('click', () => {
          const input = group.querySelector('.cf-input-val');
          if (!input) return;
          const current = parseFloat(input.value);
          const base = Number.isFinite(current) ? current : 0;
          const next = Math.max(0, base + Number(stepBtn.dataset.step || 0));
          input.value = String(next);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      });

      const textInput = group.querySelector('.cf-input-val');
      if (textInput) {
        textInput.id = `cap_${field.id}`;
        textInput.addEventListener('input', (e) => {
          field.value = e.target.value;
          recalculateCustomFields(currentTaskDetail);
          const subtotalField = currentTaskDetail.customFields.find(f => f.type === 'formula');
          if (subtotalField) {
            const subtotalEl = formEl.querySelector(`.cf-subtotal-val[data-field-id="${subtotalField.id}"]`);
            if (subtotalEl) subtotalEl.textContent = subtotalField.value;
          }
        });
        textInput.addEventListener('change', (e) => {
          logTaskActivity(`Captured ${labelText}: "${e.target.value}"`);
          showToast(`${labelText} saved`);
        });
      }

      const selectEl = group.querySelector('.cf-select-val');
      if (selectEl) {
        selectEl.id = `cap_${field.id}`;
        selectEl.addEventListener('change', (e) => {
          field.value = e.target.value;
          logTaskActivity(`Captured ${labelText}: ${captureOptionLabel(field.value)}`);
          showToast(`${labelText}: ${captureOptionLabel(field.value)}`);
        });
      }

      const userSelectEl = group.querySelector('.cf-user-select-val');
      if (userSelectEl) {
        userSelectEl.id = `cap_${field.id}`;
        userSelectEl.addEventListener('change', (e) => {
          field.value = e.target.value;
          const av = group.querySelector('.cf-user-avatar-tag');
          if (av) av.textContent = e.target.value;
          const selText = e.target.options[e.target.selectedIndex].text;
          logTaskActivity(`Captured ${labelText}: ${selText}`);
          showToast(`${labelText}: ${selText}`);
        });
      }

      // Date-Time / Date picker (calendar button opens native picker)
      const nativeDt = group.querySelector('.cf-native-datetime');
      const displayDt = group.querySelector('.cf-datetime-display');
      const calBtn = group.querySelector('.snap-calendar-btn');
      if (nativeDt && displayDt) {
        if (field.value) {
          // Keep native value in sync when possible
          try {
            const d = new Date(field.value);
            if (!Number.isNaN(d.getTime())) {
              if (field.type === 'datetime') {
                const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                nativeDt.value = local;
              } else {
                nativeDt.value = d.toISOString().slice(0, 10);
              }
            }
          } catch (err) { /* ignore */ }
        }

        const openPicker = () => {
          if (!canEdit) {
            showToast(`Only administrators can edit ${labelText}.`);
            return;
          }
          if (typeof nativeDt.showPicker === 'function') {
            nativeDt.showPicker();
          } else {
            nativeDt.click();
          }
        };

        if (calBtn) calBtn.addEventListener('click', openPicker);
        displayDt.addEventListener('click', openPicker);

        nativeDt.addEventListener('change', (e) => {
          field.value = e.target.value;
          displayDt.value = field.type === 'datetime'
            ? formatCaptureDateTimeDisplay(e.target.value)
            : e.target.value;
          logTaskActivity(`Captured ${labelText}: ${displayDt.value}`);
          showToast(`${labelText} saved`);
        });
      }

      // File upload capture
      const fileWrap = group.querySelector('.snap-file-upload');
      if (fileWrap) {
        const fileInput = fileWrap.querySelector('.cf-file-input');
        const fileBtn = fileWrap.querySelector('.snap-file-upload-btn');
        const fileLabelEl = fileWrap.querySelector('.snap-file-label');

        const openFilePicker = () => {
          if (!canEdit) {
            showToast(`Only administrators can edit ${labelText}.`);
            return;
          }
          fileInput.click();
        };

        if (fileBtn) fileBtn.addEventListener('click', openFilePicker);
        fileWrap.addEventListener('click', (e) => {
          if (e.target.closest('.snap-file-upload-btn')) return;
          openFilePicker();
        });

        fileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          field.fileName = file.name;
          field.value = file.name;
          if (fileLabelEl) {
            fileLabelEl.textContent = file.name;
            fileLabelEl.classList.add('has-file');
          }
          if (!currentTaskDetail.files) currentTaskDetail.files = [];
          currentTaskDetail.files.unshift({
            id: 'f_' + Date.now(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
            date: 'Just now'
          });
          logTaskActivity(`Uploaded file "${file.name}" to ${field.name}`);
          showToast(`File captured: ${file.name} ✓`);
        });
      }

      if (!canEdit && currentUserRole === 'crew' && field.type !== 'file' && field.type !== 'datetime' && field.type !== 'date') {
        group.addEventListener('click', (e) => {
          if (e.target.closest('input, select, button')) return;
          showToast(`Only administrators can edit ${labelText}.`);
        });
      }

      formEl.appendChild(group);
    });

    container.appendChild(formEl);
  }

  // ==========================================
  // RENDER CHECKLISTS (ADD, CHECK, DELETE)
  // ==========================================
  function renderChecklists() {
    const container = document.getElementById('taskChecklistsContainer');
    const globalProgress = document.getElementById('checklistGlobalProgress');
    if (!container || !currentTaskDetail) return;

    container.innerHTML = '';
    const checklists = currentTaskDetail.checklists || [];

    let totalItems = 0;
    let completedItems = 0;

    checklists.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'checklist-group';
      groupEl.dataset.groupId = group.id;

      const groupTotal = (group.items || []).length;
      const groupDone = (group.items || []).filter(i => i.done).length;
      totalItems += groupTotal;
      completedItems += groupDone;

      groupEl.innerHTML = `
        <div class="checklist-group-title-row">
          <span class="checklist-group-name">${group.name}</span>
          <span class="checklist-group-counter">${groupDone}/${groupTotal}</span>
        </div>
        <div class="checklist-items-list"></div>
        <div class="checklist-add-item-row">
          <input type="text" class="checklist-add-input" placeholder="Add an item to ${group.name}..." />
          <button class="checklist-add-submit-btn">+ Add</button>
        </div>
      `;

      const listContainer = groupEl.querySelector('.checklist-items-list');

      (group.items || []).forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = `checklist-item-row ${item.done ? 'completed' : ''}`;
        itemRow.dataset.itemId = item.id;

        itemRow.innerHTML = `
          <div class="checklist-item-left">
            <button class="checklist-custom-checkbox" aria-label="Toggle checklist item">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <span class="checklist-item-text">${item.text}</span>
          </div>
          <button class="checklist-delete-btn" title="Delete item" aria-label="Delete item">×</button>
        `;

        // Toggle done
        const chkBtn = itemRow.querySelector('.checklist-custom-checkbox');
        chkBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          item.done = !item.done;
          renderChecklists();
          logTaskActivity(`${item.done ? 'Checked' : 'Unchecked'} checklist item: "${item.text}"`);
          showToast(item.done ? 'Item completed ✓' : 'Item marked pending');
        });

        // Delete item
        const delBtn = itemRow.querySelector('.checklist-delete-btn');
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          group.items = group.items.filter(i => i.id !== item.id);
          renderChecklists();
          showToast('Checklist item removed');
        });

        listContainer.appendChild(itemRow);
      });

      // Add item handler
      const addInput = groupEl.querySelector('.checklist-add-input');
      const addBtn = groupEl.querySelector('.checklist-add-submit-btn');

      const handleAddItem = () => {
        const txt = addInput.value.trim();
        if (txt) {
          if (!group.items) group.items = [];
          group.items.push({
            id: 'cli_' + Date.now(),
            text: txt,
            done: false
          });
          renderChecklists();
          logTaskActivity(`Added checklist item: "${txt}"`);
          showToast(`Added to "${group.name}" ✓`);
        }
      };

      addBtn.addEventListener('click', handleAddItem);
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddItem();
        }
      });

      container.appendChild(groupEl);
    });

    if (globalProgress) {
      globalProgress.textContent = `${completedItems}/${totalItems}`;
    }
    updateWorkTabCounter();
  }

  // ==========================================
  // RENDER SUBTASKS
  // ==========================================
  function renderSubtasks() {
    const container = document.getElementById('taskSubtasksContainer');
    const badge = document.getElementById('subtasksCountBadge');
    if (!container || !currentTaskDetail) return;

    container.innerHTML = '';
    const subtasks = currentTaskDetail.subtasks || [];
    if (badge) badge.textContent = subtasks.length;
    updateWorkTabCounter();

    if (subtasks.length === 0) {
      container.innerHTML = `<div class="subtasks-empty">No subtasks yet.</div>`;
      return;
    }

    subtasks.forEach(sub => {
      const row = document.createElement('div');
      row.className = `subtask-row ${sub.done ? 'completed' : ''}`;

      row.innerHTML = `
        <div class="subtask-left">
          <button class="checklist-custom-checkbox" aria-label="Toggle subtask">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
          <span class="subtask-title">${sub.title}</span>
        </div>
        <div class="subtask-right">
          ${sub.assignee ? `<span class="subtask-assignee-chip">${sub.assignee}</span>` : ''}
          <button class="checklist-delete-btn" title="Delete subtask">✕</button>
        </div>
      `;

      row.querySelector('.checklist-custom-checkbox').addEventListener('click', (e) => {
        e.stopPropagation();
        sub.done = !sub.done;
        renderSubtasks();
        showToast(sub.done ? 'Subtask completed ✓' : 'Subtask marked pending');
      });

      row.querySelector('.checklist-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        currentTaskDetail.subtasks = currentTaskDetail.subtasks.filter(s => s.id !== sub.id);
        renderSubtasks();
        showToast('Subtask deleted');
      });

      container.appendChild(row);
    });
  }

  // ==========================================
  // RENDER FILES & DROPZONE
  // ==========================================
  function fileKind(file) {
    if (file.kind) return file.kind;
    const name = (file.name || '').toLowerCase();
    if (/\.(png|jpe?g|gif|webp|heic)$/.test(name)) return 'image';
    if (name.endsWith('.pdf')) return 'pdf';
    return 'file';
  }

  function renderFiles() {
    const container = document.getElementById('taskFilesListContainer');
    if (!container || !currentTaskDetail) return;

    container.innerHTML = '';
    const files = currentTaskDetail.files || [];

    files.forEach(file => {
      const kind = fileKind(file);
      const safeName = String(file.name || 'Attachment').replace(/"/g, '&quot;');
      const item = document.createElement('div');
      item.className = 'attach-card attach-' + kind;
      const preview = kind === 'image' && file.preview
        ? `style="background-image:url(&quot;${String(file.preview).replace(/"/g, '')}&quot;)"`
        : '';
      const body = kind === 'pdf'
        ? `<span class="attach-sheet" aria-hidden="true"><span class="attach-pdf-mark">PDF</span></span>`
        : kind === 'image'
          ? `<span class="attach-photo" ${preview}></span>`
          : `<span class="attach-sheet" aria-hidden="true"><span class="attach-file-mark">FILE</span></span>`;
      item.innerHTML = `
        <button type="button" class="attach-open" aria-label="${safeName}">${body}</button>
        <button type="button" class="attach-remove" title="Remove file" aria-label="Remove ${safeName}">✕</button>
      `;

      item.querySelector('.attach-open').addEventListener('click', () => {
        showToast(file.name);
      });
      item.querySelector('.attach-remove').addEventListener('click', () => {
        currentTaskDetail.files = currentTaskDetail.files.filter(f => f.id !== file.id);
        renderFiles();
        showToast('Attachment removed');
      });

      container.appendChild(item);
    });
  }

  // ==========================================
  // RENDER COMMENTS & FEED
  // ==========================================
  function renderComments() {
    const feed = document.getElementById('taskCommentsFeed');
    if (!feed || !currentTaskDetail) return;

    feed.innerHTML = '';
    const comments = currentTaskDetail.comments || [];

    if (comments.length === 0) {
      feed.innerHTML = `<div style="font-size: 12px; color: #94A3B8; padding: 4px 0;">No comments yet.</div>`;
      return;
    }

    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'comment-feed-item';
      item.innerHTML = `
        <div class="comment-avatar" style="width: 28px; height: 28px; font-size: 11px;">${c.avatar || 'MC'}</div>
        <div class="comment-feed-body">
          <div class="comment-feed-header">
            <span class="comment-feed-author">${c.author}</span>
            <span class="comment-feed-time">${c.time}</span>
          </div>
          <p class="comment-feed-text">${c.text}</p>
        </div>
      `;
      feed.appendChild(item);
    });
  }

  // ==========================================
  // RENDER ACTIVITY TIMELINE
  // ==========================================
  function logTaskActivity(actionText) {
    if (!currentTaskDetail) return;
    if (!currentTaskDetail.activity) currentTaskDetail.activity = [];
    currentTaskDetail.activity.unshift({
      id: 'act_' + Date.now(),
      action: actionText,
      user: (currentUserRole === 'admin') ? 'Supervisor (Admin)' : 'Field Inspector',
      time: 'Just now'
    });
    renderActivity();
  }

  function renderActivity() {
    const timeline = document.getElementById('taskActivityTimeline');
    const countBadge = document.getElementById('taskActivityCountBadge');
    if (!timeline || !currentTaskDetail) return;

    timeline.innerHTML = '';
    const activities = currentTaskDetail.activity || [];
    if (countBadge) countBadge.textContent = activities.length;

    activities.forEach(act => {
      const item = document.createElement('div');
      item.className = 'activity-log-item';
      item.innerHTML = `
        <div><strong>${act.user}</strong>: ${act.action}</div>
        <div class="activity-log-time">${act.time}</div>
      `;
      timeline.appendChild(item);
    });
  }

  // ==========================================
  // MANAGE CUSTOM FIELDS & PERMISSIONS MODAL
  // ==========================================
  function openManageFieldsModal() {
    updateManageFieldsModal();
    openModal(manageFieldsModal);
  }

  function updateManageFieldsModal() {
    if (!manageFieldsModal || !currentTaskDetail) return;

    const countEl = document.getElementById('existingFieldsCount');
    const listEl = document.getElementById('manageFieldsList');
    const fields = currentTaskDetail.customFields || [];
    const canOperate = canOperateCustomFields();

    if (countEl) countEl.textContent = fields.length;
    if (!listEl) return;

    listEl.innerHTML = '';

    if (!fields.length) {
      listEl.innerHTML = `<p class="mf-empty-hint">No custom fields yet. ${canOperate ? 'Use the form above to add one.' : 'Ask an Admin to configure fields.'}</p>`;
      return;
    }

    fields.forEach((field, index) => {
      const card = document.createElement('div');
      card.className = 'manage-field-config-card';

      const permOptions = [
        { value: 'all', label: '👥 Everyone (All Members)' },
        { value: 'admin_only', label: '🔒 Supervisors & Admins Only' },
        { value: 'pm_only', label: '💼 Project Managers Only' },
        { value: 'readonly', label: '⛔ Read-Only (System / Locked)' }
      ];

      const typeOptions = [
        { value: 'text', label: 'Text' },
        { value: 'number', label: 'Number' },
        { value: 'datetime', label: 'Date-Time' },
        { value: 'date', label: 'Date' },
        { value: 'file', label: 'File Upload' },
        { value: 'user', label: 'User / Member' },
        { value: 'select', label: 'Dropdown' },
        { value: 'currency', label: 'Currency' },
        { value: 'formula', label: 'Formula' }
      ];

      const permOptsHtml = permOptions.map(p =>
        `<option value="${p.value}" ${field.permission === p.value ? 'selected' : ''}>${p.label}</option>`
      ).join('');

      const typeOptsHtml = typeOptions.map(t =>
        `<option value="${t.value}" ${(field.type || 'text') === t.value ? 'selected' : ''}>${t.label}</option>`
      ).join('');

      card.innerHTML = `
        <div class="mf-top-row">
          <div class="mf-name-type">
            ${canOperate
              ? `<input type="text" class="mf-name-input" value="${field.name.replace(/"/g, '&quot;')}" aria-label="Field name">`
              : `<span class="mf-name">${field.name}</span>`}
            ${canOperate
              ? `<select class="mf-type-select" aria-label="Field type">${typeOptsHtml}</select>`
              : `<span class="mf-type-chip">${(field.type || 'text').toUpperCase()}</span>`}
          </div>
          <div class="mf-top-actions">
            ${canOperate ? `
              <button type="button" class="mf-move-btn mf-move-up" title="Move up" ${index === 0 ? 'disabled' : ''}>▲</button>
              <button type="button" class="mf-move-btn mf-move-down" title="Move down" ${index === fields.length - 1 ? 'disabled' : ''}>▼</button>
              <button type="button" class="mf-delete-btn" title="Delete custom field">🗑</button>
            ` : ''}
          </div>
        </div>
        <div class="mf-bottom-row">
          <span class="mf-perm-label">Access Config:</span>
          <select class="mf-perm-select" ${canOperate ? '' : 'disabled'}>
            ${permOptsHtml}
          </select>
        </div>
      `;

      // Rename field
      const nameInput = card.querySelector('.mf-name-input');
      if (nameInput) {
        nameInput.addEventListener('change', (e) => {
          const next = e.target.value.trim();
          if (!next) {
            e.target.value = field.name;
            showToast('Field name cannot be empty');
            return;
          }
          if (next !== field.name) {
            const oldName = field.name;
            field.name = next;
            renderCustomFields();
            logTaskActivity(`Renamed custom field "${oldName}" to "${field.name}"`);
            showToast(`Renamed to ${field.name} ✓`);
          }
        });
      }

      // Change field type
      const typeSelect = card.querySelector('.mf-type-select');
      if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
          field.type = e.target.value;
          if (field.type === 'select' && (!field.options || !field.options.length)) {
            field.options = ['Time', 'Hours', 'Days', 'Nos', 'Sq.Ft', 'Lump Sum'];
          }
          recalculateCustomFields(currentTaskDetail);
          renderCustomFields();
          logTaskActivity(`Changed type of "${field.name}" to ${field.type}`);
          showToast(`${field.name} type → ${field.type} ✓`);
        });
      }

      // Change permission configuration
      const permSelect = card.querySelector('.mf-perm-select');
      if (permSelect) {
        permSelect.addEventListener('change', (e) => {
          field.permission = e.target.value;
          renderCustomFields();
          logTaskActivity(`Changed permissions for field "${field.name}" to ${e.target.options[e.target.selectedIndex].text}`);
          showToast(`Permission updated for ${field.name} ✓`);
        });
      }

      // Reorder up / down
      const moveUpBtn = card.querySelector('.mf-move-up');
      const moveDownBtn = card.querySelector('.mf-move-down');
      if (moveUpBtn) {
        moveUpBtn.addEventListener('click', () => {
          if (index <= 0) return;
          const arr = currentTaskDetail.customFields;
          [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
          renderCustomFields();
          updateManageFieldsModal();
          showToast('Field order updated ✓');
        });
      }
      if (moveDownBtn) {
        moveDownBtn.addEventListener('click', () => {
          const arr = currentTaskDetail.customFields;
          if (index >= arr.length - 1) return;
          [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
          renderCustomFields();
          updateManageFieldsModal();
          showToast('Field order updated ✓');
        });
      }

      // Delete field
      const delBtn = card.querySelector('.mf-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', () => {
          if (confirm(`Remove custom field "${field.name}" from task?`)) {
            currentTaskDetail.customFields = currentTaskDetail.customFields.filter(f => f.id !== field.id);
            recalculateCustomFields(currentTaskDetail);
            renderCustomFields();
            updateManageFieldsModal();
            logTaskActivity(`Deleted custom field "${field.name}"`);
            showToast(`Deleted field: ${field.name}`);
          }
        });
      }

      listEl.appendChild(card);
    });
  }

  // ==========================================
  // TASK DETAIL SUB-TABS (Details | Work 0/2 | Updates)
  // Matches uploaded mobile task UI design
  // ==========================================
  const taskSwipeOrder = ['details', 'work', 'updates'];

  function switchTaskTab(tabKey) {
    const tabBtns = document.querySelectorAll('.task-tab-btn');
    const tabPanes = document.querySelectorAll('.task-tab-pane');
    const currentKey = document.querySelector('.task-tab-btn.active')?.getAttribute('data-task-tab');
    const currentIndex = taskSwipeOrder.indexOf(currentKey);
    const nextIndex = taskSwipeOrder.indexOf(tabKey);
    const slideClass = nextIndex > currentIndex ? 'slide-next' : nextIndex < currentIndex ? 'slide-prev' : '';

    tabBtns.forEach(btn => {
      const isMatch = btn.getAttribute('data-task-tab') === tabKey;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    tabPanes.forEach(pane => {
      const targetId = `taskPane${tabKey.charAt(0).toUpperCase() + tabKey.slice(1)}`;
      const isMatch = pane.id === targetId;
      pane.classList.toggle('active', isMatch);
      pane.classList.remove('slide-next', 'slide-prev');
      if (isMatch && slideClass) pane.classList.add(slideClass);
    });

    const scrollBody = document.getElementById('taskDetailScrollBody');
    if (scrollBody) scrollBody.scrollTop = 0;
  }

  function swipeTaskTab(direction) {
    const currentKey = document.querySelector('.task-tab-btn.active')?.getAttribute('data-task-tab') || 'details';
    const index = taskSwipeOrder.indexOf(currentKey);
    const next = index + direction;
    if (next < 0 || next >= taskSwipeOrder.length) return;
    switchTaskTab(taskSwipeOrder[next]);
  }

  function updateWorkTabCounter() {
    const counterEl = document.getElementById('workTabCounter');
    if (!counterEl || !currentTaskDetail) return;

    let total = 0;
    let completed = 0;

    if (Array.isArray(currentTaskDetail.checklists)) {
      currentTaskDetail.checklists.forEach(grp => {
        if (Array.isArray(grp.items)) {
          grp.items.forEach(it => {
            total++;
            if (it.done) completed++;
          });
        }
      });
    }

    if (Array.isArray(currentTaskDetail.subtasks) && currentTaskDetail.subtasks.length > 0) {
      currentTaskDetail.subtasks.forEach(sub => {
        total++;
        if (sub.done) completed++;
      });
    }

    counterEl.textContent = `${completed}/${total}`;
  }

  // Wire up Task Sub-Tabs Navigation
  const taskTabBtns = document.querySelectorAll('.task-tab-btn');
  taskTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-task-tab');
      if (tab) switchTaskTab(tab);
    });
  });

  const taskDetailScrollBody = document.getElementById('taskDetailScrollBody');
  if (taskDetailScrollBody) {
    let swipeStartX = 0;
    let swipeStartY = 0;
    let swipeBlocked = false;

    const beginTaskSwipe = (x, y, target) => {
      swipeStartX = x;
      swipeStartY = y;
      swipeBlocked = !!target.closest('input, textarea, select, button, a');
    };

    const finishTaskSwipe = (x, y) => {
      if (swipeBlocked) return;
      const diffX = x - swipeStartX;
      const diffY = y - swipeStartY;
      if (Math.abs(diffX) < 48 || Math.abs(diffX) < Math.abs(diffY)) return;
      swipeTaskTab(diffX < 0 ? 1 : -1);
    };

    taskDetailScrollBody.addEventListener('touchstart', (e) => {
      beginTaskSwipe(e.touches[0].clientX, e.touches[0].clientY, e.target);
    }, { passive: true });

    taskDetailScrollBody.addEventListener('touchend', (e) => {
      finishTaskSwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    }, { passive: true });

    taskDetailScrollBody.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      beginTaskSwipe(e.clientX, e.clientY, e.target);
    });

    taskDetailScrollBody.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch') return;
      finishTaskSwipe(e.clientX, e.clientY);
    });
  }

  // ==========================================
  // WIRE UP TASK DETAIL EVENT LISTENERS
  // ==========================================

  // Close Task Detail buttons
  const closeTaskDetailBtn = document.getElementById('closeTaskDetailBtn');
  if (closeTaskDetailBtn) {
    closeTaskDetailBtn.addEventListener('click', closeTaskDetail);
  }

  const taskCloseXBtn = document.getElementById('taskCloseXBtn');
  if (taskCloseXBtn) {
    taskCloseXBtn.addEventListener('click', closeTaskDetail);
  }

  // Role Switcher buttons (Permission Simulator)
  const toggleUserRoleBtn = document.getElementById('toggleUserRoleBtn');
  if (toggleUserRoleBtn) {
    toggleUserRoleBtn.addEventListener('click', toggleUserRole);
  }

  const modalSwitchRoleBtn = document.getElementById('modalSwitchRoleBtn');
  if (modalSwitchRoleBtn) {
    modalSwitchRoleBtn.addEventListener('click', toggleUserRole);
  }

  // Complete Task Toggle Button
  const taskCompleteToggleBtn = document.getElementById('taskCompleteToggleBtn');
  if (taskCompleteToggleBtn) {
    taskCompleteToggleBtn.addEventListener('click', () => {
      if (!currentTaskDetail) return;
      const willComplete = !(currentTaskDetail.completed || currentTaskDetail.stage === 'done');
      currentTaskDetail.completed = willComplete;
      currentTaskDetail.stage = willComplete ? 'done' : 'not_started';
      currentTaskDetail.status = willComplete ? 'done' : 'not_started';

      renderTaskDetail();
      renderKanbanBoard(currentProject.activeStage || 'all');
      renderTasks('all');
      updateCounters();

      logTaskActivity(willComplete ? 'Task marked complete' : 'Task reopened');
      showToast(willComplete ? 'Task Completed ✓' : 'Task marked Incomplete');
    });
  }

  // Fullscreen / Expand View button
  const taskExpandToggleBtn = document.getElementById('taskExpandToggleBtn');
  if (taskExpandToggleBtn) {
    taskExpandToggleBtn.addEventListener('click', () => {
      if (viewTaskDetail) {
        viewTaskDetail.classList.toggle('expanded');
        showToast(viewTaskDetail.classList.contains('expanded') ? 'Expanded View' : 'Standard View');
      }
    });
  }

  // Properties Accordion: Show / Hide Other Details under "Show details"
  const taskPropertiesToggleBtn = document.getElementById('taskPropertiesToggleBtn');
  const taskSecondaryPropsCard = document.getElementById('taskSecondaryPropsCard');
  const taskPropToggleText = document.getElementById('taskPropToggleText');

  if (taskPropertiesToggleBtn && taskSecondaryPropsCard) {
    taskPropertiesToggleBtn.addEventListener('click', () => {
      const isHidden = taskSecondaryPropsCard.classList.contains('hidden-card');
      taskSecondaryPropsCard.classList.toggle('hidden-card', !isHidden);
      taskPropertiesToggleBtn.classList.toggle('collapsed', !isHidden);
      if (taskPropToggleText) {
        taskPropToggleText.textContent = isHidden ? 'Hide details' : 'Show details';
      }
    });
  }

  // Inline Title editing
  const taskDetailTitle = document.getElementById('taskDetailTitle');
  if (taskDetailTitle) {
    taskDetailTitle.addEventListener('blur', () => {
      if (currentTaskDetail && taskDetailTitle.textContent.trim()) {
        currentTaskDetail.title = taskDetailTitle.textContent.trim();
        renderKanbanBoard(currentProject.activeStage || 'all');
        renderTasks('all');
        logTaskActivity(`Renamed task to "${currentTaskDetail.title}"`);
      }
    });
  }

  // Quick Status Chip: Cycle status on click
  const quickStatusChip = document.getElementById('quickStatusChip');
  if (quickStatusChip) {
    quickStatusChip.addEventListener('click', () => {
      if (!currentTaskDetail) return;
      const stageLabels = { not_started: 'Not started', in_progress: 'In progress', done: 'Done', on_hold: 'On hold' };
      openMobileChoice({
        title: 'Status',
        options: Object.keys(stageLabels).map(key => ({ value: key, label: stageLabels[key] })),
        selected: currentTaskDetail.stage || 'not_started',
        onPick: (nxt) => {
          currentTaskDetail.stage = nxt;
          currentTaskDetail.status = nxt;
          currentTaskDetail.completed = (nxt === 'done');
          renderTaskDetail();
          renderKanbanBoard(currentProject.activeStage || 'all');
          renderTasks('all');
          updateCounters();
          logTaskActivity(`Status changed to ${stageLabels[nxt]}`);
          showToast(`Status: ${stageLabels[nxt]}`);
        }
      });
    });
  }

  // Quick Due Date Chip: Pick due date
  const quickDueChip = document.getElementById('quickDueChip');
  const quickDueDateInput = document.getElementById('quickDueDateInput');
  if (quickDueChip && quickDueDateInput) {
    quickDueChip.addEventListener('click', () => {
      try {
        if (quickDueDateInput.showPicker) {
          quickDueDateInput.showPicker();
        } else {
        openMobilePrompt({
          title: 'Due date',
          placeholder: '2026-10-31',
          value: currentTaskDetail?.dueDate || '2026-10-31',
          submitLabel: 'Save',
          onSubmit: (userDate) => {
            if (!userDate || !currentTaskDetail) return;
            currentTaskDetail.dueDate = userDate.trim();
            renderTaskDetail();
          }
        });
        }
      } catch (err) {
        openMobilePrompt({
          title: 'Due date',
          placeholder: '2026-10-31',
          value: currentTaskDetail?.dueDate || '2026-10-31',
          submitLabel: 'Save',
          onSubmit: (userDate) => {
            if (!userDate || !currentTaskDetail) return;
            currentTaskDetail.dueDate = userDate.trim();
            renderTaskDetail();
          }
        });
      }
    });

    quickDueDateInput.addEventListener('change', (e) => {
      if (currentTaskDetail) {
        currentTaskDetail.dueDate = e.target.value;
        renderTaskDetail();
        logTaskActivity(`Due date updated to ${e.target.value}`);
        showToast('Due date updated ✓');
      }
    });
  }

  // Quick Priority Chip: Cycle priority on click
  const quickPriorityChip = document.getElementById('quickPriorityChip');
  if (quickPriorityChip) {
    quickPriorityChip.addEventListener('click', () => {
      if (!currentTaskDetail) return;
      const labels = { None: 'No priority', Low: 'Low', Medium: 'Medium', High: 'High', Urgent: 'Urgent' };
      openMobileChoice({
        title: 'Priority',
        options: Object.keys(labels).map(key => ({ value: key, label: labels[key] })),
        selected: currentTaskDetail.priority || 'None',
        onPick: (nxt) => {
          currentTaskDetail.priority = nxt;
          renderTaskDetail();
          renderKanbanBoard(currentProject.activeStage || 'all');
          logTaskActivity(`Priority set to ${nxt}`);
          showToast(`Priority: ${labels[nxt] || nxt}`);
        }
      });
    });
  }

  function assigneeName(value) {
    const names = {
      RK: 'Ravi Kumar',
      MC: 'Midhun Raj',
      SC: 'Sarah Chen',
      CM: 'Carlos Mendez',
      SP: 'Samir Patel'
    };
    if (!value || value === 'Unassigned') return 'Unassigned';
    return names[value] || value;
  }

  function rememberAssignment(task, name) {
    if (!task) return;
    if (!task.assignHistory) task.assignHistory = [];
    task.assignHistory.unshift({ name: assigneeName(name), when: 'Just now' });
  }

  function openTaskMoveSheet() {
    if (!currentTaskDetail) return;
    openMobileChoice({
      title: 'Move to',
      options: state.projects.map(project => ({ value: project.name, label: project.name })),
      selected: currentTaskDetail.project,
      onPick: (name) => {
        if (!name || name === currentTaskDetail.project) return;
        currentTaskDetail.project = name;
        renderTaskDetail();
        renderKanbanBoard(currentProject.activeStage || 'all');
        logTaskActivity(`Moved to ${name}`);
        showToast(`Moved to ${name}`);
      }
    });
  }

  function completeCurrentTask() {
    if (!currentTaskDetail) return;
    if (currentTaskDetail.completed || currentTaskDetail.stage === 'done') {
      showToast('Task is already complete.');
      return;
    }
    currentTaskDetail.completed = true;
    currentTaskDetail.stage = 'done';
    currentTaskDetail.status = 'done';
    renderTaskDetail();
    renderKanbanBoard(currentProject.activeStage || 'all');
    renderTasks('all');
    updateCounters();
    logTaskActivity('Task marked complete');
    showToast('Task completed');
  }

  function restoreCurrentTask() {
    if (!currentTaskDetail) return;
    const wasTrashed = !!currentTaskDetail.trashed;
    const wasDone = !!(currentTaskDetail.completed || currentTaskDetail.stage === 'done');
    if (!wasTrashed && !wasDone) {
      showToast('This task is already active.');
      return;
    }
    currentTaskDetail.trashed = false;
    if (wasDone) {
      currentTaskDetail.completed = false;
      currentTaskDetail.stage = 'not_started';
      currentTaskDetail.status = 'not_started';
    }
    renderTaskDetail();
    renderKanbanBoard(currentProject.activeStage || 'all');
    renderTasks('all');
    updateCounters();
    logTaskActivity(wasTrashed ? 'Task restored from trash' : 'Task restored');
    showToast(wasTrashed ? 'Restored from trash' : 'Task restored');
  }

  function trashCurrentTask() {
    if (!currentTaskDetail) return;
    if (typeof currentUserRole !== 'undefined' && currentUserRole === 'crew') {
      showToast('Only administrators can delete tasks.');
      return;
    }
    if (currentTaskDetail.trashed) {
      showToast('This task is already in trash.');
      return;
    }
    openMobileNotice({
      title: 'Trash',
      message: 'This task will leave the board. Restore brings it back.',
      action: 'Move to trash',
      onAction: () => {
        if (!currentTaskDetail) return;
        currentTaskDetail.trashed = true;
        renderKanbanBoard(currentProject.activeStage || 'all');
        renderTasks('all');
        updateCounters();
        logTaskActivity('Task moved to trash');
        showToast('Moved to trash');
      }
    });
  }

  function openAssignHistory() {
    if (!currentTaskDetail) return;
    const history = currentTaskDetail.assignHistory || [];
    if (!history.length) {
      openMobileNotice({ title: 'Assign history', message: 'No assignment changes yet.', action: 'OK' });
      return;
    }
    openMobileChoice({
      title: 'Assign history',
      options: history.map((entry, index) => ({
        value: String(index),
        label: `${entry.name} · ${entry.when}`
      })),
      onPick: () => {}
    });
  }

  // More Options Menu Toggle (...)
  const taskMoreOptionsBtn = document.getElementById('taskMoreOptionsBtn');
  const taskOptionsMenu = document.getElementById('taskOptionsMenu');
  if (taskMoreOptionsBtn && taskOptionsMenu) {
    taskMoreOptionsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      taskOptionsMenu.style.display = 'none';
      const menuIcon = (markup) => `<svg class="mobile-ask-ico" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${markup}</svg>`;
      openMobileChoice({
        title: 'Task',
        options: [
          { value: 'move', label: 'Move', hint: 'more', icon: menuIcon('<path d="M3 7h5l2 2h11v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"></path><path d="M14 12h5"></path><path d="M17 10l2 2-2 2"></path>') },
          { value: 'restore', label: 'Restore', icon: menuIcon('<path d="M3 12a9 9 0 1 0 3-6.7"></path><polyline points="3 4 3 10 9 10"></polyline>') },
          { value: 'duplicate', label: 'Duplicate', icon: menuIcon('<rect x="8" y="8" width="12" height="12" rx="2"></rect><path d="M4 16V6a2 2 0 0 1 2-2h10"></path>') },
          { value: 'complete', label: 'Complete', icon: menuIcon('<circle cx="12" cy="12" r="8"></circle><polyline points="8.5 12.5 11 15 15.5 9.5"></polyline>') },
          { value: 'trash', label: 'Trash', icon: menuIcon('<polyline points="4 7 6 7 20 7"></polyline><path d="M8 7V5h8v2"></path><path d="M7 7l1 13h8l1-13"></path>') },
          { value: 'history', label: 'Assign history', hint: 'dot', icon: menuIcon('<polyline points="4 16 9 11 13 14 20 7"></polyline><polyline points="14 7 20 7 20 13"></polyline>') }
        ],
        onPick: (value) => {
          if (value === 'move') openTaskMoveSheet();
          if (value === 'restore') restoreCurrentTask();
          if (value === 'duplicate') document.getElementById('menuDuplicateTaskBtn')?.click();
          if (value === 'complete') completeCurrentTask();
          if (value === 'trash') trashCurrentTask();
          if (value === 'history') openAssignHistory();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#taskOptionsMenu') && !e.target.closest('#taskMoreOptionsBtn')) {
        taskOptionsMenu.style.display = 'none';
      }
    });
  }

  // Menu items: Complete, Duplicate, Delete
  const menuToggleCompleteBtn = document.getElementById('menuToggleCompleteBtn');
  if (menuToggleCompleteBtn) {
    menuToggleCompleteBtn.addEventListener('click', () => {
      if (taskOptionsMenu) taskOptionsMenu.style.display = 'none';
      if (!currentTaskDetail) return;
      const willComplete = !(currentTaskDetail.completed || currentTaskDetail.stage === 'done');
      currentTaskDetail.completed = willComplete;
      currentTaskDetail.stage = willComplete ? 'done' : 'not_started';
      currentTaskDetail.status = willComplete ? 'done' : 'not_started';

      renderTaskDetail();
      renderKanbanBoard(currentProject.activeStage || 'all');
      renderTasks('all');
      updateCounters();
      logTaskActivity(willComplete ? 'Task marked complete' : 'Task reopened');
      showToast(willComplete ? 'Task Completed ✓' : 'Task marked Incomplete');
    });
  }

  const menuDuplicateTaskBtn = document.getElementById('menuDuplicateTaskBtn');
  if (menuDuplicateTaskBtn) {
    menuDuplicateTaskBtn.addEventListener('click', () => {
      if (taskOptionsMenu) taskOptionsMenu.style.display = 'none';
      if (!currentTaskDetail) return;
      const copy = JSON.parse(JSON.stringify(currentTaskDetail));
      copy.id = 't_' + Date.now();
      copy.token = 'TASK-' + Math.floor(100000 + Math.random() * 900000);
      copy.title = copy.title + ' (Copy)';
      copy.trashed = false;
      projectTasks.unshift(copy);
      openTaskDetail(copy);
      renderKanbanBoard(currentProject.activeStage || 'all');
      showToast('Task duplicated ✓');
    });
  }

  const menuDeleteTaskBtn = document.getElementById('menuDeleteTaskBtn');
  if (menuDeleteTaskBtn) {
    menuDeleteTaskBtn.addEventListener('click', () => {
      if (taskOptionsMenu) taskOptionsMenu.style.display = 'none';
      const delBtn = document.getElementById('deleteTaskDetailBtn');
      if (delBtn) delBtn.click();
    });
  }

  // Rich Description Auto-save
  const taskDetailDesc = document.getElementById('taskDetailDesc');
  const descSaveHint = document.getElementById('descSaveHint');
  if (taskDetailDesc) {
    taskDetailDesc.addEventListener('input', () => {
      if (currentTaskDetail) {
        currentTaskDetail.description = taskDetailDesc.value;
      }
      if (descSaveHint) {
        descSaveHint.textContent = 'Editing...';
      }
    });

    taskDetailDesc.addEventListener('blur', () => {
      if (descSaveHint) {
        descSaveHint.textContent = 'Auto-saved ✓';
        setTimeout(() => {
          descSaveHint.textContent = 'Auto-saved';
        }, 1800);
      }
      logTaskActivity('Updated task description');
    });
  }

  // Status property change
  const taskPropStatusSelect = document.getElementById('taskPropStatusSelect');
  if (taskPropStatusSelect) {
    taskPropStatusSelect.addEventListener('change', (e) => {
      if (!currentTaskDetail) return;
      currentTaskDetail.stage = e.target.value;
      currentTaskDetail.status = e.target.value;
      currentTaskDetail.completed = (e.target.value === 'done');

      const statusDot = document.getElementById('taskStatusDot');
      if (statusDot) {
        statusDot.className = 'status-dot';
        if (e.target.value === 'not_started') statusDot.classList.add('dot-orange');
        else if (e.target.value === 'in_progress') statusDot.classList.add('dot-teal');
        else if (e.target.value === 'done') statusDot.classList.add('dot-purple');
        else if (e.target.value === 'on_hold') statusDot.classList.add('dot-red');
      }

      const completeBtn = document.getElementById('taskCompleteToggleBtn');
      const completeBtnText = document.getElementById('taskCompleteBtnText');
      if (completeBtn) completeBtn.classList.toggle('is-completed', currentTaskDetail.completed);
      if (completeBtnText) completeBtnText.textContent = currentTaskDetail.completed ? 'Completed ✓' : 'Complete';

      renderKanbanBoard(currentProject.activeStage || 'all');
      renderTasks('all');
      updateCounters();
      logTaskActivity(`Status changed to ${e.target.options[e.target.selectedIndex].text}`);
      showToast(`Status: ${e.target.options[e.target.selectedIndex].text}`);
    });
  }

  // Assignee change
  const taskPropAssigneeSelect = document.getElementById('taskPropAssigneeSelect');
  if (taskPropAssigneeSelect) {
    taskPropAssigneeSelect.addEventListener('change', (e) => {
      if (!currentTaskDetail) return;
      currentTaskDetail.assignee = e.target.value;
      rememberAssignment(currentTaskDetail, e.target.value);
      renderKanbanBoard(currentProject.activeStage || 'all');
      logTaskActivity(`Assigned to ${e.target.value}`);
      showToast(`Assigned to ${e.target.value}`);
    });
  }

  // Priority change
  const taskPropPrioritySelect = document.getElementById('taskPropPrioritySelect');
  if (taskPropPrioritySelect) {
    taskPropPrioritySelect.addEventListener('change', (e) => {
      if (!currentTaskDetail) return;
      currentTaskDetail.priority = e.target.value;
      renderKanbanBoard(currentProject.activeStage || 'all');
      logTaskActivity(`Priority set to ${e.target.value}`);
      showToast(`Priority: ${e.target.value}`);
    });
  }

  // Dates change
  const taskStartDateInput = document.getElementById('taskStartDateInput');
  const quickStartChip = document.getElementById('quickStartChip');
  if (quickStartChip && taskStartDateInput) {
    quickStartChip.addEventListener('click', () => {
      if (taskStartDateInput.showPicker) taskStartDateInput.showPicker();
      else taskStartDateInput.click();
    });
  }
  if (taskStartDateInput) {
    taskStartDateInput.addEventListener('change', (e) => {
      if (currentTaskDetail) currentTaskDetail.startDate = e.target.value;
      renderTaskDetail();
    });
  }

  const taskDueDateInput = document.getElementById('taskDueDateInput');
  if (taskDueDateInput) {
    taskDueDateInput.addEventListener('change', (e) => {
      if (currentTaskDetail) currentTaskDetail.dueDate = e.target.value;
    });
  }

  // Project link click: Navigate to Project Details
  const taskProjectLinkBtn = document.getElementById('taskProjectLinkBtn');
  if (taskProjectLinkBtn) {
    taskProjectLinkBtn.addEventListener('click', () => {
      closeTaskDetail();
      openProjectDetails(currentTaskDetail.project || 'AME Estimation', 'Test Teamspace');
    });
  }

  // Manage Fields modal triggers
  const openManageFieldsBtn = document.getElementById('openManageFieldsBtn');
  if (openManageFieldsBtn) {
    openManageFieldsBtn.addEventListener('click', () => {
      if (currentUserRole === 'crew') {
        showToast('You can view these fields. Switch to administrator to edit them.');
      }
      openManageFieldsModal();
    });
  }

  const closeManageFieldsModalBtn = document.getElementById('closeManageFieldsModalBtn');
  if (closeManageFieldsModalBtn) {
    closeManageFieldsModalBtn.addEventListener('click', () => closeModal(manageFieldsModal));
  }

  // Show/Hide Options group when Select type chosen in Add Field form
  const newFieldTypeSelect = document.getElementById('newFieldTypeSelect');
  const newFieldOptionsGroup = document.getElementById('newFieldOptionsGroup');
  if (newFieldTypeSelect && newFieldOptionsGroup) {
    newFieldTypeSelect.addEventListener('change', (e) => {
      newFieldOptionsGroup.style.display = (e.target.value === 'select') ? 'flex' : 'none';
    });
  }

  // Submit Add New Custom Field form
  const submitAddCustomFieldBtn = document.getElementById('submitAddCustomFieldBtn');
  if (submitAddCustomFieldBtn) {
    submitAddCustomFieldBtn.addEventListener('click', () => {
      if (currentUserRole === 'crew') {
        showToast('Only administrators can add fields.');
        return;
      }

      const nameInput = document.getElementById('newFieldNameInput');
      const typeSelect = document.getElementById('newFieldTypeSelect');
      const optsInput = document.getElementById('newFieldOptionsInput');
      const valInput = document.getElementById('newFieldValueInput');
      const permSelect = document.getElementById('newFieldPermissionSelect');

      const name = nameInput ? nameInput.value.trim() : '';
      if (!name) {
        showToast('Enter a field name');
        return;
      }

      const type = typeSelect ? typeSelect.value : 'text';
      const initialVal = valInput ? valInput.value.trim() : '0';
      const permission = permSelect ? permSelect.value : 'all';
      const options = (type === 'select' && optsInput && optsInput.value.trim())
        ? optsInput.value.split(',').map(s => s.trim()).filter(Boolean)
        : ['Option 1', 'Option 2', 'Option 3'];

      if (!currentTaskDetail.customFields) currentTaskDetail.customFields = [];

      const newField = {
        id: 'cf_' + Date.now(),
        name: name,
        type: type,
        value: initialVal || '',
        options: options,
        permission: permission
      };
      if (type === 'file') newField.fileName = '';
      currentTaskDetail.customFields.push(newField);

      recalculateCustomFields(currentTaskDetail);
      renderCustomFields();
      updateManageFieldsModal();

      // Reset form
      if (nameInput) nameInput.value = '';
      if (valInput) valInput.value = '';
      if (optsInput) optsInput.value = '';

      logTaskActivity(`Added capture field "${name}" with permission "${permission}"`);
      showToast(`Capture field "${name}" ready ✓`);
    });
  }

  // Add New Checklist Group Button
  const addNewChecklistGroupBtn = document.getElementById('addNewChecklistGroupBtn');
  if (addNewChecklistGroupBtn) {
    addNewChecklistGroupBtn.addEventListener('click', () => {
      openMobilePrompt({
        title: 'New checklist',
        placeholder: 'Checklist name',
        value: 'Site Quality Verification',
        submitLabel: 'Add',
        onSubmit: (name) => {
          if (!name || !name.trim() || !currentTaskDetail) return;
          if (!currentTaskDetail.checklists) currentTaskDetail.checklists = [];
          currentTaskDetail.checklists.push({
            id: 'cl_' + Date.now(),
            name: name.trim(),
            items: [
              { id: 'cli_' + Date.now(), text: 'Review statutory specifications', done: false }
            ]
          });
          renderChecklists();
          logTaskActivity(`Created checklist group "${name.trim()}"`);
          showToast(`Checklist "${name.trim()}" added ✓`);
        }
      });
    });
  }

  // Add Subtask button
  const addNewSubtaskBtn = document.getElementById('addNewSubtaskBtn');
  if (addNewSubtaskBtn) {
    addNewSubtaskBtn.addEventListener('click', () => {
      openMobilePrompt({
        title: 'New subtask',
        placeholder: 'Subtask title',
        value: 'Procure municipal authority seal',
        submitLabel: 'Add',
        onSubmit: (title) => {
          if (!title || !title.trim() || !currentTaskDetail) return;
          if (!currentTaskDetail.subtasks) currentTaskDetail.subtasks = [];
          currentTaskDetail.subtasks.push({
            id: 'sub_' + Date.now(),
            title: title.trim(),
            done: false,
            assignee: 'RK'
          });
          renderSubtasks();
          logTaskActivity(`Added subtask "${title.trim()}"`);
          showToast('Subtask added ✓');
        }
      });
    });
  }

  // Upload File button & Dropzone
  const uploadFileBtn = document.getElementById('uploadFileBtn');
  const filesDropzone = document.getElementById('filesDropzone');
  const taskFileInput = document.getElementById('taskFileInput');

  function handleAddMockFile(fileName = 'Authority_Estimation_Takeoff.xlsx') {
    if (!currentTaskDetail) return;
    if (!currentTaskDetail.files) currentTaskDetail.files = [];
    currentTaskDetail.files.push({
      id: 'f_' + Date.now(),
      name: fileName,
      size: '1.2 MB',
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderFiles();
    logTaskActivity(`Attached file "${fileName}"`);
    showToast(`File attached: ${fileName} ✓`);
  }

  if (uploadFileBtn) {
    uploadFileBtn.addEventListener('click', () => {
      if (taskFileInput) taskFileInput.click();
      else handleAddMockFile();
    });
  }

  if (filesDropzone) {
    filesDropzone.addEventListener('click', () => {
      if (taskFileInput) taskFileInput.click();
      else handleAddMockFile();
    });

    filesDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      filesDropzone.classList.add('dragover');
    });

    filesDropzone.addEventListener('dragleave', () => {
      filesDropzone.classList.remove('dragover');
    });

    filesDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      filesDropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        handleAddMockFile(file.name);
      } else {
        handleAddMockFile();
      }
    });
  }

  if (taskFileInput) {
    taskFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleAddMockFile(e.target.files[0].name);
      }
    });
  }

  // Send Comment
  const taskCommentSendBtn = document.getElementById('taskCommentSendBtn');
  const taskCommentInput = document.getElementById('taskCommentInput');
  if (taskCommentSendBtn && taskCommentInput) {
    taskCommentSendBtn.addEventListener('click', () => {
      const text = taskCommentInput.value.trim();
      if (!text) return;
      if (!currentTaskDetail.comments) currentTaskDetail.comments = [];

      currentTaskDetail.comments.push({
        id: 'c_' + Date.now(),
        author: (currentUserRole === 'admin') ? 'Midhun Raj' : 'Field Crew',
        avatar: (currentUserRole === 'admin') ? 'MC' : 'FC',
        time: 'Just now',
        text: text
      });

      taskCommentInput.value = '';
      renderComments();
      logTaskActivity(`Posted comment: "${text.substring(0, 30)}..."`);
      showToast('Comment posted ✓');
    });
  }

  // ==========================================
  // INLINE COMMENT THREAD UNDER DESCRIPTION
  // Matches uploaded screenshot UI
  // ==========================================
  const threadRepliesToggleBtn = document.getElementById('threadRepliesToggleBtn');
  const threadNestedReplies = document.getElementById('threadNestedReplies');
  const threadRepliesToggleText = document.getElementById('threadRepliesToggleText');

  if (threadRepliesToggleBtn && threadNestedReplies) {
    threadRepliesToggleBtn.addEventListener('click', () => {
      const isHidden = threadNestedReplies.style.display === 'none';
      threadNestedReplies.style.display = isHidden ? 'flex' : 'none';
      if (threadRepliesToggleText) {
        threadRepliesToggleText.textContent = isHidden ? 'Hide 3 replies' : 'Show 3 replies';
      }
    });
  }

  // Show All Middle Comments Toggle (First and last always visible)
  const threadShowAllBtn = document.getElementById('threadShowAllBtn');
  const threadMiddleComments = document.getElementById('threadMiddleComments');
  const threadShowAllText = document.getElementById('threadShowAllText');

  if (threadShowAllBtn && threadMiddleComments) {
    threadShowAllBtn.addEventListener('click', () => {
      const isHidden = threadMiddleComments.style.display === 'none';
      threadMiddleComments.style.display = isHidden ? 'flex' : 'none';
      threadShowAllBtn.classList.toggle('expanded', isHidden);
      if (threadShowAllText) {
        threadShowAllText.textContent = isHidden ? 'Show less' : 'Show all';
      }
    });
  }

  const threadInlineInput = document.getElementById('threadInlineInput');
  const threadSendMiniBtn = document.getElementById('threadSendMiniBtn');
  const threadCommentsList = document.getElementById('threadCommentsList');

  function handlePostThreadComment() {
    if (!threadInlineInput) return;
    const txt = threadInlineInput.value.trim();
    if (!txt) return;

    if (threadCommentsList) {
      // Move previous last comment into middle comments container so only first and last are shown
      const prevLast = document.getElementById('threadLastComment');
      if (prevLast && threadMiddleComments) {
        prevLast.removeAttribute('id');
        threadMiddleComments.appendChild(prevLast);
        const showAllRow = document.getElementById('threadShowAllRow');
        if (showAllRow) showAllRow.style.display = 'flex';
      }

      const itemWrap = document.createElement('div');
      itemWrap.className = 'thread-item-wrapper';
      itemWrap.id = 'threadLastComment';
      itemWrap.innerHTML = `
        <div class="thread-avatar-col">
          <div class="thread-avatar-circle">M</div>
        </div>
        <div class="thread-content-col">
          <div class="thread-header-row">
            <div class="thread-author-meta">
              <span class="thread-author-name">Midhun C K</span>
              <span class="thread-time-tag">Just now</span>
            </div>
            <div class="thread-action-pill">
              <button class="thread-act-btn thread-react-btn" title="Add reaction">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                  <line x1="19" y1="5" x2="19" y2="9"></line>
                  <line x1="17" y1="7" x2="21" y2="7"></line>
                </svg>
              </button>
              <button class="thread-act-btn thread-more-btn" title="More options">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="19" cy="12" r="1"></circle>
                  <circle cx="5" cy="12" r="1"></circle>
                </svg>
              </button>
            </div>
          </div>
          <div class="thread-body-text">${txt}</div>
        </div>
      `;
      threadCommentsList.appendChild(itemWrap);
    }

    if (currentTaskDetail) {
      if (!currentTaskDetail.comments) currentTaskDetail.comments = [];
      currentTaskDetail.comments.push({
        id: 'c_' + Date.now(),
        author: 'Midhun C K',
        avatar: 'M',
        time: 'Just now',
        text: txt
      });
      renderComments();
      logTaskActivity(`Comment posted: "${txt.substring(0, 30)}..."`);
    }

    threadInlineInput.value = '';
    showToast('Comment posted ✓');
  }

  if (threadSendMiniBtn) {
    threadSendMiniBtn.addEventListener('click', handlePostThreadComment);
  }

  if (threadInlineInput) {
    threadInlineInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePostThreadComment();
      }
    });
  }

  // Delegate reaction and resolve actions in thread
  if (threadCommentsList) {
    threadCommentsList.addEventListener('click', (e) => {
      const reactBtn = e.target.closest('.thread-react-btn');
      if (reactBtn) {
        showToast('Reaction added: 👍');
        return;
      }
      const resolveBtn = e.target.closest('.thread-resolve-btn');
      if (resolveBtn) {
        const item = resolveBtn.closest('.thread-item-wrapper');
        if (item) {
          item.style.opacity = '0.6';
          showToast('Comment thread marked resolved ✓');
        }
        return;
      }
      const moreBtn = e.target.closest('.thread-more-btn');
      if (moreBtn) {
        showToast('Comment options: Edit · Copy link · Delete');
      }
    });
  }

  // Activity Accordion Toggle
  const taskActivityToggleBtn = document.getElementById('taskActivityToggleBtn');
  const taskActivityTimeline = document.getElementById('taskActivityTimeline');
  if (taskActivityToggleBtn && taskActivityTimeline) {
    taskActivityToggleBtn.addEventListener('click', () => {
      const isOpen = taskActivityTimeline.classList.contains('open');
      taskActivityTimeline.classList.toggle('open', !isOpen);
      taskActivityToggleBtn.classList.toggle('open', !isOpen);
    });
  }

  // Delete Task button
  const deleteTaskDetailBtn = document.getElementById('deleteTaskDetailBtn');
  if (deleteTaskDetailBtn) {
    deleteTaskDetailBtn.addEventListener('click', () => {
      if (currentUserRole === 'crew') {
        showToast('Only administrators can delete tasks.');
        return;
      }

      if (confirm(`Are you sure you want to delete "${currentTaskDetail.title}"?`)) {
        const taskId = currentTaskDetail.id;
        const taskTitle = currentTaskDetail.title;

        // Remove from projectTasks
        const idx = projectTasks.findIndex(t => t.id === taskId);
        if (idx !== -1) projectTasks.splice(idx, 1);

        // Remove from state.tasks
        state.tasks = state.tasks.filter(t => t.id !== taskId && t.title !== taskTitle);

        closeTaskDetail();
        renderKanbanBoard(currentProject.activeStage || 'all');
        renderTasks('all');
        updateCounters();
        showToast(`Deleted task: "${taskTitle}"`);
      }
    });
  }

  // Desktop Toolbar Button: Open TASK-000288 directly
  const openTask288ToolbarBtn = document.getElementById('openTask288ToolbarBtn');
  if (openTask288ToolbarBtn) {
    openTask288ToolbarBtn.addEventListener('click', () => {
      openTaskDetail(projectTasks[0]);
    });
  }

  // Initial render
  updateHeroSiteDisplay();
  updateCounters();
  renderSites();
  renderTasks();
  renderNotes();
  renderSnaps();
  renderCrewRoster('all');
  updateAttendanceMetrics();
  renderKanbanBoard('all');

});
