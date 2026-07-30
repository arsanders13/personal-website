import { store } from '../store.js';

let searchQuery = '';
let activeCategoryFilter = 'All';

// Color map for resource categories
const CATEGORY_COLORS = {
  'OSU Academic': 'bg-red-500/20 text-red-300 border-red-500/40',
  'Career': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  'Developer': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  'AI': 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  'Scheduling & Productivity': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  'Finance': 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  'Learning': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  'Utilities': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
};

export function renderResources(container) {
  const { data } = store;
  const resources = data.resources || [];

  // Clean Category Filter Pills
  const categories = [
    'All',
    '📌 Pinned',
    '⭐ Favorites',
    'OSU Academic',
    'Career',
    'Developer',
    'AI',
    'Scheduling & Productivity',
    'Finance',
    'Learning',
    'Utilities'
  ];

  // Apply Search & Category Filtering
  let filtered = resources.filter(r => {
    // Smart Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const titleMatch = (r.title || '').toLowerCase().includes(q);
      const descMatch = (r.description || '').toLowerCase().includes(q);
      const catMatch = (r.category || '').toLowerCase().includes(q);
      const tagsMatch = (r.tags || []).some(t => t.toLowerCase().includes(q));

      // Alias matching
      const aliasMatch = (q === 'resume' && (r.title.includes('LinkedIn') || r.title.includes('Handshake')));

      if (!titleMatch && !descMatch && !catMatch && !tagsMatch && !aliasMatch) {
        return false;
      }
    }

    // Category Filter
    if (activeCategoryFilter === '📌 Pinned') return r.isPinned;
    if (activeCategoryFilter === '⭐ Favorites') return r.isFavorite;
    if (activeCategoryFilter !== 'All') {
      return r.category.toLowerCase().includes(activeCategoryFilter.toLowerCase());
    }

    return true;
  });

  // Sort pinned first
  filtered.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const pinnedCount = resources.filter(r => r.isPinned).length;
  const favCount = resources.filter(r => r.isFavorite).length;

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in pb-16">
      
      <!-- Top Control Header & Smart Search Bar -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <i data-lucide="bookmark" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="font-bold text-lg text-text">Personal Resource Library & Launchpad</h2>
              <p class="text-xs text-text-subtle">Color-coded launchpad for official OSU portals, dev tools, AI models, & finance apps.</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button id="reload-default-res-btn" class="btn btn-secondary text-xs" title="Reset library to pre-populated starter bookmarks">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
              <span>Reload Starter Library</span>
            </button>
            <button id="add-resource-btn" class="btn btn-primary text-xs">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>+ Add Bookmark</span>
            </button>
          </div>
        </div>

        <!-- Smart Search & Quick Stats -->
        <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div class="relative w-full flex-1">
            <i data-lucide="search" class="w-4 h-4 text-text-subtle absolute left-3.5 top-3"></i>
            <input 
              id="res-search-input" 
              type="text" 
              placeholder="Search resources, descriptions, categories, or tags (e.g. 'resume', 'grades', 'dsa')..." 
              class="input-field pl-10 text-xs py-2.5"
              value="${searchQuery}"
            />
            ${searchQuery ? `
              <button id="clear-res-search" class="absolute right-3 top-2.5 text-text-subtle hover:text-text">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            ` : ''}
          </div>

          <div class="flex items-center gap-2 text-xs font-mono text-text-subtle flex-shrink-0">
            <span class="badge bg-amber-500/10 text-amber-400 border border-amber-500/30">📌 ${pinnedCount} Pinned</span>
            <span class="badge bg-rose-500/10 text-rose-400 border border-rose-500/30">⭐ ${favCount} Favorites</span>
          </div>
        </div>
      </div>

      <!-- Clean Category Filter Bar -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        ${categories.map(cat => {
          const isActive = activeCategoryFilter === cat;
          return `
            <button 
              data-cat-filter="${cat}"
              class="btn ${isActive ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3.5 whitespace-nowrap font-medium"
            >
              ${cat}
            </button>
          `;
        }).join('')}
      </div>

      <!-- Resource Grid -->
      ${filtered.length === 0 ? `
        <div class="glass-card p-12 text-center text-text-subtle text-sm space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <i data-lucide="search-x" class="w-6 h-6"></i>
          </div>
          <p class="font-semibold text-text">No resources found matching "${searchQuery}".</p>
          <button id="reset-res-filter" class="btn btn-secondary text-xs mt-2">Reset Filters</button>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${filtered.map(r => renderResourceCard(r)).join('')}
        </div>
      `}

    </div>
  `;

  // Attach Event Handlers
  container.querySelector('#res-search-input')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderResources(container);
  });

  container.querySelector('#clear-res-search')?.addEventListener('click', () => {
    searchQuery = '';
    renderResources(container);
  });

  container.querySelector('#reset-res-filter')?.addEventListener('click', () => {
    searchQuery = '';
    activeCategoryFilter = 'All';
    renderResources(container);
  });

  container.querySelector('#reload-default-res-btn')?.addEventListener('click', () => {
    if (confirm('Reload the full 35+ pre-populated starter resource library?')) {
      store.resetResourcesToDefault();
    }
  });

  container.querySelectorAll('[data-cat-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activeCategoryFilter = e.currentTarget.getAttribute('data-cat-filter');
      renderResources(container);
    });
  });

  container.querySelector('#add-resource-btn')?.addEventListener('click', openAddResourceModal);

  container.querySelectorAll('[data-toggle-pin]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-toggle-pin');
      store.toggleResourcePin(id);
    });
  });

  container.querySelectorAll('[data-toggle-fav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-toggle-fav');
      store.toggleResourceFavorite(id);
    });
  });

  container.querySelectorAll('[data-edit-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-edit-res');
      const res = resources.find(r => r.id === id);
      if (res) openEditResourceModal(res);
    });
  });

  container.querySelectorAll('[data-delete-res]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-delete-res');
      if (confirm('Delete this resource bookmark?')) {
        store.deleteResource(id);
      }
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function renderResourceCard(r) {
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.url)}&sz=64`;
  const catColor = CATEGORY_COLORS[r.category] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';

  return `
    <div class="glass-card p-6 space-y-4 flex flex-col justify-between hover:border-accent/40 transition-all duration-200 group relative">
      
      <!-- Top Badges & Actions -->
      <div class="space-y-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 min-w-0 pr-2">
            <!-- Official Favicon -->
            <div class="w-9 h-9 rounded-xl bg-white/10 p-1.5 flex items-center justify-center flex-shrink-0 border border-border group-hover:border-accent/50 transition-colors">
              <img src="${faviconUrl}" alt="${r.title}" class="w-5 h-5 object-contain" onerror="this.src='https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/globe.svg';" />
            </div>

            <div class="min-w-0 space-y-1">
              <!-- Color-Coded Home Category Pill -->
              <span class="badge text-[10px] font-bold border ${catColor}">${r.category}</span>
              <h3 class="font-bold text-base text-text group-hover:text-accent transition-colors truncate">${r.title}</h3>
            </div>
          </div>

          <!-- Pin & Fav Controls -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <button 
              data-toggle-pin="${r.id}"
              class="p-1 rounded-lg ${r.isPinned ? 'text-amber-400 bg-amber-500/10' : 'text-text-subtle hover:text-amber-400'}"
              title="${r.isPinned ? 'Unpin' : 'Pin to top'}"
            >
              📌
            </button>
            <button 
              data-toggle-fav="${r.id}"
              class="p-1 rounded-lg ${r.isFavorite ? 'text-rose-400 bg-rose-500/10' : 'text-text-subtle hover:text-rose-400'}"
              title="${r.isFavorite ? 'Unfavorite' : 'Mark Favorite'}"
            >
              ⭐
            </button>
          </div>
        </div>

        ${r.description ? `<p class="text-xs text-text-subtle leading-relaxed line-clamp-2">${r.description}</p>` : ''}

        <!-- Tags -->
        ${(r.tags && r.tags.length > 0) ? `
          <div class="flex items-center gap-1.5 flex-wrap pt-1">
            ${r.tags.map(t => `<span class="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-text-subtle border border-border">#${t}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Bottom Launch Button & Controls -->
      <div class="flex items-center justify-between pt-3 border-t border-border mt-2">
        <a 
          href="${r.url}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 group-hover:shadow-md transition-all"
        >
          <span>Open Link</span>
          <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
        </a>

        <div class="flex items-center gap-1">
          <button data-edit-res="${r.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-text" title="Edit Resource">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button data-delete-res="${r.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger" title="Delete Resource">
            <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// MODALS
// ----------------------------------------------------
function openAddResourceModal() {
  const categories = [
    'OSU Academic',
    'Career',
    'Developer',
    'AI',
    'Scheduling & Productivity',
    'Finance',
    'Learning',
    'Utilities'
  ];

  const modalHTML = `
    <div id="res-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Add Bookmark</h3>
          <button id="res-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="create-res-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Resource Title *</label>
            <input id="r-title" type="text" class="input-field" placeholder="e.g. BuckeyeLink Portal" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Official URL Link *</label>
            <input id="r-url" type="url" class="input-field" placeholder="https://..." required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Category *</label>
              <select id="r-category" class="input-field" required>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Tags (comma separated)</label>
              <input id="r-tags" type="text" class="input-field" placeholder="resume, jobs, osu" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="r-desc" rows="2" class="input-field resize-none" placeholder="Brief explanation of what this tool is used for..."></textarea>
          </div>

          <div class="flex items-center gap-6 pt-1">
            <label class="flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
              <input id="r-pinned" type="checkbox" class="w-4 h-4 rounded text-accent" />
              <span>Pin to Top 📌</span>
            </label>

            <label class="flex items-center gap-2 text-xs font-medium text-text cursor-pointer">
              <input id="r-fav" type="checkbox" class="w-4 h-4 rounded text-accent" />
              <span>Mark Favorite ⭐</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Add Bookmark</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('res-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'res-modal') modal.remove(); });
  document.getElementById('res-modal-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('create-res-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tagsStr = document.getElementById('r-tags').value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    store.addResource({
      title: document.getElementById('r-title').value,
      url: document.getElementById('r-url').value,
      category: document.getElementById('r-category').value,
      description: document.getElementById('r-desc').value,
      tags,
      isPinned: document.getElementById('r-pinned').checked,
      isFavorite: document.getElementById('r-fav').checked
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}

function openEditResourceModal(res) {
  const categories = [
    'OSU Academic',
    'Career',
    'Developer',
    'AI',
    'Scheduling & Productivity',
    'Finance',
    'Learning',
    'Utilities'
  ];

  const modalHTML = `
    <div id="edit-res-modal" class="modal-overlay">
      <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
          <h3 class="font-bold text-base text-text">Edit Resource Bookmark</h3>
          <button id="eres-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
        </div>

        <form id="edit-res-form" class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Resource Title *</label>
            <input id="er-title" type="text" class="input-field" value="${res.title}" required autofocus />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Official URL Link *</label>
            <input id="er-url" type="url" class="input-field" value="${res.url}" required />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Category *</label>
              <select id="er-category" class="input-field" required>
                ${categories.map(c => `<option value="${c}" ${res.category.includes(c) ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Tags (comma separated)</label>
              <input id="er-tags" type="text" class="input-field" value="${(res.tags || []).join(', ')}" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Short Description</label>
            <textarea id="er-desc" rows="2" class="input-field resize-none">${res.description || ''}</textarea>
          </div>

          <button type="submit" class="btn btn-primary w-full mt-4">
            <span>Save Bookmark Changes</span>
          </button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('modal-container').innerHTML = modalHTML;
  const modal = document.getElementById('edit-res-modal');
  modal.addEventListener('click', (e) => { if (e.target.id === 'edit-res-modal') modal.remove(); });
  document.getElementById('eres-close')?.addEventListener('click', () => modal.remove());

  document.getElementById('edit-res-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const tagsStr = document.getElementById('er-tags').value;
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];

    store.updateResource(res.id, {
      title: document.getElementById('er-title').value,
      url: document.getElementById('er-url').value,
      category: document.getElementById('er-category').value,
      description: document.getElementById('er-desc').value,
      tags
    });
    modal.remove();
  });

  if (window.lucide) window.lucide.createIcons();
}
