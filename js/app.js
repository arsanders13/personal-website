import { store } from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderHeader } from './components/header.js';
import { initCommandPalette } from './components/commandPalette.js';
import { initQuickCaptureModal } from './components/quickCaptureModal.js';
import { initAuthModal } from './components/authModal.js';
import { initCalendarImportModal } from './components/calendarImportModal.js';

import { renderDashboard } from './components/dashboard.js';
import { renderTasks } from './components/tasks.js';
import { renderGoals } from './components/goals.js';
import { renderProjects } from './components/projects.js';
import { renderLearning } from './components/learning.js';
import { renderFinance } from './components/finance.js';
import { renderWishlist } from './components/wishlist.js';
import { renderJournal } from './components/journal.js';
import { renderResources } from './components/resources.js';
import { renderSettings } from './components/settings.js';
import { renderArchive } from './components/archive.js';

class App {
  constructor() {
    this.sidebarContainer = document.getElementById('sidebar-container');
    this.headerContainer = document.getElementById('header-container');
    this.mainViewContainer = document.getElementById('main-view');

    this.init();
  }

  init() {
    // Global Modals Initialization
    initCommandPalette();
    initQuickCaptureModal();
    initAuthModal();
    initCalendarImportModal();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.log('SW registration notice:', err);
      });
    }

    // Register Keyboard Shortcut for Sidebar (Cmd+\)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        store.toggleSidebar();
      }
    });

    // Register window hashchange listener for URL navigation & refresh persistence
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validTabs = ['dashboard', 'tasks', 'goals', 'projects', 'learning', 'finance', 'wishlist', 'journal', 'resources', 'settings', 'archive'];
      if (hash && validTabs.includes(hash) && store.activeTab !== hash) {
        store.setActiveTab(hash);
      }
    });

    // Subscribe to Store updates
    store.subscribe(() => {
      this.render();
    });

    // Initial Render
    this.render();
  }

  render() {
    const { activeTab } = store;

    // Render Shell Layout
    renderSidebar(this.sidebarContainer);
    renderHeader(this.headerContainer);

    // Render Active Tab View
    switch (activeTab) {
      case 'dashboard':
        renderDashboard(this.mainViewContainer);
        break;
      case 'tasks':
        renderTasks(this.mainViewContainer);
        break;
      case 'goals':
        renderGoals(this.mainViewContainer);
        break;
      case 'projects':
        renderProjects(this.mainViewContainer);
        break;
      case 'finance':
        renderFinance(this.mainViewContainer);
        break;
      case 'wishlist':
        renderWishlist(this.mainViewContainer);
        break;
      case 'journal':
        renderJournal(this.mainViewContainer);
        break;
      case 'resources':
        renderResources(this.mainViewContainer);
        break;
      case 'settings':
        renderSettings(this.mainViewContainer);
        break;
      case 'archive':
        renderArchive(this.mainViewContainer);
        break;
      default:
        renderDashboard(this.mainViewContainer);
    }

    // Refresh Icons globally
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      setTimeout(() => {
        window.lucide.createIcons();
      }, 10);
    }
  }
}

// Boot Life OS
function bootApp() {
  try {
    new App();
  } catch (err) {
    console.error('Failed to boot Life OS App:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
