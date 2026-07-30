import { store } from '../store.js';

export function renderArchive(container) {
  const { data } = store;
  const completedTasks = data.tasks.filter(t => t.status === 'done');
  const purchasedWishlist = data.wishlist.filter(w => w.purchased);

  container.innerHTML = `
    <div class="space-y-6 animate-fade-in">
      
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="archive" class="w-5 h-5 text-accent"></i>
          <h2 class="font-bold text-base text-text">Completed Tasks Archive (${completedTasks.length})</h2>
        </div>

        ${completedTasks.length === 0 ? `
          <p class="text-xs text-text-subtle">No archived tasks yet.</p>
        ` : `
          <div class="space-y-2">
            ${completedTasks.map(t => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span class="font-semibold text-text line-through opacity-70">${t.title}</span>
                  <span class="category-pill text-[10px]">${t.category}</span>
                </div>
                <span class="text-text-subtle font-mono">${t.dueDate}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="shopping-bag" class="w-5 h-5 text-emerald-400"></i>
          <h2 class="font-bold text-base text-text">Purchased Wishlist Items (${purchasedWishlist.length})</h2>
        </div>

        ${purchasedWishlist.length === 0 ? `
          <p class="text-xs text-text-subtle">No purchased items yet.</p>
        ` : `
          <div class="space-y-2">
            ${purchasedWishlist.map(w => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-emerald-400">✓</span>
                  <span class="font-semibold text-text">${w.name}</span>
                  <span class="category-pill text-[10px]">${w.category}</span>
                </div>
                <span class="font-bold text-accent font-mono">$${w.price.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>

    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}
