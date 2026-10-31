import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GeneratedEventResponse, BudgetCategory, RiskRadarItem, EventPlan } from '@/lib/types';

interface ReorchestrationIntent {
  isBudgetShift: boolean;
  fromCategory?: string;
  toCategory?: string;
  shiftPercentage?: number;
  newBudget?: number;
  detectedSeason?: string;
  detectedEventType?: string;
}

function parseReorchestrationIntent(prompt: string, context?: Partial<EventPlan>): ReorchestrationIntent {
  const p = (prompt || '').toLowerCase();
  const intent: ReorchestrationIntent = {
    isBudgetShift: false,
  };

  // Check budget shift keywords
  if (p.includes('shift') || p.includes('rebalance') || p.includes('reallocate') || p.includes('move budget')) {
    intent.isBudgetShift = true;
  }

  // Detect explicit budget amount e.g. "$4,000", "$4000", "4000 budget"
  const budgetMatch = p.match(/\$([0-9,]+)/) || p.match(/([0-9,]+)\s*(?:dollar|budget|usd)/);
  if (budgetMatch) {
    const rawNum = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(rawNum) && rawNum > 0) {
      intent.newBudget = rawNum;
    }
  }

  // Detect season / climate
  if (p.includes('monsoon') || p.includes('rain') || p.includes('wet') || p.includes('storm')) {
    intent.detectedSeason = 'monsoon';
  } else if (p.includes('winter') || p.includes('snow') || p.includes('cold')) {
    intent.detectedSeason = 'winter';
  } else if (p.includes('summer') || p.includes('heat') || p.includes('sun')) {
    intent.detectedSeason = 'summer';
  }

  // Detect category keywords
  if (p.includes('decor') && (p.includes('av') || p.includes('sound') || p.includes('stage'))) {
    intent.fromCategory = 'Decor';
    intent.toCategory = 'AV/Stage';
    intent.shiftPercentage = 10;
  } else if (p.includes('media') && p.includes('decor')) {
    intent.fromCategory = 'Media';
    intent.toCategory = 'Decor';
    intent.shiftPercentage = 5;
  }

  return intent;
}

// Fallback intelligent synthesizer when GEMINI_API_KEY is not configured or network fails
function generateIntelligentFallback(prompt: string, context?: Partial<EventPlan>): GeneratedEventResponse {
  const p = (prompt || '').toLowerCase();
  const cType = context?.eventType?.toLowerCase() || '';
  const intent = parseReorchestrationIntent(prompt, context);

  let eventType = 'Wedding';
  if (p.includes('birthday') || p.includes('soiree') || p.includes('anniversary') || cType.includes('birthday')) {
    eventType = 'Birthday';
  } else if (p.includes('community') || p.includes('plant') || p.includes('civic') || p.includes('drive') || cType.includes('community')) {
    eventType = 'Community';
  }

  const budget = intent.newBudget || context?.totalBudget || (eventType === 'Wedding' ? 25000 : eventType === 'Birthday' ? 4000 : 4000);
  const location = context?.location || (eventType === 'Wedding' ? 'Ojai Hillside Estate' : eventType === 'Birthday' ? 'Tribeca Loft' : 'Sycamore Greenway');

  // --------------------------------------------------------------------------
  // DYNAMIC RE-ORCHESTRATION: Shift from Decor to AV/Stage for Monsoon Community Drive
  // --------------------------------------------------------------------------
  if (eventType === 'Community' || intent.isBudgetShift) {
    const isMonsoon = intent.detectedSeason === 'monsoon' || p.includes('monsoon') || p.includes('rain');
    const avPct = isMonsoon ? 40 : 30; // Boosted for weather-sealed outdoor AV
    const decorPct = isMonsoon ? 15 : 25; // Trimmed from decor
    const permitsPct = 25;
    const opsPct = 20;

    const categories: BudgetCategory[] = [
      {
        id: 'cat-c-av-stage',
        name: 'AV, Stage & Waterproof Audio',
        percentage: avPct,
        allocated: Math.round((avPct / 100) * budget),
        color: '#1B3B36',
        iconName: 'Camera',
        items: [
          { id: 'item-av-1', name: 'IP65 Weather-Sealed Battery PA & Wireless Mic Array', estimated: Math.round(budget * 0.25), actual: 0, status: 'planned', notes: 'Waterproof covers and grounded generator connection' },
          { id: 'item-av-2', name: 'Covered Modular Riser Stage & Waterproof Tarps', estimated: Math.round(budget * 0.15), actual: 0, status: 'planned', notes: 'Raised 18 inches off muddy lawn perimeter' },
        ],
      },
      {
        id: 'cat-c-decor',
        name: 'Signage & Ambience (Streamlined)',
        percentage: decorPct,
        allocated: Math.round((decorPct / 100) * budget),
        color: '#C89047',
        iconName: 'Sparkles',
        items: [
          { id: 'item-dec-1', name: 'Laminated Waterproof Wayfinding & Chalkboard Directionals', estimated: Math.round(budget * (decorPct / 100)), actual: 0, status: 'planned', notes: 'Zero paper banners that disintegrate in rain' },
        ],
      },
      {
        id: 'cat-c-permits',
        name: 'Permits & Municipal Security',
        percentage: permitsPct,
        allocated: Math.round((permitsPct / 100) * budget),
        color: '#575553',
        iconName: 'ShieldCheck',
        items: [
          { id: 'item-perm-1', name: 'Parks Dept Rain Contingency Pavilion Permit', estimated: Math.round(budget * 0.15), actual: 0, status: 'paid_in_full' },
          { id: 'item-perm-2', name: 'Emergency Services Staging Clearance', estimated: Math.round(budget * 0.10), actual: 0, status: 'planned' },
        ],
      },
      {
        id: 'cat-c-ops',
        name: 'Refreshments, Ponchos & Ops',
        percentage: opsPct,
        allocated: Math.round((opsPct / 100) * budget),
        color: '#757270',
        iconName: 'Building',
        items: [
          { id: 'item-ops-1', name: 'Hot Spiced Apple Cider & Hearty Sourdough Soup Urns', estimated: Math.round(budget * 0.12), actual: 0, status: 'planned' },
          { id: 'item-ops-2', name: '100 Biodegradable Cornstarch Rain Ponchos & Cocoa Mud Mats', estimated: Math.round(budget * 0.08), actual: 0, status: 'planned' },
        ],
      },
    ];

    const specificRisks: RiskRadarItem[] = [
      {
        id: 'rr-gen-1',
        risk: 'Monsoon Flash Downpour & Electrical Cable Short-Circuit',
        severity: 'High',
        mitigation: 'Elevate all distribution boxes 12 inches on rubber pallets; deploy heavy-duty IP65 rubber cable crossovers.',
        resolved: false,
      },
      {
        id: 'rr-gen-2',
        risk: 'Grassland Turf Degradation & Deep Riparian Mud Slips',
        severity: 'High',
        mitigation: 'Pre-lay 200 feet of interlocking cocoa-coir mud boardwalks between check-in and stage pavilion.',
        resolved: false,
      },
      {
        id: 'rr-gen-3',
        risk: 'Municipal Park Digging Permit Suspension Due to Saturated Ground',
        severity: 'Medium',
        mitigation: 'Secure written Parks Dept secondary clearance for raised gravel-bed planter boxes if lawn is flooded.',
        resolved: false,
      },
      {
        id: 'rr-gen-4',
        risk: 'Sudden Wind Gusts Straining Canopy Staking',
        severity: 'Low',
        mitigation: 'Replace standard ground stakes with 50-pound iron water-barrel ballast anchors per leg.',
        resolved: false,
      },
    ];

    return {
      eventMeta: {
        title: context?.title || 'Outdoor Civic Community Drive & Monsoon Assembly',
        eventType: 'Community',
        totalBudget: budget,
      },
      riskRadar: specificRisks,
      personalizedIdeas: {
        theme: 'Weather-Resilient Botanical Civic Action, Burlap & Waterproof Canvas',
        colorPalette: ['#1B3B36', '#2F4F4F', '#C89047', '#EAE4DC'],
        decorHighlights: [
          'Heavy industrial wax-canvas briefing canopies',
          'Interlocking woven cocoa-coir mud walkways',
          'Laminated chalk garden stakes with waterproof seal',
        ],
      },
      budgetBreakdown: [
        { category: 'AV, Stage & Waterproof Audio', allocatedAmount: Math.round(budget * (avPct / 100)), percentage: avPct },
        { category: 'Signage & Ambience', allocatedAmount: Math.round(budget * (decorPct / 100)), percentage: decorPct },
        { category: 'Permits & Municipal Security', allocatedAmount: Math.round(budget * (permitsPct / 100)), percentage: permitsPct },
        { category: 'Refreshments, Ponchos & Ops', allocatedAmount: Math.round(budget * (opsPct / 100)), percentage: opsPct },
      ],
      rebalancedCategories: categories,
      timeline: [
        { timeframe: 'T-72 Hours', tasks: ['Inspect weather radar and verify secondary park pavilion hold', 'Test IP65 waterproofing on audio equipment'] },
        { timeframe: 'T-24 Hours', tasks: ['Lay cocoa-coir mud mats along main guest walking artery', 'Stage 100 cornstarch rain ponchos at check-in'] },
        { timeframe: 'Day-Of (07:30 AM)', tasks: ['Elevate generator and distribution boxes on rubber pallets', 'Conduct decibel check and rain canopy tie-down test'] },
        { timeframe: 'Day-Of (11:30 AM)', tasks: ['Dispense hot spiced soup urns and warm sourdough loaves', 'Commence acoustic stage performances'] },
      ],
      chatReply: `Dynamic re-orchestration calculated for "${context?.title || 'Community Drive'}" at $${budget.toLocaleString()}:\n\n` +
        `• Shifted budget allocation: **AV & Waterproof Sound increased to ${avPct}%** ($${Math.round(budget * (avPct / 100)).toLocaleString()}) to guarantee covered stage risers and IP65 wet-weather cables.\n` +
        `• Streamlined **Decor to ${decorPct}%** ($${Math.round(budget * (decorPct / 100)).toLocaleString()}) focusing on zero-waste, rain-resistant wayfinding.\n` +
        `• Added 4 monsoon risk mitigations including cocoa-coir mud paths and 50lb water-barrel ballast anchors.`,
    };
  }

  if (eventType === 'Birthday') {
    return {
      eventMeta: {
        title: context?.title || 'Minimalist Architectural Rooftop Gathering',
        eventType: 'Birthday',
        totalBudget: budget,
      },
      riskRadar: [
        {
          id: 'rr-b-1',
          risk: 'Rooftop Wind Exposure & Amber Hurricane Glassware Tip',
          severity: 'High',
          mitigation: 'Use weighted brass hurricane holders and restrict perimeter glassware to heavy-bottom French coupes.',
          resolved: false,
        },
        {
          id: 'rr-b-2',
          risk: 'Freight Elevator Access Bottle-neck for Lounge Furniture',
          severity: 'Medium',
          mitigation: 'Book dedicated freight operator 48 hours prior with confirmed 2-hour loading window.',
          resolved: true,
        },
        {
          id: 'rr-b-3',
          risk: 'Late-Night Noise Curfew Enforcement (11:00 PM Terrace Limit)',
          severity: 'Medium',
          mitigation: 'Transition outdoor terrace guests indoors to penthouse lounge at 10:45 PM before noise cutoff.',
          resolved: false,
        },
        {
          id: 'rr-b-4',
          risk: 'Sudden Ambient Temperature Drop at Dusk',
          severity: 'Low',
          mitigation: 'Position 4 ceramic column radiant heaters and provide rolled cashmere blankets in wicker hampers.',
          resolved: false,
        },
      ],
      personalizedIdeas: {
        theme: 'Monochromatic Kinfolk Soirée, Charcoal & Honey Ochre',
        colorPalette: ['#1A1918', '#C89047', '#EAE4DC', '#575553'],
        decorHighlights: [
          'Vintage 6-tier crystal coupe champagne pyramid',
          'Single-stem dark anthuriums in matte ceramics',
          'Warm 2200K wireless architectural ground washes',
        ],
      },
      budgetBreakdown: [
        { category: 'Catering & Bar', allocatedAmount: Math.round(budget * 0.35), percentage: 35 },
        { category: 'Decor & Ambience', allocatedAmount: Math.round(budget * 0.25), percentage: 25 },
        { category: 'Entertainment / DJ', allocatedAmount: Math.round(budget * 0.25), percentage: 25 },
        { category: 'Contingency', allocatedAmount: Math.round(budget * 0.15), percentage: 15 },
      ],
      timeline: [
        { timeframe: 'T-6 Weeks', tasks: ['Lock rooftop penthouse contract', 'Send bespoke digital invitations'] },
        { timeframe: 'T-2 Weeks', tasks: ['Confirm natural champagne order', 'Curate 4-hour vinyl tracklist'] },
        { timeframe: 'T-3 Days', tasks: ['Elevator schedule lock', 'Collect vintage coupe glassware'] },
        { timeframe: 'Day-Of (02:00 PM)', tasks: ['Freight elevator load-in', 'Build coupe tower pyramid'] },
        { timeframe: 'Day-Of (06:00 PM)', tasks: ['Sunset cocktail welcome', 'Vinyl selector commences'] },
      ],
      chatReply: `Refined blueprint for "${context?.title || 'Rooftop Soirée'}" ($${budget.toLocaleString()}): Balanced with 35% Catering/Bar, 25% Decor, 25% Entertainment/DJ, and 15% Contingency reserve.`,
    };
  }

  // Default: Wedding
  return {
    eventMeta: {
      title: context?.title || 'Golden Hour Hillside Ceremonial & Olive Grove Feast',
      eventType: 'Wedding',
      totalBudget: budget,
    },
    riskRadar: [
      {
        id: 'rr-w-1',
        risk: 'Valley Sound Ordinance Cutoff (10:00 PM Strict Compliance)',
        severity: 'High',
        mitigation: 'Transition from amplified DJ to unamplified chamber strings by 09:30 PM; dispatch final guest shuttle by 09:45 PM.',
        resolved: false,
      },
      {
        id: 'rr-w-2',
        risk: 'Narrow Mountain Access Road Transit Bottleneck',
        severity: 'High',
        mitigation: 'Coordinate two 24-passenger electric shuttles on continuous 20-minute loop with valet radio leads.',
        resolved: true,
      },
      {
        id: 'rr-w-3',
        risk: 'Direct Sun Heat Exposure at Ceremony Altar',
        severity: 'Medium',
        mitigation: 'Distribute hand-woven palm fans and chilled botanical spritzes upon arrival at lower olive courtyard.',
        resolved: true,
      },
      {
        id: 'rr-w-4',
        risk: 'Foam-Free Floral Installation Wind Stability',
        severity: 'Low',
        mitigation: 'Anchor heavy iron ballast plates concealed beneath terracotta olive tree planters.',
        resolved: false,
      },
    ],
    personalizedIdeas: {
      theme: 'Warm Earthy Modernism, Terracotta & Raw Linen',
      colorPalette: ['#1B3B36', '#C89047', '#D5CCC1', '#FAF4EB'],
      decorHighlights: [
        'Foam-free sculptural floral arches with native olive foliage',
        'Hand-poured beeswax fluted candle pillars (2400K warm glow)',
        'Belgian unbleached linen runners and artisanal stoneware plates',
      ],
    },
    budgetBreakdown: [
      { category: 'Venue & Catering', allocatedAmount: Math.round(budget * 0.45), percentage: 45 },
      { category: 'Decor & Ambience', allocatedAmount: Math.round(budget * 0.20), percentage: 20 },
      { category: 'Media & Sound', allocatedAmount: Math.round(budget * 0.15), percentage: 15 },
      { category: 'Apparel & Styling', allocatedAmount: Math.round(budget * 0.10), percentage: 10 },
      { category: 'Contingency', allocatedAmount: Math.round(budget * 0.10), percentage: 10 },
    ],
    timeline: [
      { timeframe: 'T-6 Months', tasks: ['Execute estate venue agreement', 'Commission editorial 35mm photographer'] },
      { timeframe: 'T-1 Month', tasks: ['Finalize RSVP dietary profiles (120 guests)', 'Wine tasting and pairing sign-off'] },
      { timeframe: 'T-1 Week', tasks: ['Sun angle and shadow progression walkthrough', 'Calligraphy place-card receipt'] },
      { timeframe: 'Day-Of (08:00 AM)', tasks: ['Vendor load-in & generator check', 'Floral arch build & beeswax styling'] },
      { timeframe: 'Day-Of (05:15 PM)', tasks: ['Sunset ceremonial vows exchange', 'Communal candlelit dinner feast'] },
    ],
    chatReply: `Curated wedding manifesto for "${context?.title || 'Ceremonial'}" ($${budget.toLocaleString()}): Structured around 45% Catering/Venue, 20% Decor, 15% Media, 10% Apparel, and 10% Contingency.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, eventContext } = body;

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.info('[Aethel API] GEMINI_API_KEY not set. Using intelligent atelier fallback synthesis.');
      const fallbackResult = generateIntelligentFallback(prompt || '', eventContext);
      return NextResponse.json({
        ...fallbackResult,
        _engine: 'aethel-curated-atelier',
        _source: 'fallback',
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are Aethel AI Atelier, an industrial-grade architectural event planning intelligence for Weddings, Milestone Birthdays, and Community Drives.
Follow strict aesthetic principles (Kinfolk Warm Modernism, terracotta, unbleached linen, zero neon purple AI clichés).
When analyzing a prompt (which may request budget rebalancing, seasonal contingency, risk radar audit, or vendor outreach), you MUST return ONLY a valid, parseable JSON object matching this EXACT schema:
{
  "eventMeta": {
    "title": "string",
    "eventType": "Wedding|Birthday|Community",
    "totalBudget": number
  },
  "riskRadar": [
    {
      "id": "string",
      "risk": "string",
      "severity": "High|Medium|Low",
      "mitigation": "string",
      "resolved": false
    }
  ],
  "personalizedIdeas": {
    "theme": "string",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
    "decorHighlights": ["string", "string", "string"]
  },
  "budgetBreakdown": [
    {
      "category": "string",
      "allocatedAmount": number,
      "percentage": number
    }
  ],
  "timeline": [
    {
      "timeframe": "string",
      "tasks": ["string", "string"]
    }
  ],
  "chatReply": "string explanation of changes and rationale"
}
Rules:
1. Percentages in budgetBreakdown MUST sum to exactly 100.
2. If the user asks to shift budget (e.g. from Decor to AV), rebalance categories accordingly and reflect the exact dollar and percentage math.
3. Provide 3-4 specific real-world event risks (Weather, Vendor Cancellations, Permit Delays, Noise Curfews) with concrete 1-click mitigation plans.
4. Return only valid JSON without markdown fences.`;

      const userMessage = `User Prompt: ${prompt || 'Curate an unforgettable bespoke celebration.'}
Event Context:
- Title: ${eventContext?.title || 'Aethel Atelier Event'}
- Event Archetype: ${eventContext?.eventType || 'wedding'}
- Total Budget: $${eventContext?.totalBudget || 20000}
- Guest Count: ${eventContext?.guestCount || 80}
- Location: ${eventContext?.location || 'Scenic location'}
- Date: ${eventContext?.date || '2026-10-15'}
- Active Categories: ${JSON.stringify(
        (eventContext?.categories || []).map((c: BudgetCategory) => ({ name: c.name, percentage: c.percentage, allocated: c.allocated }))
      )}
- Key Constraints: ${JSON.stringify(eventContext?.constraints || [])}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text?.trim() || '';

      // Parse JSON safely
      let parsedData: GeneratedEventResponse;
      try {
        parsedData = JSON.parse(responseText);
      } catch {
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      // Ensure IDs on riskRadar items if omitted by Gemini
      if (Array.isArray(parsedData.riskRadar)) {
        parsedData.riskRadar = parsedData.riskRadar.map((r, i) => ({
          ...r,
          id: r.id || `rr-gemini-${Date.now()}-${i}`,
          resolved: r.resolved ?? false,
        }));
      }

      return NextResponse.json({
        ...parsedData,
        _engine: 'google-gemini-2.5-flash',
        _source: 'live',
      });
    } catch (geminiError: unknown) {
      const errorMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.warn('[Aethel API] Gemini API call failed, falling back to atelier engine:', errorMsg);
      const fallbackResult = generateIntelligentFallback(prompt || '', eventContext);
      return NextResponse.json({
        ...fallbackResult,
        _engine: 'aethel-curated-atelier',
        _source: 'fallback',
        _error: errorMsg || 'Gemini error fallback',
      });
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Aethel API Error]', errorMsg);
    return NextResponse.json(
      { error: errorMsg || 'Failed to generate event architecture' },
      { status: 500 }
    );
  }
}
