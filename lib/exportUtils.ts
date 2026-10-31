import { TimelineTask, EventPlan } from './types';

/**
 * Format a Date or date string + optional time into RFC 5545 iCalendar UTC date-time string
 * (e.g. 20260918T150000Z)
 */
function formatIcsDateTime(dateStr?: string, timeStr?: string, defaultHour = 9, durationMinutes = 60): { start: string; end: string } {
  const baseDate = dateStr ? new Date(dateStr) : new Date();
  const year = isNaN(baseDate.getFullYear()) ? new Date().getFullYear() : baseDate.getFullYear();
  const month = isNaN(baseDate.getMonth()) ? new Date().getMonth() : baseDate.getMonth();
  const day = isNaN(baseDate.getDate()) ? new Date().getDate() : baseDate.getDate();

  let startHour = defaultHour;
  let startMinute = 0;
  let endHour = defaultHour + Math.floor(durationMinutes / 60);
  let endMinute = durationMinutes % 60;

  if (timeStr) {
    // Try to parse strings like "08:30 AM - 10:00 AM" or "05:15 PM"
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const meridian = match[3]?.toUpperCase();
      if (meridian === 'PM' && h < 12) h += 12;
      if (meridian === 'AM' && h === 12) h = 0;
      startHour = h;
      startMinute = m;

      // Check for end time in the same string
      const endMatch = timeStr.match(/-\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (endMatch) {
        let eh = parseInt(endMatch[1], 10);
        const em = parseInt(endMatch[2], 10);
        const emeridian = endMatch[3]?.toUpperCase() || meridian;
        if (emeridian === 'PM' && eh < 12) eh += 12;
        if (emeridian === 'AM' && eh === 12) eh = 0;
        endHour = eh;
        endMinute = em;
      } else {
        endHour = startHour + 1;
        endMinute = startMinute;
      }
    }
  }

  const startDate = new Date(year, month, day, startHour, startMinute, 0);
  const endDate = new Date(year, month, day, endHour, endMinute, 0);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const toUtcString = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;

  return {
    start: toUtcString(startDate),
    end: toUtcString(endDate),
  };
}

/**
 * Escape iCal summary and description fields
 */
function escapeIcsText(str?: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * exportToiCal(timeline, eventTitle?, eventDate?)
 * Formats timeline tasks into an RFC 5545 .ics blob and triggers a browser download
 * for Google Calendar and Apple Calendar synchronization.
 */
export function exportToiCal(
  timeline: TimelineTask[],
  eventTitle = 'Aethel Event Production Schedule',
  eventDate?: string
): void {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const icsLines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aethel Atelier//Event OS Cadence//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(eventTitle)}`,
    'X-WR-TIMEZONE:UTC',
  ];

  timeline.forEach((task, idx) => {
    const targetDate = task.dueDate || eventDate;
    const { start, end } = formatIcsDateTime(targetDate, task.timeSlot, 9 + (idx % 8), 45);

    let priorityNum = 5;
    if (task.priority === 'critical') priorityNum = 1;
    else if (task.priority === 'high') priorityNum = 3;
    else if (task.priority === 'low') priorityNum = 9;

    const desc = [
      task.description || '',
      task.assignedTo ? `Lead: ${task.assignedTo}` : '',
      `Discipline: ${task.category}`,
      `Phase: ${task.phaseId}`,
      task.completed ? 'Status: [Completed]' : 'Status: [Pending]',
    ]
      .filter(Boolean)
      .join('\n');

    icsLines.push(
      'BEGIN:VEVENT',
      `UID:aethel-${task.id || idx}-${Date.now()}@aethel.atelier`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(task.title)}`,
      `DESCRIPTION:${escapeIcsText(desc)}`,
      `PRIORITY:${priorityNum}`,
      `STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}`,
      'CLASS:PUBLIC',
      'END:VEVENT'
    );
  });

  icsLines.push('END:VCALENDAR');

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  const filename = `${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cadence.ics`;
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
}

/**
 * generateShareableLink(eventData)
 * Encodes the active event state object into a Base64 URL parameter (?plan=...)
 * and copies a shareable URL to the clipboard.
 */
export function generateShareableLink(eventData: EventPlan): string {
  if (typeof window === 'undefined') return '';

  try {
    const jsonStr = JSON.stringify(eventData);
    // Safe UTF-8 to Base64 encode
    const base64 = btoa(
      encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );

    const shareUrl = `${window.location.origin}${window.location.pathname}?plan=${base64}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {
        // Fallback for non-https/unsupported environments
      });
    }

    return shareUrl;
  } catch (err) {
    console.error('Failed to generate shareable link:', err);
    return window.location.href;
  }
}

/**
 * decodeSharedPlan(base64String)
 * Decodes a Base64 string from the ?plan= URL parameter into an EventPlan object.
 */
export function decodeSharedPlan(base64String: string): EventPlan | null {
  try {
    const jsonStr = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64String), (c: string) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const parsed = JSON.parse(jsonStr) as EventPlan;
    if (parsed && parsed.title && Array.isArray(parsed.categories)) {
      return parsed;
    }
    return null;
  } catch (e) {
    console.warn('Could not decode shared plan parameter:', e);
    return null;
  }
}
