import { store } from '../store.js';

export function renderTasks(container) {
  const { data } = store;
  let currentView = 'list'; // 'list' | 'kanban' | 'calendar' | 'timeblock'
  let selectedCategory = 'All';
  let selectedPriority = 'All';
  let searchQuery = '';
  
  // Dynamic Real-Time Date Initialization (Defaults to actual today: July 29, 2026)
  const realNow = new Date();
  let activeYear = realNow.getFullYear();
  let activeMonth = realNow.getMonth(); // 0-indexed (6 = July)
  let activeDay = realNow.getDate(); // 29

  // Pomodoro Focus Timer State
  let focusTask = null;
  let focusSeconds = 1500; // 25 mins
  let focusTimerId = null;

  function renderView() {
    const integrations = data.integrations || { powerPlanner: true, googleCalendar: true, canvas: true, lastSynced: null };
    let filteredTasks = (Array.isArray(data.tasks) ? data.tasks : []).filter(t => t && typeof t === 'object' && t.id);

    // Live Calendar Feed Checkbox Filtering
    filteredTasks = filteredTasks.filter(t => {
      const src = t.sourceTag || 'Life OS';
      if (src.includes('Power Planner') && !integrations.powerPlanner) return false;
      if (src.includes('Google Calendar') && !integrations.googleCalendar) return false;
      if (src.includes('Canvas') && !integrations.canvas) return false;
      return true;
    });

    if (selectedCategory !== 'All') {
      filteredTasks = filteredTasks.filter(t => t && t.category === selectedCategory);
    }
    if (selectedPriority !== 'All') {
      filteredTasks = filteredTasks.filter(t => t && t.priority === selectedPriority);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredTasks = filteredTasks.filter(t => t && t.title && (t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q))));
    }

    const categories = ['All', 'Personal', 'Errands', 'Career', 'School (non-hw)', 'Clubs', 'Health', 'Shopping'];
    const priorities = ['All', 'urgent', 'high', 'medium', 'low'];

    const quickCaptureItems = data.quickCapture || [];

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in pb-12">
        
        <!-- Brain Dump & Quick Notes Inbox Banner (if items exist) -->
        ${quickCaptureItems.length > 0 ? `
          <div class="glass-card p-4 bg-amber-500/10 border-amber-500/30 space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-amber-700 dark:text-amber-400 font-bold text-sm flex items-center gap-1.5">
                  <span>📥 Unprocessed Quick Notes Inbox</span>
                </span>
                <span class="badge bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">${quickCaptureItems.length} items</span>
              </div>
              <span class="text-xs text-text-subtle">Click "⚡ Convert to Task" to schedule them!</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              ${quickCaptureItems.map(item => `
                <div class="p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-border flex items-center justify-between gap-2 text-xs">
                  <div class="flex items-center gap-2 min-w-0 pr-1">
                    <span class="badge text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">${item.type}</span>
                    <span class="text-text font-medium truncate" title="${item.content}">${item.content}</span>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    ${item.type === 'Link' ? `
                      <button data-tasks-convert-res="${item.id}" class="btn btn-secondary text-[10px] py-0.5 px-2 text-indigo-500" title="Pin to Vision Launchpad">
                        📌 Pin Link
                      </button>
                    ` : (item.type === 'Idea' ? `
                      <button data-tasks-convert-goal="${item.id}" class="btn btn-secondary text-[10px] py-0.5 px-2 text-purple-500" title="Save as Goal">
                        🎯 Goal
                      </button>
                      <button data-tasks-convert-qc="${item.id}" class="btn btn-secondary text-[10px] py-0.5 px-2 text-accent" title="Convert to Task">
                        ⚡ Convert
                      </button>
                    ` : `
                      <button data-tasks-convert-qc="${item.id}" class="btn btn-secondary text-[10px] py-0.5 px-2 text-accent" title="Convert to Task">
                        ⚡ Convert
                      </button>
                    `)}
                    <button data-tasks-delete-qc="${item.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Schedule Integration & Sync Hub Banner (Always Visible) -->
        <div class="glass-card p-5 bg-gradient-to-r from-amber-500/10 via-bg-card to-indigo-950/20 border-amber-500/30 space-y-3">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <i data-lucide="calendar" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="font-bold text-base text-text flex items-center gap-2">
                  <span>OSU Schedule & Calendar Visibility Feeds</span>
                </h3>
                <p class="text-xs text-text-subtle">Check/uncheck feeds to toggle visibility of your classes and events on your schedule.</p>
              </div>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <button id="add-class-schedule-btn" class="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-lg shadow-amber-500/20" title="Add a class or schedule item for Power Planner or Google Calendar">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i>
                <span>+ Add Class / Schedule Item</span>
              </button>

              <button id="sync-schedule-btn" class="btn btn-secondary text-xs py-1.5 px-3" title="Load sample demo classes for testing">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                <span>Load Sample Demo Schedule</span>
              </button>

              <button id="unsync-schedule-btn" class="btn btn-secondary text-xs py-1.5 px-3 text-danger border-danger/30 hover:bg-danger/10" title="Remove sample demo classes">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>Clear Demo Schedule</span>
              </button>
            </div>
          </div>

          <!-- Individual Feed Toggles & Live Item Counts -->
          <div class="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50 text-xs">
            <span class="text-text-subtle font-semibold">Active Calendar Feeds:</span>
            
            ${(() => {
              const allTasks = data.tasks || [];
              const ppCount = allTasks.filter(t => t.sourceTag && t.sourceTag.includes('Power Planner')).length;
              const gcalCount = allTasks.filter(t => t.sourceTag && t.sourceTag.includes('Google')).length;
              const canvasCount = allTasks.filter(t => t.sourceTag && t.sourceTag.includes('Canvas')).length;

              return `
                <label class="flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-xl border border-border">
                  <input type="checkbox" id="toggle-pp" ${integrations.powerPlanner ? 'checked' : ''} class="rounded text-accent" />
                  <span class="text-text font-medium">Power Planner</span>
                  <span class="badge ${ppCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-text-subtle'} text-[10px] font-mono">${ppCount} items</span>
                </label>

                <label class="flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-xl border border-border">
                  <input type="checkbox" id="toggle-gcal" ${integrations.googleCalendar ? 'checked' : ''} class="rounded text-accent" />
                  <span class="text-text font-medium">Google Calendar</span>
                  <span class="badge ${gcalCount > 0 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/10 text-text-subtle'} text-[10px] font-mono">${gcalCount} items</span>
                </label>

                <label class="flex items-center gap-1.5 cursor-pointer bg-white/5 px-2.5 py-1 rounded-xl border border-border">
                  <input type="checkbox" id="toggle-canvas" ${integrations.canvas ? 'checked' : ''} class="rounded text-accent" />
                  <span class="text-text font-medium">Canvas LMS</span>
                  <span class="badge ${canvasCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-text-subtle'} text-[10px] font-mono">${canvasCount} items</span>
                </label>
              `;
            })()}
          </div>
        </div>

        <!-- Active Focus Pomodoro Bar (if running) -->
        ${focusTask ? `
          <div class="glass-card p-4 bg-emerald-950/20 border-emerald-500/40 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold animate-pulse">
                <i data-lucide="timer" class="w-5 h-5"></i>
              </div>
              <div>
                <div class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Active Pomodoro Focus Session</div>
                <div class="text-sm font-bold text-text">${focusTask.title}</div>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-2xl font-black font-mono text-emerald-400">
                ${Math.floor(focusSeconds / 60).toString().padStart(2, '0')}:${(focusSeconds % 60).toString().padStart(2, '0')}
              </div>
              <div class="flex items-center gap-1">
                <button id="pause-focus-btn" class="btn btn-secondary text-xs px-2 py-1">
                  ${focusTimerId ? 'Pause' : 'Resume'}
                </button>
                <button id="stop-focus-btn" class="btn btn-ghost text-xs text-danger px-2 py-1">
                  Stop
                </button>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- View Controls & Filters Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4">
          
          <!-- View Switcher -->
          <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-border">
            <button id="view-list-btn" class="btn ${currentView === 'list' ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3">
              <i data-lucide="list" class="w-3.5 h-3.5"></i>
              <span>List View</span>
            </button>
            <button id="view-kanban-btn" class="btn ${currentView === 'kanban' ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3">
              <i data-lucide="columns-3" class="w-3.5 h-3.5"></i>
              <span>Kanban</span>
            </button>
            <button id="view-calendar-btn" class="btn ${currentView === 'calendar' ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              <span>Month Grid</span>
            </button>
            <button id="view-timeblock-btn" class="btn ${currentView === 'timeblock' ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3">
              <i data-lucide="clock" class="w-3.5 h-3.5"></i>
              <span>Day Time-Blocker</span>
            </button>
          </div>

          <!-- Category & Priority Filters -->
          <div class="flex flex-wrap items-center gap-2">
            <input 
              id="tasks-search-input" 
              type="text" 
              placeholder="Search tasks..." 
              value="${searchQuery}"
              class="input-field text-xs py-1.5 px-3 w-40 sm:w-48"
            />
            
            <select id="category-filter" class="input-field text-xs py-1.5 px-3 w-auto">
              ${categories.map(c => `<option value="${c}" ${selectedCategory === c ? 'selected' : ''}>Category: ${c}</option>`).join('')}
            </select>

            <select id="priority-filter" class="input-field text-xs py-1.5 px-3 w-auto capitalize">
              ${priorities.map(p => `<option value="${p}" ${selectedPriority === p ? 'selected' : ''}>Priority: ${p}</option>`).join('')}
            </select>

            <button id="add-task-btn" class="btn btn-primary text-xs">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>New Task</span>
            </button>
          </div>

        </div>

        <!-- Render Current Active View -->
        ${currentView === 'list' ? renderListView(filteredTasks) : ''}
        ${currentView === 'kanban' ? renderKanbanView(filteredTasks) : ''}
        ${currentView === 'calendar' ? renderCalendarView(filteredTasks) : ''}
        ${currentView === 'timeblock' ? renderTimeBlockView(filteredTasks) : ''}

      </div>
    `;

    attachEvents();
  }

  function renderListView(tasks) {
    const todoTasks = tasks.filter(t => t.status !== 'done');
    const doneTasks = tasks.filter(t => t.status === 'done');

    return `
      <div class="space-y-6">
        <!-- Active Tasks -->
        <div class="glass-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-border">
            <h3 class="text-base font-bold text-text flex items-center gap-2">
              <span>Pending Tasks & Classes</span>
              <span class="badge text-xs bg-accent-light text-accent">${todoTasks.length}</span>
            </h3>
          </div>

          ${todoTasks.length === 0 ? `
            <div class="py-8 text-center text-text-subtle text-sm">No pending tasks found. Click "New Task" or "Sync Schedules Now" to add items!</div>
          ` : `
            <div class="space-y-3">
              ${todoTasks.map(t => renderTaskItem(t)).join('')}
            </div>
          `}
        </div>

        <!-- Completed Archive -->
        ${doneTasks.length > 0 ? `
          <div class="glass-card p-6 space-y-4 opacity-80">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="text-base font-bold text-text flex items-center gap-2">
                <span>Completed Archive</span>
                <span class="badge text-xs bg-emerald-500/20 text-emerald-400">${doneTasks.length}</span>
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
    const sourceTag = t.sourceTag || 'Life OS';

    let tagColorClass = 'bg-accent/15 text-accent border-accent/30';
    if (sourceTag === 'Power Planner') tagColorClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    else if (sourceTag === 'Google Calendar') tagColorClass = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    else if (sourceTag === 'Canvas') tagColorClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';

    const isMultiDay = (t.startDate && t.dueDate && t.startDate !== t.dueDate) || t.taskType === 'multi-day';
    const dateDisplay = isMultiDay ? `📅 ${t.startDate || t.dueDate} ➔ ${t.dueDate}` : `📅 ${t.dueDate}`;

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
              <span class="badge text-[10px] font-mono border ${tagColorClass}">${sourceTag}</span>
              ${isMultiDay ? `<span class="badge bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">📅 Multi-Day Span</span>` : ''}
              ${t.timeBlock ? `<span class="badge bg-white/10 text-text-subtle font-mono text-[10px]">⏰ ${t.timeBlock.startTime} - ${t.timeBlock.endTime}</span>` : ''}
              ${t.estimatedTime ? `<span class="text-[11px] text-text-subtle font-mono">⌛ ${t.estimatedTime}</span>` : ''}
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
          <span class="text-xs text-text-subtle font-mono">${dateDisplay}</span>
          ${t.status !== 'done' ? `
            <button data-start-focus="${t.id}" class="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5" title="Start 25-min Focus Timer">
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
      { id: 'review', title: 'Review', icon: 'eye' },
      { id: 'done', title: 'Done', icon: 'check-circle' }
    ];

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <div class="space-y-3 min-h-[400px]">
                ${colTasks.map(t => `
                  <div class="glass-card p-4 space-y-2 cursor-pointer hover:border-accent/40 transition-all">
                    <div class="flex items-center justify-between">
                      <span class="badge badge-${t.priority}">${t.priority}</span>
                      <span class="category-pill">${t.category}</span>
                    </div>
                    <h4 class="font-semibold text-xs text-text leading-snug">${t.title}</h4>
                    ${t.timeBlock ? `<div class="text-[10px] text-text-subtle font-mono">⏰ ${t.timeBlock.startTime} - ${t.timeBlock.endTime}</div>` : ''}
                    <div class="flex items-center justify-between text-[11px] text-text-subtle pt-2 border-t border-border/50">
                      <span>Due ${t.dueDate}</span>
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

  function renderCalendarView(tasks) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const totalDaysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(activeYear, activeMonth, 1).getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, etc.
    const paddingSlots = Array.from({ length: firstDayOfWeek }, (_, i) => i);
    const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

    const goals = data.goals || [];
    const projects = data.projects || [];

    return `
      <div class="glass-card p-6 space-y-4">
        <!-- Month Navigation Header -->
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-3">
            <h3 class="font-bold text-base text-text">${monthNames[activeMonth]} ${activeYear} Schedule</h3>
            <span class="badge bg-accent-light text-accent text-xs">Unified Tasks, Goals & Projects Calendar</span>
          </div>

          <div class="flex items-center gap-2">
            <button id="cal-prev-month" class="btn btn-ghost btn-icon text-xs"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
            <button id="cal-today-btn" class="btn btn-secondary text-xs px-2.5 py-1">Today</button>
            <button id="cal-next-month" class="btn btn-ghost btn-icon text-xs"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-text-subtle pb-2">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div class="grid grid-cols-7 gap-2">
          ${paddingSlots.map(() => `
            <div class="min-h-[100px] p-2 rounded-2xl bg-white/0 border border-transparent opacity-0 pointer-events-none"></div>
          `).join('')}
          ${days.map(d => {
            const mStr = (activeMonth + 1).toString().padStart(2, '0');
            const dStr = d.toString().padStart(2, '0');
            const dateStr = `${activeYear}-${mStr}-${dStr}`;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr);
            const dayGoals = goals.filter(g => g.deadline === dateStr);
            const dayProjects = projects.filter(p => p.deadline === dateStr);
            const isToday = d === activeDay && activeMonth === realNow.getMonth() && activeYear === realNow.getFullYear();

            return `
              <div 
                data-add-task-on-date="${dateStr}" 
                class="min-h-[100px] p-2 rounded-2xl ${isToday ? 'bg-accent/10 border-accent' : 'bg-white/5 border-border'} border flex flex-col justify-between hover:border-accent/40 transition-all cursor-pointer group"
              >
                <div class="flex items-center justify-between w-full">
                  <span class="text-[10px] text-text-subtle group-hover:text-accent font-mono">+ Add</span>
                  <span class="text-xs font-bold ${isToday ? 'text-accent font-extrabold' : 'text-text-subtle'}">${d}</span>
                </div>

                <div class="space-y-1 overflow-y-auto max-h-24 mt-1">
                  <!-- Render Goal Deadlines -->
                  ${dayGoals.map(g => `
                    <div class="text-[10px] p-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium truncate flex items-center justify-between" title="Goal Deadline: ${g.title}">
                      <span class="truncate">🎯 ${g.title}</span>
                    </div>
                  `).join('')}

                  <!-- Render Project Deadlines -->
                  ${dayProjects.map(p => `
                    <div class="text-[10px] p-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium truncate flex items-center justify-between" title="Project Deadline: ${p.title}">
                      <span class="truncate">📁 ${p.title}</span>
                    </div>
                  `).join('')}

                  <!-- Render Tasks -->
                  ${dayTasks.map(t => {
                    const tag = t.sourceTag || 'Life OS';
                    return `
                      <div class="text-[10px] p-1 rounded bg-white/10 text-text font-medium truncate flex items-center justify-between" title="${t.title}">
                        <span class="truncate">${t.title}</span>
                        ${t.timeBlock ? `<span class="text-[9px] text-accent font-mono ml-1">${t.timeBlock.startTime}</span>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderTimeBlockView(tasks) {
    const hours = [
      '08:00', '09:00', '10:00', '11:00', '12:00', 
      '13:00', '14:00', '15:00', '16:00', '17:00', 
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const dateStr = `${activeYear}-08-${activeDay.toString().padStart(2, '0')}`;
    const todayTasks = tasks.filter(t => t.dueDate === dateStr || !t.dueDate);

    return `
      <div class="glass-card p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>Daily Hourly Time-Blocker</span>
              <span class="badge bg-indigo-500/20 text-indigo-300 font-mono text-xs">August ${activeDay}, ${activeYear}</span>
            </h3>
            <p class="text-xs text-text-subtle">Schedule specific hour slots for classes, study sprints, and personal tasks.</p>
          </div>

          <div class="flex items-center gap-2">
            <button id="prev-day-btn" class="btn btn-ghost btn-icon text-xs"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
            <span class="text-xs font-mono font-bold text-accent">Aug ${activeDay}</span>
            <button id="next-day-btn" class="btn btn-ghost btn-icon text-xs"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
          </div>
        </div>

        <div class="space-y-3">
          ${hours.map(h => {
            const hNum = parseInt(h.split(':')[0], 10);
            // Tasks matching this hour slot
            const matchedTasks = todayTasks.filter(t => {
              if (!t.timeBlock) return false;
              const startH = parseInt(t.timeBlock.startTime.split(':')[0], 10);
              return startH === hNum;
            });

            let matchedTasksHTML = '';
            if (matchedTasks.length === 0) {
              matchedTasksHTML = `
                <button 
                  data-add-task-at-time="${h}" 
                  class="w-full text-left text-xs text-text-subtle py-1.5 px-3 rounded-xl border border-dashed border-border hover:border-accent/40 hover:text-accent transition-all flex items-center justify-between"
                >
                  <span>+ Click to schedule task in ${h} slot</span>
                  <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                </button>
              `;
            } else {
              const itemsHTML = matchedTasks.map(t => {
                const tag = t.sourceTag || 'Life OS';
                const notesHTML = t.notes ? `<p class="text-[11px] text-text-subtle line-clamp-1">${t.notes}</p>` : '';
                return `
                  <div class="p-3 rounded-xl bg-accent/15 border border-accent/30 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="font-bold text-xs text-text">${t.title}</span>
                      <span class="badge text-[9px] bg-white/10 text-accent font-mono">${tag}</span>
                    </div>
                    <div class="text-[11px] text-text-subtle font-mono">⏰ ${t.timeBlock.startTime} - ${t.timeBlock.endTime} (${t.estimatedTime || '1 hr'})</div>
                    ${notesHTML}
                  </div>
                `;
              }).join('');

              matchedTasksHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-2">${itemsHTML}</div>`;
            }

            return `
              <div class="flex items-start gap-4 p-3 rounded-2xl bg-white/5 border border-border hover:border-accent/30 transition-colors">
                <div class="w-16 flex-shrink-0 text-xs font-bold font-mono text-text-subtle pt-1">${h}</div>

                <div class="flex-1 space-y-2">
                  ${matchedTasksHTML}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function attachEvents() {
    // View Switchers
    container.querySelector('#view-list-btn')?.addEventListener('click', () => { currentView = 'list'; renderView(); });
    container.querySelector('#view-kanban-btn')?.addEventListener('click', () => { currentView = 'kanban'; renderView(); });
    container.querySelector('#view-calendar-btn')?.addEventListener('click', () => { currentView = 'calendar'; renderView(); });
    container.querySelector('#view-timeblock-btn')?.addEventListener('click', () => { currentView = 'timeblock'; renderView(); });

    // Filter listeners
    container.querySelector('#category-filter')?.addEventListener('change', (e) => { selectedCategory = e.target.value; renderView(); });
    container.querySelector('#priority-filter')?.addEventListener('change', (e) => { selectedPriority = e.target.value; renderView(); });
    container.querySelector('#tasks-search-input')?.addEventListener('input', (e) => { searchQuery = e.target.value; renderView(); });

    // Quick Capture Inbox listeners
    container.querySelectorAll('[data-tasks-convert-qc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-tasks-convert-qc');
        store.convertQuickCaptureToTask(id);
        renderView();
      });
    });
    container.querySelectorAll('[data-tasks-convert-res]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-tasks-convert-res');
        store.convertQuickCaptureToResource(id);
        renderView();
      });
    });
    container.querySelectorAll('[data-tasks-convert-goal]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-tasks-convert-goal');
        store.convertQuickCaptureToGoal(id);
        renderView();
      });
    });
    container.querySelectorAll('[data-tasks-delete-qc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-tasks-delete-qc');
        store.deleteQuickCapture(id);
        renderView();
      });
    });

    // External Schedule Sync & Controls
    container.querySelector('#add-class-schedule-btn')?.addEventListener('click', () => {
      openAddTaskModal();
    });
    container.querySelector('#sync-schedule-btn')?.addEventListener('click', () => {
      store.syncExternalSchedules();
      renderView();
    });
    container.querySelector('#unsync-schedule-btn')?.addEventListener('click', () => {
      store.unsyncAllExternalSchedules();
      renderView();
    });

    container.querySelector('#toggle-pp')?.addEventListener('change', () => {
      store.toggleIntegration('powerPlanner');
      renderView();
    });
    container.querySelector('#toggle-gcal')?.addEventListener('change', () => {
      store.toggleIntegration('googleCalendar');
      renderView();
    });
    container.querySelector('#toggle-canvas')?.addEventListener('change', () => {
      store.toggleIntegration('canvas');
      renderView();
    });

    // Month Navigation Controls
    container.querySelector('#cal-prev-month')?.addEventListener('click', () => {
      activeMonth = activeMonth === 0 ? 11 : activeMonth - 1;
      if (activeMonth === 11) activeYear--;
      renderView();
    });
    container.querySelector('#cal-next-month')?.addEventListener('click', () => {
      activeMonth = activeMonth === 11 ? 0 : activeMonth + 1;
      if (activeMonth === 0) activeYear++;
      renderView();
    });
    container.querySelector('#cal-today-btn')?.addEventListener('click', () => {
      activeMonth = realNow.getMonth();
      activeYear = realNow.getFullYear();
      activeDay = realNow.getDate();
      renderView();
    });

    // Day Blocker Controls
    container.querySelector('#prev-day-btn')?.addEventListener('click', () => {
      if (activeDay > 1) activeDay--;
      renderView();
    });
    container.querySelector('#next-day-btn')?.addEventListener('click', () => {
      if (activeDay < 31) activeDay++;
      renderView();
    });

    // Add Task on Specific Date Click (Calendar view)
    container.querySelectorAll('[data-add-task-on-date]').forEach(el => {
      el.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-add-task-on-date');
        openAddTaskModal(dateStr);
      });
    });

    // Add Task at Time Slot Click (Time-Blocker view)
    container.querySelectorAll('[data-add-task-at-time]').forEach(el => {
      el.addEventListener('click', (e) => {
        const timeSlot = e.currentTarget.getAttribute('data-add-task-at-time');
        openAddTaskModal(null, timeSlot);
      });
    });

    // Start Focus Session
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
              const minStr = Math.floor(focusSeconds / 60).toString().padStart(2, '0');
              const secStr = (focusSeconds % 60).toString().padStart(2, '0');
              const timerEl = container.querySelector('.font-mono.text-emerald-400');
              if (timerEl) timerEl.innerText = `${minStr}:${secStr}`;
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

    container.querySelector('#pause-focus-btn')?.addEventListener('click', () => {
      if (focusTimerId) {
        clearInterval(focusTimerId);
        focusTimerId = null;
      } else {
        focusTimerId = setInterval(() => {
          if (focusSeconds > 0) {
            focusSeconds--;
            const minStr = Math.floor(focusSeconds / 60).toString().padStart(2, '0');
            const secStr = (focusSeconds % 60).toString().padStart(2, '0');
            const timerEl = container.querySelector('.font-mono.text-emerald-400');
            if (timerEl) timerEl.innerText = `${minStr}:${secStr}`;
          }
        }, 1000);
      }
      renderView();
    });

    container.querySelector('#stop-focus-btn')?.addEventListener('click', () => {
      if (focusTimerId) clearInterval(focusTimerId);
      focusTimerId = null;
      focusTask = null;
      renderView();
    });

    // Checkbox toggles
    container.querySelectorAll('[data-toggle-task]').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-task');
        store.toggleTaskStatus(id);
      });
    });

    // Subtask toggles & quick add
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
        const text = prompt('Add checklist step (e.g. "Browse coats on Depop", "Compare prices"):');
        if (text && text.trim()) {
          store.addSubtask(taskId, text.trim());
        }
      });
    });

    // Edit Task
    container.querySelectorAll('[data-edit-task]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-edit-task');
        openEditTaskModal(id);
      });
    });

    // Delete Task
    container.querySelectorAll('[data-delete-task]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-task');
        store.deleteTask(id);
      });
    });

    // Kanban status move
    container.querySelectorAll('[data-move-status]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = e.currentTarget.getAttribute('data-move-status');
        store.updateTask(id, { status: e.target.value });
      });
    });

    container.querySelector('#add-task-btn')?.addEventListener('click', () => openAddTaskModal());

    if (window.lucide) window.lucide.createIcons();
  }

  function openAddTaskModal(prefillDate = null, prefillTimeSlot = null) {
    const modalHTML = `
      <div id="task-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <h3 class="font-bold text-base text-text">Create New Task / Time-Block</h3>
            <button id="task-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <form id="create-task-form" class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Task Title *</label>
              <input id="t-title" type="text" class="input-field" placeholder="e.g. CSE 2221 Lab Assignment or Gym Workout" required autofocus />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Priority</label>
                <select id="t-priority" class="input-field capitalize">
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium" selected>Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Category</label>
                <select id="t-category" class="input-field">
                  <option value="Personal">Personal</option>
                  <option value="Errands">Errands</option>
                  <option value="Career">Career</option>
                  <option value="School (non-hw)" selected>School (non-hw)</option>
                  <option value="Clubs">Clubs</option>
                  <option value="Health">Health</option>
                  <option value="Shopping">Shopping</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Task Type</label>
                <select id="t-tasktype" class="input-field">
                  <option value="single" selected>Single Day</option>
                  <option value="multi-day">Multi-Day Span</option>
                  <option value="ongoing">Flexible / Ongoing</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Start Date</label>
                <input id="t-startdate" type="date" class="input-field" value="${prefillDate || `${activeYear}-08-${activeDay.toString().padStart(2, '0')}`}" />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">End / Due Date</label>
                <input id="t-duedate" type="date" class="input-field" value="${prefillDate || `${activeYear}-08-${activeDay.toString().padStart(2, '0')}`}" />
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Schedule Source</label>
              <select id="t-sourcetag" class="input-field">
                <option value="Life OS" selected>Life OS</option>
                <option value="Power Planner">Power Planner</option>
                <option value="Google Calendar">Google Calendar</option>
                <option value="Canvas">Canvas LMS</option>
              </select>
            </div>

            <!-- Subtask Checklist Steps -->
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Subtask Checklist Steps (Comma-separated)</label>
              <input id="t-subtasks-input" type="text" class="input-field" placeholder="e.g. Browse vintage coats, Check seller ratings, Compare prices" />
            </div>

            <!-- Time-Blocking & Estimated Duration -->
            <div class="p-4 rounded-xl bg-white/5 border border-border space-y-3">
              <span class="text-xs font-bold text-accent block">⏰ Time-Blocking & Duration (Optional)</span>
              
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">Start Time</label>
                  <input id="t-starttime" type="time" class="input-field text-xs py-1" value="${prefillTimeSlot || '10:00'}" />
                </div>
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">End Time</label>
                  <input id="t-endtime" type="time" class="input-field text-xs py-1" value="${prefillTimeSlot ? `${parseInt(prefillTimeSlot.split(':')[0], 10) + 1}:00` : '11:00'}" />
                </div>
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">Est. Duration</label>
                  <input id="t-estimatedtime" type="text" class="input-field text-xs py-1" placeholder="e.g. 45 mins" />
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Notes / Room / Link</label>
              <textarea id="t-notes" rows="2" class="input-field resize-none" placeholder="Additional details, location or assignment link..."></textarea>
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
      const startTime = document.getElementById('t-starttime').value;
      const endTime = document.getElementById('t-endtime').value;
      const subtasksRaw = document.getElementById('t-subtasks-input').value.split(',');
      const subtasks = subtasksRaw
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map((title, idx) => ({ id: `st-${Date.now()}-${idx}`, title, completed: false }));

      store.addTask({
        title: document.getElementById('t-title').value,
        priority: document.getElementById('t-priority').value,
        category: document.getElementById('t-category').value,
        startDate: document.getElementById('t-startdate').value,
        dueDate: document.getElementById('t-duedate').value,
        taskType: document.getElementById('t-tasktype').value,
        sourceTag: document.getElementById('t-sourcetag').value,
        subtasks: subtasks,
        timeBlock: startTime && endTime ? { startTime, endTime } : null,
        estimatedTime: document.getElementById('t-estimatedtime').value,
        notes: document.getElementById('t-notes').value
      });
      modal.remove();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openEditTaskModal(id) {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;

    const modalHTML = `
      <div id="edit-task-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <h3 class="font-bold text-base text-text">Edit Task</h3>
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
                <select id="et-priority" class="input-field capitalize">
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
                  <option value="School (non-hw)" ${task.category === 'School (non-hw)' ? 'selected' : ''}>School (non-hw)</option>
                  <option value="Clubs" ${task.category === 'Clubs' ? 'selected' : ''}>Clubs</option>
                  <option value="Health" ${task.category === 'Health' ? 'selected' : ''}>Health</option>
                  <option value="Shopping" ${task.category === 'Shopping' ? 'selected' : ''}>Shopping</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Task Type</label>
                <select id="et-tasktype" class="input-field">
                  <option value="single" ${(task.taskType || 'single') === 'single' ? 'selected' : ''}>Single Day</option>
                  <option value="multi-day" ${task.taskType === 'multi-day' ? 'selected' : ''}>Multi-Day Span</option>
                  <option value="ongoing" ${task.taskType === 'ongoing' ? 'selected' : ''}>Flexible / Ongoing</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Start Date</label>
                <input id="et-startdate" type="date" class="input-field" value="${task.startDate || task.dueDate || ''}" />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">End / Due Date</label>
                <input id="et-duedate" type="date" class="input-field" value="${task.dueDate || ''}" />
              </div>
            </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Schedule Source</label>
                <select id="et-sourcetag" class="input-field">
                  <option value="Life OS" ${task.sourceTag === 'Life OS' ? 'selected' : ''}>Life OS</option>
                  <option value="Power Planner" ${task.sourceTag === 'Power Planner' ? 'selected' : ''}>Power Planner</option>
                  <option value="Google Calendar" ${task.sourceTag === 'Google Calendar' ? 'selected' : ''}>Google Calendar</option>
                  <option value="Canvas" ${task.sourceTag === 'Canvas' ? 'selected' : ''}>Canvas LMS</option>
                </select>
              </div>
            </div>

            <!-- Time-Blocking & Estimated Duration -->
            <div class="p-4 rounded-xl bg-white/5 border border-border space-y-3">
              <span class="text-xs font-bold text-accent block">⏰ Time-Blocking & Duration</span>
              
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">Start Time</label>
                  <input id="et-starttime" type="time" class="input-field text-xs py-1" value="${task.timeBlock?.startTime || ''}" />
                </div>
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">End Time</label>
                  <input id="et-endtime" type="time" class="input-field text-xs py-1" value="${task.timeBlock?.endTime || ''}" />
                </div>
                <div>
                  <label class="text-[10px] text-text-subtle block mb-1">Est. Duration</label>
                  <input id="et-estimatedtime" type="text" class="input-field text-xs py-1" value="${task.estimatedTime || ''}" placeholder="e.g. 45 mins" />
                </div>
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Notes / Description</label>
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
      const startTime = document.getElementById('et-starttime').value;
      const endTime = document.getElementById('et-endtime').value;

      store.updateTask(id, {
        title: document.getElementById('et-title').value,
        priority: document.getElementById('et-priority').value,
        category: document.getElementById('et-category').value,
        taskType: document.getElementById('et-tasktype').value,
        startDate: document.getElementById('et-startdate').value,
        dueDate: document.getElementById('et-duedate').value,
        sourceTag: document.getElementById('et-sourcetag').value,
        timeBlock: startTime && endTime ? { startTime, endTime } : null,
        estimatedTime: document.getElementById('et-estimatedtime').value,
        notes: document.getElementById('et-notes').value
      });
      modal.remove();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  // Initial Render
  renderView();

  // Listen to store updates
  store.subscribe(() => {
    if (store.activeTab === 'tasks') {
      renderView();
    }
  });
}
