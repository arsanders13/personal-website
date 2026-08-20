import { store } from '../store.js';

export function renderTasks(container) {
  try {
    const { data } = store;
    let currentView = 'list'; // 'list' | 'kanban'
    let selectedCategory = 'All';
    let selectedPriority = 'All';
    let selectedProject = 'All';
    let selectedGoal = 'All';
    let activeQuickFilter = 'all'; // 'all' | 'today' | 'upcoming' | 'overdue' | 'high'
    let searchQuery = '';

    // Pomodoro Focus Timer State
    let focusTask = null;
    let focusSeconds = 1500; // 25 mins
    let focusTimerId = null;

    function renderView() {
      const todayStr = new Date().toISOString().split('T')[0];
      let filteredTasks = (Array.isArray(data.tasks) ? data.tasks : []).filter(t => t && typeof t === 'object' && t.id);

      // Sort all tasks & events strictly in chronological order by date
      filteredTasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });

      // Quick Filter Tabs Logic
      if (activeQuickFilter === 'today') {
        filteredTasks = filteredTasks.filter(t => t.dueDate === todayStr && t.status !== 'done');
      } else if (activeQuickFilter === 'upcoming') {
        filteredTasks = filteredTasks.filter(t => t.dueDate && t.dueDate > todayStr && t.status !== 'done');
      } else if (activeQuickFilter === 'events') {
        filteredTasks = filteredTasks.filter(t => t.sourceTag === 'Campus Events' || t.sourceTag === 'OSU Honors' || t.category === 'Clubs');
      } else if (activeQuickFilter === 'overdue') {
        filteredTasks = filteredTasks.filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done');
      } else if (activeQuickFilter === 'high') {
        filteredTasks = filteredTasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status !== 'done');
      }

      // Dropdown Filters
      if (selectedCategory !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.category === selectedCategory);
      }
      if (selectedPriority !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.priority === selectedPriority);
      }
      if (selectedProject !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.projectId === selectedProject);
      }
      if (selectedGoal !== 'All') {
        filteredTasks = filteredTasks.filter(t => t.goalId === selectedGoal);
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredTasks = filteredTasks.filter(t => t.title && (t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))));
      }

      const categories = ['All', 'Personal', 'Errands', 'Career', 'Clubs', 'Shopping', 'Other'];
      const priorities = ['All', 'urgent', 'high', 'medium', 'low'];
      const projects = data.projects || [];
      const goals = data.goals || [];
      const quickCaptureItems = data.quickCapture || [];

      container.innerHTML = `
        <div class="space-y-6 animate-fade-in pb-12">
          
          <!-- Header Banner -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between glass-card p-6 gap-4 bg-gradient-to-r from-amber-500/10 via-bg-card to-indigo-950/20 border-amber-500/20">
            <div class="space-y-1">
              <h2 class="text-xl font-extrabold text-text flex items-center gap-2">
                <span>Tasks & Campus Events Schedule</span>
                <span class="badge bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono text-xs">${filteredTasks.length} items</span>
              </h2>
              <p class="text-xs text-text-subtle">Chronologically ordered campus events, parties, meetups, and action items.</p>
            </div>

            <button id="add-task-btn" class="btn btn-primary text-xs py-2 px-4 shadow-lg shadow-amber-500/20">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ New Event / Task</span>
            </button>
          </div>

          <!-- Quick Capture Notes Inbox (if items exist) -->
          ${quickCaptureItems.length > 0 ? `
            <div class="glass-card p-4 bg-amber-500/10 border-amber-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-amber-700 dark:text-amber-400 font-bold text-xs">📥 Brain Dump Inbox (${quickCaptureItems.length})</span>
                </div>
                <span class="text-[11px] text-text-subtle">Click "⚡ Convert" to save as a Task!</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                ${quickCaptureItems.map(item => `
                  <div class="p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-border flex items-center justify-between gap-2 text-xs">
                    <span class="text-text font-medium truncate">${item.content}</span>
                    <button data-tasks-convert-qc="${item.id}" class="btn btn-secondary text-[10px] py-0.5 px-2 text-accent flex-shrink-0">
                      ⚡ Convert
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Pomodoro Bar (if active) -->
          ${focusTask ? `
            <div class="glass-card p-4 bg-emerald-950/20 border-emerald-500/40 flex items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold animate-pulse">
                  <i data-lucide="timer" class="w-4 h-4"></i>
                </div>
                <div>
                  <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Active Focus Session</div>
                  <div class="text-xs font-bold text-text">${focusTask.title}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-xl font-black font-mono text-emerald-400">
                  ${Math.floor(focusSeconds / 60).toString().padStart(2, '0')}:${(focusSeconds % 60).toString().padStart(2, '0')}
                </div>
                <button id="stop-focus-btn" class="btn btn-ghost text-xs text-danger px-2 py-1">Stop</button>
              </div>
            </div>
          ` : ''}

          <!-- View Switcher & Smart Filter Bar -->
          <div class="space-y-4">
            
            <!-- Quick Filter Tabs -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button data-filter-tab="all" class="btn ${activeQuickFilter === 'all' ? 'btn-primary' : 'btn-ghost'} py-1.5 px-3 text-xs">All Items (In Order)</button>
              <button data-filter-tab="events" class="btn ${activeQuickFilter === 'events' ? 'btn-primary' : 'btn-ghost'} py-1.5 px-3 text-xs flex items-center gap-1">
                <span>🎉 Campus Events</span>
                <span class="badge bg-amber-500/20 text-amber-300 text-[10px] font-bold">${(data.tasks || []).filter(t => t.sourceTag === 'Campus Events' || t.sourceTag === 'OSU Honors' || t.category === 'Clubs').length}</span>
              </button>
              <button data-filter-tab="today" class="btn ${activeQuickFilter === 'today' ? 'btn-primary' : 'btn-ghost'} py-1.5 px-3 text-xs flex items-center gap-1">
                <span>Today</span>
                <span class="badge bg-white/20 text-[10px]">${(data.tasks || []).filter(t => t.dueDate === todayStr && t.status !== 'done').length}</span>
              </button>
              <button data-filter-tab="upcoming" class="btn ${activeQuickFilter === 'upcoming' ? 'btn-primary' : 'btn-ghost'} py-1.5 px-3 text-xs">Upcoming</button>
              <button data-filter-tab="overdue" class="btn ${activeQuickFilter === 'overdue' ? 'btn-primary text-danger' : 'btn-ghost'} py-1.5 px-3 text-xs flex items-center gap-1">
                <span>Overdue</span>
                ${(data.tasks || []).filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length > 0 ? `
                  <span class="badge bg-danger/20 text-danger text-[10px] font-bold">${(data.tasks || []).filter(t => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length}</span>
                ` : ''}
              </button>
              <button data-filter-tab="high" class="btn ${activeQuickFilter === 'high' ? 'btn-primary' : 'btn-ghost'} py-1.5 px-3 text-xs">High Priority</button>
            </div>

            <!-- Controls Header & View Switcher -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 glass-card p-3.5">
              
              <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-border">
                <button id="view-list-btn" class="btn ${currentView === 'list' ? 'btn-primary' : 'btn-ghost'} text-xs py-1 px-3">
                  <i data-lucide="list" class="w-3.5 h-3.5"></i>
                  <span>List View</span>
                </button>
                <button id="view-kanban-btn" class="btn ${currentView === 'kanban' ? 'btn-primary' : 'btn-ghost'} text-xs py-1 px-3">
                  <i data-lucide="columns-3" class="w-3.5 h-3.5"></i>
                  <span>Kanban</span>
                </button>
              </div>

              <!-- Search & Category/Project Dropdown Filters -->
              <div class="flex flex-wrap items-center gap-2">
                <input 
                  id="tasks-search-input" 
                  type="text" 
                  placeholder="Search tasks..." 
                  value="${searchQuery}"
                  class="input-field text-xs py-1 px-3 w-36 sm:w-44"
                />
                
                <select id="category-filter" class="input-field text-xs py-1 px-2.5 w-auto">
                  ${categories.map(c => `<option value="${c}" ${selectedCategory === c ? 'selected' : ''}>Category: ${c}</option>`).join('')}
                </select>

                <select id="project-filter" class="input-field text-xs py-1 px-2.5 w-auto">
                  <option value="All">Project: All Projects</option>
                  ${projects.map(p => `<option value="${p.id}" ${selectedProject === p.id ? 'selected' : ''}>Project: ${p.title}</option>`).join('')}
                </select>
              </div>

            </div>
          </div>

          <!-- Active View Rendering -->
          ${currentView === 'list' ? renderListView(filteredTasks) : renderKanbanView(filteredTasks)}

        </div>
      `;

      attachEvents();
    }

    function renderListView(tasks) {
      const todoTasks = tasks.filter(t => t.status !== 'done');
      const doneTasks = tasks.filter(t => t.status === 'done');

      return `
        <div class="space-y-6">
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="text-base font-bold text-text flex items-center gap-2">
                <span>Action Items & To-Dos</span>
                <span class="badge text-xs bg-amber-500/20 text-amber-400 font-bold">${todoTasks.length}</span>
              </h3>
            </div>

            ${todoTasks.length === 0 ? `
              <div class="py-10 text-center text-text-subtle text-xs">No tasks match selected filter. Click "+ New Task" to add an item!</div>
            ` : `
              <div class="space-y-3">
                ${todoTasks.map(t => renderTaskItem(t)).join('')}
              </div>
            `}
          </div>

          ${doneTasks.length > 0 ? `
            <div class="glass-card p-6 space-y-4 opacity-75">
              <div class="flex items-center justify-between pb-2 border-b border-border">
                <h3 class="text-base font-bold text-text flex items-center gap-2">
                  <span>Completed Archive</span>
                  <span class="badge text-xs bg-emerald-500/20 text-emerald-400 font-bold">${doneTasks.length}</span>
                </h3>
              </div>
              <div class="space-y-2">
                ${doneTasks.map(t => renderTaskItem(t)).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    }

    function renderTaskItem(t) {
      const totalSub = t.subtasks ? t.subtasks.length : 0;
      const completedSub = t.subtasks ? t.subtasks.filter(s => s.completed).length : 0;
      
      const project = (data.projects || []).find(p => p.id === t.projectId);
      const goal = (data.goals || []).find(g => g.id === t.goalId);

      return `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-border hover:border-accent/30 transition-all duration-150 gap-3 group">
          <div class="flex items-start gap-3 min-w-0">
            <input 
              type="checkbox" 
              data-toggle-task="${t.id}" 
              class="mt-1 w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer"
              ${t.status === 'done' ? 'checked' : ''}
            />
            <div class="space-y-1.5 min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-bold text-sm text-text group-hover:text-accent transition-colors ${t.status === 'done' ? 'line-through opacity-60' : ''}">
                  ${t.title}
                </span>
                <span class="badge badge-${t.priority}">${t.priority}</span>
                <span class="category-pill">${t.category}</span>

                ${project ? `
                  <span class="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]" title="Related Project">
                    📁 ${project.title}
                  </span>
                ` : ''}

                ${goal ? `
                  <span class="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]" title="Related Goal">
                    🎯 ${goal.title}
                  </span>
                ` : ''}
              </div>
              
              ${t.notes ? `<p class="text-xs text-text-subtle line-clamp-1">${t.notes}</p>` : ''}
              
              <!-- Subtasks checklist -->
              <div class="pt-1.5 space-y-1">
                <div class="flex items-center gap-2 text-[11px] text-text-subtle">
                  <span>Subtasks checklist (${completedSub}/${totalSub})</span>
                  <button data-quick-add-subtask="${t.id}" class="text-accent hover:underline font-medium text-[11px]">
                    + Add Step
                  </button>
                </div>
                ${totalSub > 0 ? `
                  <div class="flex flex-wrap gap-2">
                    ${t.subtasks.map(st => `
                      <button 
                        data-toggle-subtask="${t.id}:${st.id}"
                        class="text-[11px] px-2 py-0.5 rounded border ${st.completed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 line-through' : 'bg-white/5 text-text-muted border-border hover:border-text-muted'}"
                      >
                        ${st.completed ? '✓' : '○'} ${st.title}
                      </button>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            ${t.dueDate ? `<span class="text-xs text-text-subtle font-mono">${t.dueDate}</span>` : ''}
            ${t.status !== 'done' ? `
              <button data-start-focus="${t.id}" class="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5" title="Start Focus Timer">
                <i data-lucide="play" class="w-3.5 h-3.5 text-emerald-400"></i>
                <span>Focus</span>
              </button>
            ` : ''}
            <button data-edit-task="${t.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-accent" title="Edit Task">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button data-delete-task="${t.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Task">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
    }

    function renderKanbanView(tasks) {
      const columns = [
        { id: 'todo', title: 'To Do', icon: 'circle' },
        { id: 'in_progress', title: 'In Progress', icon: 'clock' },
        { id: 'done', title: 'Done', icon: 'check-circle' }
      ];

      return `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${columns.map(col => {
            const colTasks = tasks.filter(t => (t.status || 'todo') === col.id);
            return `
              <div class="kanban-col space-y-3">
                <div class="flex items-center justify-between pb-2 border-b border-border">
                  <div class="flex items-center gap-2">
                    <i data-lucide="${col.icon}" class="w-4 h-4 text-accent"></i>
                    <span class="font-bold text-sm text-text">${col.title}</span>
                  </div>
                  <span class="badge text-xs bg-white/10 text-text-subtle">${colTasks.length}</span>
                </div>

                <div class="space-y-3 min-h-[350px]">
                  ${colTasks.map(t => `
                    <div class="glass-card p-4 space-y-2 cursor-pointer hover:border-accent/40 transition-all">
                      <div class="flex items-center justify-between">
                        <span class="badge badge-${t.priority}">${t.priority}</span>
                        <span class="category-pill">${t.category}</span>
                      </div>
                      <h4 class="font-semibold text-xs text-text leading-snug">${t.title}</h4>
                      <div class="flex items-center justify-between text-[11px] text-text-subtle pt-2 border-t border-border/50">
                        <span>${t.dueDate || 'No Due Date'}</span>
                        <select data-move-status="${t.id}" class="bg-transparent text-accent focus:outline-none font-medium">
                          ${columns.map(c => `<option value="${c.id}" ${c.id === col.id ? 'selected' : ''}>Move: ${c.title}</option>`).join('')}
                        </select>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    function attachEvents() {
      container.querySelector('#add-task-btn')?.addEventListener('click', () => openAddTaskModal());

      // Quick Filter Tab Clicks
      container.querySelectorAll('[data-filter-tab]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          activeQuickFilter = e.currentTarget.getAttribute('data-filter-tab');
          renderView();
        });
      });

      // View Switcher Buttons
      container.querySelector('#view-list-btn')?.addEventListener('click', () => {
        currentView = 'list';
        renderView();
      });
      container.querySelector('#view-kanban-btn')?.addEventListener('click', () => {
        currentView = 'kanban';
        renderView();
      });

      // Dropdown Filters & Search
      container.querySelector('#tasks-search-input')?.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderView();
      });
      container.querySelector('#category-filter')?.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        renderView();
      });
      container.querySelector('#project-filter')?.addEventListener('change', (e) => {
        selectedProject = e.target.value;
        renderView();
      });

      // Checkbox Toggles
      container.querySelectorAll('[data-toggle-task]').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const id = e.currentTarget.getAttribute('data-toggle-task');
          store.toggleTaskStatus(id);
        });
      });

      // Subtasks
      container.querySelectorAll('[data-toggle-subtask]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const [taskId, subtaskId] = e.currentTarget.getAttribute('data-toggle-subtask').split(':');
          store.toggleSubtask(taskId, subtaskId);
        });
      });

      container.querySelectorAll('[data-quick-add-subtask]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const taskId = e.currentTarget.getAttribute('data-quick-add-subtask');
          const text = prompt('Add checklist step (e.g. "Apply on career portal", "Review resume"):');
          if (text && text.trim()) {
            store.addSubtask(taskId, text.trim());
          }
        });
      });

      // Edit / Delete Task
      container.querySelectorAll('[data-edit-task]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-edit-task');
          openEditTaskModal(id);
        });
      });

      container.querySelectorAll('[data-delete-task]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-delete-task');
          store.deleteTask(id);
        });
      });

      // Kanban Move Status
      container.querySelectorAll('[data-move-status]').forEach(sel => {
        sel.addEventListener('change', (e) => {
          const id = e.currentTarget.getAttribute('data-move-status');
          store.updateTask(id, { status: e.target.value });
        });
      });

      // Quick capture conversion
      container.querySelectorAll('[data-tasks-convert-qc]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-tasks-convert-qc');
          store.convertQuickCaptureToTask(id);
          renderView();
        });
      });

      // Focus session
      container.querySelectorAll('[data-start-focus]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.getAttribute('data-start-focus');
          const task = data.tasks.find(t => t.id === id);
          if (task) {
            focusTask = task;
            focusSeconds = 1500;
            if (focusTimerId) clearInterval(focusTimerId);
            focusTimerId = setInterval(() => {
              if (focusSeconds > 0) {
                focusSeconds--;
                renderView();
              } else {
                clearInterval(focusTimerId);
                focusTimerId = null;
                alert(`🎉 Focus Session completed for: ${focusTask.title}!`);
              }
            }, 1000);
            renderView();
          }
        });
      });

      container.querySelector('#stop-focus-btn')?.addEventListener('click', () => {
        if (focusTimerId) clearInterval(focusTimerId);
        focusTimerId = null;
        focusTask = null;
        renderView();
      });

      if (window.lucide) window.lucide.createIcons();
    }

    function openAddTaskModal() {
      const projects = data.projects || [];
      const goals = data.goals || [];

      const modalHTML = `
        <div id="task-modal" class="modal-overlay">
          <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h3 class="font-bold text-base text-text">New Action Task</h3>
              <button id="task-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>

            <form id="create-task-form" class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Task Title *</label>
                <input id="t-title" type="text" class="input-field" placeholder="e.g. Update resume, Apply for internship..." required autofocus />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Priority</label>
                  <select id="t-priority" class="input-field">
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium" selected>Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Category</label>
                  <select id="t-category" class="input-field">
                    <option value="Personal" selected>Personal</option>
                    <option value="Errands">Errands</option>
                    <option value="Career">Career</option>
                    <option value="Clubs">Clubs</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Project & Goal Integration Dropdowns -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Related Project (Optional)</label>
                  <select id="t-project" class="input-field">
                    <option value="">-- None --</option>
                    ${projects.map(p => `<option value="${p.id}">📁 ${p.title}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Related Goal (Optional)</label>
                  <select id="t-goal" class="input-field">
                    <option value="">-- None --</option>
                    ${goals.map(g => `<option value="${g.id}">🎯 ${g.title}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Due Date (Optional)</label>
                <input id="t-duedate" type="date" class="input-field" value="${new Date().toISOString().split('T')[0]}" />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Subtask Checklist Steps (Comma-separated)</label>
                <input id="t-subtasks-input" type="text" class="input-field" placeholder="e.g. Draft bullet points, Review formatting" />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Notes / Link (Optional)</label>
                <textarea id="t-notes" rows="2" class="input-field resize-none" placeholder="Additional details or links..."></textarea>
              </div>

              <button type="submit" class="btn btn-primary w-full mt-4">
                <i data-lucide="plus" class="w-4 h-4"></i>
                <span>Create Task</span>
              </button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('modal-container').innerHTML = modalHTML;
      const modal = document.getElementById('task-modal');
      modal.addEventListener('click', (e) => { if (e.target.id === 'task-modal') modal.remove(); });
      document.getElementById('task-modal-close')?.addEventListener('click', () => modal.remove());

      document.getElementById('create-task-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const subtasksRaw = document.getElementById('t-subtasks-input').value.split(',');
        const subtasks = subtasksRaw
          .map(s => s.trim())
          .filter(s => s.length > 0)
          .map((title, idx) => ({ id: `st-${Date.now()}-${idx}`, title, completed: false }));

        store.addTask({
          title: document.getElementById('t-title').value,
          priority: document.getElementById('t-priority').value,
          category: document.getElementById('t-category').value,
          projectId: document.getElementById('t-project').value || null,
          goalId: document.getElementById('t-goal').value || null,
          dueDate: document.getElementById('t-duedate').value || null,
          subtasks,
          notes: document.getElementById('t-notes').value
        });
        modal.remove();
      });

      if (window.lucide) window.lucide.createIcons();
    }

    function openEditTaskModal(id) {
      const task = data.tasks.find(t => t.id === id);
      if (!task) return;

      const projects = data.projects || [];
      const goals = data.goals || [];

      const modalHTML = `
        <div id="edit-task-modal" class="modal-overlay">
          <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
              <h3 class="font-bold text-base text-text">Edit Action Task</h3>
              <button id="edit-task-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
            </div>

            <form id="edit-task-form" class="space-y-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Task Title *</label>
                <input id="et-title" type="text" class="input-field" value="${task.title}" required autofocus />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Priority</label>
                  <select id="et-priority" class="input-field">
                    <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Category</label>
                  <select id="et-category" class="input-field">
                    <option value="Personal" ${task.category === 'Personal' ? 'selected' : ''}>Personal</option>
                    <option value="Errands" ${task.category === 'Errands' ? 'selected' : ''}>Errands</option>
                    <option value="Career" ${task.category === 'Career' ? 'selected' : ''}>Career</option>
                    <option value="Clubs" ${task.category === 'Clubs' ? 'selected' : ''}>Clubs</option>
                    <option value="Shopping" ${task.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
                    <option value="Other" ${task.category === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Related Project</label>
                  <select id="et-project" class="input-field">
                    <option value="">-- None --</option>
                    ${projects.map(p => `<option value="${p.id}" ${task.projectId === p.id ? 'selected' : ''}>📁 ${p.title}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label class="text-xs font-semibold text-text-subtle block mb-1">Related Goal</label>
                  <select id="et-goal" class="input-field">
                    <option value="">-- None --</option>
                    ${goals.map(g => `<option value="${g.id}" ${task.goalId === g.id ? 'selected' : ''}>🎯 ${g.title}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Due Date (Optional)</label>
                <input id="et-duedate" type="date" class="input-field" value="${task.dueDate || ''}" />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Notes / Link</label>
                <textarea id="et-notes" rows="2" class="input-field resize-none">${task.notes || ''}</textarea>
              </div>

              <button type="submit" class="btn btn-primary w-full mt-4">
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </div>
      `;

      document.getElementById('modal-container').innerHTML = modalHTML;
      const modal = document.getElementById('edit-task-modal');
      modal.addEventListener('click', (e) => { if (e.target.id === 'edit-task-modal') modal.remove(); });
      document.getElementById('edit-task-modal-close')?.addEventListener('click', () => modal.remove());

      document.getElementById('edit-task-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        store.updateTask(id, {
          title: document.getElementById('et-title').value,
          priority: document.getElementById('et-priority').value,
          category: document.getElementById('et-category').value,
          projectId: document.getElementById('et-project').value || null,
          goalId: document.getElementById('et-goal').value || null,
          dueDate: document.getElementById('et-duedate').value || null,
          notes: document.getElementById('et-notes').value
        });
        modal.remove();
      });

      if (window.lucide) window.lucide.createIcons();
    }

    renderView();

    store.subscribe(() => {
      if (store.activeTab === 'tasks') {
        renderView();
      }
    });
  } catch (err) {
    console.error('Task view render error:', err);
    container.innerHTML = `
      <div class="glass-card p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <div class="w-12 h-12 rounded-full bg-danger/20 text-danger flex items-center justify-center mx-auto">
          <i data-lucide="alert-triangle" class="w-6 h-6"></i>
        </div>
        <h3 class="font-bold text-base text-text">Tasks View Recovery</h3>
        <p class="text-xs text-text-subtle">Reset your task view cleanly below.</p>
        <button onclick="window.location.reload();" class="btn btn-primary text-xs py-2 px-4">
          <span>Reload View</span>
        </button>
      </div>
    `;
  }
}
