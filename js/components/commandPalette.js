import { store } from '../store.js';

export function initCommandPalette() {
  let isOpen = false;

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
  });

  window.addEventListener('open-command-palette', () => {
    openPalette();
  });

  function togglePalette() {
    isOpen ? closePalette() : openPalette();
  }

  function openPalette() {
    isOpen = true;
    render();
  }

  function closePalette() {
    isOpen = false;
    const existing = document.getElementById('command-palette-modal');
    if (existing) existing.remove();
  }

  function render() {
    const modalContainer = document.getElementById('modal-container');
    const { data } = store;

    const modalHTML = `
      <div id="command-palette-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-xl p-0 overflow-hidden shadow-2xl animate-modal border-border">
          
          <!-- Search Input Header -->
          <div class="flex items-center px-4 py-3 border-b border-border bg-bg-glass">
            <i data-lucide="search" class="w-5 h-5 text-accent mr-3"></i>
            <input 
              id="cmd-input" 
              type="text" 
              placeholder="Search Life OS or jump to module... (Esc to close)" 
              class="w-full bg-transparent border-none text-text placeholder-text-subtle focus:outline-none text-sm font-medium"
              autofocus
            />
            <button id="cmd-close-btn" class="btn btn-ghost btn-icon text-text-subtle">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Results List -->
          <div id="cmd-results" class="max-h-96 overflow-y-auto p-2 space-y-1"></div>

          <!-- Footer Shortcut Hints -->
          <div class="px-4 py-2 bg-white/5 border-t border-border flex items-center justify-between text-[11px] text-text-subtle">
            <div class="flex items-center gap-3">
              <span><kbd class="px-1 bg-white/10 rounded">↑↓</kbd> Navigate</span>
              <span><kbd class="px-1 bg-white/10 rounded">↵</kbd> Select</span>
            </div>
            <span><kbd class="px-1 bg-white/10 rounded">Esc</kbd> Close</span>
          </div>

        </div>
      </div>
    `;

    modalContainer.insertAdjacentHTML('beforeend', modalHTML);

    const input = document.getElementById('cmd-input');
    const resultsContainer = document.getElementById('cmd-results');
    const closeBtn = document.getElementById('cmd-close-btn');

    closeBtn?.addEventListener('click', closePalette);
    document.getElementById('command-palette-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'command-palette-modal') closePalette();
    });

    input?.focus();
    input?.addEventListener('input', (e) => updateResults(e.target.value, resultsContainer));
    
    // Initial display of items
    updateResults('', resultsContainer);

    if (window.lucide) window.lucide.createIcons();
  }

  function updateResults(query, container) {
    const { data } = store;
    const q = query.toLowerCase().trim();

    const items = [];

    // Navigation Shortcuts
    const navs = [
      { type: 'Navigation', title: 'Dashboard View', tab: 'dashboard', icon: 'layout-dashboard' },
      { type: 'Navigation', title: 'Tasks Engine', tab: 'tasks', icon: 'check-square' },
      { type: 'Navigation', title: 'Goals & Milestones', tab: 'goals', icon: 'target' },
      { type: 'Navigation', title: 'Projects Workspace', tab: 'projects', icon: 'folder-kanban' },
      { type: 'Navigation', title: 'CS Learning Knowledge Hub', tab: 'learning', icon: 'book-open' },
      { type: 'Navigation', title: 'Finance Dashboard', tab: 'finance', icon: 'wallet' },
      { type: 'Navigation', title: 'Wishlist Manager', tab: 'wishlist', icon: 'shopping-bag' },
      { type: 'Navigation', title: 'Daily Journal', tab: 'journal', icon: 'feather' },
      { type: 'Navigation', title: 'OSU Resources Launchpad', tab: 'resources', icon: 'bookmark' },
      { type: 'Navigation', title: 'Settings & Backups', tab: 'settings', icon: 'sliders' }
    ];

    navs.forEach(n => {
      if (!q || n.title.toLowerCase().includes(q)) {
        items.push({ category: 'Navigation', title: n.title, icon: n.icon, action: () => store.setActiveTab(n.tab) });
      }
    });

    // Tasks
    data.tasks.forEach(t => {
      if (!q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
        items.push({ category: 'Tasks', title: t.title, badge: t.priority, icon: 'check-square', action: () => store.setActiveTab('tasks') });
      }
    });

    // Goals
    data.goals.forEach(g => {
      if (!q || g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)) {
        items.push({ category: 'Goals', title: g.title, badge: g.horizon, icon: 'target', action: () => store.setActiveTab('goals') });
      }
    });

    // Projects
    data.projects.forEach(p => {
      if (!q || p.title.toLowerCase().includes(q)) {
        items.push({ category: 'Projects', title: p.title, badge: p.status, icon: 'folder-kanban', action: () => store.setActiveTab('projects') });
      }
    });

    // Learning
    data.learning.forEach(l => {
      if (!q || l.topic.toLowerCase().includes(q) || l.domain.toLowerCase().includes(q)) {
        items.push({ category: 'Learning', title: l.topic, badge: l.domain, icon: 'book-open', action: () => store.setActiveTab('learning') });
      }
    });

    // Resources
    data.resources.forEach(r => {
      if (!q || r.title.toLowerCase().includes(q)) {
        items.push({ category: 'Resources', title: r.title, badge: 'Launch', icon: 'external-link', action: () => window.open(r.url, '_blank') });
      }
    });

    if (items.length === 0) {
      container.innerHTML = `<div class="p-4 text-center text-sm text-text-subtle">No matching results for "${query}"</div>`;
      return;
    }

    container.innerHTML = items.slice(0, 12).map((item, idx) => `
      <div 
        data-index="${idx}" 
        class="cmd-item flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-white/10 text-sm transition-colors duration-100"
      >
        <div class="flex items-center gap-3">
          <i data-lucide="${item.icon}" class="w-4 h-4 text-accent"></i>
          <span class="text-text font-medium">${item.title}</span>
        </div>
        <div class="flex items-center gap-2">
          ${item.badge ? `<span class="badge text-[10px] bg-white/10 text-text-subtle px-2 py-0.5 rounded">${item.badge}</span>` : ''}
          <span class="text-[10px] text-text-subtle font-mono">${item.category}</span>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.cmd-item').forEach((el, idx) => {
      el.addEventListener('click', () => {
        items[idx].action();
        closePalette();
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}
