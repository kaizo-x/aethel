'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Check,
  Shield,
  Layers,
  Heart,
  Cake,
  Leaf,
  Briefcase,
  RefreshCw,
  Palette,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  EventPlan,
  EventType,
  BudgetCategory,
  TimelinePhase,
  TimelineTask,
  Vendor,
  MoodboardItem,
  GeneratedEventResponse,
  RiskRadarItem,
} from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (newEvent: EventPlan) => void;
}

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
}) => {
  const [step, setStep] = useState(1);

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [totalBudget, setTotalBudget] = useState(15000);
  const [guestCount, setGuestCount] = useState(75);
  const [themeVibe, setThemeVibe] = useState('');
  const [constraintsText, setConstraintsText] = useState('');
  const [allocationStrategy, setAllocationStrategy] = useState<'balanced' | 'venue_heavy' | 'decor_heavy' | 'civic'>(
    'balanced'
  );

  // Gemini State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedAiData, setGeneratedAiData] = useState<GeneratedEventResponse | null>(null);

  const handleGenerateWithGemini = async () => {
    setIsAiGenerating(true);
    try {
      const constraints = constraintsText
        .split('\n')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a bespoke event architecture for a ${eventType} entitled "${title || 'Untitled'}" with vibe "${themeVibe || 'Earthy Modernism'}".`,
          eventContext: {
            title,
            eventType,
            totalBudget,
            guestCount,
            location,
            date,
            constraints,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedAiData(data);
      }
    } catch (err) {
      console.warn('Gemini generation error in wizard:', err);
    } finally {
      setIsAiGenerating(false);
    }
  };

  if (!isOpen) return null;

  // Preset Vibe suggestions per event type
  const getSuggestedVibes = () => {
    switch (eventType) {
      case 'wedding':
        return [
          'Warm Earthy Modernism, Terracotta & Raw Linen, Golden Hour Strings',
          'Monochromatic Minimalist Sculpture & Champagne Tower',
          'Cotswolds English Garden, Wildflowers & Candlelit Tables',
        ];
      case 'birthday':
        return [
          'Kinfolk Rooftop Soirée, Mezcal Bar & Vinyl Turntable',
          'Intimate Tuscan Farmhouse Dinner with Natural Wine',
          'Mid-century Modern Loft Cocktail Hour with Jazz Trio',
        ];
      case 'community':
        return [
          'Tactile Botanical, Native Saplings, Burlap & Community Sourdough Picnic',
          'Neighborhood Street Fair, Artisanal Ceramics & Open Stage',
          'Urban Greenway Restoration & Sunset Seed Swap',
        ];
      default:
        return [
          'Editorial Architectural Gallery, Ambient Projection & Canapés',
          'Scandinavian Minimalist Retreat with Fireside Workshop',
        ];
    }
  };

  // Generate complete EventPlan object based on wizard inputs
  const buildEventPlan = (): EventPlan => {
    const constraints = constraintsText
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    // Dynamic category allocation percentages based on strategy
    let pVenue = 45;
    let pDecor = 22;
    let pMedia = 15;
    let pLogistics = 10;
    let pContingency = 8;

    if (allocationStrategy === 'venue_heavy') {
      pVenue = 55;
      pDecor = 18;
      pMedia = 12;
      pLogistics = 8;
      pContingency = 7;
    } else if (allocationStrategy === 'decor_heavy') {
      pVenue = 35;
      pDecor = 32;
      pMedia = 15;
      pLogistics = 10;
      pContingency = 8;
    } else if (allocationStrategy === 'civic') {
      pVenue = 30;
      pDecor = 30;
      pMedia = 15;
      pLogistics = 18;
      pContingency = 7;
    }

    const categories: BudgetCategory[] = [
      {
        id: 'cat-w-venue',
        name: 'Venue & Catering',
        percentage: pVenue,
        allocated: Math.round((pVenue / 100) * totalBudget),
        color: '#1B3B36',
        iconName: 'Building',
        items: [
          {
            id: 'it-w-1',
            name: `${title || 'Primary'} Venue Hire Fee`,
            estimated: Math.round((pVenue * 0.55 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
          {
            id: 'it-w-2',
            name: `Seasonal Hospitality & Provisions (${guestCount} guests)`,
            estimated: Math.round((pVenue * 0.45 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
        ],
      },
      {
        id: 'cat-w-decor',
        name: 'Decor & Ambience',
        percentage: pDecor,
        allocated: Math.round((pDecor / 100) * totalBudget),
        color: '#C89047',
        iconName: 'Sparkles',
        items: [
          {
            id: 'it-w-3',
            name: 'Botanical Styling & Architectural Installations',
            estimated: Math.round((pDecor * 0.65 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
          {
            id: 'it-w-4',
            name: 'Linen Runners, Handmade Ceramics & Candlelight',
            estimated: Math.round((pDecor * 0.35 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
        ],
      },
      {
        id: 'cat-w-media',
        name: 'Media & Sound',
        percentage: pMedia,
        allocated: Math.round((pMedia / 100) * totalBudget),
        color: '#3D3B39',
        iconName: 'Camera',
        items: [
          {
            id: 'it-w-5',
            name: 'Editorial Documentary Photography Coverage',
            estimated: Math.round((pMedia * 0.7 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
          {
            id: 'it-w-6',
            name: 'Acoustic Sound Equipment & Atmosphere Musician',
            estimated: Math.round((pMedia * 0.3 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
        ],
      },
      {
        id: 'cat-w-logistics',
        name: 'Logistics/Permits',
        percentage: pLogistics,
        allocated: Math.round((pLogistics / 100) * totalBudget),
        color: '#575553',
        iconName: 'ShieldCheck',
        items: [
          {
            id: 'it-w-7',
            name: 'Municipal Permits & Comprehensive Liability Cover',
            estimated: Math.round((pLogistics * 0.4 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
          {
            id: 'it-w-8',
            name: 'Guest Shuttles & Zero-Waste Sanitation Services',
            estimated: Math.round((pLogistics * 0.6 / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
        ],
      },
      {
        id: 'cat-w-contingency',
        name: 'Contingency',
        percentage: pContingency,
        allocated: Math.round((pContingency / 100) * totalBudget),
        locked: true,
        color: '#757270',
        iconName: 'Sliders',
        items: [
          {
            id: 'it-w-9',
            name: 'Emergency Weather & Tactical Reserve',
            estimated: Math.round((pContingency / 100) * totalBudget),
            actual: 0,
            status: 'planned',
          },
        ],
      },
    ];

    const phases: TimelinePhase[] = [
      { id: 't-6m', label: 'T-6 Months', description: 'Core spatial booking, contracts & vision alignment', order: 1 },
      { id: 't-1m', label: 'T-1 Month', description: 'Tastings, final RSVPs & acoustic coordination', order: 2 },
      { id: 't-1w', label: 'T-1 Week', description: 'Headcount lock, load-in timetable & emergency pack', order: 3 },
      { id: 'day-of', label: 'Day-Of Schedule', description: 'Live minute-by-minute run of show', order: 4 },
    ];

    const tasks: TimelineTask[] = [
      {
        id: 't-gen-1',
        title: `Secure ${location || 'Venue'} Contract and Reserve Deposit`,
        description: 'Verify noise ordinance and loading dock window',
        phaseId: 't-6m',
        category: 'Venue',
        completed: false,
        priority: 'critical',
      },
      {
        id: 't-gen-2',
        title: 'Commission Editorial Visual Documentarian',
        description: 'Align on natural light shot list and moodboard aesthetic',
        phaseId: 't-6m',
        category: 'Media',
        completed: false,
        priority: 'high',
      },
      {
        id: 't-gen-3',
        title: `Lock Final Guest List (${guestCount} Guests) & Dietary Requirements`,
        description: 'Catalog allergen profiles and seating arrangements',
        phaseId: 't-1m',
        category: 'Hospitality',
        completed: false,
        priority: 'critical',
      },
      {
        id: 't-gen-4',
        title: 'Conduct Final On-Site Space & Sound Level Walkthrough',
        description: 'Check sun shadow progression and power circuit capacities',
        phaseId: 't-1w',
        category: 'Production',
        completed: false,
        priority: 'high',
      },
      {
        id: 't-gen-5',
        title: '08:00 AM Vendor Load-In & Site Master Setup',
        description: 'Inspect tent structures, catering staging, and power runs',
        phaseId: 'day-of',
        category: 'Logistics',
        completed: false,
        priority: 'critical',
        timeSlot: '08:00 AM - 10:30 AM',
      },
      {
        id: 't-gen-6',
        title: '05:00 PM Guest Welcome & Gathering Commencement',
        description: 'Opening toasts and ceremonial schedule begins',
        phaseId: 'day-of',
        category: 'Main Event',
        completed: false,
        priority: 'high',
        timeSlot: '05:00 PM - 08:30 PM',
      },
    ];

    const vendors: Vendor[] = [
      {
        id: `v-gen-1`,
        name: location ? `${location} Grounds` : 'Premier Atelier Space',
        role: 'Atmospheric Spatial Partner',
        category: 'Venue & Grounds',
        contactName: 'Site Coordinator',
        email: 'events@venue.com',
        phone: '+1 (555) 234-5678',
        status: 'contacted',
        estimatedCost: Math.round((pVenue * 0.55 / 100) * totalBudget),
        actualCost: 0,
        rating: 4.9,
        notes: 'Priority consideration for chosen date.',
        inquiryTemplate: {
          subject: `Atelier Booking Inquiry: ${title || 'Special Event'} (${date || 'Upcoming'})`,
          body: `Dear Venue Management,\n\nWe are curating "${title || 'Our Upcoming Gathering'}" for ${guestCount} guests on ${date || 'the upcoming season'}.\n\nOur design aesthetic is centered on: "${themeVibe || 'Earthy Modernism'}". We would love to arrange a private walkthrough to review loading logistics.\n\nWarm regards,\nAethel Event Atelier`,
        },
      },
      {
        id: `v-gen-2`,
        name: 'Guild & Hearth Hospitality',
        role: 'Farm-to-Table Seasonal Catering Guild',
        category: 'Catering & Spirits',
        contactName: 'Culinary Director',
        email: 'guild@hearthprovisions.com',
        phone: '+1 (555) 890-1234',
        status: 'to_source',
        estimatedCost: Math.round((pVenue * 0.45 / 100) * totalBudget),
        actualCost: 0,
        rating: 5.0,
        inquiryTemplate: {
          subject: `Catering Inquiry: ${guestCount} Guests — ${title || 'Atelier Event'}`,
          body: `Hello Team,\n\nWe are preparing a celebration for ${guestCount} guests on ${date}.\n\nWe are seeking a family-style seasonal menu with biodynamic wines. Please provide your seasonal packages.\n\nBest,\nAethel Event Atelier`,
        },
      },
    ];

    const moodboard: MoodboardItem[] = [
      {
        id: `mb-gen-1`,
        title: 'Architectural Natural Light',
        imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
        caption: 'Golden ambiance and minimalist tactile styling',
        tag: 'Atmosphere',
        aspect: 'wide',
      },
      {
        id: `mb-gen-2`,
        title: 'Botanical Stems & Stoneware',
        imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=1000&q=80',
        caption: 'Foam-free organic flora in earthy pottery',
        tag: 'Florals',
        aspect: 'square',
      },
    ];

    return {
      id: `custom-event-${Date.now()}`,
      title: title.trim() || 'Untitled Atelier Celebration',
      eventType,
      date: date || '2026-10-15',
      location: location.trim() || 'Custom Private Location',
      guestCount: guestCount || 50,
      totalBudget: totalBudget || 10000,
      themeVibe:
        themeVibe.trim() ||
        'Warm Earthy Modernism, Terracotta & Raw Linen, Golden Hour Strings',
      constraints: constraints.length > 0 ? constraints : [
        'Curfew compliance at 10:00 PM',
        'Zero single-use plastics',
      ],
      categories,
      phases,
      tasks,
      vendors,
      moodboard,
      riskRadar: generatedAiData?.riskRadar
        ? generatedAiData.riskRadar.map((r, i) => ({
            id: `rr-gen-${Date.now()}-${i}`,
            risk: r.risk,
            severity: r.severity,
            mitigation: r.mitigation,
            resolved: false,
          }))
        : [
            {
              id: 'rr-w-gen-1',
              risk: 'Local Sound & Noise Ordinance Compliance Window',
              severity: 'High',
              mitigation: 'Verify 10:00 PM decibel attenuation and schedule acoustic buffer.',
              resolved: false,
            },
            {
              id: 'rr-w-gen-2',
              risk: 'Vendor Loading Choke Point & Arrival Sync',
              severity: 'Medium',
              mitigation: 'Stagger catering and floral load-in by 90 minutes.',
              resolved: true,
            },
          ],
      personalizedIdeas: generatedAiData?.personalizedIdeas || {
        theme: themeVibe || 'Warm Earthy Modernism & Tactile Linen',
        colorPalette: ['#1B3B36', '#C89047', '#EAE4DC', '#575553'],
        decorHighlights: [
          'Sculptural foam-free floral installations',
          'Hand-poured beeswax pillar groupings',
          'Belgian unbleached linen runners',
        ],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleFinishWizard = () => {
    const newEvent = buildEventPlan();
    onCreateEvent(newEvent);

    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#1B3B36', '#C89047', '#575553'],
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-charcoal-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-atelier-border rounded-xl shadow-atelier-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-atelier-border flex items-center justify-between bg-cream-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest font-sans font-semibold text-forest">
                Atelier Creator &bull; Step {step} of 4
              </span>
            </div>
            <h2 className="font-serif text-2xl font-medium text-charcoal-900 tracking-tight mt-0.5">
              Curate a New Event Manifesto
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-400 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-grow">
          
          {/* STEP 1: Event Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-2">
                  Select Event Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'wedding', label: 'Wedding', icon: Heart },
                    { id: 'birthday', label: 'Birthday', icon: Cake },
                    { id: 'community', label: 'Civic / Drive', icon: Leaf },
                    { id: 'corporate', label: 'Gathering', icon: Briefcase },
                  ].map((arch) => {
                    const Icon = arch.icon;
                    const isSelected = eventType === arch.id;

                    return (
                      <button
                        key={arch.id}
                        type="button"
                        onClick={() => setEventType(arch.id as EventType)}
                        className={`p-4 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-forest bg-forest/5 text-forest font-semibold ring-1 ring-forest'
                            : 'border-atelier-border bg-white text-charcoal-700 hover:bg-cream-50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{arch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Equinox Hillside Ceremonial"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Location / Venue *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ojai Valley Olive Grounds, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scale & Investment */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Total Event Budget ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-charcoal-400 font-serif">$</span>
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white font-medium focus:outline-none focus:border-forest"
                    />
                  </div>
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    Calculated allocation: {formatCurrency(totalBudget)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                    Guest Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white font-medium focus:outline-none focus:border-forest"
                  />
                  <p className="text-[11px] text-charcoal-500 mt-1">
                    ~{formatCurrency(Math.round(totalBudget / (guestCount || 1)))} per guest ratio
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-2">
                  Budget Allocation Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'balanced',
                      title: 'Balanced Atelier',
                      desc: '45% Venue/Food, 22% Decor, 15% Media, 10% Logistics, 8% Contingency',
                    },
                    {
                      id: 'venue_heavy',
                      title: 'Architectural Splurge',
                      desc: '55% Iconic Space & Dining, 18% Decor, 12% Media, 8% Logistics, 7% Contingency',
                    },
                    {
                      id: 'decor_heavy',
                      title: 'Sensory & Botanical Focus',
                      desc: '35% Venue, 32% Florals & Tableware, 15% Media, 10% Logistics, 8% Contingency',
                    },
                    {
                      id: 'civic',
                      title: 'Civic & Volunteer Action',
                      desc: '30% Materials, 30% Nourishment, 18% Permits/Logistics, 15% Media, 7% Contingency',
                    },
                  ].map((strat) => (
                    <button
                      key={strat.id}
                      type="button"
                      onClick={() => setAllocationStrategy(strat.id as any)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        allocationStrategy === strat.id
                          ? 'border-forest bg-forest/5 ring-1 ring-forest'
                          : 'border-atelier-border bg-white hover:bg-cream-50'
                      }`}
                    >
                      <h4 className="font-serif text-sm font-medium text-charcoal-900">{strat.title}</h4>
                      <p className="text-[11px] text-charcoal-500 mt-1 leading-relaxed">{strat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Aesthetic Vibe & Key Constraints */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                  Aesthetic Mood & Theme Vibe
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raw Linen, Terracotta, Candlelight, Acoustic Strings..."
                  value={themeVibe}
                  onChange={(e) => setThemeVibe(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-atelier-border rounded-md bg-white focus:outline-none focus:border-forest"
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-sans uppercase font-semibold text-charcoal-400 mr-1">
                    Quick Suggestions:
                  </span>
                  {getSuggestedVibes().map((vibe, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setThemeVibe(vibe)}
                      className="px-2 py-0.5 text-[11px] rounded bg-cream-100 hover:bg-cream-200 text-charcoal-700 border border-atelier-border transition-colors truncate max-w-full"
                    >
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1">
                  Constraints & Curfews (One per line)
                </label>
                <textarea
                  rows={4}
                  placeholder={`10:00 PM sound ordinance strictly enforced\nZero single-use plastics\nGuest shuttle mandatory for mountain road`}
                  value={constraintsText}
                  onChange={(e) => setConstraintsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-atelier-border rounded-md bg-white font-sans leading-relaxed focus:outline-none focus:border-forest"
                />
                <p className="text-[11px] text-charcoal-500 mt-1">
                  These constraints will automatically shape AI risk checks and timeline milestones.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: AI Atelier Auto-Generation Preview */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-lg bg-cream-50 border border-atelier-border space-y-2">
                <div className="flex items-center gap-2 text-forest text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-ochre" />
                  <span>Atelier Synthesis Ready</span>
                </div>
                <h3 className="font-serif text-xl font-medium text-charcoal-900">
                  {title || 'Untitled Atelier Celebration'}
                </h3>
                <p className="text-xs text-charcoal-600 font-sans">
                  {eventType.toUpperCase()} &bull; {location || 'Custom Venue'} &bull; {guestCount} Guests &bull; {formatCurrency(totalBudget)} Budget
                </p>
              </div>

              {/* Gemini GenAI Trigger Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-forest/5 border border-forest/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ochre flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-charcoal-900 block">
                      {generatedAiData ? 'Gemini GenAI Architecture Generated' : 'Synthesize with Google Gemini'}
                    </span>
                    <span className="text-[11px] text-charcoal-500 font-sans">
                      Automatically generates risk radar, bespoke color palette & tailored timeline.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={isAiGenerating}
                  onClick={handleGenerateWithGemini}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded bg-forest hover:bg-forest-light text-cream-50 transition-colors shadow-atelier disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-ochre-light ${isAiGenerating ? 'animate-spin' : ''}`} />
                  <span>{isAiGenerating ? 'Synthesizing...' : generatedAiData ? 'Re-Synthesize' : 'Generate with Gemini'}</span>
                </button>
              </div>

              {/* Live Gemini Preview */}
              {generatedAiData && (
                <div className="p-4 rounded-lg bg-cream-50 border border-atelier-border space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-700" />
                      Gemini Risk Radar Preview ({generatedAiData.riskRadar.length} risks analyzed)
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {generatedAiData.riskRadar.slice(0, 2).map((r, i) => (
                      <div key={i} className="text-xs bg-white p-2 rounded border border-atelier-border flex items-start justify-between gap-2">
                        <span className="font-medium text-charcoal-900">{r.risk}</span>
                        <span className="text-[10px] uppercase font-sans font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          {r.severity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {generatedAiData.personalizedIdeas?.colorPalette && (
                    <div className="pt-2 border-t border-atelier-border/60 flex items-center gap-2">
                      <Palette className="w-3.5 h-3.5 text-forest" />
                      <span className="text-[11px] font-sans font-medium text-charcoal-600">Aesthetic Swatches:</span>
                      <div className="flex items-center gap-1.5">
                        {generatedAiData.personalizedIdeas.colorPalette.map((hex, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded border border-charcoal-300"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border border-atelier-border rounded-lg p-4 space-y-3">
                <span className="text-[11px] uppercase tracking-wider font-sans font-semibold text-charcoal-500 block">
                  Generated Architecture Components:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs text-charcoal-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-forest" />
                    <span>5 Dynamic Budget Sliders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-forest" />
                    <span>4 Reverse Chronological Phases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-forest" />
                    <span>Automated Risk Radar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-forest" />
                    <span>Vetted Vendor Inquiry Drafts</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-6 border-t border-atelier-border bg-cream-50 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold bg-forest hover:bg-forest-light text-cream-50 rounded-md transition-colors shadow-atelier"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishWizard}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-forest hover:bg-forest-light text-cream-50 rounded-md transition-colors shadow-atelier"
            >
              <Sparkles className="w-4 h-4 text-ochre-light" />
              <span>Create Atelier Manifesto</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
