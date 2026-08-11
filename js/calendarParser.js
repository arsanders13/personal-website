// Robust iCal (.ics) & Schedule Import Parser with Smart AI Deduplication
export function parseICSContent(icsText, sourceTag = 'Google Calendar') {
  const events = [];
  const lines = icsText.split(/\r\n|\n|\r/);
  let currentEvent = null;

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { sourceTag, status: 'todo', subtasks: [] };
      continue;
    }

    if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.title) {
        events.push(currentEvent);
      }
      currentEvent = null;
      continue;
    }

    if (currentEvent) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const prop = line.substring(0, colonIdx).toUpperCase();
      const val = line.substring(colonIdx + 1).replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\n/g, ' ');

      if (prop.startsWith('SUMMARY')) {
        currentEvent.title = val;
      } else if (prop.startsWith('LOCATION') || prop.startsWith('DESCRIPTION')) {
        if (!currentEvent.notes) currentEvent.notes = val;
        else if (val && !currentEvent.notes.includes(val)) currentEvent.notes += ` | ${val}`;
      } else if (prop.startsWith('DTSTART')) {
        currentEvent.dueDate = parseICSDate(val);
        currentEvent.startTime = parseICSTime(val);
      } else if (prop.startsWith('DTEND')) {
        currentEvent.endTime = parseICSTime(val);
      }
    }
  }

  return events;
}

function parseICSDate(val) {
  // Handles: 20260826T102000Z or 20260826
  const clean = val.replace(/[^0-9T]/g, '');
  if (clean.length >= 8) {
    const y = clean.substring(0, 4);
    const m = clean.substring(4, 6);
    const d = clean.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseICSTime(val) {
  // Handles: 20260826T102000Z or T102000 or 102000
  if (val.includes('T')) {
    const tPart = val.split('T')[1].replace(/[^0-9]/g, '');
    if (tPart.length >= 4) {
      const h = tPart.substring(0, 2);
      const m = tPart.substring(2, 4);
      return `${h}:${m}`;
    }
  }
  return '10:00';
}

// Smart Deduplication Helper: Merges duplicate events with matching title & time
export function smartDeduplicateEvents(existingTasks, newEvents) {
  const merged = [...existingTasks];
  let addedCount = 0;
  let mergedCount = 0;

  newEvents.forEach(newEvent => {
    const normTitle = (newEvent.title || '').toLowerCase().trim();
    const date = newEvent.dueDate;
    const startT = newEvent.startTime;

    const duplicate = merged.find(t => {
      const existingTitle = (t.title || '').toLowerCase().trim();
      const sameDate = t.dueDate === date;
      const sameTitle = existingTitle.includes(normTitle) || normTitle.includes(existingTitle);
      const sameTime = t.timeBlock && t.timeBlock.startTime === startT;
      return sameDate && (sameTitle || sameTime);
    });

    if (duplicate) {
      if (!duplicate.sourceTag.includes(newEvent.sourceTag)) {
        duplicate.sourceTag = `${duplicate.sourceTag} + ${newEvent.sourceTag}`;
      }
      if (newEvent.notes && !duplicate.notes?.includes(newEvent.notes)) {
        duplicate.notes = `${duplicate.notes || ''} | ${newEvent.notes}`.trim();
      }
      mergedCount++;
    } else {
      merged.unshift({
        id: 'task-import-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        title: newEvent.title,
        priority: 'medium',
        category: 'School (non-hw)',
        dueDate: newEvent.dueDate || new Date().toISOString().split('T')[0],
        startDate: newEvent.dueDate || new Date().toISOString().split('T')[0],
        timeBlock: newEvent.startTime && newEvent.endTime ? { startTime: newEvent.startTime, endTime: newEvent.endTime } : null,
        sourceTag: newEvent.sourceTag || 'Google Calendar',
        status: 'todo',
        subtasks: [],
        notes: newEvent.notes || ''
      });
      addedCount++;
    }
  });

  return { mergedTasks: merged, addedCount, mergedCount };
}
