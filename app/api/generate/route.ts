import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GeneratedEventResponse } from '@/lib/types';

// Fallback intelligent synthesizer when GEMINI_API_KEY is not configured or network fails
function generateIntelligentFallback(prompt: string, context?: any): GeneratedEventResponse {
  const p = (prompt || '').toLowerCase();
  const cType = context?.eventType?.toLowerCase() || '';

  let eventType = 'Wedding';
  if (p.includes('birthday') || p.includes('soiree') || p.includes('anniversary') || cType.includes('birthday')) {
    eventType = 'Birthday';
  } else if (p.includes('community') || p.includes('plant') || p.includes('civic') || p.includes('drive') || cType.includes('community')) {
    eventType = 'Community';
  }

  const budget = context?.totalBudget || (eventType === 'Wedding' ? 25000 : eventType === 'Birthday' ? 4500 : 1500);
  const location = context?.location || (eventType === 'Wedding' ? 'Ojai Hillside Estate' : eventType === 'Birthday' ? 'Tribeca Loft' : 'Sycamore Greenway');

  if (eventType === 'Birthday') {
    return {
      eventMeta: {
        title: context?.title || 'Minimalist Architectural Rooftop Gathering',
        eventType: 'Birthday',
        totalBudget: budget,
      },
      riskRadar: [
        {
          risk: 'Rooftop Wind Exposure & Amber Hurricane Glassware Tip',
          severity: 'High',
          mitigation: 'Use weighted brass hurricane holders and restrict glassware to heavy-bottom French coupes.',
        },
        {
          risk: 'Elevator Access Bottle-neck for Lounge Furniture',
          severity: 'Medium',
          mitigation: 'Book freight operator reservation 48 hours prior with confirmed 2-hour loading window.',
        },
        {
          risk: 'Sudden Ambient Temperature Drop at Dusk',
          severity: 'Low',
          mitigation: 'Position 4 ceramic column radiant heaters and provide rolled cashmere blankets.',
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
        { category: 'Venue & Penthouse Hire', allocatedAmount: Math.round(budget * 0.48), percentage: 48 },
        { category: 'Catering & Spirits Bar', allocatedAmount: Math.round(budget * 0.24), percentage: 24 },
        { category: 'Decor & Illumination', allocatedAmount: Math.round(budget * 0.14), percentage: 14 },
        { category: 'Media & Vinyl Acoustic', allocatedAmount: Math.round(budget * 0.08), percentage: 8 },
        { category: 'Reserve Contingency', allocatedAmount: Math.round(budget * 0.06), percentage: 6 },
      ],
      timeline: [
        { timeframe: 'T-4 Weeks', tasks: ['Lock rooftop penthouse contract', 'Send bespoke digital invitations'] },
        { timeframe: 'T-1 Week', tasks: ['Confirm natural champagne order', 'Curate 4-hour vinyl tracklist'] },
        { timeframe: 'Day-Of (02:00 PM)', tasks: ['Elevator freight load-in', 'Build coupe tower pyramid'] },
        { timeframe: 'Day-Of (06:00 PM)', tasks: ['Sunset cocktail welcome', 'Vinyl selector commences'] },
      ],
    };
  }

  if (eventType === 'Community') {
    return {
      eventMeta: {
        title: context?.title || 'Neighborhood Urban Planting & Seed Swap Drive',
        eventType: 'Community',
        totalBudget: budget,
      },
      riskRadar: [
        {
          risk: 'Volunteer Dehydration during Afternoon Planting Shift',
          severity: 'High',
          mitigation: 'Establish two shaded hydration stations with 50-gallon water refill kegs and electrolyte packs.',
        },
        {
          risk: 'City Green Space Digging Permit Absence on Site',
          severity: 'High',
          mitigation: 'Display laminated municipal permit at volunteer registration desk alongside first-aid kit.',
        },
        {
          risk: 'Tool Contamination & Ergonomic Blistering',
          severity: 'Medium',
          mitigation: 'Provide 150 pairs of reinforced nitrile work gloves and conduct 15-minute ergonomic demo.',
        },
      ],
      personalizedIdeas: {
        theme: 'Tactile Botanical Greenway, Burlap & Terracotta',
        colorPalette: ['#1B3B36', '#4A6B5D', '#D2B48C', '#FAF4EB'],
        decorHighlights: [
          'Burlap-wrapped native sapling root balls with jute twine',
          'Hand-lettered chalk terracotta garden stakes',
          'Communal cedar trestle tables with sourdough lunch boards',
        ],
      },
      budgetBreakdown: [
        { category: 'Native Saplings & Soil Amendments', allocatedAmount: Math.round(budget * 0.45), percentage: 45 },
        { category: 'Volunteer Hospitality & Picnic Lunch', allocatedAmount: Math.round(budget * 0.25), percentage: 25 },
        { category: 'Municipal Permits & Safety Kits', allocatedAmount: Math.round(budget * 0.15), percentage: 15 },
        { category: 'Tool Lending Library Deposits', allocatedAmount: Math.round(budget * 0.10), percentage: 10 },
        { category: 'Contingency Reserve', allocatedAmount: Math.round(budget * 0.05), percentage: 5 },
      ],
      timeline: [
        { timeframe: 'T-4 Weeks', tasks: ['File municipal park permit', 'Order wholesale drought-tolerant oaks'] },
        { timeframe: 'T-1 Week', tasks: ['Pre-stake planting holes with bio-flags', 'Inventory tool library'] },
        { timeframe: 'Day-Of (08:30 AM)', tasks: ['Volunteer check-in & safety briefing', 'Distribute gloves & spades'] },
        { timeframe: 'Day-Of (12:00 PM)', tasks: ['Picnic potluck lunch', 'Mulching & deep root watering'] },
      ],
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
        risk: 'Valley Sound Ordinance Cutoff (10:00 PM Strict Compliance)',
        severity: 'High',
        mitigation: 'Transition from amplified DJ to unamplified chamber strings by 09:30 PM; dispatch final guest shuttle by 09:45 PM.',
      },
      {
        risk: 'Narrow Mountain Access Road Transit Bottleneck',
        severity: 'High',
        mitigation: 'Coordinate two 24-passenger electric shuttles on continuous 20-minute loop with valet radio leads.',
      },
      {
        risk: 'Direct Sun Heat Exposure at Ceremony Altar',
        severity: 'Medium',
        mitigation: 'Distribute hand-woven palm fans and chilled botanical spritzes upon arrival at lower olive courtyard.',
      },
      {
        risk: 'Foam-Free Floral Installation Wind Stability',
        severity: 'Low',
        mitigation: 'Anchor heavy iron ballast plates concealed beneath terracotta olive tree planters.',
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
      { category: 'Venue & Grounds Hire', allocatedAmount: Math.round(budget * 0.28), percentage: 28 },
      { category: 'Seasonal Farm-to-Table Catering & Wine', allocatedAmount: Math.round(budget * 0.28), percentage: 28 },
      { category: 'Botanical Styling & Decor', allocatedAmount: Math.round(budget * 0.20), percentage: 20 },
      { category: 'Editorial Analog & Digital Media', allocatedAmount: Math.round(budget * 0.12), percentage: 12 },
      { category: 'Logistics, Shuttles & Permits', allocatedAmount: Math.round(budget * 0.06), percentage: 6 },
      { category: 'Emergency Weather Contingency', allocatedAmount: Math.round(budget * 0.06), percentage: 6 },
    ],
    timeline: [
      { timeframe: 'T-6 Months', tasks: ['Execute estate venue agreement', 'Commission editorial 35mm photographer'] },
      { timeframe: 'T-1 Month', tasks: ['Finalize RSVP dietary profiles (120 guests)', 'Wine tasting and pairing sign-off'] },
      { timeframe: 'T-1 Week', tasks: ['Sun angle and shadow progression walkthrough', 'Calligraphy place-card receipt'] },
      { timeframe: 'Day-Of (08:00 AM)', tasks: ['Vendor load-in & generator check', 'Floral arch build & beeswax styling'] },
      { timeframe: 'Day-Of (05:15 PM)', tasks: ['Sunset ceremonial vows exchange', 'Communal candlelit dinner feast'] },
    ],
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

      const systemInstruction = `You are Aethel AI Atelier, a world-class architectural and editorial event planning intelligence (inspired by Kinfolk, architectural design studios, tactile aesthetics, zero neon purple AI clichés).
Analyze the user's event concept and constraints.
You MUST return ONLY a valid, parseable JSON object matching this EXACT schema:
{
  "eventMeta": {
    "title": "string",
    "eventType": "Wedding|Birthday|Community",
    "totalBudget": number
  },
  "riskRadar": [
    {
      "risk": "string",
      "severity": "High|Medium|Low",
      "mitigation": "string"
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
  ]
}
Ensure:
1. All numbers are realistic and budget percentages sum to 100.
2. riskRadar highlights real-world logistical, noise ordinance, weather, and vendor bottleneck risks with concrete mitigations.
3. personalizedIdeas includes 4 elegant, tasteful hex color codes and 3 architectural decor concepts.
4. Do not include markdown code fences (\`\`\`json) outside the JSON. Return only the JSON object.`;

      const userMessage = `Event Concept Request: ${prompt || 'Curate an unforgettable bespoke celebration.'}
Event Context:
- Existing Title: ${eventContext?.title || 'None provided'}
- Event Type: ${eventContext?.eventType || 'Auto-detect'}
- Total Budget: $${eventContext?.totalBudget || 20000}
- Guest Count: ${eventContext?.guestCount || 80}
- Location: ${eventContext?.location || 'Scenic location'}
- Date: ${eventContext?.date || 'Upcoming season'}
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
      } catch (parseError) {
        // Strip markdown backticks if present
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      return NextResponse.json({
        ...parsedData,
        _engine: 'google-gemini-2.5-flash',
        _source: 'live',
      });
    } catch (geminiError: any) {
      console.warn('[Aethel API] Gemini API call failed, falling back to atelier engine:', geminiError?.message || geminiError);
      const fallbackResult = generateIntelligentFallback(prompt || '', eventContext);
      return NextResponse.json({
        ...fallbackResult,
        _engine: 'aethel-curated-atelier',
        _source: 'fallback',
        _error: geminiError?.message || 'Gemini error fallback',
      });
    }
  } catch (err: any) {
    console.error('[Aethel API Error]', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate event architecture' },
      { status: 500 }
    );
  }
}
