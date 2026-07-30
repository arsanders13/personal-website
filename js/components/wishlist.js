import { store } from '../store.js';

export function renderWishlist(container) {
  const { data } = store;
  let activeCategory = 'All';

  function renderView() {
    let wishlist = data.wishlist;
    if (activeCategory !== 'All') {
      wishlist = wishlist.filter(w => w.category === activeCategory);
    }

    const categories = ['All', 'Tech', 'Books', 'Dorm', 'Apartment', 'Shopping', 'Gift Ideas', 'Games', 'Travel'];

    const totalCost = wishlist.reduce((acc, item) => acc + item.price, 0);
    const purchasedCost = wishlist.filter(w => w.purchased).reduce((acc, item) => acc + item.price, 0);

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Controls & Metrics Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4">
          <div class="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-border overflow-x-auto">
            ${categories.map(c => `
              <button 
                data-wish-cat-btn="${c}" 
                class="btn ${activeCategory === c ? 'btn-primary' : 'btn-ghost'} text-xs py-1.5 px-3"
              >
                ${c}
              </button>
            `).join('')}
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-[10px] text-text-subtle block">Wishlist Value</span>
              <span class="text-sm font-bold text-accent">$${totalCost.toFixed(2)} ($${purchasedCost.toFixed(2)} bought)</span>
            </div>
            
            <button id="add-wish-btn" class="btn btn-primary text-xs">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Add Item</span>
            </button>
          </div>
        </div>

        <!-- Wishlist Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${wishlist.map(w => renderWishItemCard(w)).join('')}
        </div>

      </div>
    `;

    attachEvents();
  }

  function renderWishItemCard(w) {
    return `
      <div class="glass-card overflow-hidden flex flex-col justify-between group ${w.purchased ? 'opacity-70' : ''}">
        <div>
          <!-- Image Header -->
          <div class="relative h-44 w-full bg-white/5 overflow-hidden">
            <img src="${w.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="${w.name}" />
            <div class="absolute top-3 left-3 flex items-center gap-1.5">
              <span class="badge badge-${w.priority}">${w.priority}</span>
              <span class="category-pill text-[10px] bg-black/60 backdrop-blur-md text-white border-none">${w.category}</span>
            </div>
            
            <button data-delete-wish="${w.id}" class="absolute top-3 right-3 btn btn-ghost btn-icon bg-black/60 backdrop-blur-md text-white hover:text-danger">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>

          <!-- Content -->
          <div class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-bold text-sm text-text leading-tight group-hover:text-accent transition-colors">${w.name}</h3>
              <span class="font-bold text-sm text-accent font-mono">$${w.price.toFixed(2)}</span>
            </div>
            ${w.notes ? `<p class="text-xs text-text-subtle line-clamp-2">${w.notes}</p>` : ''}
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-4 pt-0 flex items-center justify-between gap-2">
          <button data-toggle-wish-bought="${w.id}" class="btn ${w.purchased ? 'btn-secondary text-emerald-400' : 'btn-ghost'} text-xs flex-1">
            <i data-lucide="${w.purchased ? 'check-circle' : 'circle'}" class="w-3.5 h-3.5"></i>
            <span>${w.purchased ? 'Purchased' : 'Mark Bought'}</span>
          </button>

          ${w.link && w.link !== '#' ? `
            <a href="${w.link}" target="_blank" class="btn btn-secondary btn-icon" title="Open Link">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  function attachEvents() {
    container.querySelectorAll('[data-wish-cat-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.getAttribute('data-wish-cat-btn');
        renderView();
      });
    });

    container.querySelectorAll('[data-toggle-wish-bought]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-toggle-wish-bought');
        store.toggleWishlistPurchased(id);
      });
    });

    container.querySelectorAll('[data-delete-wish]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-wish');
        store.deleteWishlistItem(id);
      });
    });

    container.querySelector('#add-wish-btn')?.addEventListener('click', openAddWishModal);

    if (window.lucide) window.lucide.createIcons();
  }

  function openAddWishModal() {
    const modalHTML = `
      <div id="wish-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-md p-6 shadow-2xl animate-modal relative">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <h3 class="font-bold text-base text-text">Add Wishlist Item</h3>
            <button id="w-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <form id="create-wish-form" class="space-y-4">
            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Item Name *</label>
              <input id="w-name" type="text" class="input-field" placeholder="e.g. Keychron K2 Keyboard" required autofocus />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Price ($)</label>
                <input id="w-price" type="number" step="0.01" class="input-field" placeholder="89.00" required />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Category</label>
                <select id="w-category" class="input-field">
                  <option value="Tech" selected>Tech</option>
                  <option value="Books">Books</option>
                  <option value="Dorm">Dorm</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Gift Ideas">Gift Ideas</option>
                  <option value="Games">Games</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Priority</label>
                <select id="w-priority" class="input-field capitalize">
                  <option value="urgent">Urgent</option>
                  <option value="high" selected>High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Image URL (optional)</label>
                <input id="w-image" type="url" class="input-field" placeholder="https://..." />
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Product Link (optional)</label>
              <input id="w-link" type="url" class="input-field" placeholder="https://amazon.com/..." />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Notes</label>
              <textarea id="w-notes" rows="2" class="input-field resize-none" placeholder="Specs, color preferences, etc..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary w-full mt-4">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Save Wishlist Item</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;
    const modal = document.getElementById('wish-modal');
    modal.addEventListener('click', (e) => { if (e.target.id === 'wish-modal') modal.remove(); });
    document.getElementById('w-modal-close')?.addEventListener('click', () => modal.remove());

    document.getElementById('create-wish-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.addWishlistItem({
        name: document.getElementById('w-name').value,
        price: document.getElementById('w-price').value,
        category: document.getElementById('w-category').value,
        priority: document.getElementById('w-priority').value,
        image: document.getElementById('w-image').value,
        link: document.getElementById('w-link').value,
        notes: document.getElementById('w-notes').value
      });
      modal.remove();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  renderView();
}
