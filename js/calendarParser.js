// iCal (.ics) & Schedule Import Parser with Smart AI Deduplication
export function parseICSContent(icsText, sourceTag = 'Google Calendar') {
  const events = [];
  const lines = icsText.split(/\r\n|\n|\r/);
  let currentEvent = null;

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('BEGIN:VEVENT')) {
      currentEvent = { sourceTag, status: 'todo', subtasks: [] };
    } else if (line.startsWith('END:VEVENT')) {
      if (currentEvent && currentEvent.title) {
        events.push(currentEvent);
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('SUMMARY:')) {
        currentEvent.title = line.substring(8).replace(/\\,/g, ',').replace(/\\;/g, ';');
      } else if (line.startsWith('LOCATION:')) {
        currentEvent.notes = line.substring(9).replace(/\\,/g, ',').replace(/\\;/g, ';');
      } else if (line.startsWith('DTSTART')) {
        const val = line.split(':')[1];
        if (val) {
          currentEvent.dueDate = parseICSDate(val);
          currentEvent.startTime = parseICSTime(val);
        }
      } else if (line.startsWith('DTEND')) {
        const val = line.split(':')[1];
        if (val) {
          currentEvent.endTime = parseICSTime(val);
        }
      }
    }
  }

  return events;
}

function parseICSDate(val) {
  // Format: 20260826T102000Z
  if (val.length >= 8) {
    const y = val.substring(0, 4);
    const m = val.substring(4, 6);
    const d = val.substring(6, 8);
    return `${y}-${m}-${d}`;
  }
  return new Date().toISOString().split('T')[0];
}

function parseICSTime(val) {
  if (val.includes('T') && val.length >= 13) {
    const tPart = val.split('T')[1];
    const h = tPart.substring(0, 2);
    const m = tPart.substring(2, 4);
    return `${h}:${m}`;
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

    // Check if an existing task matches title & date
    const duplicate = merged.find(t => {
      const existingTitle = (t.title || '').toLowerCase().trim();
      const sameDate = t.dueDate === date;
      const sameTitle = existingTitle.includes(normTitle) || normTitle.includes(existingTitle);
      const sameTime = t.timeBlock && t.timeBlock.startTime === startT;
      return sameDate && (sameTitle || sameTime);
    });

    if (duplicate) {
      // Smart Merge: Combine source tags & details
      if (!duplicate.sourceTag.includes(newEvent.sourceTag)) {
        duplicate.sourceTag = `${duplicate.sourceTag} + ${newEvent.sourceTag}`;
      }
      if (newEvent.notes && !duplicate.notes?.includes(newEvent.notes)) {
        duplicate.notes = `${duplicate.notes || ''} | ${newEvent.notes}`.trim();
      }
      mergedCount++;
    } else {
      // Add new unique event
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
