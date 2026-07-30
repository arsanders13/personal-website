import { store } from '../store.js';

export function renderHeader(container) {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });

  const { activeTab } = store;
  const capitalizedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);

  container.innerHTML = `
    <div class="flex items-center justify-between w-full">
      <!-- Left: Mobile Menu Toggle & Title -->
      <div class="flex items-center gap-4">
        <button id="mobile-sidebar-btn" class="md:hidden btn btn-ghost btn-icon">
          <i data-lucide="menu" class="w-5 h-5"></i>
        </button>
        
        <div class="flex flex-col">
          <h1 class="text-lg font-bold tracking-tight text-text">${capitalizedTab}</h1>
          <span class="text-xs text-text-subtle">${today} • Columbus, OH</span>
        </div>
      </div>

      <!-- Center: Global Search Trigger -->
      <div class="hidden sm:flex items-center flex-1 max-w-md mx-6">
        <button id="open-command-palette" class="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-border hover:border-accent/40 text-text-subtle hover:text-text transition-all duration-150 text-sm">
          <div class="flex items-center gap-2">
            <i data-lucide="search" class="w-4 h-4 text-text-subtle"></i>
            <span>Search tasks, goals, projects, notes...</span>
          </div>
          <div class="flex items-center gap-1">
            <kbd class="px-2 py-0.5 text-[10px] font-semibold text-text-subtle bg-white/10 rounded border border-border">⌘K</kbd>
          </div>
        </button>
      </div>

      <!-- Right: OSU Badge & Quick Add -->
      <div class="flex items-center gap-3">
        <span class="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-950/40 text-red-300 border border-red-800/30">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          OSU CSE '30
        </span>

        <button id="quick-capture-btn" class="btn btn-primary shadow-lg shadow-indigo-500/20">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span class="hidden sm:inline">Quick Add</span>
          <kbd class="hidden md:inline-block px-1.5 py-0.2 text-[10px] bg-white/20 rounded">⌘J</kbd>
        </button>
      </div>
    </div>
  `;

  // Attach Event Listeners
  container.querySelector('#open-command-palette')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  });

  container.querySelector('#quick-capture-btn')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-quick-capture'));
  });

  container.querySelector('#mobile-sidebar-btn')?.addEventListener('click', () => {
    store.toggleSidebar();
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}
