import { store } from '../store.js';

export function renderProjects(container) {
  const { activeProjectId } = store;

  if (activeProjectId) {
    renderProjectWorkspace(container, activeProjectId);
  } else {
    renderProjectsList(container);
  }
}

// ----------------------------------------------------
// 1. PROJECTS LIST VIEW
// ----------------------------------------------------
function renderProjectsList(container) {
  const { data } = store;
  const projects = data.projects || [];

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Header Controls -->
      <div class="flex items-center justify-between glass-card p-4">
        <div class="flex items-center gap-2">
          <i data-lucide="folder-kanban" class="w-5 h-5 text-purple-400"></i>
          <h2 class="font-bold text-base text-text">Central Projects Workspace</h2>
        </div>

        <button id="add-project-btn" class="btn btn-primary text-xs">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Create Project</span>
        </button>
      </div>

      <!-- Projects Grid -->
      ${projects.length === 0 ? `
        <div class="glass-card p-12 text-center text-text-subtle text-sm space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <i data-lucide="layers" class="w-6 h-6"></i>
          </div>
          <p class="font-semibold text-text">No active project workspaces yet.</p>
          <p class="text-xs text-text-subtle">Projects act as your central hub for everything you build throughout college.</p>
          <button id="empty-add-proj-btn" class="btn btn-primary text-xs mt-2">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Create Your First Project</span>
          </button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${projects.map(p => renderProjectCard(p)).join('')}
        </div>
      `}

    </div>
  `;

  // Attach Events
  container.querySelector('#add-project-btn')?.addEventListener('click', openCreateProjectModal);
  container.querySelector('#empty-add-proj-btn')?.addEventListener('click', openCreateProjectModal);

  container.querySelectorAll('[data-open-workspace]').forEach(card => {
    card.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-open-workspace');
      store.setActiveProjectId(id);
    });
  });

  container.querySelectorAll('[data-delete-proj]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-delete-proj');
      store.deleteProject(id);
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderProjectCard(p) {
  let totalTasks = (p.tasks ? p.tasks.length : 0);
  let completedTasks = (p.tasks ? p.tasks.filter(t => t.completed).length : 0);

  if (p.milestones) {
    p.milestones.forEach(m => {
      if (m.tasks) {
        totalTasks += m.tasks.length;
        completedTasks += m.tasks.filter(t => t.completed).length;
      }
    });
  }

  const calcProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (p.progress || 0);

  const statusColors = {
    'Planning': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'In Progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Paused': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Archived': 'bg-white/10 text-text-subtle border-border'
  };

  return `
    <div 
      data-open-workspace="${p.id}"
      class="glass-card p-6 space-y-4 flex flex-col justify-between cursor-pointer hover:border-accent/50 transition-all duration-200 group"
    >
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <div class="space-y-1 min-w-0 pr-2">
            <span class="badge text-xs ${statusColors[p.status] || ''}">${p.status}</span>
            <h3 class="text-base font-bold text-text group-hover:text-accent transition-colors truncate">${p.title}</h3>
          </div>
          <button data-delete-proj="${p.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger flex-shrink-0" title="Delete Project">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>

        ${p.description ? `<p class="text-xs text-text-subtle leading-relaxed line-clamp-2">${p.description}</p>` : ''}
      </div>

      <div class="space-y-3 pt-3 border-t border-border">
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-text-subtle text-[10px] font-semibold">Progress</span>
            <span class="font-bold text-accent font-mono">${calcProgress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${calcProgress}%"></div>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-text-subtle font-mono pt-1">
          <span>Deadline: ${p.deadline || 'None'}</span>
          <span class="text-accent font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Open Workspace →
          </span>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// 2. DEDICATED TABBED PROJECT WORKSPACE VIEW
// ----------------------------------------------------
let activeWorkspaceTab = 'overview'; // 'overview', 'milestones', 'resources', 'gallery', 'reflection'

function renderProjectWorkspace(container, id) {
  const { data } = store;
  const project = (data.projects || []).find(p => p.id === id);

  if (!project) {
    store.setActiveProjectId(null);
    return;
  }

  let totalTasks = (project.tasks ? project.tasks.length : 0);
  let completedTasks = (project.tasks ? project.tasks.filter(t => t.completed).length : 0);

  if (project.milestones) {
    project.milestones.forEach(m => {
      if (m.tasks) {
        totalTasks += m.tasks.length;
        completedTasks += m.tasks.filter(t => t.completed).length;
      }
    });
  }

  const calcProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : (project.progress || 0);

  const statusColors = {
    'Planning': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'In Progress': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Paused': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Completed': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Archived': 'bg-white/10 text-text-subtle border-border'
  };

  const tabs = [
    { id: 'overview', label: '🎯 Overview & Objective', icon: 'target' },
    { id: 'milestones', label: '📝 Milestones & Tasks', icon: 'check-square', badge: totalTasks },
    { id: 'resources', label: '📚 Resources & Links', icon: 'book-open', badge: project.resources ? project.resources.length : 0 },
    { id: 'gallery', label: '📸 Gallery & Files', icon: 'image', badge: project.galleryFiles ? project.galleryFiles.length : 0 },
    { id: 'reflection', label: '🪞 Reflection', icon: 'feather' }
  ];

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in pb-20">
      
      <!-- Top Navigation & Global Save Bar -->
      <div class="flex items-center justify-between">
        <button id="back-to-projects-btn" class="btn btn-ghost text-xs text-text-subtle hover:text-text flex items-center gap-2">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back to Projects List</span>
        </button>

        <div class="flex items-center gap-3">
          <button data-save-entire-workspace="${project.id}" class="btn btn-primary text-xs shadow-lg shadow-indigo-500/20">
            <i data-lucide="save" class="w-4 h-4"></i>
            <span>Save Workspace</span>
          </button>

          <button id="edit-proj-details-btn" class="btn btn-secondary text-xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit Project Details</span>
          </button>

          <button id="delete-workspace-proj-btn" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Project">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- 📌 Clean Project Header Banner -->
      <div class="glass-card p-6 border-purple-500/30 bg-gradient-to-r from-purple-950/20 via-bg-card to-bg-card">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge text-xs ${statusColors[project.status] || ''}">${project.status}</span>
              <span class="text-xs text-text-subtle font-mono">Created: ${project.createdAt || 'N/A'}</span>
              <span class="text-xs text-text-subtle font-mono">• Updated: ${project.updatedAt || 'N/A'}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-text">${project.title}</h1>
            ${project.description ? `<p class="text-sm text-text-muted leading-relaxed">${project.description}</p>` : ''}
          </div>

          <div class="w-full md:w-64 space-y-2 flex-shrink-0 bg-white/5 p-4 rounded-xl border border-border">
            <div class="flex items-center justify-between text-xs">
              <span class="text-text-subtle font-semibold">Overall Progress</span>
              <span class="font-bold text-accent font-mono">${calcProgress}%</span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${calcProgress}%"></div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-text-subtle font-mono pt-1">
              <span>Target Deadline:</span>
              <span class="text-text font-medium">${project.deadline || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Workspace Navigation Tabs Bar -->
      <div class="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-border overflow-x-auto">
        ${tabs.map(tab => {
          const isActive = activeWorkspaceTab === tab.id;
          return `
            <button 
              data-ws-tab="${tab.id}"
              class="btn ${isActive ? 'btn-primary' : 'btn-ghost'} text-xs py-2 px-4 flex items-center gap-2 font-medium"
            >
              <span>${tab.label}</span>
              ${tab.badge !== undefined && tab.badge > 0 ? `<span class="badge text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-text-subtle'}">${tab.badge}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Tab View Content Rendering -->
      <div id="tab-view-container" class="animate-fade-in">
        ${renderWorkspaceTabContent(project, activeWorkspaceTab, completedTasks, totalTasks, data)}
      </div>

      <!-- Bottom Global Save Bar -->
      <div class="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-purple-950/20 via-bg-card to-bg-card border-purple-500/30">
        <span class="text-xs text-text-subtle font-medium">Finished editing notes or reflection?</span>
        
        <button data-save-entire-workspace="${project.id}" class="btn btn-primary text-xs shadow-lg shadow-indigo-500/20">
          <i data-lucide="save" class="w-4 h-4"></i>
          <span>Save Workspace Changes</span>
        </button>
      </div>

    </div>
  `;

  // Attach Navigation & Tab Listeners
  container.querySelector('#back-to-projects-btn')?.addEventListener('click', () => {
    store.setActiveProjectId(null);
  });

  container.querySelectorAll('[data-ws-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeWorkspaceTab = e.currentTarget.getAttribute('data-ws-tab');
      renderProjectWorkspace(container, id);
    });
  });

  container.querySelectorAll('[data-save-entire-workspace]').forEach(btn => {
    btn.addEventListener('click', () => {
      saveEntireWorkspace(id);
    });
  });

  container.querySelector('#edit-proj-details-btn')?.addEventListener('click', () => {
    openEditProjectModal(project);
  });

  container.querySelector('#delete-workspace-proj-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this project workspace?')) {
      store.deleteProject(id);
    }
  });

  attachWorkspaceTabEvents(container, project, id);

  if (window.lucide) window.lucide.createIcons();
}

// ----------------------------------------------------
// TAB CONTENT RENDERER
// ----------------------------------------------------
function renderWorkspaceTabContent(project, activeTab, completedTasks, totalTasks, data) {
  if (activeTab === 'overview') {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2 space-y-8">
          <!-- 🎯 Objective Section -->
          <div class="glass-card p-6 space-y-3">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="text-base font-bold text-text flex items-center gap-2">
                <span>🎯 Objective</span>
              </h3>
              <span class="text-xs text-text-subtle">What am I building and why?</span>
            </div>
            <textarea 
              id="proj-objective-input"
              rows="4" 
              class="w-full input-field resize-none text-sm leading-relaxed"
              placeholder="Explain what you are building, key goals, and why it matters..."
            >${project.objective || ''}</textarea>
          </div>

          <!-- 💡 Ideas & Free-form Notes Section -->
          <div class="glass-card p-6 space-y-3 bg-amber-950/15 border-amber-500/30">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-base text-amber-400 flex items-center gap-2">
                <i data-lucide="lightbulb" class="w-5 h-5"></i>
                <span>💡 Ideas & Free-form Notes</span>
              </h3>
              <span class="text-[10px] text-text-subtle">Brainstorm without leaving project</span>
            </div>
            <textarea 
              id="proj-ideas-input"
              rows="5" 
              class="w-full bg-transparent border-none text-text text-xs leading-relaxed focus:outline-none resize-none placeholder-text-subtle font-sans"
              placeholder="Brainstorm technical ideas, pin wiring concepts, or write scratchpad notes..."
            >${project.ideasNotes || ''}</textarea>
          </div>
        </div>

        <div class="space-y-8">
          <!-- 📈 Timeline Summary -->
          <div class="glass-card p-6 space-y-3">
            <h3 class="font-bold text-sm text-text flex items-center gap-2">
              <span>📈 Project Timeline Summary</span>
            </h3>
            <div class="space-y-2 text-xs text-text-subtle">
              <div class="flex items-center justify-between">
                <span>Created Date:</span>
                <span class="font-mono text-text">${project.createdAt || 'N/A'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Last Modified:</span>
                <span class="font-mono text-text">${project.updatedAt || 'N/A'}</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Total Actionable Tasks:</span>
                <span class="font-mono text-accent font-bold">${completedTasks}/${totalTasks} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'milestones') {
    return `
      <div class="space-y-8">
        <!-- 📝 Milestones (Phases) -->
        <div class="glass-card p-6 space-y-6">
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 class="font-bold text-base text-text">📝 Milestones (Major Checkpoints & Phases)</h3>
              <p class="text-xs text-text-subtle">Break your project into major phases (e.g. Phase 1 – Learn Arduino, Phase 2 – Simulation)</p>
            </div>
            <button id="add-phase-btn" class="btn btn-secondary text-xs flex-shrink-0">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Add Phase</span>
            </button>
          </div>

          ${(!project.milestones || project.milestones.length === 0) ? `
            <div class="py-8 text-center space-y-2">
              <p class="text-xs text-text-subtle">No milestone phases created. Click "+ Add Phase" to define your project checkpoints!</p>
            </div>
          ` : `
            <div class="space-y-4">
              ${project.milestones.map((m, mIndex) => {
                const mTasks = m.tasks || [];
                const mDone = mTasks.filter(t => t.completed).length;
                return `
                  <div class="p-4 rounded-xl bg-white/5 border border-border space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-border">
                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-0.5">
                          <button data-move-phase-up="${m.id}" class="text-text-subtle hover:text-accent p-1" title="Move Up" ${mIndex === 0 ? 'disabled class="opacity-30"' : ''}>▲</button>
                          <button data-move-phase-down="${m.id}" class="text-text-subtle hover:text-accent p-1" title="Move Down" ${mIndex === project.milestones.length - 1 ? 'disabled class="opacity-30"' : ''}>▼</button>
                        </div>

                        <span class="font-bold text-sm text-text flex items-center gap-1.5">
                          <span>🚩</span>
                          <span>${m.phaseTitle}</span>
                        </span>

                        <button data-rename-phase="${m.id}" class="text-text-subtle hover:text-accent p-1" title="Edit Phase Title">
                          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>

                      <div class="flex items-center gap-2">
                        <span class="text-xs text-text-subtle font-mono">${mDone}/${mTasks.length} Done</span>
                        <button data-delete-phase="${m.id}" class="text-text-subtle hover:text-danger p-1" title="Delete Phase">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </div>

                    <div class="space-y-1.5">
                      ${mTasks.map((t, tIndex) => `
                        <div class="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs transition-colors group/item">
                          <div class="flex items-center gap-2 min-w-0 flex-1">
                            <div class="flex items-center gap-0.5 text-[10px]">
                              <button data-move-item-up="${m.id}:${t.id}" class="text-text-subtle hover:text-accent px-0.5" title="Move Up" ${tIndex === 0 ? 'disabled class="opacity-30"' : ''}>▲</button>
                              <button data-move-item-down="${m.id}:${t.id}" class="text-text-subtle hover:text-accent px-0.5" title="Move Down" ${tIndex === mTasks.length - 1 ? 'disabled class="opacity-30"' : ''}>▼</button>
                            </div>

                            <div 
                              data-toggle-pm-task="${m.id}:${t.id}"
                              class="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                            >
                              <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-3.5 h-3.5 rounded text-accent cursor-pointer" readonly />
                              <span class="${t.completed ? 'line-through text-text-subtle' : 'text-text font-medium'} truncate">${t.title}</span>
                            </div>
                          </div>

                          <div class="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button data-rename-item="${m.id}:${t.id}" class="text-text-subtle hover:text-accent p-0.5" title="Edit Item">
                              <i data-lucide="edit-2" class="w-3 h-3"></i>
                            </button>
                            <button data-delete-pm-task="${m.id}:${t.id}" class="text-text-subtle hover:text-danger p-0.5" title="Delete Item">
                              <i data-lucide="x" class="w-3.5 h-3.5"></i>
                            </button>
                          </div>
                        </div>
                      `).join('')}
                    </div>

                    <form data-add-pm-task-form="${m.id}" class="flex items-center gap-2 pt-2 border-t border-border/50">
                      <input type="text" placeholder="+ Add item to ${m.phaseTitle}..." class="input-field text-xs py-1 px-2.5" required />
                      <button type="submit" class="btn btn-secondary text-xs py-1 px-3">Add</button>
                    </form>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- ⚡ Focused Action Tasks -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 class="font-bold text-base text-text flex items-center gap-2">
                <span>⚡ Active Action Tasks (Current Focus)</span>
              </h3>
              <p class="text-xs text-text-subtle">Keep this list short (next 3-5 immediate steps) to stay focused without feeling overwhelmed.</p>
            </div>
          </div>

          <form id="add-proj-task-form" class="flex items-center gap-2">
            <input id="pt-title" type="text" placeholder="Add an immediate next action..." class="input-field text-xs py-1.5 px-3" required />
            <select id="pt-priority" class="input-field text-xs py-1.5 px-2.5 w-auto capitalize">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
            <button type="submit" class="btn btn-primary text-xs">Add Action</button>
          </form>

          <div class="space-y-2 pt-2">
            ${(!project.tasks || project.tasks.length === 0) ? `
              <p class="text-xs text-text-subtle py-4 text-center">No active action tasks. Add the next step you're working on right now!</p>
            ` : project.tasks.map(t => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
                <div 
                  data-toggle-proj-task="${t.id}"
                  class="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                >
                  <input type="checkbox" ${t.completed ? 'checked' : ''} class="w-4 h-4 rounded text-accent cursor-pointer" readonly />
                  <span class="${t.completed ? 'line-through text-text-subtle' : 'text-text font-medium'} truncate">${t.title}</span>
                  <span class="badge badge-${t.priority}">${t.priority}</span>
                </div>
                <button data-delete-proj-task="${t.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'resources') {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- 📚 Resources Section -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>📚 Project Resources</span>
            </h3>
            <button id="add-proj-res-btn" class="btn btn-secondary text-xs">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Add Resource</span>
            </button>
          </div>

          ${(!project.resources || project.resources.length === 0) ? `
            <p class="text-xs text-text-subtle text-center py-8">No resources attached yet (YouTube, GitHub, Docs, PDFs).</p>
          ` : `
            <div class="space-y-2">
              ${project.resources.map(r => `
                <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
                  <div class="flex items-center gap-2.5 min-w-0 pr-2">
                    <span class="badge text-[10px] bg-accent/15 text-accent">${r.type}</span>
                    <a href="${r.url}" target="_blank" class="font-medium text-text hover:text-accent truncate">${r.title}</a>
                  </div>
                  <button data-delete-proj-res="${r.id}" class="text-text-subtle hover:text-danger p-1">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- 🔗 Related Items Section -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>🔗 Connected Goals & Learning</span>
            </h3>
          </div>

          <div class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Connected Goal</label>
              <select id="rel-goal-select" class="input-field text-xs">
                <option value="">-- None Selected --</option>
                ${(data.goals || []).map(g => `<option value="${g.title}" ${(project.relatedGoals || []).includes(g.title) ? 'selected' : ''}>Goal: ${g.title}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Connected Learning Topic</label>
              <select id="rel-learn-select" class="input-field text-xs">
                <option value="">-- None Selected --</option>
                ${(data.learning || []).map(l => `<option value="${l.topic}" ${(project.relatedLearning || []).includes(l.topic) ? 'selected' : ''}>Topic: ${l.topic}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (activeTab === 'gallery') {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <h3 class="font-bold text-base text-text flex items-center gap-2">
            <span>📸 Gallery / Attached Files</span>
          </h3>
          <button id="add-file-btn" class="btn btn-secondary text-xs">
            <i data-lucide="upload" class="w-3.5 h-3.5"></i>
            <span>Attach File</span>
          </button>
        </div>

        ${(!project.galleryFiles || project.galleryFiles.length === 0) ? `
          <p class="text-xs text-text-subtle text-center py-12">No images, diagrams, or CAD files attached yet.</p>
        ` : `
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${project.galleryFiles.map(f => `
              <div class="p-3 rounded-xl bg-white/5 border border-border text-xs relative group/file space-y-2">
                <span class="badge text-[10px] bg-white/10 text-text-subtle block">${f.type}</span>
                <span class="font-medium text-text block truncate">${f.name}</span>
                <button data-delete-file="${f.id}" class="absolute top-2 right-2 text-text-subtle hover:text-danger p-0.5 opacity-0 group-hover/file:opacity-100 transition-opacity">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  if (activeTab === 'reflection') {
    return `
      <div class="glass-card p-6 space-y-4 max-w-3xl">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <h3 class="font-bold text-base text-text flex items-center gap-2">
            <span>🪞 Project Reflection</span>
          </h3>
          <span class="text-xs text-text-subtle">Document lessons learned & portfolio summary</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What I Learned</label>
            <textarea id="ref-learned" rows="3" class="input-field text-xs resize-none" placeholder="Key takeaways...">${(project.reflection && project.reflection.whatILearned) || ''}</textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What Went Well</label>
            <textarea id="ref-well" rows="3" class="input-field text-xs resize-none" placeholder="Highlights...">${(project.reflection && project.reflection.whatWentWell) || ''}</textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What I Would Improve</label>
            <textarea id="ref-improve" rows="3" class="input-field text-xs resize-none" placeholder="Future enhancements...">${(project.reflection && project.reflection.whatIWouldImprove) || ''}</textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Portfolio Summary</label>
            <textarea id="ref-summary" rows="3" class="input-field text-xs resize-none" placeholder="Short description for resume/portfolio...">${(project.reflection && project.reflection.portfolioSummary) || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// ----------------------------------------------------
// TAB EVENTS ATTACHER
// ----------------------------------------------------
function attachWorkspaceTabEvents(container, project, id) {
  container.querySelector('#add-phase-btn')?.addEventListener('click', () => openAddPhaseModal(id));

  container.querySelectorAll('[data-move-phase-up]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phaseId = e.currentTarget.getAttribute('data-move-phase-up');
      store.moveProjectMilestonePhase(id, phaseId, 'up');
    });
  });

  container.querySelectorAll('[data-move-phase-down]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phaseId = e.currentTarget.getAttribute('data-move-phase-down');
      store.moveProjectMilestonePhase(id, phaseId, 'down');
    });
  });

  container.querySelectorAll('[data-rename-phase]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phaseId = e.currentTarget.getAttribute('data-rename-phase');
      const phase = project.milestones.find(m => m.id === phaseId);
      if (phase) {
        const newTitle = prompt('Edit Phase Title:', phase.phaseTitle);
        if (newTitle && newTitle.trim()) {
          store.renameProjectMilestonePhase(id, phaseId, newTitle.trim());
        }
      }
    });
  });

  container.querySelectorAll('[data-move-item-up]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [phaseId, taskId] = e.currentTarget.getAttribute('data-move-item-up').split(':');
      store.moveProjectMilestoneTask(id, phaseId, taskId, 'up');
    });
  });

  container.querySelectorAll('[data-move-item-down]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [phaseId, taskId] = e.currentTarget.getAttribute('data-move-item-down').split(':');
      store.moveProjectMilestoneTask(id, phaseId, taskId, 'down');
    });
  });

  container.querySelectorAll('[data-rename-item]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [phaseId, taskId] = e.currentTarget.getAttribute('data-rename-item').split(':');
      const phase = project.milestones.find(m => m.id === phaseId);
      if (phase && phase.tasks) {
        const item = phase.tasks.find(tk => tk.id === taskId);
        if (item) {
          const newTitle = prompt('Edit Item Title:', item.title);
          if (newTitle && newTitle.trim()) {
            store.renameProjectMilestoneTask(id, phaseId, taskId, newTitle.trim());
          }
        }
      }
    });
  });

  container.querySelectorAll('[data-toggle-pm-task]').forEach(el => {
    el.addEventListener('click', (e) => {
      const [phaseId, taskId] = e.currentTarget.getAttribute('data-toggle-pm-task').split(':');
      store.toggleProjectMilestoneTask(id, phaseId, taskId);
    });
  });

  container.querySelectorAll('[data-delete-pm-task]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [phaseId, taskId] = e.currentTarget.getAttribute('data-delete-pm-task').split(':');
      store.deleteProjectMilestoneTask(id, phaseId, taskId);
    });
  });

  container.querySelectorAll('[data-delete-phase]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const phaseId = e.currentTarget.getAttribute('data-delete-phase');
      store.deleteProjectMilestonePhase(id, phaseId);
    });
  });

  container.querySelectorAll('[data-add-pm-task-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const phaseId = e.currentTarget.getAttribute('data-add-pm-task-form');
      const input = e.currentTarget.querySelector('input');
      const taskTitle = input.value.trim();
      if (taskTitle) {
        store.addProjectMilestoneTask(id, phaseId, taskTitle);
        input.value = '';
      }
    });
  });

  container.querySelector('#add-proj-task-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('pt-title').value.trim();
    const priority = document.getElementById('pt-priority').value;
    if (title) {
      store.addProjectTask(id, { title, priority });
      document.getElementById('pt-title').value = '';
    }
  });

  container.querySelectorAll('[data-toggle-proj-task]').forEach(el => {
    el.addEventListener('click', (e) => {
      const taskId = e.currentTarget.getAttribute('data-toggle-proj-task');
      store.toggleProjectTask(id, taskId);
    });
  });

  container.querySelectorAll('[data-delete-proj-task]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.currentTarget.getAttribute('data-delete-proj-task');
      store.deleteProjectTask(id, taskId);
    });
  });

  container.querySelector('#add-proj-res-btn')?.addEventListener('click', () => openAddProjResModal(id));
  container.querySelectorAll('[data-delete-proj-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const resId = e.currentTarget.getAttribute('data-delete-proj-res');
      store.deleteProjectResource(id, resId);
    });
  });

  container.querySelector('#rel-goal-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    store.updateProject(id, { relatedGoals: val ? [val] : [] });
  });

  container.querySelector('#rel-learn-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    store.updateProject(id, { relatedLearning: val ? [val] : [] });
  });

  container.querySelector('#add-file-btn')?.addEventListener('click', () => openAddFileModal(id));
  container.querySelectorAll('[data-delete-file]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const fileId = e.currentTarget.getAttribute('data-delete-file');
      store.deleteProjectFile(id, fileId);
    });
  });
}

function saveEntireWorkspace(projectId) {
  const objective = document.getElementById('proj-objective-input')?.value;
  const ideasNotes = document.getElementById('proj-ideas-input')?.value;
  
  const updates = {};
  if (objective !== undefined) updates.objective = objective;
  if (ideasNotes !== undefined) updates.ideasNotes = ideasNotes;

  const learned = document.getElementById('ref-learned')?.value;
  if (learned !== undefined) {
    updates.reflection = {
      whatILearned: document.getElementById('ref-learned')?.value || '',
      whatWentWell: document.getElementById('ref-well')?.value || '',
      whatIWouldImprove: document.getElementById('ref-improve')?.value || '',
      portfolioSummary: document.getElementById('ref-summary')?.value || ''
    };
  }

  store.updateProject(projectId, updates);
  alert('Workspace saved successfully!');
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function openCreateProjectModal() {
  const modalHTML = `
    <div id="project-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Create Project Workspace</h3>
          <button id="p-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-project-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Project Title *</label>
            <input id="p-title" type="text" class="input-field" placeholder="e.g. Arduino Smart Mirror" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="p-desc" rows="2" class="input-field resize-none" placeholder="Brief summary of the project..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Status</label>
              <select id="p-status" class="input-field">
                <option value="Planning" selected>Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Target Deadline (optional)</label>
              <input id="p-deadline" type="date" class="input-field" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Open Dedicated Workspace</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('project-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'project-modal') modal.remove(); });
  document.getElementById('p-modal-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-project-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProj = store.addProject({
      title: document.getElementById('p-title').value,
      description: document.getElementById('p-desc').value,
      status: document.getElementById('p-status').value,
      deadline: document.getElementById('p-deadline').value
    });
    modal.remove();
    store.setActiveProjectId(newProj.id);
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditProjectModal(project) {
  const modalHTML = `
    <div id="edit-proj-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Edit Project Details</h3>
          <button id="ep-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-proj-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Project Title *</label>
            <input id="ep-title" type="text" class="input-field" value="${project.title}" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="ep-desc" rows="2" class="input-field resize-none">${project.description || ''}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Status</label>
              <select id="ep-status" class="input-field">
                <option value="Planning" ${project.status === 'Planning' ? 'selected' : ''}>Planning</option>
                <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Paused" ${project.status === 'Paused' ? 'selected' : ''}>Paused</option>
                <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                <option value="Archived" ${project.status === 'Archived' ? 'selected' : ''}>Archived</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Target Deadline</label>
              <input id="ep-deadline" type="date" class="input-field" value="${project.deadline || ''}" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Save Changes</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-proj-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-proj-modal') modal.remove(); });
  document.getElementById('ep-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-proj-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateProject(project.id, {
      title: document.getElementById('ep-title').value,
      description: document.getElementById('ep-desc').value,
      status: document.getElementById('ep-status').value,
      deadline: document.getElementById('ep-deadline').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddPhaseModal(projectId) {
  const modalHTML = `
    <div id="phase-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">New Milestone Phase</h3>
          <button id="phase-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-phase-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Phase Title *</label>
            <input id="phase-name" type="text" class="input-field" placeholder="e.g. Phase 1 – Learn Arduino" required autofocus />
          </div>

          <button type="submit" class="btn btn-primary w-full text-xs">
            <span>Add Phase</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('phase-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'phase-modal') modal.remove(); });
  document.getElementById('phase-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-phase-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('phase-name').value.trim();
    if (title) {
      store.addProjectMilestonePhase(projectId, title);
      modal.remove();
    }
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddProjResModal(projectId) {
  const modalHTML = `
    <div id="proj-res-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">Add Project Resource</h3>
          <button id="pres-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-pres-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Resource Title *</label>
            <input id="pres-title" type="text" class="input-field" placeholder="e.g. Arduino Wiring Guide" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">URL Link *</label>
            <input id="pres-url" type="url" class="input-field" placeholder="https://..." required />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Type</label>
            <select id="pres-type" class="input-field">
              <option value="GitHub">GitHub</option>
              <option value="Doc" selected>Documentation</option>
              <option value="YouTube">YouTube Video</option>
              <option value="Article">Article</option>
              <option value="PDF">PDF</option>
              <option value="Note">Note</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-full text-xs">
            <span>Attach Resource</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('proj-res-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'proj-res-modal') modal.remove(); });
  document.getElementById('pres-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-pres-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addProjectResource(projectId, {
      title: document.getElementById('pres-title').value,
      url: document.getElementById('pres-url').value,
      type: document.getElementById('pres-type').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddFileModal(projectId) {
  const modalHTML = `
    <div id="file-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">Attach File / Diagram</h3>
          <button id="file-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-file-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">File Name *</label>
            <input id="file-name" type="text" class="input-field" placeholder="e.g. circuit_schematic.png" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Type</label>
            <select id="file-type" class="input-field">
              <option value="Diagram" selected>Wiring Diagram</option>
              <option value="Screenshot">Screenshot</option>
              <option value="Image">Image</option>
              <option value="PDF">PDF Document</option>
              <option value="CAD">CAD File</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary w-full text-xs">
            <span>Attach File</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('file-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'file-modal') modal.remove(); });
  document.getElementById('file-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-file-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addProjectFile(projectId, {
      name: document.getElementById('file-name').value,
      type: document.getElementById('file-type').value,
      url: '#'
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}
