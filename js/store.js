import { SEED_DATA } from './data/seed.js';
import { supabaseService } from './supabase.js';

const STORAGE_KEY = 'life_os_data_v2';
const THEME_KEY = 'life_os_theme_v1';
const SIDEBAR_KEY = 'life_os_sidebar_v1';
const TAB_KEY = 'life_os_active_tab_v1';

class Store {
  constructor() {
    this.listeners = [];
    this.data = this.loadData();
    this.theme = localStorage.getItem(THEME_KEY) || 'light';
    this.sidebarCollapsed = localStorage.getItem(SIDEBAR_KEY) === 'true';
    this.activeTab = this.getInitialTab();
    this.activeProjectId = null;
    this.activeTopicId = null;
    this.currentUser = null;
    this.cloudUnsubscribe = null;

    this.applyTheme(this.theme);
    this.initAuthSync();
  }

  getInitialTab() {
    const hash = window.location.hash.replace('#', '').trim();
    const validTabs = ['dashboard', 'tasks', 'goals', 'projects', 'learning', 'finance', 'wishlist', 'journal', 'resources', 'settings', 'archive'];
    if (hash && validTabs.includes(hash)) {
      return hash;
    }
    const savedTab = localStorage.getItem(TAB_KEY);
    if (savedTab && validTabs.includes(savedTab)) {
      return savedTab;
    }
    return 'dashboard';
  }

  async initAuthSync() {
    try {
      await supabaseService.getSession();
      this.currentUser = supabaseService.currentUser;
      const targetSyncId = this.currentUser ? this.currentUser.id : 'default-dashboard';

      const remotePayload = await supabaseService.fetchUserData(targetSyncId);
      if (remotePayload) {
        this.data = this.sanitizeData(remotePayload);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } else {
        await supabaseService.saveUserData(targetSyncId, this.data);
      }

      if (this.cloudUnsubscribe) this.cloudUnsubscribe();
      this.cloudUnsubscribe = supabaseService.subscribeToUserSync(targetSyncId, (payload) => {
        if (payload) {
          this.data = this.sanitizeData(payload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
          this.notify();
        }
      });

      this.notify();

      supabaseService.onAuthStateChange(async (event, session) => {
        this.currentUser = session?.user || null;
        const syncId = this.currentUser ? this.currentUser.id : 'default-dashboard';
        const payload = await supabaseService.fetchUserData(syncId);
        if (payload) {
          this.data = this.sanitizeData(payload);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } else {
          await supabaseService.saveUserData(syncId, this.data);
        }
        if (this.cloudUnsubscribe) this.cloudUnsubscribe();
        this.cloudUnsubscribe = supabaseService.subscribeToUserSync(syncId, (p) => {
          if (p) {
            this.data = this.sanitizeData(p);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
            this.notify();
          }
        });
        this.notify();
      });
    } catch (e) {
      console.warn('Auth sync init notice:', e);
    }
  }

  sanitizeData(parsed) {
    if (!parsed || typeof parsed !== 'object') {
      parsed = JSON.parse(JSON.stringify(SEED_DATA));
    }
    if (!parsed.profile || !parsed.profile.name) {
      parsed.profile = JSON.parse(JSON.stringify(SEED_DATA.profile));
    }
    if (!parsed.domains || parsed.domains.length === 0) {
      parsed.domains = JSON.parse(JSON.stringify(SEED_DATA.domains));
    }
    if (!parsed.learning || parsed.learning.length === 0) {
      parsed.learning = JSON.parse(JSON.stringify(SEED_DATA.learning));
    }
    if (!parsed.resources || parsed.resources.length === 0) {
      parsed.resources = JSON.parse(JSON.stringify(SEED_DATA.resources));
    }
    if (!parsed.projects || parsed.projects.length === 0) {
      parsed.projects = JSON.parse(JSON.stringify(SEED_DATA.projects));
    }
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      parsed.tasks = JSON.parse(JSON.stringify(SEED_DATA.tasks));
    }
    if (!parsed.goals || !Array.isArray(parsed.goals)) {
      parsed.goals = JSON.parse(JSON.stringify(SEED_DATA.goals));
    }
    if (!parsed.finance || typeof parsed.finance !== 'object') {
      parsed.finance = JSON.parse(JSON.stringify(SEED_DATA.finance));
    }
    if (!parsed.quickCapture || !Array.isArray(parsed.quickCapture)) {
      parsed.quickCapture = [];
    }
    return parsed;
  }

  loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.profile || !parsed.profile.name) {
          parsed.profile = JSON.parse(JSON.stringify(SEED_DATA.profile));
        }
        if (!parsed.domains || parsed.domains.length === 0) {
          parsed.domains = JSON.parse(JSON.stringify(SEED_DATA.domains));
        }
        if (!parsed.learning || parsed.learning.length === 0) {
          parsed.learning = JSON.parse(JSON.stringify(SEED_DATA.learning));
        }
        if (!parsed.resources || parsed.resources.length < 30 || !parsed.resources.some(r => r.category === 'OSU Academic')) {
          parsed.resources = JSON.parse(JSON.stringify(SEED_DATA.resources));
        }
        // Load ONLY the single portfolio project: Arduino Smart Mirror
        parsed.projects = JSON.parse(JSON.stringify(SEED_DATA.projects));
        if (!parsed.tasks || !parsed.tasks.some(t => t.id === 'task-lolla')) {
          parsed.tasks = JSON.parse(JSON.stringify(SEED_DATA.tasks));
        }
        // Filter out legacy sample demo sync tasks so unlinked feeds show 0 items by default
        parsed.tasks = parsed.tasks.filter(t => !t.id.startsWith('task-sync-') && !t.id.startsWith('task-import-'));
        if (!parsed.goals || !parsed.goals.some(g => g.id === 'goal-internship-2027')) {
          parsed.goals = JSON.parse(JSON.stringify(SEED_DATA.goals));
        }
        if (!parsed.finance || !parsed.finance.bigPurchases || !parsed.finance.bigPurchases.some(b => b.id === 'bp-roth-ira')) {
          parsed.finance = JSON.parse(JSON.stringify(SEED_DATA.finance));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load saved state:', e);
    }
    return JSON.parse(JSON.stringify(SEED_DATA));
  }

  resetAllDataToSeed() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.saveData();
  }

  saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      const targetSyncId = this.currentUser ? this.currentUser.id : 'default-dashboard';
      supabaseService.saveUserData(targetSyncId, this.data);
    } catch (e) {
      console.error('Failed to save state:', e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.data));
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, this.theme);
    this.applyTheme(this.theme);
    this.notify();
  }

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem(SIDEBAR_KEY, this.sidebarCollapsed);
    this.notify();
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    this.activeProjectId = null;
    this.activeTopicId = null;
    localStorage.setItem(TAB_KEY, tab);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `#${tab}`);
    } else {
      window.location.hash = tab;
    }
    this.notify();
  }

  setActiveProjectId(id) {
    this.activeProjectId = id;
    this.notify();
  }

  setActiveTopicId(id) {
    this.activeTopicId = id;
    this.notify();
  }

  // ------------ TASK & CALENDAR CRUD ------------
  addTask(task) {
    const defaultDate = new Date().toISOString().split('T')[0];
    const startDate = task.startDate || task.dueDate || defaultDate;
    const dueDate = task.dueDate || startDate || defaultDate;

    const newTask = {
      id: 'task-' + Date.now(),
      title: task.title,
      priority: task.priority || 'medium',
      category: task.category || 'Personal',
      startDate: startDate,
      dueDate: dueDate,
      taskType: task.taskType || (startDate !== dueDate ? 'multi-day' : 'single'),
      timeBlock: task.timeBlock || null, // { startTime: '09:00', endTime: '10:00' }
      estimatedTime: task.estimatedTime || '', // e.g. "45 mins"
      sourceTag: task.sourceTag || 'Life OS', // "Life OS", "Power Planner", "Google Calendar", "Canvas"
      status: task.status || 'todo',
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
      repeating: task.repeating || 'none',
      tags: task.tags || [],
      notes: task.notes || ''
    };
    this.data.tasks.unshift(newTask);
    this.saveData();
    return newTask;
  }

  addSubtask(taskId, title) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task) {
      if (!Array.isArray(task.subtasks)) task.subtasks = [];
      task.subtasks.push({
        id: 'st-' + Date.now(),
        title: title,
        completed: false
      });
      this.saveData();
    }
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && Array.isArray(task.subtasks)) {
      const st = task.subtasks.find(s => s.id === subtaskId);
      if (st) {
        st.completed = !st.completed;
        this.saveData();
      }
    }
  }

  deleteSubtask(taskId, subtaskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && Array.isArray(task.subtasks)) {
      task.subtasks = task.subtasks.filter(s => s.id !== subtaskId);
      this.saveData();
    }
  }

  syncExternalSchedules() {
    if (!this.data.integrations) {
      this.data.integrations = { powerPlanner: false, googleCalendar: false, canvas: false, lastSynced: null };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const sampleClasses = [
      {
        id: 'task-sync-1',
        title: 'CSE 2221: Software I (Lecture)',
        priority: 'high',
        category: 'School (non-hw)',
        dueDate: todayStr,
        timeBlock: { startTime: '10:20', endTime: '11:15' },
        estimatedTime: '55 mins',
        sourceTag: 'Power Planner',
        status: 'todo',
        subtasks: [{ id: 'st-1', title: 'Review lecture slide deck', completed: false }],
        notes: 'Dreese Laboratories Rm 228'
      },
      {
        id: 'task-sync-2',
        title: 'MATH 1151: Calculus I (Recitation)',
        priority: 'medium',
        category: 'School (non-hw)',
        dueDate: todayStr,
        timeBlock: { startTime: '12:40', endTime: '13:35' },
        estimatedTime: '55 mins',
        sourceTag: 'Power Planner',
        status: 'todo',
        subtasks: [],
        notes: 'Mathematics Building Rm 104'
      },
      {
        id: 'task-sync-3',
        title: 'ENGR 1181: Engineering Fundamentals Lab',
        priority: 'high',
        category: 'School (non-hw)',
        dueDate: todayStr,
        timeBlock: { startTime: '14:20', endTime: '16:10' },
        estimatedTime: '1 hr 50 mins',
        sourceTag: 'Google Calendar',
        status: 'todo',
        subtasks: [{ id: 'st-2', title: 'Bring safety glasses & lab workbook', completed: true }],
        notes: 'Hitchcock Hall Rm 224'
      },
      {
        id: 'task-sync-4',
        title: 'Canvas HW: CSE 2221 Project 1 Submission',
        priority: 'urgent',
        category: 'School (non-hw)',
        dueDate: todayStr,
        timeBlock: { startTime: '17:00', endTime: '18:30' },
        estimatedTime: '1 hr 30 mins',
        sourceTag: 'Canvas',
        status: 'todo',
        subtasks: [{ id: 'st-3', title: 'Run JUnit test suite', completed: true }, { id: 'st-4', title: 'Zip and submit zip file to Carmen Canvas', completed: false }],
        notes: 'Due by 11:59 PM tonight on Carmen Canvas'
      }
    ];

    // Filter out items that exist already
    sampleClasses.forEach(item => {
      if (!this.data.tasks.some(t => t.id === item.id || t.title === item.title)) {
        this.data.tasks.unshift(item);
      }
    });

    this.data.integrations = {
      powerPlanner: true,
      googleCalendar: true,
      canvas: true,
      lastSynced: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    this.saveData();
    this.notify();
  }

  unsyncAllExternalSchedules() {
    this.data.tasks = this.data.tasks.filter(t => {
      if (t.isExternal) return false;
      if (t.id && t.id.startsWith('task-sync-')) return false;
      if (t.sourceTag && (
        t.sourceTag.includes('Power Planner') || 
        t.sourceTag.includes('Google') || 
        t.sourceTag.includes('Canvas') ||
        t.sourceTag.includes('Sync')
      )) return false;
      if (t.title && (
        t.title.includes('CSE 2221:') ||
        t.title.includes('MATH 1151:') ||
        t.title.includes('ENGR 1181:') ||
        t.title.includes('Canvas HW:')
      )) return false;
      return true;
    });

    this.data.integrations = {
      powerPlanner: false,
      googleCalendar: false,
      canvas: false,
      lastSynced: null
    };

    this.saveData();
    this.notify();
  }

  toggleIntegration(source) {
    if (!this.data.integrations) {
      this.data.integrations = { powerPlanner: true, googleCalendar: true, canvas: true, lastSynced: null };
    }
    this.data.integrations[source] = !this.data.integrations[source];
    this.saveData();
    this.notify();
  }

  updateTask(id, updates) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
      this.saveData();
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.saveData();
  }

  toggleTaskStatus(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'done' ? 'todo' : 'done';
      this.saveData();
    }
  }

  toggleSubtask(taskId, subtaskId) {
    const task = this.data.tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
      const st = task.subtasks.find(s => s.id === subtaskId);
      if (st) {
        st.completed = !st.completed;
        this.saveData();
      }
    }
  }

  // ------------ GOAL CRUD ------------
  addGoal(goal) {
    const newGoal = {
      id: 'goal-' + Date.now(),
      title: goal.title,
      horizon: goal.horizon || 'semester',
      category: goal.category || 'Personal',
      deadline: goal.deadline || '',
      notes: goal.notes || '',
      isExpanded: false,
      milestoneGroups: goal.milestoneGroups || [
        {
          id: 'grp-1',
          title: 'General Milestones',
          items: []
        }
      ]
    };
    this.data.goals.unshift(newGoal);
    this.saveData();
    return newGoal;
  }

  updateGoal(id, updates) {
    const index = this.data.goals.findIndex(g => g.id === id);
    if (index !== -1) {
      this.data.goals[index] = { ...this.data.goals[index], ...updates };
      this.saveData();
    }
  }

  toggleGoalExpanded(id) {
    const goal = this.data.goals.find(g => g.id === id);
    if (goal) {
      goal.isExpanded = !goal.isExpanded;
      this.saveData();
    }
  }

  toggleMilestoneItem(goalId, groupId, itemId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal && goal.milestoneGroups) {
      const group = goal.milestoneGroups.find(grp => grp.id === groupId);
      if (group && group.items) {
        const item = group.items.find(i => i.id === itemId);
        if (item) {
          item.completed = !item.completed;
          this.saveData();
        }
      }
    }
  }

  addMilestoneGroup(goalId, groupTitle) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal) {
      if (!goal.milestoneGroups) goal.milestoneGroups = [];
      goal.milestoneGroups.push({
        id: 'grp-' + Date.now(),
        title: groupTitle,
        items: []
      });
      this.saveData();
    }
  }

  deleteMilestoneGroup(goalId, groupId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal && goal.milestoneGroups) {
      goal.milestoneGroups = goal.milestoneGroups.filter(grp => grp.id !== groupId);
      this.saveData();
    }
  }

  addMilestoneItem(goalId, groupId, itemTitle) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal && goal.milestoneGroups) {
      const group = goal.milestoneGroups.find(grp => grp.id === groupId);
      if (group) {
        if (!group.items) group.items = [];
        group.items.push({
          id: 'item-' + Date.now(),
          title: itemTitle,
          completed: false
        });
        this.saveData();
      }
    }
  }

  deleteMilestoneItem(goalId, groupId, itemId) {
    const goal = this.data.goals.find(g => g.id === goalId);
    if (goal && goal.milestoneGroups) {
      const group = goal.milestoneGroups.find(grp => grp.id === groupId);
      if (group && group.items) {
        group.items = group.items.filter(i => i.id !== itemId);
        this.saveData();
      }
    }
  }

  deleteGoal(id) {
    this.data.goals = this.data.goals.filter(g => g.id !== id);
    this.saveData();
  }

  // ------------ FULL DEDICATED PROJECT WORKSPACE CRUD ------------
  addProject(project) {
    const now = new Date().toISOString().split('T')[0];
    const newProj = {
      id: 'project-' + Date.now(),
      title: project.title,
      description: project.description || '',
      status: project.status || 'Planning',
      deadline: project.deadline || '',
      createdAt: now,
      updatedAt: now,
      objective: '',
      milestones: [],
      tasks: [],
      resources: [],
      ideasNotes: '',
      relatedGoals: [],
      relatedLearning: [],
      galleryFiles: [],
      reflection: {
        whatILearned: '',
        whatWentWell: '',
        whatIWouldImprove: '',
        portfolioSummary: ''
      }
    };
    if (!this.data.projects) this.data.projects = [];
    this.data.projects.unshift(newProj);
    this.saveData();
    return newProj;
  }

  updateProject(id, updates) {
    const proj = this.data.projects.find(p => p.id === id);
    if (proj) {
      Object.assign(proj, updates);
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  deleteProject(id) {
    this.data.projects = this.data.projects.filter(p => p.id !== id);
    if (this.activeProjectId === id) this.activeProjectId = null;
    this.saveData();
  }

  addProjectMilestonePhase(projectId, phaseTitle) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.milestones) proj.milestones = [];
      proj.milestones.push({
        id: 'pm-grp-' + Date.now(),
        phaseTitle,
        isExpanded: true,
        tasks: []
      });
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  renameProjectMilestonePhase(projectId, phaseId, newTitle) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase) {
        phase.phaseTitle = newTitle;
        proj.updatedAt = new Date().toISOString().split('T')[0];
        this.saveData();
      }
    }
  }

  moveProjectMilestonePhase(projectId, phaseId, direction) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const index = proj.milestones.findIndex(m => m.id === phaseId);
      if (index !== -1) {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < proj.milestones.length) {
          const temp = proj.milestones[index];
          proj.milestones[index] = proj.milestones[targetIndex];
          proj.milestones[targetIndex] = temp;
          proj.updatedAt = new Date().toISOString().split('T')[0];
          this.saveData();
        }
      }
    }
  }

  deleteProjectMilestonePhase(projectId, phaseId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      proj.milestones = proj.milestones.filter(m => m.id !== phaseId);
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  addProjectMilestoneTask(projectId, phaseId, taskTitle) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase) {
        if (!phase.tasks) phase.tasks = [];
        phase.tasks.push({
          id: 'pm-t-' + Date.now(),
          title: taskTitle,
          completed: false
        });
        proj.updatedAt = new Date().toISOString().split('T')[0];
        this.saveData();
      }
    }
  }

  renameProjectMilestoneTask(projectId, phaseId, taskId, newTitle) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase && phase.tasks) {
        const t = phase.tasks.find(tk => tk.id === taskId);
        if (t) {
          t.title = newTitle;
          proj.updatedAt = new Date().toISOString().split('T')[0];
          this.saveData();
        }
      }
    }
  }

  moveProjectMilestoneTask(projectId, phaseId, taskId, direction) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase && phase.tasks) {
        const index = phase.tasks.findIndex(tk => tk.id === taskId);
        if (index !== -1) {
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex >= 0 && targetIndex < phase.tasks.length) {
            const temp = phase.tasks[index];
            phase.tasks[index] = phase.tasks[targetIndex];
            phase.tasks[targetIndex] = temp;
            proj.updatedAt = new Date().toISOString().split('T')[0];
            this.saveData();
          }
        }
      }
    }
  }

  toggleProjectMilestoneTask(projectId, phaseId, taskId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase && phase.tasks) {
        const t = phase.tasks.find(tk => tk.id === taskId);
        if (t) {
          t.completed = !t.completed;
          proj.updatedAt = new Date().toISOString().split('T')[0];
          this.saveData();
        }
      }
    }
  }

  deleteProjectMilestoneTask(projectId, phaseId, taskId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.milestones) {
      const phase = proj.milestones.find(m => m.id === phaseId);
      if (phase && phase.tasks) {
        phase.tasks = phase.tasks.filter(tk => tk.id !== taskId);
        proj.updatedAt = new Date().toISOString().split('T')[0];
        this.saveData();
      }
    }
  }

  addProjectTask(projectId, task) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.tasks) proj.tasks = [];
      proj.tasks.push({
        id: 'pt-' + Date.now(),
        title: task.title,
        priority: task.priority || 'medium',
        dueDate: task.dueDate || new Date().toISOString().split('T')[0],
        completed: false
      });
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  toggleProjectTask(projectId, taskId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.tasks) {
      const t = proj.tasks.find(tk => tk.id === taskId);
      if (t) {
        t.completed = !t.completed;
        proj.updatedAt = new Date().toISOString().split('T')[0];
        this.saveData();
      }
    }
  }

  deleteProjectTask(projectId, taskId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.tasks) {
      proj.tasks = proj.tasks.filter(tk => tk.id !== taskId);
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  addProjectResource(projectId, res) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.resources) proj.resources = [];
      proj.resources.push({
        id: 'pres-' + Date.now(),
        title: res.title,
        url: res.url,
        type: res.type || 'Doc'
      });
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  deleteProjectResource(projectId, resId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.resources) {
      proj.resources = proj.resources.filter(r => r.id !== resId);
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  addProjectFile(projectId, file) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.galleryFiles) proj.galleryFiles = [];
      proj.galleryFiles.push({
        id: 'file-' + Date.now(),
        name: file.name,
        url: file.url,
        type: file.type || 'Image'
      });
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  deleteProjectFile(projectId, fileId) {
    const proj = this.data.projects.find(p => p.id === projectId);
    if (proj && proj.galleryFiles) {
      proj.galleryFiles = proj.galleryFiles.filter(f => f.id !== fileId);
      proj.updatedAt = new Date().toISOString().split('T')[0];
      this.saveData();
    }
  }

  // ------------ DOMAINS & LEARNING HUB ------------
  addDomain(domain) {
    if (!this.data.domains) this.data.domains = [];
    const newDom = {
      id: 'dom-' + Date.now(),
      name: domain.name,
      icon: domain.icon || 'book-open',
      color: domain.color || 'purple',
      description: domain.description || ''
    };
    this.data.domains.push(newDom);
    this.saveData();
    return newDom;
  }

  updateDomain(id, updates) {
    const dom = this.data.domains.find(d => d.id === id);
    if (dom) {
      const oldName = dom.name;
      Object.assign(dom, updates);
      if (updates.name && updates.name !== oldName) {
        (this.data.learning || []).forEach(t => {
          if (t.domain === oldName) t.domain = updates.name;
        });
      }
      this.saveData();
    }
  }

  deleteDomain(id) {
    const dom = this.data.domains.find(d => d.id === id);
    if (dom) {
      const domName = dom.name;
      this.data.domains = this.data.domains.filter(d => d.id !== id);
      this.data.learning = (this.data.learning || []).filter(t => t.domain !== domName);
      this.saveData();
    }
  }

  addLearningTopic(topic) {
    if (!this.data.learning) this.data.learning = [];
    const newTopic = {
      id: 'learn-' + Date.now(),
      topic: topic.topic,
      domain: topic.domain || 'Computer Science',
      status: topic.status || 'Not Started',
      progress: topic.status === 'Mastered' ? 100 : (topic.status === 'Comfortable' ? 85 : (topic.status === 'Practicing' ? 60 : (topic.status === 'Learning' ? 35 : 0))),
      description: topic.description || '',
      notes: '',
      practiceItems: [],
      resources: [],
      reflection: {
        whatClicked: '',
        whatWasDifficult: '',
        needToLearn: ''
      }
    };
    this.data.learning.unshift(newTopic);
    this.saveData();
    return newTopic;
  }

  updateLearningTopic(id, updates) {
    const topic = this.data.learning.find(l => l.id === id);
    if (topic) {
      Object.assign(topic, updates);
      if (updates.status) {
        const progressMap = {
          'Mastered': 100,
          'Comfortable': 85,
          'Practicing': 60,
          'Learning': 35,
          'Not Started': 0
        };
        if (progressMap[updates.status] !== undefined) {
          topic.progress = progressMap[updates.status];
        }
      }
      this.saveData();
    }
  }

  deleteLearningTopic(id) {
    this.data.learning = this.data.learning.filter(l => l.id !== id);
    if (this.activeTopicId === id) this.activeTopicId = null;
    this.saveData();
  }

  addTopicPracticeItem(topicId, title) {
    const topic = this.data.learning.find(l => l.id === topicId);
    if (topic) {
      if (!topic.practiceItems) topic.practiceItems = [];
      topic.practiceItems.push({
        id: 'tp-' + Date.now(),
        title,
        completed: false
      });
      this.saveData();
    }
  }

  toggleTopicPracticeItem(topicId, itemId) {
    const topic = this.data.learning.find(l => l.id === topicId);
    if (topic && topic.practiceItems) {
      const item = topic.practiceItems.find(p => p.id === itemId);
      if (item) {
        item.completed = !item.completed;
        this.saveData();
      }
    }
  }

  deleteTopicPracticeItem(topicId, itemId) {
    const topic = this.data.learning.find(l => l.id === topicId);
    if (topic && topic.practiceItems) {
      topic.practiceItems = topic.practiceItems.filter(p => p.id !== itemId);
      this.saveData();
    }
  }

  addTopicResource(topicId, res) {
    const topic = this.data.learning.find(l => l.id === topicId);
    if (topic) {
      if (!topic.resources) topic.resources = [];
      topic.resources.push({
        id: 'tr-' + Date.now(),
        title: res.title,
        url: res.url,
        type: res.type || 'Documentation'
      });
      this.saveData();
    }
  }

  deleteTopicResource(topicId, resId) {
    const topic = this.data.learning.find(l => l.id === topicId);
    if (topic && topic.resources) {
      topic.resources = topic.resources.filter(r => r.id !== resId);
      this.saveData();
    }
  }

  // ------------ EXPANDED GLOBAL RESOURCE LIBRARY ------------
  addResource(res) {
    if (!this.data.resources) this.data.resources = [];
    const newRes = {
      id: 'res-' + Date.now(),
      title: res.title,
      category: res.category || 'Custom',
      url: res.url,
      description: res.description || '',
      tags: res.tags || [],
      isPinned: !!res.isPinned,
      isFavorite: !!res.isFavorite
    };
    this.data.resources.unshift(newRes);
    this.saveData();
    return newRes;
  }

  updateResource(id, updates) {
    const res = this.data.resources.find(r => r.id === id);
    if (res) {
      Object.assign(res, updates);
      this.saveData();
    }
  }

  toggleResourcePin(id) {
    const res = this.data.resources.find(r => r.id === id);
    if (res) {
      res.isPinned = !res.isPinned;
      this.saveData();
    }
  }

  toggleResourceFavorite(id) {
    const res = this.data.resources.find(r => r.id === id);
    if (res) {
      res.isFavorite = !res.isFavorite;
      this.saveData();
    }
  }

  deleteResource(id) {
    this.data.resources = this.data.resources.filter(r => r.id !== id);
    this.saveData();
  }

  // ------------ COLLEGE STUDENT FINANCE PLANNING ------------
  toggleFinanceSectionCollapse(sectionKey) {
    if (!this.data.finance.collapsedSections) {
      this.data.finance.collapsedSections = {};
    }
    this.data.finance.collapsedSections[sectionKey] = !this.data.finance.collapsedSections[sectionKey];
    this.saveData();
  }

  // Income Sources
  addIncomeSource(source) {
    if (!this.data.finance.incomeSources) this.data.finance.incomeSources = [];
    this.data.finance.incomeSources.push({
      id: 'inc-' + Date.now(),
      name: source.name,
      amount: parseFloat(source.amount) || 0,
      frequency: source.frequency || 'Monthly',
      status: source.status || 'Active',
      payPeriod: source.payPeriod || '',
      notes: source.notes || ''
    });
    this.saveData();
  }

  updateIncomeSource(id, updates) {
    if (this.data.finance.incomeSources) {
      const inc = this.data.finance.incomeSources.find(i => i.id === id);
      if (inc) {
        Object.assign(inc, updates);
        this.saveData();
      }
    }
  }

  deleteIncomeSource(id) {
    if (this.data.finance.incomeSources) {
      this.data.finance.incomeSources = this.data.finance.incomeSources.filter(i => i.id !== id);
      this.saveData();
    }
  }

  // Budget Categories
  addFinanceCategory(cat) {
    if (!this.data.finance.categories) this.data.finance.categories = [];
    this.data.finance.categories.push({
      id: 'cat-' + Date.now(),
      name: cat.name,
      allocated: parseFloat(cat.allocated) || 0,
      spent: 0
    });
    this.saveData();
  }

  updateFinanceCategory(id, updates) {
    if (this.data.finance.categories) {
      const cat = this.data.finance.categories.find(c => c.id === id || c.name === id);
      if (cat) {
        Object.assign(cat, updates);
        this.saveData();
      }
    }
  }

  deleteFinanceCategory(id) {
    if (this.data.finance.categories) {
      this.data.finance.categories = this.data.finance.categories.filter(c => c.id !== id && c.name !== id);
      this.saveData();
    }
  }

  // Savings Accounts
  updateAccountBalances(balances) {
    if (!this.data.finance.accounts) this.data.finance.accounts = { checking: 0, savings: 0, rothIra: 0 };
    Object.assign(this.data.finance.accounts, balances);
    this.saveData();
  }

  // Scholarships
  addScholarship(sch) {
    if (!this.data.finance.scholarships) this.data.finance.scholarships = [];
    this.data.finance.scholarships.push({
      id: 'sch-' + Date.now(),
      name: sch.name,
      amount: parseFloat(sch.amount) || 0,
      status: sch.status || 'Planning',
      deadline: sch.deadline || '',
      notes: sch.notes || ''
    });
    this.saveData();
  }

  updateScholarship(id, updates) {
    if (this.data.finance.scholarships) {
      const sch = this.data.finance.scholarships.find(s => s.id === id);
      if (sch) {
        Object.assign(sch, updates);
        this.saveData();
      }
    }
  }

  deleteScholarship(id) {
    if (this.data.finance.scholarships) {
      this.data.finance.scholarships = this.data.finance.scholarships.filter(s => s.id !== id);
      this.saveData();
    }
  }

  // Subscriptions
  addSubscription(sub) {
    if (!this.data.finance.subscriptions) this.data.finance.subscriptions = [];
    this.data.finance.subscriptions.push({
      id: 'sub-' + Date.now(),
      name: sub.name,
      cost: parseFloat(sub.cost) || 0,
      cycle: sub.cycle || 'Monthly',
      renewalDate: sub.renewalDate || '',
      category: sub.category || 'Tech',
      active: true
    });
    this.saveData();
  }

  toggleSubscription(id) {
    if (this.data.finance.subscriptions) {
      const sub = this.data.finance.subscriptions.find(s => s.id === id);
      if (sub) {
        sub.active = !sub.active;
        this.saveData();
      }
    }
  }

  deleteSubscription(id) {
    if (this.data.finance.subscriptions) {
      this.data.finance.subscriptions = this.data.finance.subscriptions.filter(s => s.id !== id);
      this.saveData();
    }
  }

  // Big Purchases
  addBigPurchase(bp) {
    if (!this.data.finance.bigPurchases) this.data.finance.bigPurchases = [];
    this.data.finance.bigPurchases.push({
      id: 'bp-' + Date.now(),
      name: bp.name,
      estimatedCost: parseFloat(bp.estimatedCost) || 0,
      amountSaved: parseFloat(bp.amountSaved) || 0,
      targetDate: bp.targetDate || '',
      priority: bp.priority || 'Medium',
      notes: bp.notes || ''
    });
    this.saveData();
  }

  updateBigPurchase(id, updates) {
    if (this.data.finance.bigPurchases) {
      const bp = this.data.finance.bigPurchases.find(b => b.id === id);
      if (bp) {
        Object.assign(bp, updates);
        this.saveData();
      }
    }
  }

  deleteBigPurchase(id) {
    if (this.data.finance.bigPurchases) {
      this.data.finance.bigPurchases = this.data.finance.bigPurchases.filter(b => b.id !== id);
      this.saveData();
    }
  }

  // ------------ WISHLIST ------------
  addWishlistItem(item) {
    const newItem = {
      id: 'wish-' + Date.now(),
      name: item.name,
      category: item.category || 'Tech',
      price: parseFloat(item.price) || 0,
      priority: item.priority || 'medium',
      purchased: false,
      image: item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400',
      link: item.link || '#',
      notes: item.notes || ''
    };
    this.data.wishlist.unshift(newItem);
    this.saveData();
  }

  updateWishlistItem(id, updates) {
    const item = this.data.wishlist.find(w => w.id === id);
    if (item) {
      Object.assign(item, updates);
      this.saveData();
    }
  }

  toggleWishlistPurchased(id) {
    const item = this.data.wishlist.find(w => w.id === id);
    if (item) {
      item.purchased = !item.purchased;
      this.saveData();
    }
  }

  deleteWishlistItem(id) {
    this.data.wishlist = this.data.wishlist.filter(w => w.id !== id);
    this.saveData();
  }

  // ------------ JOURNAL ------------
  setJournalPin(pin) {
    if (pin && pin.trim()) {
      this.data.journalPin = pin.trim();
      this.isJournalUnlocked = true;
    } else {
      delete this.data.journalPin;
      this.isJournalUnlocked = false;
    }
    this.saveData();
  }

  unlockJournal(pin) {
    if (pin && this.data.journalPin && pin.trim() === this.data.journalPin) {
      this.isJournalUnlocked = true;
      this.notify();
      return true;
    }
    return false;
  }

  lockJournal() {
    this.isJournalUnlocked = false;
    this.notify();
  }

  addJournalEntry(entry) {
    const newEntry = {
      id: 'j-' + Date.now(),
      date: entry.date || new Date().toISOString().split('T')[0],
      mood: entry.mood || 'Productive',
      reflection: entry.reflection || '',
      wins: entry.wins || [],
      lessons: entry.lessons || '',
      gratitude: entry.gratitude || ''
    };
    this.data.journal.unshift(newEntry);
    this.saveData();
  }

  // ------------ QUICK CAPTURE ------------
  addQuickCapture(item) {
    const newItem = {
      id: 'qc-' + Date.now(),
      content: item.content,
      type: item.type || 'Note',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      processed: false
    };
    this.data.quickCapture.unshift(newItem);
    this.saveData();
    return newItem;
  }

  deleteQuickCapture(id) {
    this.data.quickCapture = this.data.quickCapture.filter(q => q.id !== id);
    this.saveData();
  }

  convertQuickCaptureToTask(id) {
    const item = this.data.quickCapture.find(q => q.id === id);
    if (item) {
      this.addTask({
        title: item.content,
        priority: 'medium',
        category: 'Personal'
      });
      this.deleteQuickCapture(id);
    }
  }

  convertQuickCaptureToResource(id) {
    const item = this.data.quickCapture.find(q => q.id === id);
    if (item) {
      if (!this.data.resources) this.data.resources = [];
      const cleanUrl = item.content.startsWith('http') ? item.content : 'https://' + item.content;
      this.data.resources.unshift({
        id: 'res-' + Date.now(),
        title: item.content.length > 30 ? item.content.substring(0, 30) + '...' : item.content,
        url: cleanUrl,
        category: 'Bookmarks & Quick Links',
        description: 'Captured via Quick Add',
        isPinned: true
      });
      this.deleteQuickCapture(id);
    }
  }

  convertQuickCaptureToGoal(id) {
    const item = this.data.quickCapture.find(q => q.id === id);
    if (item) {
      if (!this.data.goals) this.data.goals = [];
      this.data.goals.unshift({
        id: 'goal-' + Date.now(),
        title: item.content,
        horizon: 'This Term',
        category: 'Personal & Career',
        status: 'In Progress',
        progress: 10,
        milestones: [{ id: 'm-1', title: 'Initial setup', completed: false }]
      });
      this.deleteQuickCapture(id);
    }
  }

  updateStickyNote(note) {
    this.data.stickyNote = note;
    this.saveData();
  }

  exportBackup() {
    const jsonStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life_os_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonData) {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed && parsed.tasks) {
        this.data = parsed;
        this.saveData();
        return true;
      }
    } catch (e) {
      console.error('Failed to import backup:', e);
    }
    return false;
  }

  clearAllData() {
    this.data = JSON.parse(JSON.stringify(SEED_DATA));
    this.saveData();
  }
}

export const store = new Store();
