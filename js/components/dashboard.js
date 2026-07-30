import { store } from '../store.js';

export function renderDashboard(container) {
  const { data } = store;
  const profileName = (data.profile && data.profile.name) ? data.profile.name : 'Arianna Sanders';
  const tasks = data.tasks || [];
  const goals = data.goals || [];
  const projects = data.projects || [];
  const resources = data.resources || [];
  const stickyNote = data.stickyNote || '🎯 Set your top priorities for this week!';

  const activeFocusTasks = tasks.filter(t => t.status !== 'done').slice(0, 4);
  const activeGoalsList = goals.slice(0, 3);
  const recentProjectsList = projects.slice(0, 3);
  const pinnedResources = resources.filter(r => r.isPinned).slice(0, 6);

  // Aesthetic Pinterest Scrapbook Photo Cards (Kirby/Pink Gaming, Spider-Man, Video Games, Soccer, Music)
  const scrapbookPhotos = [
    { title: 'Kirby & Pink Gaming', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400', rotation: '-rotate-2' },
    { title: 'Spider-Man & Pop Art', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=400', rotation: 'rotate-3' },
    { title: 'Video Games', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=400', rotation: '-rotate-1' },
    { title: 'Soccer', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=400', rotation: 'rotate-2' },
    { title: 'Music & Vinyl', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400', rotation: '-rotate-3' }
  ];

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in pb-16">
      
      <!-- Pinterest Scrapbook Header Banner -->
      <div class="glass-card p-6 md:p-8 bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-indigo-500/10 border-amber-500/20 relative overflow-hidden">
        <div class="washi-tape"></div>
        <div class="washi-tape washi-tape-right"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <!-- Greeting & Title -->
          <div class="space-y-2 max-w-lg">
            <div class="flex items-center gap-2">
              <span class="badge bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold border border-amber-500/30">Class of 2030</span>
              <span class="text-xs text-text-subtle font-mono">The Ohio State University</span>
            </div>

            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-text">Welcome back, ${profileName.split(' ')[0]} 🌸</h1>
            <p class="text-sm text-text-muted">Your aesthetic Pinterest scrapbook digital headquarters for college.</p>
          </div>

          <div class="flex items-center gap-3">
            <button id="dash-quick-task-btn" class="btn btn-primary text-xs">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Quick Task</span>
            </button>
            <button id="dash-quick-capture-btn" class="btn btn-secondary text-xs">
              <i data-lucide="zap" class="w-4 h-4"></i>
              <span>Brain Dump</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Sticky Note / Corkboard Scratchpad Widget -->
      <div class="glass-card p-5 bg-amber-500/10 border-amber-500/30 space-y-2 relative">
        <div class="washi-tape"></div>
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <span>📌 Weekly Focus Scratchpad</span>
          </h3>
          <button id="save-sticky-btn" class="btn btn-ghost text-xs text-amber-700 dark:text-amber-400">Save</button>
        </div>
        <textarea 
          id="sticky-input"
          rows="2" 
          class="w-full bg-transparent border-none text-text text-xs leading-relaxed focus:outline-none resize-none placeholder-text-subtle font-sans"
          placeholder="Jot down key focus areas for this week..."
        >${stickyNote}</textarea>
      </div>

      <!-- Brain Dump & Quick Notes Inbox Widget -->
      <div class="glass-card p-6 space-y-4 relative">
        <div class="washi-tape washi-tape-right"></div>
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>📥 Brain Dump & Quick Notes Inbox</span>
            </h3>
            <span class="badge bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">${(data.quickCapture || []).length} items</span>
          </div>
          <button id="dash-open-qc-modal-btn" class="btn btn-primary text-xs">+ Quick Add (Cmd+J)</button>
        </div>

        <!-- Inline Quick Add Input -->
        <form id="dash-qc-inline-form" class="flex items-center gap-2">
          <input 
            type="text" 
            id="dash-qc-input"
            placeholder="Jot down a quick thought, link, or idea..." 
            class="input-field text-xs py-2"
            required
          />
          <select id="dash-qc-type" class="input-field text-xs py-2 px-2 w-auto">
            <option value="Idea">💡 Idea</option>
            <option value="Task">✅ Task</option>
            <option value="Link">🔗 Link</option>
            <option value="Note">📝 Note</option>
          </select>
          <button type="submit" class="btn btn-secondary text-xs flex-shrink-0">Add</button>
        </form>

        <!-- List of Captured Quick Notes -->
        ${(!data.quickCapture || data.quickCapture.length === 0) ? `
          <p class="text-xs text-text-subtle py-4 text-center">Your Quick Notes Inbox is clear! Press <kbd class="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Cmd+J</kbd> anytime to capture ideas on the fly.</p>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pt-1">
            ${data.quickCapture.map(item => `
              <div class="p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border flex items-center justify-between gap-3 text-xs group hover:border-accent/40 transition-all">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <span class="badge text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">${item.type}</span>
                  <span class="text-text font-medium truncate" title="${item.content}">${item.content}</span>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  ${item.type === 'Link' ? `
                    <button data-dash-convert-res="${item.id}" class="btn btn-secondary text-[10px] py-1 px-2 text-indigo-500" title="Pin to Vision Launchpad">
                      📌 Pin Link
                    </button>
                  ` : (item.type === 'Idea' ? `
                    <button data-dash-convert-goal="${item.id}" class="btn btn-secondary text-[10px] py-1 px-2 text-purple-500" title="Save as Goal">
                      🎯 Goal
                    </button>
                    <button data-dash-convert-qc="${item.id}" class="btn btn-secondary text-[10px] py-1 px-2 text-accent" title="Convert to Task">
                      ⚡ Task
                    </button>
                  ` : `
                    <button data-dash-convert-qc="${item.id}" class="btn btn-secondary text-[10px] py-1 px-2 text-accent" title="Convert to Task">
                      ⚡ Task
                    </button>
                  `)}
                  <button data-dash-delete-qc="${item.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <!-- Pinned Resource Launchpad (Polaroid Pinterest Board Style Grid) -->
      ${pinnedResources.length > 0 ? `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>📌 Pinned Vision Launchpad</span>
            </h3>
            <button id="view-all-res-btn" class="btn btn-ghost text-xs text-accent">View All Resources →</button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            ${pinnedResources.map(r => `
              <a 
                href="${r.url}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="polaroid-card text-center space-y-2 group"
              >
                <div class="w-9 h-9 rounded-xl bg-amber-500/10 p-1.5 mx-auto flex items-center justify-center border border-amber-500/20 group-hover:border-accent">
                  <img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.url)}&sz=64" alt="${r.title}" class="w-5 h-5 object-contain" onerror="this.src='https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg';" />
                </div>
                <span class="text-xs font-semibold text-text group-hover:text-accent truncate block">${r.title}</span>
              </a>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Main Dashboard 2-Column Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- Left 2 Columns: Priority Action Items & Projects -->
        <div class="lg:col-span-2 space-y-8">
          
          <!-- Focus Tasks -->
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="font-bold text-base text-text flex items-center gap-2">
                <span>⚡ Priority Next Steps</span>
              </h3>
              <button id="go-tasks-btn" class="btn btn-ghost text-xs text-accent">Tasks Engine →</button>
            </div>

            ${activeFocusTasks.length === 0 ? `
              <p class="text-xs text-text-subtle py-6 text-center">No pending priority tasks. You're all caught up!</p>
            ` : `
              <div class="space-y-2">
                ${activeFocusTasks.map(t => `
                  <div class="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-border text-xs">
                    <div 
                      data-dash-toggle-task="${t.id}"
                      class="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} class="w-4 h-4 rounded text-accent cursor-pointer" readonly />
                      <span class="font-medium text-text truncate">${t.title}</span>
                      <span class="badge badge-${t.priority}">${t.priority}</span>
                      ${t.sourceTag ? `<span class="badge text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-mono">${t.sourceTag}</span>` : ''}
                      ${t.timeBlock ? `<span class="text-[10px] text-accent font-mono">⏰ ${t.timeBlock.startTime}</span>` : ''}
                    </div>
                    <span class="text-[10px] font-mono text-text-subtle">${t.dueDate || ''}</span>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Active Portfolio Workspace -->
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="font-bold text-base text-text flex items-center gap-2">
                <span>📁 Flagship Portfolio Workspace</span>
              </h3>
              <button id="go-projects-btn" class="btn btn-ghost text-xs text-accent">Portfolio Hub →</button>
            </div>

            ${recentProjectsList.length === 0 ? `
              <p class="text-xs text-text-subtle py-6 text-center">No active projects defined.</p>
            ` : `
              <div class="grid grid-cols-1 gap-4">
                ${recentProjectsList.map(p => `
                  <div 
                    data-dash-open-proj="${p.id}"
                    class="polaroid-card cursor-pointer transition-all space-y-2 group"
                  >
                    <div class="flex items-center justify-between">
                      <span class="badge text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">${p.status}</span>
                      <span class="text-[10px] text-text-subtle font-mono">Deadline: ${p.deadline || 'None'}</span>
                    </div>
                    <h4 class="font-bold text-sm text-text group-hover:text-accent">${p.title}</h4>
                    <p class="text-xs text-text-subtle line-clamp-2">${p.description}</p>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>

        <!-- Right Column: Strategic Goals Summary -->
        <div class="space-y-8">
          
          <!-- Strategic Goals -->
          <div class="glass-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-2 border-b border-border">
              <h3 class="font-bold text-base text-text flex items-center gap-2">
                <span>🎯 Strategic Goals</span>
              </h3>
              <button id="go-goals-btn" class="btn btn-ghost text-xs text-accent">Goals Hub →</button>
            </div>

            ${activeGoalsList.length === 0 ? `
              <p class="text-xs text-text-subtle py-6 text-center">No active goals defined yet.</p>
            ` : `
              <div class="space-y-3">
                ${activeGoalsList.map(g => `
                  <div class="p-3.5 rounded-xl bg-white/50 dark:bg-white/5 border border-border space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="badge text-[9px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">${g.category || 'Personal'}</span>
                      <span class="text-[10px] text-text-subtle font-mono">${g.horizon}</span>
                    </div>
                    <h4 class="font-bold text-xs text-text truncate">${g.title}</h4>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

        </div>

      </div>

    </div>
  `;

  // Attach Dashboard Listeners
  container.querySelector('#save-sticky-btn')?.addEventListener('click', () => {
    const val = document.getElementById('sticky-input').value;
    store.updateStickyNote(val);
    alert('Focus scratchpad saved!');
  });

  container.querySelector('#dash-quick-task-btn')?.addEventListener('click', () => {
    store.setActiveTab('tasks');
  });

  container.querySelector('#dash-quick-capture-btn')?.addEventListener('click', () => {
    const event = new KeyboardEvent('keydown', { key: 'j', ctrlKey: true });
    window.dispatchEvent(event);
  });

  container.querySelector('#view-all-res-btn')?.addEventListener('click', () => {
    store.setActiveTab('resources');
  });

  container.querySelector('#go-tasks-btn')?.addEventListener('click', () => {
    store.setActiveTab('tasks');
  });

  container.querySelector('#go-projects-btn')?.addEventListener('click', () => {
    store.setActiveTab('projects');
  });

  container.querySelector('#go-goals-btn')?.addEventListener('click', () => {
    store.setActiveTab('goals');
  });

  container.querySelectorAll('[data-dash-toggle-task]').forEach(el => {
    el.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-dash-toggle-task');
      store.toggleTaskStatus(id);
    });
  });

  container.querySelector('#dash-open-qc-modal-btn')?.addEventListener('click', () => {
    const event = new KeyboardEvent('keydown', { key: 'j', ctrlKey: true });
    window.dispatchEvent(event);
  });

  container.querySelector('#dash-qc-inline-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('dash-qc-input').value.trim();
    const type = document.getElementById('dash-qc-type').value;
    if (content) {
      store.addQuickCapture({ content, type });
    }
  });

  container.querySelectorAll('[data-dash-convert-qc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-dash-convert-qc');
      store.convertQuickCaptureToTask(id);
    });
  });

  container.querySelectorAll('[data-dash-convert-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-dash-convert-res');
      store.convertQuickCaptureToResource(id);
    });
  });

  container.querySelectorAll('[data-dash-convert-goal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-dash-convert-goal');
      store.convertQuickCaptureToGoal(id);
    });
  });

  container.querySelectorAll('[data-dash-delete-qc]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-dash-delete-qc');
      store.deleteQuickCapture(id);
    });
  });

  if (window.lucide) window.lucide.createIcons();
}
