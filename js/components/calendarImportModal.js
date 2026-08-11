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
        <div id="cal-import-card" class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto space-y-5">
          
          <button id="cal-import-close" class="btn btn-ghost btn-icon absolute top-4 right-4 text-text-subtle hover:text-text">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <div class="text-center space-y-1">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold shadow-lg shadow-amber-500/20">
              <i data-lucide="calendar-plus" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-extrabold text-text">Sync Real Calendar & Course Schedule</h3>
            <p class="text-xs text-text-subtle">Select sub-calendars, filter out past events, and import your schedule cleanly.</p>
          </div>

          <!-- Step 1 View Container -->
          <div id="import-step-1" class="space-y-4">
            
            <!-- Clear Imported / Past Tasks Quick Cleanup -->
            <div class="p-3.5 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-between gap-3 text-xs">
              <div class="text-[11px] text-text-subtle">
                <strong class="text-danger block">Wipe Imported Historical Tasks?</strong>
                Clear out any old imported events before today.
              </div>
              <button id="clear-imported-btn" class="btn btn-secondary text-xs py-1 px-2.5 text-danger border-danger/40 hover:bg-danger/20 flex-shrink-0">
                Wipe Imported Tasks
              </button>
            </div>

            <!-- Method 1: Upload .zip or .ics File (Fastest & 100% Reliable) -->
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <span class="text-xs font-bold text-amber-300 block flex items-center justify-between">
                <span>📁 Upload Google Calendar (.zip) or (.ics) File</span>
                <span class="badge bg-emerald-500/20 text-emerald-400 text-[10px]">Select Sub-Calendars</span>
              </span>
              <p class="text-[11px] text-text-subtle">
                Upload your downloaded <strong>Google Calendar (.zip)</strong> file to pick which sub-calendars to import:
              </p>

              <input type="file" id="ics-file-input" accept=".zip,.ics,.ical,.csv,.txt" class="input-field text-xs py-1.5 cursor-pointer bg-white/5" />
            </div>

            <!-- Method 2: Paste iCal Secret URL -->
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3">
              <span class="text-xs font-bold text-text block">
                🔗 Paste Google Calendar Secret iCal Address
              </span>
              <input id="ical-url-input" type="url" placeholder="https://calendar.google.com/calendar/ical/.../basic.ics" class="input-field text-xs py-2 font-mono" />
              <button id="import-url-btn" class="btn btn-secondary w-full text-xs py-2 flex items-center justify-center gap-2">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Fetch Calendar Link</span>
              </button>
            </div>

            <!-- Method 3: Paste Raw iCal Text -->
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
              <span class="text-xs font-bold text-text block">
                📋 Paste iCal Text / Raw Schedule
              </span>
              <textarea id="ical-text-input" rows="2" class="input-field text-xs font-mono resize-none" placeholder="BEGIN:VCALENDAR..."></textarea>
              <button id="import-text-btn" class="btn btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-2">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                <span>Import Pasted Text</span>
              </button>
            </div>

          </div>

          <!-- Step 2 Sub-Calendar & Date Inspector Container (Hidden by default) -->
          <div id="import-step-2" class="space-y-4 hidden">
            <div class="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="font-bold text-sm text-text flex items-center gap-2">
                  <span>Choose Sub-Calendars to Import</span>
                </h4>
                <button id="back-to-step-1-btn" class="text-xs text-accent hover:underline">← Back</button>
              </div>

              <div id="subcal-list-container" class="space-y-2 max-h-48 overflow-y-auto pr-1"></div>
            </div>

            <!-- Date Range & Task Mode Filters -->
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3 text-xs">
              <span class="font-bold text-text block">📅 Date & Task Filters</span>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="filter-future-only" checked class="rounded text-accent" />
                <span class="text-text font-medium">Only import current & future events (From Today onwards)</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="filter-schedule-only" checked class="rounded text-accent" />
                <span class="text-text font-medium">Tag items as "Schedule Feed" (Keeps daily to-do tasks clean)</span>
              </label>
            </div>

            <button id="confirm-zip-import-btn" class="btn btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Import Selected Calendars</span>
            </button>
          </div>

          <div id="import-result-msg" class="text-xs font-medium text-center hidden"></div>

        </div>
      </div>
    `;

    document.getElementById('modal-container').innerHTML = modalHTML;
    if (window.lucide) window.lucide.createIcons();

    const modal = document.getElementById('cal-import-modal');
    document.getElementById('cal-import-close')?.addEventListener('click', () => modal.remove());
    modal?.addEventListener('click', (e) => { if (e.target.id === 'cal-import-modal') modal.remove(); });

    // Wipe imported tasks
    document.getElementById('clear-imported-btn')?.addEventListener('click', () => {
      store.clearAllSyncedDemoClasses();
      showMsg('✅ Wiped all imported calendar tasks!', false);
    });

    let zipParsedData = []; // Array of { name, filename, events }

    // Handle Method 1: File Upload (.zip or .ics)
    document.getElementById('ics-file-input')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showMsg('⏳ Reading calendar file...', false);

      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          if (!window.JSZip) throw new Error('JSZip extractor loading. Please try again.');
          const zip = new window.JSZip();
          const zipData = await zip.loadAsync(file);
          zipParsedData = [];

          for (let filename in zipData.files) {
            if (filename.toLowerCase().endsWith('.ics')) {
              const icsText = await zipData.files[filename].async('text');
              const calName = filename.replace('.ics', '').replace(/_/g, ' ').replace(/.*[/\\]/, '');
              const parsed = parseICSContent(icsText, calName);
              if (parsed.length > 0) {
                zipParsedData.push({ name: calName, filename, events: parsed });
              }
            }
          }

          if (zipParsedData.length === 0) {
            showMsg('No .ics calendar files found inside zip. Make sure it is a Google Calendar export.', true);
            return;
          }

          renderSubCalInspector(zipParsedData);
        } catch (err) {
          showMsg('Error reading ZIP: ' + (err.message || 'Invalid zip file'), true);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          const calName = file.name.replace('.ics', '');
          const events = parseICSContent(text, calName);
          renderSubCalInspector([{ name: calName, filename: file.name, events }]);
        };
        reader.readAsText(file);
      }
    });

    function renderSubCalInspector(cals) {
      document.getElementById('import-step-1').classList.add('hidden');
      document.getElementById('import-step-2').classList.remove('hidden');

      const listContainer = document.getElementById('subcal-list-container');
      listContainer.innerHTML = cals.map((c, idx) => `
        <label class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-border hover:border-accent/40 cursor-pointer">
          <div class="flex items-center gap-2 text-xs">
            <input type="checkbox" class="subcal-checkbox rounded text-accent" data-cal-index="${idx}" checked />
            <span class="font-bold text-text">${c.name}</span>
          </div>
          <span class="badge bg-white/10 text-text-subtle text-[10px] font-mono">${c.events.length} events</span>
        </label>
      `).join('');

      document.getElementById('back-to-step-1-btn')?.addEventListener('click', () => {
        document.getElementById('import-step-2').classList.add('hidden');
        document.getElementById('import-step-1').classList.remove('hidden');
      });

      document.getElementById('confirm-zip-import-btn')?.onclick = () => {
        const selectedIndices = Array.from(document.querySelectorAll('.subcal-checkbox:checked')).map(cb => parseInt(cb.getAttribute('data-cal-index'), 10));
        const filterFuture = document.getElementById('filter-future-only').checked;
        const tagSchedule = document.getElementById('filter-schedule-only').checked;

        const todayStr = new Date().toISOString().split('T')[0];
        let finalEvents = [];

        selectedIndices.forEach(idx => {
          const cal = cals[idx];
          cal.events.forEach(ev => {
            // Check future filter
            if (filterFuture && ev.dueDate && ev.dueDate < todayStr) return;
            if (tagSchedule) ev.sourceTag = `${cal.name} (Schedule Feed)`;
            finalEvents.push(ev);
          });
        });

        if (finalEvents.length === 0) {
          showMsg('No current/upcoming events found matching selected filters.', true);
          return;
        }

        const { addedCount, mergedCount } = store.importParsedCalendarEvents(finalEvents);
        showMsg(`🎉 Successfully imported ${addedCount} events (${mergedCount} duplicates merged cleanly)!`, false);
        setTimeout(() => modal.remove(), 2000);
      };
    }

    // Handle Method 2: URL Import
    document.getElementById('import-url-btn')?.addEventListener('click', async () => {
      const url = document.getElementById('ical-url-input').value.trim();
      if (!url) { showMsg('Please paste a valid iCal URL.', true); return; }

      showMsg('⏳ Connecting to Google Calendar...', false);
      const proxyEndpoints = [
        url,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ];

      let icsContent = '';
      for (let endpoint of proxyEndpoints) {
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const text = await res.text();
            if (text && text.includes('BEGIN:VCALENDAR')) { icsContent = text; break; }
          }
        } catch (e) {}
      }

      if (icsContent) {
        const events = parseICSContent(icsContent, 'Google Calendar');
        renderSubCalInspector([{ name: 'Google Calendar Feed', filename: 'gcal.ics', events }]);
      } else {
        showMsg('⚠️ Browser security blocked live link. Please upload your Google Calendar export (.zip) file above!', true);
      }
    });

    // Handle Method 3: Pasted Text Import
    document.getElementById('import-text-btn')?.addEventListener('click', () => {
      const rawText = document.getElementById('ical-text-input').value.trim();
      if (!rawText) { showMsg('Please paste your iCal text above.', true); return; }
      const events = parseICSContent(rawText, 'Imported Calendar');
      renderSubCalInspector([{ name: 'Pasted Calendar', filename: 'pasted.ics', events }]);
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
