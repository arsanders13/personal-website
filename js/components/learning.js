import { store } from '../store.js';

export function renderLearning(container) {
  const { activeTopicId } = store;

  if (activeTopicId) {
    renderTopicWorkspace(container, activeTopicId);
  } else {
    renderLearningDashboard(container);
  }
}

// ----------------------------------------------------
// 1. LEARNING DASHBOARD (LEVEL 1 & 2)
// ----------------------------------------------------
function renderLearningDashboard(container) {
  const { data } = store;
  const domains = data.domains || [];
  const topics = data.learning || [];

  const currentlyLearning = topics.filter(t => t.status === 'Learning' || t.status === 'Practicing');
  const comfortable = topics.filter(t => t.status === 'Comfortable');
  const mastered = topics.filter(t => t.status === 'Mastered');
  const notStarted = topics.filter(t => t.status === 'Not Started');

  const suggestedNext = notStarted.length > 0 ? notStarted[0] : (currentlyLearning.length > 0 ? currentlyLearning[0] : null);

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in pb-16">
      
      <!-- Top Control Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-4">
        <div class="flex items-center gap-2">
          <i data-lucide="graduation-cap" class="w-5 h-5 text-accent"></i>
          <div>
            <h2 class="font-bold text-base text-text">4-Year College Knowledge Hub</h2>
            <p class="text-xs text-text-subtle">Distill concepts, track practice, and connect skills to real projects & goals.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button id="add-domain-btn" class="btn btn-secondary text-xs">
            <i data-lucide="folder-plus" class="w-4 h-4"></i>
            <span>+ Add Domain</span>
          </button>
          <button id="add-topic-btn" class="btn btn-primary text-xs">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>+ Add Topic</span>
          </button>
        </div>
      </div>

      <!-- 📊 Dashboard Metric Summary Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-4 space-y-1">
          <span class="text-xs text-text-subtle font-semibold block">Currently Learning</span>
          <span class="text-2xl font-bold text-accent font-mono">${currentlyLearning.length}</span>
          <span class="text-[10px] text-text-subtle block">Active focus topics</span>
        </div>

        <div class="glass-card p-4 space-y-1">
          <span class="text-xs text-text-subtle font-semibold block">Comfortable & Mastered</span>
          <span class="text-2xl font-bold text-emerald-400 font-mono">${comfortable.length + mastered.length}</span>
          <span class="text-[10px] text-text-subtle block">Solid core skills</span>
        </div>

        <div class="glass-card p-4 space-y-1">
          <span class="text-xs text-text-subtle font-semibold block">Total Topics</span>
          <span class="text-2xl font-bold text-text font-mono">${topics.length}</span>
          <span class="text-[10px] text-text-subtle block">Across ${domains.length} domains</span>
        </div>

        <div class="glass-card p-4 space-y-1 bg-purple-950/20 border-purple-500/30">
          <span class="text-xs text-purple-300 font-semibold block">Suggested Next Focus</span>
          <div class="truncate font-bold text-sm text-text">${suggestedNext ? suggestedNext.topic : 'None'}</div>
          <span class="text-[10px] text-text-subtle block truncate">${suggestedNext ? suggestedNext.domain : 'All caught up!'}</span>
        </div>
      </div>

      <!-- LEVEL 1 & 2: DOMAINS & NESTED TOPICS GRID -->
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-border pb-2">
          <h3 class="font-bold text-base text-text flex items-center gap-2">
            <span>Level 1 & 2 — Domains & Learning Topics</span>
          </h3>
          <span class="text-xs text-text-subtle font-mono">${domains.length} Domains</span>
        </div>

        ${domains.length === 0 ? `
          <div class="glass-card p-12 text-center text-text-subtle text-sm space-y-3">
            <p>No learning domains defined yet.</p>
            <button id="empty-add-dom-btn" class="btn btn-primary text-xs">+ Add First Domain</button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${domains.map(dom => renderDomainCard(dom, topics)).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  // Attach Dashboard Event Listeners
  container.querySelector('#add-domain-btn')?.addEventListener('click', openAddDomainModal);
  container.querySelector('#empty-add-dom-btn')?.addEventListener('click', openAddDomainModal);
  container.querySelector('#add-topic-btn')?.addEventListener('click', openAddTopicModal);

  container.querySelectorAll('[data-open-topic]').forEach(card => {
    card.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-open-topic');
      store.setActiveTopicId(id);
    });
  });

  container.querySelectorAll('[data-edit-domain]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const domId = e.currentTarget.getAttribute('data-edit-domain');
      const dom = domains.find(d => d.id === domId);
      if (dom) openEditDomainModal(dom);
    });
  });

  container.querySelectorAll('[data-delete-domain]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const domId = e.currentTarget.getAttribute('data-delete-domain');
      if (confirm('Delete this domain and all associated topics?')) {
        store.deleteDomain(domId);
      }
    });
  });

  container.querySelectorAll('[data-add-topic-to-dom]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const domName = e.currentTarget.getAttribute('data-add-topic-to-dom');
      openAddTopicModal(domName);
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderDomainCard(dom, allTopics) {
  const domTopics = allTopics.filter(t => t.domain === dom.name);
  const total = domTopics.length;
  const done = domTopics.filter(t => t.status === 'Comfortable' || t.status === 'Mastered').length;
  const avgProgress = total > 0 ? Math.round(domTopics.reduce((acc, t) => acc + (t.progress || 0), 0) / total) : 0;

  const colorMap = {
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    rose: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
  };

  const statusBadges = {
    'Not Started': 'bg-white/10 text-text-subtle',
    'Learning': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Practicing': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Comfortable': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Mastered': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  return `
    <div class="glass-card p-6 space-y-4 flex flex-col justify-between border-t-2 ${colorMap[dom.color] || 'border-purple-500/30'}">
      
      <!-- Domain Header -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl ${colorMap[dom.color] || 'bg-purple-500/10'} flex items-center justify-center">
              <i data-lucide="${dom.icon || 'book-open'}" class="w-4 h-4"></i>
            </div>
            <div>
              <h4 class="font-bold text-base text-text">${dom.name}</h4>
              <span class="text-[10px] text-text-subtle font-mono">${done}/${total} Completed</span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button data-add-topic-to-dom="${dom.name}" class="btn btn-ghost btn-icon text-text-subtle hover:text-accent" title="Add Topic to Domain">
              <i data-lucide="plus" class="w-4 h-4"></i>
            </button>
            <button data-edit-domain="${dom.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-text" title="Edit Domain">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button data-delete-domain="${dom.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Domain">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>

        ${dom.description ? `<p class="text-xs text-text-subtle leading-relaxed">${dom.description}</p>` : ''}

        <!-- Domain Progress Bar -->
        <div class="space-y-1 pt-1">
          <div class="flex items-center justify-between text-[10px]">
            <span class="text-text-subtle">Domain Mastery</span>
            <span class="font-bold text-accent font-mono">${avgProgress}%</span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${avgProgress}%"></div>
          </div>
        </div>
      </div>

      <!-- Topics List (Level 2) -->
      <div class="space-y-2 pt-2 border-t border-border">
        ${domTopics.length === 0 ? `
          <p class="text-xs text-text-subtle py-3 text-center">No topics added to this domain yet.</p>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${domTopics.map(t => `
              <div 
                data-open-topic="${t.id}"
                class="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-border cursor-pointer transition-all duration-200 flex items-center justify-between group"
              >
                <span class="text-xs font-medium text-text group-hover:text-accent truncate pr-2">${t.topic}</span>
                <span class="badge text-[9px] ${statusBadges[t.status] || ''}">${t.status}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 2. LEVEL 3 — DEDICATED TOPIC WORKSPACE VIEW
// ----------------------------------------------------
let activeTopicTab = 'overview'; // 'overview', 'practice', 'resources', 'related', 'reflection'

function renderTopicWorkspace(container, id) {
  const { data } = store;
  const topic = (data.learning || []).find(t => t.id === id);

  if (!topic) {
    store.setActiveTopicId(null);
    return;
  }

  const statusBadges = {
    'Not Started': 'bg-white/10 text-text-subtle',
    'Learning': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Practicing': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Comfortable': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Mastered': 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  };

  const tabs = [
    { id: 'overview', label: '📌 Overview & Distilled Notes', icon: 'file-text' },
    { id: 'practice', label: '🧪 Practice Exercises', icon: 'check-circle-2', badge: topic.practiceItems ? topic.practiceItems.length : 0 },
    { id: 'resources', label: '📚 Resources', icon: 'book-open', badge: topic.resources ? topic.resources.length : 0 },
    { id: 'related', label: '🔗 Connected Projects & Goals', icon: 'link' },
    { id: 'reflection', label: '🪞 Reflection', icon: 'feather' }
  ];

  // Linked Projects & Goals
  const relatedProjects = (data.projects || []).filter(p => p.relatedLearning && p.relatedLearning.includes(topic.topic));
  const relatedGoals = (data.goals || []).filter(g => g.notes && g.notes.toLowerCase().includes(topic.topic.toLowerCase()));

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in pb-20">
      
      <!-- Top Navigation & Global Save Bar -->
      <div class="flex items-center justify-between">
        <button id="back-to-learning-btn" class="btn btn-ghost text-xs text-text-subtle hover:text-text flex items-center gap-2">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
          <span>Back to Learning Hub</span>
        </button>

        <div class="flex items-center gap-3">
          <button data-save-topic-workspace="${topic.id}" class="btn btn-primary text-xs shadow-lg shadow-indigo-500/20">
            <i data-lucide="save" class="w-4 h-4"></i>
            <span>Save Topic Notes</span>
          </button>

          <button id="edit-topic-details-btn" class="btn btn-secondary text-xs">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            <span>Edit Topic Details</span>
          </button>

          <button id="delete-topic-btn" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Topic">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- 📌 Clean Topic Header Banner -->
      <div class="glass-card p-6 md:p-8 space-y-4 border-indigo-500/30 bg-gradient-to-r from-indigo-950/20 via-bg-card to-bg-card">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="badge text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">${topic.domain}</span>
              <span class="badge text-xs ${statusBadges[topic.status] || ''}">${topic.status}</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight text-text">${topic.topic}</h1>
            ${topic.description ? `<p class="text-sm text-text-muted leading-relaxed">${topic.description}</p>` : ''}
          </div>

          <!-- Status Selector Pill -->
          <div class="w-full md:w-64 space-y-3 flex-shrink-0 bg-white/5 p-4 rounded-xl border border-border">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-text-subtle block">Learning Status</label>
              <select id="update-topic-status-select" class="input-field text-xs font-semibold">
                <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="Learning" ${topic.status === 'Learning' ? 'selected' : ''}>Learning</option>
                <option value="Practicing" ${topic.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                <option value="Comfortable" ${topic.status === 'Comfortable' ? 'selected' : ''}>Comfortable</option>
                <option value="Mastered" ${topic.status === 'Mastered' ? 'selected' : ''}>Mastered</option>
              </select>
            </div>

            <div class="space-y-1 pt-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-text-subtle">Topic Mastery</span>
                <span class="font-bold text-accent font-mono">${topic.progress || 0}%</span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${topic.progress || 0}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Workspace Tabs Navigation Bar -->
      <div class="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-border overflow-x-auto">
        ${tabs.map(tab => {
          const isActive = activeTopicTab === tab.id;
          return `
            <button 
              data-topic-tab="${tab.id}"
              class="btn ${isActive ? 'btn-primary' : 'btn-ghost'} text-xs py-2 px-4 flex items-center gap-2 font-medium"
            >
              <span>${tab.label}</span>
              ${tab.badge !== undefined && tab.badge > 0 ? `<span class="badge text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-text-subtle'}">${tab.badge}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Tab Content Area -->
      <div id="topic-tab-container" class="animate-fade-in">
        ${renderTopicTabContent(topic, activeTopicTab, relatedProjects, relatedGoals)}
      </div>

      <!-- Bottom Global Save Bar -->
      <div class="glass-card p-4 flex items-center justify-between bg-gradient-to-r from-indigo-950/20 via-bg-card to-bg-card border-indigo-500/30">
        <span class="text-xs text-text-subtle font-medium">Finished editing distilled notes or reflection?</span>
        
        <button data-save-topic-workspace="${topic.id}" class="btn btn-primary text-xs shadow-lg shadow-indigo-500/20">
          <i data-lucide="save" class="w-4 h-4"></i>
          <span>Save Topic Notes</span>
        </button>
      </div>

    </div>
  `;

  // Attach Navigation & Action Listeners
  container.querySelector('#back-to-learning-btn')?.addEventListener('click', () => {
    store.setActiveTopicId(null);
  });

  container.querySelectorAll('[data-topic-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeTopicTab = e.currentTarget.getAttribute('data-topic-tab');
      renderTopicWorkspace(container, id);
    });
  });

  container.querySelector('#update-topic-status-select')?.addEventListener('change', (e) => {
    store.updateLearningTopic(id, { status: e.target.value });
  });

  container.querySelectorAll('[data-save-topic-workspace]').forEach(btn => {
    btn.addEventListener('click', () => {
      saveTopicWorkspace(id);
    });
  });

  container.querySelector('#edit-topic-details-btn')?.addEventListener('click', () => {
    openEditTopicModal(topic);
  });

  container.querySelector('#delete-topic-btn')?.addEventListener('click', () => {
    if (confirm('Delete this learning topic workspace?')) {
      store.deleteLearningTopic(id);
    }
  });

  attachTopicTabEvents(container, topic, id);

  if (window.lucide) window.lucide.createIcons();
}

function renderTopicTabContent(topic, activeTab, relatedProjects, relatedGoals) {
  if (activeTab === 'overview') {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>📝 Distilled Knowledge & Concepts</span>
            </h3>
            <p class="text-xs text-text-subtle">Summarize concepts in your own words. (Not class notes—distilled formulas, cheat sheets, & key rules).</p>
          </div>
        </div>
        <textarea 
          id="topic-notes-input"
          rows="12" 
          class="w-full input-field resize-y text-sm font-mono leading-relaxed"
          placeholder="Write your distilled knowledge summary, cheat sheet notes, or key formulas..."
        >${topic.notes || ''}</textarea>
      </div>
    `;
  }

  if (activeTab === 'practice') {
    return `
      <div class="glass-card p-6 space-y-6">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <div>
            <h3 class="font-bold text-base text-text flex items-center gap-2">
              <span>🧪 Practice Exercises & Labs</span>
            </h3>
            <p class="text-xs text-text-subtle">Coding exercises, labs, problems solved, or mini-practice projects.</p>
          </div>
        </div>

        <form id="add-practice-form" class="flex items-center gap-2">
          <input id="tp-title" type="text" placeholder="Add practice exercise or problem..." class="input-field text-xs py-1.5 px-3" required />
          <button type="submit" class="btn btn-primary text-xs">Add Exercise</button>
        </form>

        <div class="space-y-2 pt-2">
          ${(!topic.practiceItems || topic.practiceItems.length === 0) ? `
            <p class="text-xs text-text-subtle py-6 text-center">No practice exercises added yet. Add LeetCode problems, lab assignments, or code exercises!</p>
          ` : topic.practiceItems.map(p => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
              <div 
                data-toggle-practice="${p.id}"
                class="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
              >
                <input type="checkbox" ${p.completed ? 'checked' : ''} class="w-4 h-4 rounded text-accent cursor-pointer" readonly />
                <span class="${p.completed ? 'line-through text-text-subtle' : 'text-text font-medium'} truncate">${p.title}</span>
              </div>
              <button data-delete-practice="${p.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  if (activeTab === 'resources') {
    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <h3 class="font-bold text-base text-text flex items-center gap-2">
            <span>📚 Learning Resources</span>
          </h3>
          <button id="add-topic-res-btn" class="btn btn-secondary text-xs">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Add Resource</span>
          </button>
        </div>

        ${(!topic.resources || topic.resources.length === 0) ? `
          <p class="text-xs text-text-subtle text-center py-8">No resources attached yet (YouTube, Documentation, Books, Courses, GitHub repos).</p>
        ` : `
          <div class="space-y-2">
            ${topic.resources.map(r => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
                <div class="flex items-center gap-2.5 min-w-0 pr-2">
                  <span class="badge text-[10px] bg-accent/15 text-accent">${r.type}</span>
                  <a href="${r.url}" target="_blank" class="font-medium text-text hover:text-accent truncate">${r.title}</a>
                </div>
                <button data-delete-topic-res="${r.id}" class="text-text-subtle hover:text-danger p-1">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  if (activeTab === 'related') {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="glass-card p-6 space-y-3">
          <h3 class="font-bold text-base text-text flex items-center gap-2 pb-2 border-b border-border">
            <span>🔗 Connected Projects</span>
          </h3>
          ${relatedProjects.length === 0 ? `
            <p class="text-xs text-text-subtle py-4">No projects linked to this topic yet. Connect this topic inside any Project Workspace!</p>
          ` : `
            <div class="space-y-2">
              ${relatedProjects.map(p => `
                <div class="p-3 rounded-xl bg-white/5 border border-border text-xs flex items-center justify-between">
                  <span class="font-medium text-text">${p.title}</span>
                  <span class="badge text-[9px] bg-purple-500/20 text-purple-300">${p.status}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <div class="glass-card p-6 space-y-3">
          <h3 class="font-bold text-base text-text flex items-center gap-2 pb-2 border-b border-border">
            <span>🎯 Connected Goals</span>
          </h3>
          ${relatedGoals.length === 0 ? `
            <p class="text-xs text-text-subtle py-4">No goals directly referencing this topic.</p>
          ` : `
            <div class="space-y-2">
              ${relatedGoals.map(g => `
                <div class="p-3 rounded-xl bg-white/5 border border-border text-xs flex items-center justify-between">
                  <span class="font-medium text-text">${g.title}</span>
                  <span class="badge text-[9px] bg-accent/20 text-accent">${g.horizon}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  }

  if (activeTab === 'reflection') {
    return `
      <div class="glass-card p-6 space-y-4 max-w-3xl">
        <div class="flex items-center justify-between pb-2 border-b border-border">
          <h3 class="font-bold text-base text-text flex items-center gap-2">
            <span>🪞 Learning Reflection</span>
          </h3>
          <span class="text-xs text-text-subtle">Synthesize how this concept clicked</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What finally made this click?</label>
            <textarea id="tr-clicked" rows="3" class="input-field text-xs resize-none" placeholder="Breakthrough moments or mental models...">${(topic.reflection && topic.reflection.whatClicked) || ''}</textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What was difficult?</label>
            <textarea id="tr-diff" rows="3" class="input-field text-xs resize-none" placeholder="Stumbling blocks or tricky syntax...">${(topic.reflection && topic.reflection.whatWasDifficult) || ''}</textarea>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">What do I still need to learn?</label>
            <textarea id="tr-need" rows="3" class="input-field text-xs resize-none" placeholder="Next sub-topics or advanced concepts...">${(topic.reflection && topic.reflection.needToLearn) || ''}</textarea>
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

function attachTopicTabEvents(container, topic, topicId) {
  container.querySelector('#add-practice-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('tp-title').value.trim();
    if (title) {
      store.addTopicPracticeItem(topicId, title);
      document.getElementById('tp-title').value = '';
    }
  });

  container.querySelectorAll('[data-toggle-practice]').forEach(el => {
    el.addEventListener('click', (e) => {
      const pId = e.currentTarget.getAttribute('data-toggle-practice');
      store.toggleTopicPracticeItem(topicId, pId);
    });
  });

  container.querySelectorAll('[data-delete-practice]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pId = e.currentTarget.getAttribute('data-delete-practice');
      store.deleteTopicPracticeItem(topicId, pId);
    });
  });

  container.querySelector('#add-topic-res-btn')?.addEventListener('click', () => openAddTopicResModal(topicId));

  container.querySelectorAll('[data-delete-topic-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const resId = e.currentTarget.getAttribute('data-delete-topic-res');
      store.deleteTopicResource(topicId, resId);
    });
  });
}

function saveTopicWorkspace(topicId) {
  const notes = document.getElementById('topic-notes-input')?.value;
  const updates = {};
  if (notes !== undefined) updates.notes = notes;

  const clicked = document.getElementById('tr-clicked')?.value;
  if (clicked !== undefined) {
    updates.reflection = {
      whatClicked: document.getElementById('tr-clicked')?.value || '',
      whatWasDifficult: document.getElementById('tr-diff')?.value || '',
      needToLearn: document.getElementById('tr-need')?.value || ''
    };
  }

  store.updateLearningTopic(topicId, updates);
  alert('Topic notes & reflection saved successfully!');
}

// ----------------------------------------------------
// 3. MODALS
// ----------------------------------------------------
function openAddDomainModal() {
  const modalHTML = `
    <div id="domain-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">Add Learning Domain</h3>
          <button id="dom-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-domain-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Domain Name *</label>
            <input id="dom-name" type="text" class="input-field" placeholder="e.g. Cybersecurity & Networking" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Description</label>
            <textarea id="dom-desc" rows="2" class="input-field resize-none" placeholder="Brief summary of domain focus..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Color Accent</label>
              <select id="dom-color" class="input-field">
                <option value="purple" selected>Purple</option>
                <option value="blue">Blue</option>
                <option value="amber">Amber</option>
                <option value="emerald">Emerald</option>
                <option value="rose">Rose</option>
                <option value="cyan">Cyan</option>
                <option value="indigo">Indigo</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Icon</label>
              <select id="dom-icon" class="input-field">
                <option value="cpu" selected>CPU</option>
                <option value="code-2">Code</option>
                <option value="globe">Globe</option>
                <option value="bot">Bot / AI</option>
                <option value="binary">Binary</option>
                <option value="briefcase">Briefcase</option>
                <option value="book-open">Book</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full text-xs mt-2">
            <span>Create Domain</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('domain-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'domain-modal') modal.remove(); });
  document.getElementById('dom-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-domain-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addDomain({
      name: document.getElementById('dom-name').value,
      description: document.getElementById('dom-desc').value,
      color: document.getElementById('dom-color').value,
      icon: document.getElementById('dom-icon').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditDomainModal(dom) {
  const modalHTML = `
    <div id="edit-dom-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">Edit Domain</h3>
          <button id="edom-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-domain-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Domain Name *</label>
            <input id="edom-name" type="text" class="input-field" value="${dom.name}" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Description</label>
            <textarea id="edom-desc" rows="2" class="input-field resize-none">${dom.description || ''}</textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Color Accent</label>
              <select id="edom-color" class="input-field">
                <option value="purple" ${dom.color === 'purple' ? 'selected' : ''}>Purple</option>
                <option value="blue" ${dom.color === 'blue' ? 'selected' : ''}>Blue</option>
                <option value="amber" ${dom.color === 'amber' ? 'selected' : ''}>Amber</option>
                <option value="emerald" ${dom.color === 'emerald' ? 'selected' : ''}>Emerald</option>
                <option value="rose" ${dom.color === 'rose' ? 'selected' : ''}>Rose</option>
                <option value="cyan" ${dom.color === 'cyan' ? 'selected' : ''}>Cyan</option>
                <option value="indigo" ${dom.color === 'indigo' ? 'selected' : ''}>Indigo</option>
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Icon</label>
              <select id="edom-icon" class="input-field">
                <option value="cpu" ${dom.icon === 'cpu' ? 'selected' : ''}>CPU</option>
                <option value="code-2" ${dom.icon === 'code-2' ? 'selected' : ''}>Code</option>
                <option value="globe" ${dom.icon === 'globe' ? 'selected' : ''}>Globe</option>
                <option value="bot" ${dom.icon === 'bot' ? 'selected' : ''}>Bot / AI</option>
                <option value="binary" ${dom.icon === 'binary' ? 'selected' : ''}>Binary</option>
                <option value="briefcase" ${dom.icon === 'briefcase' ? 'selected' : ''}>Briefcase</option>
                <option value="book-open" ${dom.icon === 'book-open' ? 'selected' : ''}>Book</option>
              </select>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-full text-xs mt-2">
            <span>Save Domain</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-dom-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-dom-modal') modal.remove(); });
  document.getElementById('edom-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-domain-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateDomain(dom.id, {
      name: document.getElementById('edom-name').value,
      description: document.getElementById('edom-desc').value,
      color: document.getElementById('edom-color').value,
      icon: document.getElementById('edom-icon').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddTopicModal(defaultDomain = '') {
  const { data } = store;
  const domains = data.domains || [];

  const modalHTML = `
    <div id="topic-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Create Learning Topic</h3>
          <button id="top-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-topic-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Topic Name *</label>
            <input id="top-title" type="text" class="input-field" placeholder="e.g. Data Structures & Algorithms" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Domain Category *</label>
              <select id="top-domain" class="input-field" required>
                ${domains.map(d => `<option value="${d.name}" ${d.name === defaultDomain ? 'selected' : ''}>${d.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Initial Status</label>
              <select id="top-status" class="input-field">
                <option value="Not Started" selected>Not Started</option>
                <option value="Learning">Learning</option>
                <option value="Practicing">Practicing</option>
                <option value="Comfortable">Comfortable</option>
                <option value="Mastered">Mastered</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="top-desc" rows="2" class="input-field resize-none" placeholder="Brief summary of topic scope..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Open Dedicated Topic Page</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('topic-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'topic-modal') modal.remove(); });
  document.getElementById('top-modal-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-topic-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTopic = store.addLearningTopic({
      topic: document.getElementById('top-title').value,
      domain: document.getElementById('top-domain').value,
      status: document.getElementById('top-status').value,
      description: document.getElementById('top-desc').value
    });
    modal.remove();
    store.setActiveTopicId(newTopic.id);
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditTopicModal(topic) {
  const { data } = store;
  const domains = data.domains || [];

  const modalHTML = `
    <div id="edit-topic-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Edit Topic Details</h3>
          <button id="et-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-topic-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Topic Name *</label>
            <input id="et-title" type="text" class="input-field" value="${topic.topic}" required autofocus />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Domain Category *</label>
              <select id="et-domain" class="input-field" required>
                ${domains.map(d => `<option value="${d.name}" ${d.name === topic.domain ? 'selected' : ''}>${d.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Learning Status</label>
              <select id="et-status" class="input-field">
                <option value="Not Started" ${topic.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                <option value="Learning" ${topic.status === 'Learning' ? 'selected' : ''}>Learning</option>
                <option value="Practicing" ${topic.status === 'Practicing' ? 'selected' : ''}>Practicing</option>
                <option value="Comfortable" ${topic.status === 'Comfortable' ? 'selected' : ''}>Comfortable</option>
                <option value="Mastered" ${topic.status === 'Mastered' ? 'selected' : ''}>Mastered</option>
              </select>
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="et-desc" rows="2" class="input-field resize-none">${topic.description || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Save Topic Details</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-topic-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-topic-modal') modal.remove(); });
  document.getElementById('et-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-topic-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.updateLearningTopic(topic.id, {
      topic: document.getElementById('et-title').value,
      domain: document.getElementById('et-domain').value,
      status: document.getElementById('et-status').value,
      description: document.getElementById('et-desc').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openAddTopicResModal(topicId) {
  const modalHTML = `
    <div id="topic-res-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-sm p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <h3 class="font-bold text-sm text-text">Add Topic Resource</h3>
          <button id="tres-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-tres-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Resource Title *</label>
            <input id="tres-title" type="text" class="input-field" placeholder="e.g. Java Collections API Docs" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">URL Link *</label>
            <input id="tres-url" type="url" class="input-field" placeholder="https://..." required />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Type</label>
            <select id="tres-type" class="input-field">
              <option value="Documentation" selected>Documentation</option>
              <option value="YouTube">YouTube Video</option>
              <option value="Book">Book</option>
              <option value="Article">Article</option>
              <option value="Course">Course</option>
              <option value="GitHub">GitHub Repo</option>
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
  const modal = document.getElementById('topic-res-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'topic-res-modal') modal.remove(); });
  document.getElementById('tres-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-tres-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    store.addTopicResource(topicId, {
      title: document.getElementById('tres-title').value,
      url: document.getElementById('tres-url').value,
      type: document.getElementById('tres-type').value
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}
