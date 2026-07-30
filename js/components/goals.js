import { store } from '../store.js';

const GOAL_CATEGORY_COLORS = {
  'Academic': 'bg-red-500/20 text-red-300 border-red-500/40',
  'Career': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Projects': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Personal': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'Finance': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Health': 'bg-rose-500/20 text-rose-300 border-rose-500/40'
};

export function renderGoals(container) {
  const { data } = store;
  const goals = data.goals || [];

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      
      <!-- Top Control Header -->
      <div class="flex items-center justify-between glass-card p-4">
        <div class="flex items-center gap-2">
          <i data-lucide="target" class="w-5 h-5 text-accent"></i>
          <h2 class="font-bold text-base text-text">Strategic Life Goals</h2>
        </div>

        <button id="add-goal-btn" class="btn btn-primary text-xs">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>Create Goal</span>
        </button>
      </div>

      <!-- Goals Cards Container -->
      ${goals.length === 0 ? `
        <div class="glass-card p-12 text-center text-text-subtle text-sm space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <i data-lucide="target" class="w-6 h-6"></i>
          </div>
          <p class="font-semibold text-text">No active strategic goals defined yet.</p>
          <p class="text-xs text-text-subtle">Set high-level goals for your semester, college journey, or career horizon.</p>
          <button id="empty-add-goal-btn" class="btn btn-primary text-xs mt-2">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Create Your First Goal</span>
          </button>
        </div>
      ` : `
        <div class="space-y-4">
          ${goals.map(g => renderGoalCard(g)).join('')}
        </div>
      `}

    </div>
  `;

  // Attach Event Handlers
  container.querySelector('#add-goal-btn')?.addEventListener('click', openCreateGoalModal);
  container.querySelector('#empty-add-goal-btn')?.addEventListener('click', openCreateGoalModal);

  // Toggle Goal Card Expand/Collapse
  container.querySelectorAll('[data-toggle-goal]').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      const id = e.currentTarget.getAttribute('data-toggle-goal');
      store.toggleGoalExpanded(id);
    });
  });

  container.querySelectorAll('[data-edit-goal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-edit-goal');
      const goal = goals.find(g => g.id === id);
      if (goal) openEditGoalModal(goal);
    });
  });

  container.querySelectorAll('[data-delete-goal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-delete-goal');
      if (confirm('Delete this goal and all its milestones?')) {
        store.deleteGoal(id);
      }
    });
  });

  // Milestone Item Checkbox Toggle
  container.querySelectorAll('[data-toggle-m-item]').forEach(el => {
    el.addEventListener('click', (e) => {
      const [goalId, groupId, itemId] = e.currentTarget.getAttribute('data-toggle-m-item').split(':');
      store.toggleMilestoneItem(goalId, groupId, itemId);
    });
  });

  // Add Milestone Sub-Item
  container.querySelectorAll('[data-add-item-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const [goalId, groupId] = e.currentTarget.getAttribute('data-add-item-form').split(':');
      const input = e.currentTarget.querySelector('input');
      const itemTitle = input.value.trim();
      if (itemTitle) {
        store.addMilestoneItem(goalId, groupId, itemTitle);
        input.value = '';
      }
    });
  });

  // Delete Milestone Group
  container.querySelectorAll('[data-delete-group]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const [goalId, groupId] = e.currentTarget.getAttribute('data-delete-group').split(':');
      store.deleteMilestoneGroup(goalId, groupId);
    });
  });

  // Add Milestone Group (Category)
  container.querySelectorAll('[data-add-group-btn]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const goalId = e.currentTarget.getAttribute('data-add-group-btn');
      const groupTitle = prompt('Enter Milestone Group Name (e.g. Professional Foundation, Experience, Applications):');
      if (groupTitle && groupTitle.trim()) {
        store.addMilestoneGroup(goalId, groupTitle.trim());
      }
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderGoalCard(g) {
  let totalItems = 0;
  let completedItems = 0;

  if (g.milestoneGroups) {
    g.milestoneGroups.forEach(group => {
      if (group.items) {
        totalItems += group.items.length;
        completedItems += group.items.filter(i => i.completed).length;
      }
    });
  }

  const calcProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const isExpanded = g.isExpanded;
  const categoryColor = GOAL_CATEGORY_COLORS[g.category] || 'bg-accent/20 text-accent border-accent/40';

  return `
    <div class="glass-card overflow-hidden transition-all duration-200 border-border hover:border-accent/40">
      
      <!-- Goal Header Banner (Clickable to Expand) -->
      <div 
        data-toggle-goal="${g.id}"
        class="p-5 flex items-center justify-between cursor-pointer select-none bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div class="flex items-center gap-3 min-w-0 pr-4">
          <div class="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center flex-shrink-0 font-bold text-sm">
            🎯
          </div>

          <div class="min-w-0 space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Color-Coded Home Category Pill -->
              <span class="badge text-[10px] font-bold border ${categoryColor}">${g.category || 'Personal'}</span>
              <span class="badge text-[10px] bg-white/10 text-text-subtle font-mono capitalize">${g.horizon || 'Semester'}</span>
              ${g.deadline ? `<span class="text-[10px] text-text-subtle font-mono">Deadline: ${g.deadline}</span>` : ''}
            </div>
            <h3 class="font-bold text-base text-text truncate">${g.title}</h3>
          </div>
        </div>

        <div class="flex items-center gap-4 flex-shrink-0">
          <div class="hidden sm:flex flex-col items-end w-28">
            <div class="flex items-center justify-between w-full text-xs mb-1">
              <span class="text-text-subtle text-[10px]">Progress</span>
              <span class="font-bold text-accent font-mono">${calcProgress}%</span>
            </div>
            <div class="progress-bar-bg w-full">
              <div class="progress-bar-fill" style="width: ${calcProgress}%"></div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button data-edit-goal="${g.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-text" title="Edit Goal">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button data-delete-goal="${g.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Goal">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
            <span class="text-text-subtle p-1">${isExpanded ? '▲' : '▼'}</span>
          </div>
        </div>
      </div>

      <!-- Expandable Milestones Content -->
      ${isExpanded ? `
        <div class="p-6 border-t border-border space-y-6 bg-black/20 animate-fade-in">
          
          ${g.notes ? `
            <div class="p-3 rounded-xl bg-white/5 border border-border text-xs text-text-muted leading-relaxed">
              <span class="font-semibold text-text block mb-0.5">Goal Overview / Context:</span>
              ${g.notes}
            </div>
          ` : ''}

          <div class="flex items-center justify-between border-b border-border pb-2">
            <h4 class="font-bold text-sm text-text">Milestone Phases</h4>
            <button data-add-group-btn="${g.id}" class="btn btn-secondary text-xs">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ Add Milestone Group</span>
            </button>
          </div>

          ${(!g.milestoneGroups || g.milestoneGroups.length === 0) ? `
            <p class="text-xs text-text-subtle text-center py-4">No milestone groups added. Click "+ Add Milestone Group" to create sections like "Professional Foundation", "Experience", or "Applications".</p>
          ` : `
            <div class="space-y-6">
              ${g.milestoneGroups.map(group => renderMilestoneGroup(g.id, group)).join('')}
            </div>
          `}

        </div>
      ` : ''}

    </div>
  `;
}

function renderMilestoneGroup(goalId, group) {
  const items = group.items || [];
  const completedCount = items.filter(i => i.completed).length;

  return `
    <div class="space-y-3 p-4 rounded-2xl bg-white/5 border border-border">
      <div class="flex items-center justify-between pb-2 border-b border-border/60">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold text-text">☐ ${group.title}</span>
          <span class="text-[10px] font-mono text-text-subtle">(${completedCount}/${items.length} completed)</span>
        </div>
        
        <button data-delete-group="${goalId}:${group.id}" class="text-text-subtle hover:text-danger p-1" title="Delete Group">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>

      <div class="space-y-1.5 pl-2">
        ${items.map(item => `
          <div 
            data-toggle-m-item="${goalId}:${group.id}:${item.id}"
            class="flex items-center gap-2.5 cursor-pointer text-xs p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <input type="checkbox" ${item.completed ? 'checked' : ''} class="w-4 h-4 rounded text-accent cursor-pointer" readonly />
            <span class="${item.completed ? 'line-through text-text-subtle font-normal' : 'text-text font-medium'}">${item.title}</span>
          </div>
        `).join('')}
      </div>

      <form data-add-item-form="${goalId}:${group.id}" class="flex items-center gap-2 pt-2 border-t border-border/40">
        <input 
          type="text" 
          placeholder="+ Add item to ${group.title}..." 
          class="input-field text-xs py-1 px-3"
          required
        />
        <button type="submit" class="btn btn-secondary text-xs py-1 px-3">Add</button>
      </form>
    </div>
  `;
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function openCreateGoalModal() {
  const categories = ['Academic', 'Career', 'Projects', 'Personal', 'Finance', 'Health'];

  const modalHTML = `
    <div id="goal-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Create Strategic Goal</h3>
          <button id="g-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-goal-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Goal Title *</label>
            <input id="g-title" type="text" class="input-field" placeholder="e.g. 🎯 Get a Summer 2027 Internship" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Category *</label>
              <select id="g-category" class="input-field">
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Time Horizon</label>
              <select id="g-horizon" class="input-field">
                <option value="Semester">Semester</option>
                <option value="1-Year">1-Year</option>
                <option value="College Journey" selected>College Journey</option>
                <option value="Long-Term">Long-Term</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Target Deadline (optional)</label>
            <input id="g-deadline" type="date" class="input-field" />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Goal Overview / Notes</label>
            <textarea id="g-notes" rows="2" class="input-field resize-none" placeholder="Context or key outcomes..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Create Goal</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('goal-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'goal-modal') modal.remove(); });
  document.getElementById('g-modal-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-goal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addGoal({
      title: document.getElementById('g-title').value,
      category: document.getElementById('g-category').value,
      horizon: document.getElementById('g-horizon').value,
      deadline: document.getElementById('g-deadline').value,
      notes: document.getElementById('g-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditGoalModal(goal) {
  const categories = ['Academic', 'Career', 'Projects', 'Personal', 'Finance', 'Health'];

  const modalHTML = `
    <div id="edit-goal-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Edit Goal</h3>
          <button id="eg-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-goal-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Goal Title *</label>
            <input id="eg-title" type="text" class="input-field" value="${goal.title}" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Category *</label>
              <select id="eg-category" class="input-field">
                ${categories.map(c => `<option value="${c}" ${goal.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Time Horizon</label>
              <select id="eg-horizon" class="input-field">
                <option value="Semester" ${goal.horizon === 'Semester' ? 'selected' : ''}>Semester</option>
                <option value="1-Year" ${goal.horizon === '1-Year' ? 'selected' : ''}>1-Year</option>
                <option value="College Journey" ${goal.horizon === 'College Journey' ? 'selected' : ''}>College Journey</option>
                <option value="Long-Term" ${goal.horizon === 'Long-Term' ? 'selected' : ''}>Long-Term</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Target Deadline</label>
            <input id="eg-deadline" type="date" class="input-field" value="${goal.deadline || ''}" />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Goal Overview / Notes</label>
            <textarea id="eg-notes" rows="2" class="input-field resize-none">${goal.notes || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Save Goal Changes</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-goal-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-goal-modal') modal.remove(); });
  document.getElementById('eg-modal-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-goal-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateGoal(goal.id, {
      title: document.getElementById('eg-title').value,
      category: document.getElementById('eg-category').value,
      horizon: document.getElementById('eg-horizon').value,
      deadline: document.getElementById('eg-deadline').value,
      notes: document.getElementById('eg-notes').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}
