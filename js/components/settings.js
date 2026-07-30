import { store } from '../store.js';

export function renderSettings(container) {
  container.innerHTML = `
    <div class="max-w-3xl space-y-8 animate-fade-in">
      
      <!-- Theme & Aesthetics -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="sun" class="w-5 h-5 text-accent"></i>
          <h3 class="font-bold text-base text-text">Theme & Interface Design</h3>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <span class="font-bold text-sm text-text block">Current Color Mode</span>
            <span class="text-xs text-text-subtle">Switch between sleek Apple/Linear dark mode and clean light mode</span>
          </div>

          <button id="settings-theme-btn" class="btn btn-secondary text-xs">
            <i data-lucide="${store.theme === 'dark' ? 'sun' : 'moon'}" class="w-4 h-4"></i>
            <span>Switch to ${store.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </div>

      <!-- Data Persistence & Backups -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="database" class="w-5 h-5 text-emerald-400"></i>
          <h3 class="font-bold text-base text-text">Data Ownership & Local Backups</h3>
        </div>

        <div class="space-y-4 text-xs text-text-subtle">
          <p>Your Life OS stores all data locally in your browser with zero latency. You can export a full JSON backup at any time or restore from an existing file.</p>

          <div class="flex flex-wrap gap-4 pt-2">
            <button id="export-json-btn" class="btn btn-primary text-xs">
              <i data-lucide="download" class="w-4 h-4"></i>
              <span>Export Data JSON</span>
            </button>

            <label class="btn btn-secondary text-xs cursor-pointer">
              <i data-lucide="upload" class="w-4 h-4"></i>
              <span>Import Data JSON</span>
              <input id="import-json-file" type="file" accept=".json" class="hidden" />
            </label>

            <button id="reset-seed-btn" class="btn btn-ghost text-xs text-danger hover:bg-danger-bg">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Reset to Seed Data</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Cloud Sync & Supabase Integration Config -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="cloud" class="w-5 h-5 text-purple-400"></i>
          <h3 class="font-bold text-base text-text">Supabase Cloud Sync Adapter (Optional)</h3>
        </div>

        <div class="space-y-3">
          <p class="text-xs text-text-subtle">Connect your own Supabase project to enable real-time cross-device sync between laptop, tablet, and phone.</p>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Supabase Project URL</label>
            <input type="text" class="input-field text-xs" placeholder="https://xyzcompany.supabase.co" />
          </div>

          <div>
            <label class="text-xs font-semibold text-text-subtle block mb-1">Supabase Anon Key</label>
            <input type="password" class="input-field text-xs" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
          </div>

          <button class="btn btn-secondary text-xs" disabled>
            <span>Save Supabase Adapter Settings</span>
          </button>
        </div>
      </div>

      <!-- API Integrations Architecture -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center gap-2 pb-2 border-b border-border">
          <i data-lucide="layers" class="w-5 h-5 text-amber-400"></i>
          <h3 class="font-bold text-base text-text">Future Modular Integrations</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-white/5 border border-border flex items-center justify-between">
            <span class="font-bold text-text">Google Calendar API</span>
            <span class="badge text-[10px] bg-emerald-500/20 text-emerald-300">Ready</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-border flex items-center justify-between">
            <span class="font-bold text-text">Spotify Web API</span>
            <span class="badge text-[10px] bg-emerald-500/20 text-emerald-300">Ready</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-border flex items-center justify-between">
            <span class="font-bold text-text">Weather API</span>
            <span class="badge text-[10px] bg-emerald-500/20 text-emerald-300">Active</span>
          </div>

          <div class="p-3 rounded-xl bg-white/5 border border-border flex items-center justify-between">
            <span class="font-bold text-text">GitHub REST API</span>
            <span class="badge text-[10px] bg-purple-500/20 text-purple-300">Ready</span>
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach Events
  container.querySelector('#settings-theme-btn')?.addEventListener('click', () => store.toggleTheme());
  container.querySelector('#export-json-btn')?.addEventListener('click', () => store.exportBackup());
  
  container.querySelector('#import-json-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (store.importBackup(evt.target.result)) {
          alert('Data imported successfully!');
        } else {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    }
  });

  container.querySelector('#reset-seed-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset Life OS to initial OSU student seed data? Custom data will be reset.')) {
      store.resetSeedData();
    }
  });

  if (window.lucide) window.lucide.createIcons();
}
