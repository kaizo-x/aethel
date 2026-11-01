import { exportToiCal, generateShareableLink, decodeSharedPlan } from '../lib/exportUtils';
import { TimelineTask } from '../lib/types';
import { INITIAL_WEDDING } from '../lib/initialData';

/**
 * Lightweight Blob stand-in so we can inspect the iCal payload that
 * exportToiCal hands to URL.createObjectURL / Browser download.
 */
class MockBlob {
  content: string;
  mime: string;

  constructor(parts: BlobPart[], options?: { type?: string }) {
    this.content = (parts as unknown[]).map((p) => String(p)).join('');
    this.mime = options?.type ?? '';
  }

  text(): Promise<string> {
    return Promise.resolve(this.content);
  }
}

describe('exportUtils Test Suite', () => {
  const mockTimeline: TimelineTask[] = [
    {
      id: 'task-1',
      title: 'Book Venue',
      description: 'Sign the hillside estate contract',
      phaseId: 't-6m',
      category: 'Venue',
      completed: false,
      priority: 'high',
      assignedTo: 'Lead Planner',
      dueDate: '2026-03-15',
    },
  ];

  let createdBlobs: MockBlob[];

  beforeEach(() => {
    createdBlobs = [];
    (global as unknown as { Blob: typeof Blob }).Blob = MockBlob as unknown as typeof Blob;

    URL.createObjectURL = jest.fn((blob: Blob) => {
      createdBlobs.push(blob as unknown as MockBlob);
      return 'blob:mock-url';
    }) as unknown as typeof URL.createObjectURL;
    URL.revokeObjectURL = jest.fn() as unknown as typeof URL.revokeObjectURL;

    // Prevent jsdom from attempting navigation on the synthetic anchor click.
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('exportToiCal outputs valid RFC 5545 string', async () => {
    exportToiCal(mockTimeline, 'Test Wedding');

    expect(createdBlobs).toHaveLength(1);
    const icsString = await createdBlobs[0].text();

    expect(icsString).toContain('BEGIN:VCALENDAR');
    expect(icsString).toContain('END:VCALENDAR');
    expect(icsString).toContain('SUMMARY:Book Venue');
    expect(icsString).toContain('BEGIN:VEVENT');
    expect(icsString).toContain('END:VEVENT');
    expect(icsString).toContain('VERSION:2.0');
    expect(icsString).toContain('X-WR-CALNAME:Test Wedding');
    expect(createdBlobs[0].mime).toContain('text/calendar');
  });

  test('generateShareableLink & decodeSharedPlan roundtrip state', () => {
    const sampleState = INITIAL_WEDDING;
    const link = generateShareableLink(sampleState);

    expect(link).toContain('?plan=');

    const base64Param = link.split('?plan=')[1];
    const decoded = decodeSharedPlan(base64Param);

    expect(decoded).toEqual(sampleState);
  });

  test('decodeSharedPlan returns null for malformed input', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(decodeSharedPlan('not-a-valid-base64')).toBeNull();
  });
});
