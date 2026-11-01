/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/generate/route';

const makeRequest = (body: unknown) =>
  ({ json: async () => body }) as unknown as NextRequest;

describe('API Fallback Engine Test', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    // Force the deterministic atelier fallback engine (no live Gemini call).
    process.env = { ...ORIGINAL_ENV };
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_GENAI_API_KEY;
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
    jest.restoreAllMocks();
  });

  test('generateIntelligentFallback builds balanced event blueprint', async () => {
    const response = await POST(
      makeRequest({
        prompt: 'Monsoon Wedding',
        eventContext: { eventType: 'wedding', totalBudget: 10000 },
      })
    );

    const fallback = await response.json();

    expect(fallback).toHaveProperty('eventMeta');
    expect(fallback).toHaveProperty('budgetBreakdown');
    expect(fallback).toHaveProperty('riskRadar');
    expect(fallback._engine).toBe('aethel-curated-atelier');
    expect(fallback._source).toBe('fallback');

    expect(fallback.eventMeta.totalBudget).toBe(10000);

    const totalPercentage = fallback.budgetBreakdown.reduce(
      (acc: number, item: { percentage: number }) => acc + item.percentage,
      0
    );
    expect(totalPercentage).toBe(100);
  });
});
