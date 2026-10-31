'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Calendar,
  Users,
  Compass,
  Sparkles,
  Heart,
  Cake,
  Leaf,
  Check,
} from 'lucide-react';
import {
  EventPlan,
  BudgetCategory,
  TimelineTask,
  Vendor,
  MoodboardItem,
  RiskRadarItem,
  PersonalizedIdeas,
} from '@/lib/types';
import { INITIAL_PRESETS, INITIAL_WEDDING, INITIAL_BIRTHDAY, INITIAL_COMMUNITY } from '@/lib/initialData';
import { Header } from '@/components/Header';
import { OverviewDashboard } from '@/components/OverviewDashboard';
import { BudgetCalculator } from '@/components/BudgetCalculator';
import { TimelineBoard } from '@/components/TimelineBoard';
import { VendorChecklist } from '@/components/VendorChecklist';
import { PersonaFeatures } from '@/components/PersonaFeatures';
import { EventWizardModal } from '@/components/EventWizardModal';
import { AiCoPilotDrawer } from '@/components/AiCoPilotDrawer';
import { formatCurrency, formatDate } from '@/lib/utils';
import { decodeSharedPlan } from '@/lib/exportUtils';

export default function AtelierPage() {
  const [allEvents, setAllEvents] = useState<EventPlan[]>(INITIAL_PRESETS);
  const [currentEventId, setCurrentEventId] = useState<string>(INITIAL_WEDDING.id);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'vendors' | 'persona'>('overview');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [sharedToast, setSharedToast] = useState<string | null>(null);

  // Hydrate from URL (?plan=...) or localStorage on client mount
  useEffect(() => {
    setIsMounted(true);

    // 1. Check for Base64 shared plan in URL
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');
        if (planParam) {
          const sharedPlan = decodeSharedPlan(planParam);
          if (sharedPlan) {
            setAllEvents((prev) => [sharedPlan, ...prev.filter((e) => e.id !== sharedPlan.id)]);
            setCurrentEventId(sharedPlan.id);
            setSharedToast(`Imported shared manifest: "${sharedPlan.title}"`);
            setTimeout(() => setSharedToast(null), 4000);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not parse shared plan param:', err);
      }
    }

    // 2. Hydrate from localStorage
    try {
      const storedEvents = localStorage.getItem('aethel_events_v3');
      const storedActiveId = localStorage.getItem('aethel_active_event_id_v3');

      if (storedEvents) {
        const parsed = JSON.parse(storedEvents) as EventPlan[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllEvents(parsed);
          if (storedActiveId && parsed.some((e) => e.id === storedActiveId)) {
            setCurrentEventId(storedActiveId);
          } else {
            setCurrentEventId(parsed[0].id);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load from localStorage, using presets', e);
    }
  }, []);

  // Save to localStorage on updates
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem('aethel_events_v3', JSON.stringify(allEvents));
      localStorage.setItem('aethel_active_event_id_v3', currentEventId);
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [allEvents, currentEventId, isMounted]);

  // Current active event plan
  const currentEvent = allEvents.find((e) => e.id === currentEventId) || allEvents[0] || INITIAL_WEDDING;

  // Helper to update current event
  const updateCurrentEvent = (updater: (prev: EventPlan) => EventPlan) => {
    setAllEvents((prevAll) =>
      prevAll.map((item) => (item.id === currentEvent.id ? updater(item) : item))
    );
  };

  // Handlers
  const handleSelectEvent = (event: EventPlan) => {
    setCurrentEventId(event.id);
  };

  const handleLoadPreset = (presetId: string) => {
    const exists = allEvents.find((e) => e.id === presetId);
    if (exists) {
      setCurrentEventId(exists.id);
    } else {
      let presetToLoad: EventPlan | undefined;
      if (presetId === INITIAL_WEDDING.id) presetToLoad = INITIAL_WEDDING;
      else if (presetId === INITIAL_BIRTHDAY.id) presetToLoad = INITIAL_BIRTHDAY;
      else if (presetId === INITIAL_COMMUNITY.id) presetToLoad = INITIAL_COMMUNITY;

      if (presetToLoad) {
        setAllEvents((prev) => [...prev, presetToLoad!]);
        setCurrentEventId(presetToLoad.id);
      }
    }
  };

  const handleCreateEvent = (newEvent: EventPlan) => {
    setAllEvents((prev) => [newEvent, ...prev]);
    setCurrentEventId(newEvent.id);
    setActiveTab('overview');
  };

  const handleUpdateCategories = (categories: BudgetCategory[]) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      categories,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateTotalBudget = (newBudget: number) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      totalBudget: newBudget,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateTasks = (tasks: TimelineTask[]) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      tasks,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateVendors = (vendors: Vendor[]) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      vendors,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddMoodboardItem = (item: MoodboardItem) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      moodboard: [item, ...prev.moodboard],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleAddTaskFromAi = (task: TimelineTask) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      tasks: [task, ...prev.tasks],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdateRiskRadar = (riskRadar: RiskRadarItem[]) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      riskRadar,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleUpdatePersonalizedIdeas = (personalizedIdeas: PersonalizedIdeas) => {
    updateCurrentEvent((prev) => ({
      ...prev,
      personalizedIdeas,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Dynamic persona tab configuration based on current event type
  const personaTabInfo =
    currentEvent.eventType === 'wedding'
      ? { id: 'persona', label: 'Wedding Suite', icon: Heart }
      : currentEvent.eventType === 'birthday'
      ? { id: 'persona', label: 'Soirée Lounge', icon: Cake }
      : { id: 'persona', label: 'Civic Ops Hub', icon: Leaf };

  const PersonaIcon = personaTabInfo.icon;

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col selection:bg-forest selection:text-cream-50">
      
      {/* Sticky Main Header */}
      <div className="no-print">
        <Header
          currentEvent={currentEvent}
          allEvents={allEvents}
          onSelectEvent={handleSelectEvent}
          onOpenWizard={() => setIsWizardOpen(true)}
          onToggleAiDrawer={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
          isAiDrawerOpen={isAiDrawerOpen}
          onLoadPreset={handleLoadPreset}
        />

        {/* Shared Plan Toast Banner */}
        {sharedToast && (
          <div className="bg-emerald-800 text-cream-50 text-xs px-4 py-2 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-300" />
            <span className="font-medium">{sharedToast}</span>
          </div>
        )}

        {/* Editorial Sub-Navigation Bar */}
        <div className="bg-white border-b border-atelier-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              
              <nav className="flex space-x-1 sm:space-x-6 overflow-x-auto py-1">
                {([
                  { id: 'overview', label: 'Overview & Moodboard', icon: LayoutDashboard, highlight: false },
                  { id: 'persona', label: personaTabInfo.label, icon: PersonaIcon, highlight: true },
                  { id: 'budget', label: 'Budget Rebalancer', icon: DollarSign, highlight: false },
                  { id: 'timeline', label: 'Cadence & Timeline', icon: Calendar, highlight: false },
                  { id: 'vendors', label: 'Vendor Directory', icon: Users, highlight: false },
                ] as Array<{
                  id: 'overview' | 'budget' | 'timeline' | 'vendors' | 'persona';
                  label: string;
                  icon: React.ComponentType<{ className?: string }>;
                  highlight: boolean;
                }>).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`inline-flex items-center gap-2 py-3 px-3 sm:px-1.5 border-b-2 text-xs font-medium tracking-tight whitespace-nowrap transition-all ${
                        isActive
                          ? 'border-forest text-forest font-semibold'
                          : 'border-transparent text-charcoal-500 hover:text-charcoal-800 hover:border-charcoal-300'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? 'text-forest' : ''}`} />
                      <span>{tab.label}</span>
                      {tab.highlight && (
                        <span className="w-1.5 h-1.5 rounded-full bg-forest hidden sm:inline-block" />
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Status Indicator */}
              <div className="hidden lg:flex items-center gap-2 text-xs text-charcoal-500">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Atelier Live &bull; Auto-saved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Printable Dossier View (Visible only during print) */}
        <div className="hidden print:block space-y-6 text-charcoal-900">
          <div className="border-b-2 border-charcoal-900 pb-4">
            <div className="flex justify-between items-baseline">
              <h1 className="font-serif text-3xl font-bold">{currentEvent.title}</h1>
              <span className="text-xs uppercase font-sans tracking-widest">Aethel Atelier Dossier</span>
            </div>
            <p className="text-sm mt-1 text-charcoal-600">
              {currentEvent.eventType.toUpperCase()} &bull; {currentEvent.location} &bull; {formatDate(currentEvent.date)}
            </p>
            <p className="text-xs italic mt-1 font-serif">&ldquo;{currentEvent.themeVibe}&rdquo;</p>
            <p className="text-xs font-semibold mt-2">
              Total Budget: {formatCurrency(currentEvent.totalBudget)} | Guest Count: {currentEvent.guestCount}
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg font-bold border-b border-charcoal-400 pb-1 mb-2">Budget Allocations</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {currentEvent.categories.map((cat) => (
                <div key={cat.id} className="border p-2">
                  <div className="flex justify-between font-bold">
                    <span>{cat.name} ({cat.percentage}%)</span>
                    <span>{formatCurrency(cat.allocated)}</span>
                  </div>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-charcoal-700">
                    {cat.items.map((it) => (
                      <li key={it.id}>
                        {it.name}: {formatCurrency(it.actual || it.estimated)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="print-page-break pt-4">
            <h2 className="font-serif text-lg font-bold border-b border-charcoal-400 pb-1 mb-2">Master Production Timeline</h2>
            <div className="space-y-3 text-xs">
              {currentEvent.phases.map((ph) => (
                <div key={ph.id}>
                  <h3 className="font-bold uppercase text-[11px] text-charcoal-600">{ph.label}</h3>
                  <div className="pl-3 space-y-1 mt-1">
                    {currentEvent.tasks
                      .filter((t) => t.phaseId === ph.id)
                      .map((t) => (
                        <div key={t.id} className="flex justify-between">
                          <span>{t.completed ? '[x]' : '[ ]'} {t.title} ({t.category})</span>
                          <span>{t.timeSlot || t.dueDate || ''}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <h2 className="font-serif text-lg font-bold border-b border-charcoal-400 pb-1 mb-2">Artisan Directory</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {currentEvent.vendors.map((v) => (
                <div key={v.id} className="border p-2">
                  <p className="font-bold">{v.name} ({v.category})</p>
                  <p>{v.contactName} &bull; {v.email} &bull; {v.phone}</p>
                  <p className="text-[10px] text-charcoal-500">Status: {v.status.toUpperCase()} &bull; Est: {formatCurrency(v.estimatedCost)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Views */}
        <div className="no-print">
          {activeTab === 'overview' && (
            <OverviewDashboard
              event={currentEvent}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onAddMoodboardItem={handleAddMoodboardItem}
              onUpdateRiskRadar={handleUpdateRiskRadar}
              onAddTimelineTask={handleAddTaskFromAi}
              onUpdatePersonalizedIdeas={handleUpdatePersonalizedIdeas}
            />
          )}

          {activeTab === 'persona' && (
            <PersonaFeatures
              event={currentEvent}
              onUpdateEvent={updateCurrentEvent}
              onAddTimelineTask={handleAddTaskFromAi}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetCalculator
              event={currentEvent}
              onUpdateCategories={handleUpdateCategories}
              onUpdateTotalBudget={handleUpdateTotalBudget}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineBoard
              event={currentEvent}
              onUpdateTasks={handleUpdateTasks}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorChecklist
              event={currentEvent}
              onUpdateVendors={handleUpdateVendors}
            />
          )}
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="no-print border-t border-atelier-border bg-white mt-12 py-8 text-center text-xs text-charcoal-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm text-charcoal-900">Aethel</span>
            <span>&bull; AI Event Operating System</span>
          </div>
          <p className="text-charcoal-400 text-[11px]">
            Engineered for weddings, milestone soirées & civic drives &bull; 100% budget parity &bull; Google Gemini engine.
          </p>
          <div className="flex items-center gap-4 text-charcoal-600">
            <button
              onClick={() => setIsWizardOpen(true)}
              className="hover:text-forest transition-colors"
            >
              New Manifesto
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="hover:text-forest transition-colors"
            >
              Ask AI Co-Pilot
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <AiCoPilotDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        event={currentEvent}
        onApplyCategoryUpdate={handleUpdateCategories}
        onAddTask={handleAddTaskFromAi}
      />

    </div>
  );
}
