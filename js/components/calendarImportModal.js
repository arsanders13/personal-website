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
        <div class="glass-card w-full max-w-lg p-6 shadow-2xl animate-modal relative max-h-[90vh] overflow-y-auto space-y-5">
          
          <button id="cal-import-close" class="btn btn-ghost btn-icon absolute top-4 right-4 text-text-subtle hover:text-text">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>

          <div class="text-center space-y-1">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 font-bold shadow-lg shadow-amber-500/20">
              <i data-lucide="calendar-plus" class="w-6 h-6"></i>
            </div>
            <h3 class="text-lg font-extrabold text-text">Sync Real Calendar & Course Schedule</h3>
            <p class="text-xs text-text-subtle">Import your real Google Calendar or Power Planner schedule with Smart AI Deduplication.</p>
          </div>

          <!-- Import Methods -->
          <div class="space-y-4">
            
            <!-- Method 1: Upload .zip or .ics File (Fastest & 100% Reliable) -->
            <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <span class="text-xs font-bold text-amber-300 block flex items-center justify-between">
                <span>📁 Method 1: Upload .zip or .ics File (Recommended)</span>
                <span class="badge bg-emerald-500/20 text-emerald-400 text-[10px]">Supports Google Export ZIP</span>
              </span>
              <p class="text-[11px] text-text-subtle">
                Upload your downloaded <strong>Google Calendar export (.zip)</strong> or <strong>Power Planner (.ics)</strong> file below:
              </p>

              <input type="file" id="ics-file-input" accept=".zip,.ics,.ical,.csv,.txt" class="input-field text-xs py-1.5 cursor-pointer bg-white/5" />
            </div>

            <!-- Method 2: Paste iCal Secret URL -->
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-3">
              <span class="text-xs font-bold text-text block">
                🔗 Method 2: Paste Google Calendar Secret iCal Link
              </span>
              <p class="text-[11px] text-text-subtle">
                In Google Calendar (Desktop) ➔ Settings ➔ Select your Calendar ➔ Copy <strong>"Secret address in iCal format"</strong>:
              </p>

              <input id="ical-url-input" type="url" placeholder="https://calendar.google.com/calendar/ical/.../basic.ics" class="input-field text-xs py-2 font-mono" />
              <button id="import-url-btn" class="btn btn-secondary w-full text-xs py-2 flex items-center justify-center gap-2">
                <i data-lucide="download" class="w-3.5 h-3.5"></i>
                <span>Sync via Secret iCal Address</span>
              </button>
            </div>

            <!-- Method 3: Paste iCal Text Directly -->
            <div class="p-4 rounded-2xl bg-white/5 border border-border space-y-2">
              <span class="text-xs font-bold text-text block">
                📋 Method 3: Paste iCal Text / Raw Schedule
              </span>
              <p class="text-[11px] text-text-subtle">If you opened your .ics file in Notepad, paste the raw text below:</p>

              <textarea id="ical-text-input" rows="3" class="input-field text-xs font-mono resize-none" placeholder="BEGIN:VCALENDAR..."></textarea>
              <button id="import-text-btn" class="btn btn-secondary w-full text-xs py-1.5 flex items-center justify-center gap-2">
                <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                <span>Import Pasted iCal Text</span>
              </button>
            </div>

            <!-- Smart AI Deduplication Notice -->
            <div class="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs flex items-center gap-3">
              <i data-lucide="sparkles" class="w-5 h-5 text-indigo-400 flex-shrink-0"></i>
              <div class="text-[11px] text-text-subtle leading-tight">
                <strong class="text-text font-bold block">Smart AI Overlap Deduplication Active</strong>
                Overlapping classes or events on both Google Calendar and Power Planner will be merged into 1 clean item!
              </div>
            </div>

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

    // Handle Method 1: File Upload (.zip or .ics)
    document.getElementById('ics-file-input')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      showMsg('⏳ Extracting & reading calendar file...', false);

      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          if (!window.JSZip) throw new Error('Zip extractor initializing. Please try selecting the file again.');
          const zip = new window.JSZip();
          const zipData = await zip.loadAsync(file);
          let allEvents = [];

          for (let filename in zipData.files) {
            if (filename.toLowerCase().endsWith('.ics')) {
              const icsText = await zipData.files[filename].async('text');
              const sourceTag = filename.toLowerCase().includes('power') ? 'Power Planner' : 'Google Calendar';
              const parsed = parseICSContent(icsText, sourceTag);
              allEvents = allEvents.concat(parsed);
            }
          }

          if (allEvents.length === 0) {
            showMsg('No .ics calendar files found inside zip. Ensure it is your Google Calendar export .zip file.', true);
            return;
          }

          const { addedCount, mergedCount } = store.importParsedCalendarEvents(allEvents);
          showMsg(`🎉 Successfully imported ${addedCount} events from your Google Calendar ZIP (${mergedCount} duplicates merged)!`, false);
          setTimeout(() => modal.remove(), 2000);
        } catch (err) {
          showMsg('Error reading ZIP file: ' + (err.message || 'Invalid zip file'), true);
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          processICSText(text, file.name.toLowerCase().includes('power') ? 'Power Planner' : 'Google Calendar');
        };
        reader.readAsText(file);
      }
    });

    // Handle Method 2: URL Import with multi-proxy fallback loop
    document.getElementById('import-url-btn')?.addEventListener('click', async () => {
      const url = document.getElementById('ical-url-input').value.trim();
      if (!url) {
        showMsg('Please paste a valid iCal URL.', true);
        return;
      }

      showMsg('⏳ Connecting to Google Calendar...', false);

      const proxyEndpoints = [
        url, // Direct fetch
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
            if (text && text.includes('BEGIN:VCALENDAR')) {
              icsContent = text;
              break;
            }
          }
        } catch (e) {
          // Try next proxy in loop
        }
      }

      if (icsContent) {
        processICSText(icsContent, 'Google Calendar');
      } else {
        showMsg('⚠️ Browser CORS security blocked live link fetching. Please use "Method 1: Upload .ics File" above — export your .ics file from Google Calendar or Power Planner and upload it here!', true);
      }
    });

    // Handle Method 3: Pasted Text Import
    document.getElementById('import-text-btn')?.addEventListener('click', () => {
      const rawText = document.getElementById('ical-text-input').value.trim();
      if (!rawText) {
        showMsg('Please paste your iCal text above.', true);
        return;
      }
      processICSText(rawText, 'Imported Calendar');
    });

    function processICSText(text, sourceTag) {
      const events = parseICSContent(text, sourceTag);
      if (!events || events.length === 0) {
        showMsg('No valid events found in calendar data. Make sure it is an .ics file or iCal format.', true);
        return;
      }

      const { addedCount, mergedCount } = store.importParsedCalendarEvents(events);
      showMsg(`🎉 Successfully imported ${addedCount} events (${mergedCount} duplicates merged cleanly)!`, false);
      setTimeout(() => modal.remove(), 2000);
    }
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
