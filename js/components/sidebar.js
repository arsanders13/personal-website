import { store } from '../store.js';

export function renderSidebar(container) {
  const { sidebarCollapsed, activeTab, data } = store;
  const profile = data.profile || { name: 'Arianna Sanders', title: 'OSU CSE student' };
  const pendingTasksCount = (data.tasks || []).filter(t => t.status !== 'done').length;
  const activeGoalsCount = (data.goals || []).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
    { id: 'tasks', label: 'Tasks', icon: 'check-square', badge: pendingTasksCount },
    { id: 'goals', label: 'Goals', icon: 'target', badge: activeGoalsCount },
    { id: 'projects', label: 'Projects', icon: 'folder-kanban' },
    { id: 'finance', label: 'Finance', icon: 'wallet' },
    { id: 'wishlist', label: 'Wishlist', icon: 'shopping-bag' },
    { id: 'journal', label: 'Journal', icon: 'feather' },
    { id: 'resources', label: 'Resources', icon: 'bookmark' },
    { id: 'settings', label: 'Settings', icon: 'sliders' },
    { id: 'archive', label: 'Archive', icon: 'archive' }
  ];

  container.innerHTML = `
    <div class="flex flex-col h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out py-5 px-3 select-none">
      
      <!-- Brand & Header -->
      <div class="flex items-center justify-between mb-6 px-3">
        <div class="flex items-center gap-3 cursor-pointer" id="sidebar-brand">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <i data-lucide="compass" class="w-5 h-5"></i>
          </div>
          ${!sidebarCollapsed ? `
            <div class="flex flex-col animate-fade-in">
              <span class="font-extrabold text-base tracking-tight text-text leading-none">Life OS</span>
              <span class="text-xs text-text-subtle font-medium mt-1">OSU CSE '30</span>
            </div>
          ` : ''}
        </div>
        
        <button id="toggle-sidebar-btn" class="btn btn-ghost btn-icon text-text-subtle hover:text-text" title="Toggle Sidebar (Cmd+\\)">
          <i data-lucide="${sidebarCollapsed ? 'chevron-right' : 'panel-left-close'}" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1.5 overflow-y-auto">
        ${navItems.map(item => {
          const isActive = activeTab === item.id;
          return `
            <button 
              data-tab="${item.id}"
              class="nav-tab-btn w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm' 
                  : 'text-text-muted hover:text-text hover:bg-white/5'
              }"
              title="${item.label}"
            >
              <div class="flex items-center gap-3">
                <i data-lucide="${item.icon}" class="w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-text-subtle'}"></i>
                ${!sidebarCollapsed ? `<span>${item.label}</span>` : ''}
              </div>
              ${!sidebarCollapsed && item.badge !== undefined && item.badge > 0 ? `
                <span class="text-xs px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/10 text-text-subtle'}">
                  ${item.badge}
                </span>
              ` : ''}
            </button>
          `;
        }).join('')}
      </nav>

      <!-- User Profile & Theme Footer -->
      <div class="pt-4 border-t border-border mt-auto flex flex-col gap-2">
        <div class="flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-2'}">
          ${!sidebarCollapsed ? `
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs border border-border flex-shrink-0">AS</div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-text truncate max-w-[110px]">${profile.name}</span>
                <span class="text-[10px] text-text-subtle truncate max-w-[110px]">OSU CSE '30</span>
              </div>
            </div>
          ` : ''}

          <button id="theme-toggle-btn" class="btn btn-ghost btn-icon text-text-subtle hover:text-text" title="Toggle Light / Dark Mode">
            <i data-lucide="${store.theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

    </div>
  `;

  // Attach Listeners
  container.querySelector('#toggle-sidebar-btn')?.addEventListener('click', () => store.toggleSidebar());
  container.querySelector('#theme-toggle-btn')?.addEventListener('click', () => store.toggleTheme());

  container.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.getAttribute('data-tab');
      store.setActiveTab(tab);
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}
