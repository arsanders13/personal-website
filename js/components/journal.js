import { store } from '../store.js';

export function renderJournal(container) {
  const { data } = store;
  const hasPin = Boolean(data.journalPin);
  const isUnlocked = !hasPin || store.isJournalUnlocked;

  function renderView() {
    if (!isUnlocked) {
      renderLockScreen();
      return;
    }

    const journalEntries = data.journal || [];

    container.innerHTML = `
      <div class="space-y-6 animate-fade-in">
        
        <!-- Controls Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between glass-card p-4 gap-4">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <i data-lucide="feather" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="font-bold text-base text-text flex items-center gap-2">
                <span>Daily Reflection Journal</span>
                ${hasPin ? `<span class="badge bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">🔓 PIN Protected</span>` : ''}
              </h2>
              <p class="text-xs text-text-subtle">Private daily thoughts, mood logs, and reflections.</p>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button id="set-pin-btn" class="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <i data-lucide="key" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>${hasPin ? 'Change PIN' : 'Set 4-Digit PIN'}</span>
            </button>

            ${hasPin ? `
              <button id="lock-now-btn" class="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-amber-400 border-amber-500/30">
                <i data-lucide="lock" class="w-3.5 h-3.5"></i>
                <span>Lock Now</span>
              </button>
            ` : ''}

            <button id="add-journal-btn" class="btn btn-primary text-xs py-1.5 px-3">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>New Daily Entry</span>
            </button>
          </div>
        </div>

        <!-- Journal Entries Timeline -->
        <div class="space-y-6">
          ${journalEntries.length === 0 ? `
            <div class="glass-card p-12 text-center text-text-subtle text-sm">
              No journal entries recorded yet. Click "New Daily Entry" to record today's reflections!
            </div>
          ` : journalEntries.map(entry => renderEntryCard(entry)).join('')}
        </div>

      </div>
    `;

    attachEvents();
  }

  function renderLockScreen() {
    container.innerHTML = `
      <div class="min-h-[70vh] flex items-center justify-center p-4 animate-fade-in">
        <div class="glass-card w-full max-w-md p-8 text-center space-y-6 border-amber-500/30 shadow-2xl">
          <div class="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <i data-lucide="lock" class="w-8 h-8"></i>
          </div>

          <div class="space-y-2">
            <h2 class="text-xl font-extrabold text-text">Private Journal Locked</h2>
            <p class="text-xs text-text-subtle">Enter your 4-digit security PIN to access your daily reflections.</p>
          </div>

          <form id="unlock-form" class="space-y-4">
            <div class="flex justify-center">
              <input 
                id="pin-input" 
                type="password" 
                maxlength="8" 
                placeholder="••••" 
                class="input-field text-center text-2xl font-mono tracking-widest w-40 py-2" 
                required 
                autofocus 
              />
            </div>

            <div id="pin-error-msg" class="text-xs text-danger font-medium hidden">Incorrect PIN. Please try again.</div>

            <button type="submit" class="btn btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2">
              <i data-lucide="unlock" class="w-4 h-4"></i>
              <span>Unlock Journal</span>
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('unlock-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pin = document.getElementById('pin-input').value;
      const success = store.unlockJournal(pin);
      if (!success) {
        const errEl = document.getElementById('pin-error-msg');
        if (errEl) errEl.classList.remove('hidden');
      }
    });
  }

  function renderEntryCard(entry) {
    const moodIcons = {
      'Productive': 'zap',
      'Calm': 'smile',
      'Focused': 'target',
      'Stressed': 'alert-circle',
      'Energetic': 'sun'
    };

    return `
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-border">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <i data-lucide="${moodIcons[entry.mood] || 'feather'}" class="w-5 h-5"></i>
            </div>
            <div>
              <span class="font-bold text-base text-text block">${new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span class="text-xs text-text-subtle">Mood: <strong class="text-amber-400">${entry.mood}</strong></span>
            </div>
          </div>
        </div>

        ${entry.reflection ? `
          <div class="space-y-1">
            <span class="text-xs font-semibold text-text-subtle uppercase tracking-wider block">Daily Reflection</span>
            <p class="text-sm text-text leading-relaxed">${entry.reflection}</p>
          </div>
        ` : ''}

        <!-- Wins -->
        ${entry.wins && entry.wins.length > 0 ? `
          <div class="space-y-1.5 pt-2">
            <span class="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Wins of the Day</span>
            <div class="space-y-1">
              ${entry.wins.map(w => `
                <div class="flex items-center gap-2 text-xs text-text">
                  <span class="text-emerald-400">✓</span>
                  <span>${w}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Lessons & Gratitude -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/50 text-xs">
          ${entry.lessons ? `
            <div class="p-3 rounded-xl bg-white/5 border border-border space-y-1">
              <span class="font-bold text-indigo-400 block">Lesson Learned</span>
              <span class="text-text-muted leading-snug block">${entry.lessons}</span>
            </div>
          ` : ''}

          ${entry.gratitude ? `
            <div class="p-3 rounded-xl bg-white/5 border border-border space-y-1">
              <span class="font-bold text-purple-400 block">Gratitude</span>
              <span class="text-text-muted leading-snug block">${entry.gratitude}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  function attachEvents() {
    container.querySelector('#add-journal-btn')?.addEventListener('click', openAddJournalModal);

    container.querySelector('#set-pin-btn')?.addEventListener('click', () => {
      const currentPin = data.journalPin;
      const promptMsg = currentPin
        ? 'Enter a new 4-digit PIN (or leave blank to remove PIN protection):'
        : 'Set a 4-digit security PIN for your private journal:';
      const newPin = prompt(promptMsg, currentPin || '');
      if (newPin !== null) {
        store.setJournalPin(newPin);
      }
    });

    container.querySelector('#lock-now-btn')?.addEventListener('click', () => {
      store.lockJournal();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  function openAddJournalModal() {
    const modalHTML = `
      <div id="journal-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative">
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-border">
            <h3 class="font-bold text-base text-text">New Journal & Reflection Entry</h3>
            <button id="j-modal-close" class="btn btn-ghost btn-icon"><i data-lucide="x" class="w-4 h-4"></i></button>
          </div>

          <form id="create-journal-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Date</label>
                <input id="j-date" type="date" class="input-field" value="${new Date().toISOString().split('T')[0]}" required />
              </div>

              <div>
                <label class="text-xs font-semibold text-text-subtle block mb-1">Current Mood</label>
                <select id="j-mood" class="input-field">
                  <option value="Productive" selected>⚡ Productive</option>
                  <option value="Calm">🧘 Calm</option>
                  <option value="Focused">🎯 Focused</option>
                  <option value="Stressed">😰 Stressed</option>
                  <option value="Energetic">☀️ Energetic</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Daily Reflection *</label>
              <textarea id="j-reflection" rows="3" class="input-field resize-none" placeholder="What stood out today? How did coding & studies go?" required autofocus></textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Wins of the Day (comma separated)</label>
              <input id="j-wins" type="text" class="input-field" placeholder="Solved LeetCode medium, Finished lab prep" />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Key Lesson Learned</label>
              <input id="j-lessons" type="text" class="input-field" placeholder="Consistency matters more than intensity." />
            </div>

            <div>
              <label class="text-xs font-semibold text-text-subtle block mb-1">Gratitude</label>
              <input id="j-gratitude" type="text" class="input-field" placeholder="Grateful for great professors and health." />
            </div>

            <button type="submit" class="btn btn-primary w-full mt-4">
              <i data-lucide="plus" class="w-4 h-4"></i>
              <span>Save Journal Entry</span>
            </button>
          </form>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;
    const modal = document.getElementById('journal-modal');
    modal.addEventListener('click', (e) => { if (e.target.id === 'journal-modal') modal.remove(); });
    document.getElementById('j-modal-close')?.addEventListener('click', () => modal.remove());

    document.getElementById('create-journal-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawWins = document.getElementById('j-wins').value;
      const wins = rawWins ? rawWins.split(',').map(w => w.trim()).filter(Boolean) : [];

      store.addJournalEntry({
        date: document.getElementById('j-date').value,
        mood: document.getElementById('j-mood').value,
        reflection: document.getElementById('j-reflection').value,
        wins,
        lessons: document.getElementById('j-lessons').value,
        gratitude: document.getElementById('j-gratitude').value
      });
      modal.remove();
    });

    if (window.lucide) window.lucide.createIcons();
  }

  renderView();
}
