import { store } from '../store.js';

export function initQuickCaptureModal() {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
      e.preventDefault();
      openModal();
    }
  });

  window.addEventListener('open-quick-capture', () => {
    openModal();
  });

  function openModal() {
    const existing = document.getElementById('quick-capture-modal');
    if (existing) existing.remove();

    const { data } = store;

    const modalHTML = `
      <div id="quick-capture-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative">
          
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <i data-lucide="zap" class="w-4 h-4"></i>
              </div>
              <h2 class="text-base font-bold text-text">Quick Capture / Brain Dump</h2>
            </div>
            <button id="qc-close-btn" class="btn btn-ghost btn-icon">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <!-- Input Form -->
          <form id="qc-form" class="space-y-4">
            <div>
              <textarea 
                id="qc-input"
                rows="3" 
                placeholder="Capture anything instantly... (e.g. 'Look into OSU CSE Research lab options')" 
                class="input-field resize-none text-sm font-medium"
                required
                autofocus
              ></textarea>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs text-text-subtle">Type:</span>
                <select id="qc-type" class="input-field text-xs py-1 px-2 w-auto">
                  <option value="Idea">💡 Idea</option>
                  <option value="Task">✅ Task</option>
                  <option value="Link">🔗 Link</option>
                  <option value="Note">📝 Note</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary text-xs">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i>
                <span>Save to Inbox</span>
              </button>
            </div>
          </form>

          <!-- Recent Inbox Items -->
          ${data.quickCapture && data.quickCapture.length > 0 ? `
            <div class="mt-6 pt-4 border-t border-border">
              <span class="text-xs font-semibold text-text-subtle uppercase tracking-wider block mb-3">Recent Brain Dump Inbox (${data.quickCapture.length})</span>
              <div class="max-h-48 overflow-y-auto space-y-2">
                ${data.quickCapture.map(item => `
                  <div class="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-border text-xs">
                    <div class="flex items-center gap-2 min-w-0 pr-2">
                      <span class="badge text-[10px] bg-white/10 text-text-subtle">${item.type}</span>
                      <span class="text-text truncate">${item.content}</span>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0">
                      <button data-convert-qc="${item.id}" class="btn btn-ghost text-[10px] py-0.5 px-1.5 text-accent hover:underline" title="Convert to Task">
                        + Task
                      </button>
                      <button data-delete-qc="${item.id}" class="btn btn-ghost btn-icon text-text-subtle hover:text-danger">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;

    const modal = document.getElementById('quick-capture-modal');
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'quick-capture-modal') modal.remove();
    });

    document.getElementById('qc-close-btn')?.addEventListener('click', () => modal.remove());

    document.getElementById('qc-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const content = document.getElementById('qc-input').value.trim();
      const type = document.getElementById('qc-type').value;
      if (content) {
        store.addQuickCapture({ content, type });
        modal.remove();
      }
    });

    // Handle convert & delete
    modal.querySelectorAll('[data-convert-qc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-convert-qc');
        store.convertQuickCaptureToTask(id);
        modal.remove();
      });
    });

    modal.querySelectorAll('[data-delete-qc]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-delete-qc');
        store.deleteQuickCapture(id);
        openModal(); // Re-render modal
      });
    });

    if (window.lucide) window.lucide.createIcons();
  }
}
