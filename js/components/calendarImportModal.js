import { store } from '../store.js';
import { parseICSContent } from '../calendarParser.js';

export function initCalendarImportModal() {
  window.addEventListener('open-calendar-import-modal', () => {
    openModal();
  });

  function openModal() {
    const existing = document.getElementById('cal-import-modal');
    if (existing) existing.remove();

    const modalHTML = `
      <div id="cal-import-modal" class="modal-overlay">
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto">
          
          <button id="cal-import-close" class="btn btn-ghost btn-icon absolute top-4 right-4 text-text-subtle hover:text-text">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <div class="space-y-5">
            <div class="text-center space-y-1">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold shadow-lg shadow-amber-500/20">
                <i data-lucide="calendar-plus" class="w-6 h-6"></i>
              </div>
              <h3 class="text-lg font-extrabold text-text">Sync Real Calendar & Course Schedule</h3>
              <p class="text-xs text-text-subtle">Import your real Google Calendar or Power Planner schedule with automatic Smart AI Deduplication.</p>
            </div>

            <!-- Import Method Tabs -->
            <div class="space-y-4">
              <!-- Method A: Upload .ics / .csv File -->
              <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
                <span class="text-xs font-bold text-text block flex items-center gap-2">
                  <span>📁 Method 1: Upload .ics File (Power Planner or Google Calendar)</span>
                </span>
                <p class="text-[11px] text-text-subtle">Export your calendar file from Power Planner or Google Calendar and drop it here.</p>

                <input type="file" id="ics-file-input" accept=".ics,.ical,.csv" class="input-field text-xs py-1.5" />
              </div>

              <!-- Method B: Google Calendar iCal URL -->
              <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3">
                <span class="text-xs font-bold text-text block flex items-center gap-2">
                  <span>🔗 Method 2: Paste Google Calendar iCal URL</span>
                </span>
                <p class="text-[11px] text-text-subtle">
                  In Google Calendar ➔ Settings ➔ Integrate calendar ➔ Copy <strong>"Secret address in iCal format"</strong>.
                </p>

                <input id="ical-url-input" type="url" placeholder="https://calendar.google.com/calendar/ical/.../basic.ics" class="input-field text-xs py-2 font-mono" />
                <button id="import-url-btn" class="btn btn-secondary w-full text-xs py-2 flex items-center justify-center gap-2">
                  <i data-lucide="download" class="w-3.5 h-3.5"></i>
                  <span>Import via iCal Link</span>
                </button>
              </div>

              <!-- Smart AI Deduplication Toggle Notice -->
              <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-center gap-3">
                <i data-lucide="sparkles" class="w-5 h-5 text-indigo-400 flex-shrink-0"></i>
                <div class="text-[11px] text-text-subtle leading-tight">
                  <strong class="text-text font-bold block">Smart AI Overlap Deduplication Active</strong>
                  If the same class or event exists on both Google Calendar and Power Planner, it will automatically merge them into 1 clean event instead of creating duplicates!
                </div>
              </div>
            </div>

            <div id="import-result-msg" class="text-xs font-medium text-center hidden"></div>

          </div>
        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;
    if (window.lucide) window.lucide.createIcons();

    const modal = document.getElementById('cal-import-modal');
    document.getElementById('cal-import-close')?.addEventListener('click', () => modal.remove());
    modal?.addEventListener('click', (e) => { if (e.target.id === 'cal-import-modal') modal.remove(); });

    // Handle File Upload
    document.getElementById('ics-file-input')?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const sourceTag = file.name.toLowerCase().includes('power') ? 'Power Planner' : 'Google Calendar';
        const events = parseICSContent(text, sourceTag);
        
        if (events.length === 0) {
          showMsg('No events found in file. Please ensure it is a valid .ics calendar file.', true);
          return;
        }

        const { addedCount, mergedCount } = store.importParsedCalendarEvents(events);
        showMsg(`✅ Imported ${addedCount} new events (${mergedCount} overlapping events merged cleanly)!`, false);
        setTimeout(() => modal.remove(), 2000);
      };
      reader.readAsText(file);
    });

    // Handle URL Import with CORS Proxy Fallback
    document.getElementById('import-url-btn')?.addEventListener('click', async () => {
      const url = document.getElementById('ical-url-input').value.trim();
      if (!url) {
        showMsg('Please paste a valid iCal link.', true);
        return;
      }

      try {
        showMsg('⏳ Syncing calendar data from Google...', false);
        let text = '';

        // Try direct fetch first
        try {
          const res = await fetch(url);
          if (res.ok) text = await res.text();
        } catch (e) {
          // Direct fetch failed (CORS block by browser). Use CORS Proxy Fallback!
        }

        // If direct fetch was blocked by CORS, fallback to CORS Proxy
        if (!text) {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl);
          if (!res.ok) throw new Error('Could not fetch calendar URL. Please verify your Google Calendar secret iCal address.');
          text = await res.text();
        }

        const events = parseICSContent(text, 'Google Calendar');
        if (!events || events.length === 0) {
          showMsg('No valid events found in calendar feed. Please ensure the link is a public or secret iCal address (.ics).', true);
          return;
        }

        const { addedCount, mergedCount } = store.importParsedCalendarEvents(events);
        showMsg(`✅ Successfully imported ${addedCount} events (${mergedCount} duplicates merged cleanly)!`, false);
        setTimeout(() => modal.remove(), 2000);
      } catch (err) {
        showMsg('⚠️ Google Calendar blocked direct fetch due to browser security. Please export your .ics file from Google Calendar or Power Planner and use "Method 1: Upload .ics File" above!', true);
      }
    });
  }

  function showMsg(text, isError) {
    const el = document.getElementById('import-result-msg');
    if (el) {
      el.textContent = text;
      el.className = `text-xs font-medium text-center ${isError ? 'text-danger' : 'text-emerald-400'}`;
      el.classList.remove('hidden');
    }
  }
}
