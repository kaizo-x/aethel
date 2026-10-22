'use client';

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  ArrowUpRight,
  Plus,
  Image as ImageIcon,
  Shield,
  Layers,
  ShieldAlert,
  Radio,
  RefreshCw,
  Check,
  Palette,
  Lightbulb,
} from 'lucide-react';
import { EventPlan, MoodboardItem, RiskRadarItem, TimelineTask, PersonalizedIdeas } from '@/lib/types';
import { formatCurrency, formatDate, calculateDaysRemaining } from '@/lib/utils';

interface OverviewDashboardProps {
  event: EventPlan;
  onNavigateTab: (tab: 'budget' | 'timeline' | 'vendors') => void;
  onAddMoodboardItem?: (item: MoodboardItem) => void;
  onUpdateRiskRadar?: (risks: RiskRadarItem[]) => void;
  onAddTimelineTask?: (task: TimelineTask) => void;
  onUpdatePersonalizedIdeas?: (ideas: PersonalizedIdeas) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  event,
  onNavigateTab,
  onAddMoodboardItem,
  onUpdateRiskRadar,
  onAddTimelineTask,
  onUpdatePersonalizedIdeas,
}) => {
  const [isScanningRadar, setIsScanningRadar] = useState(false);
  const [radarEngineBadge, setRadarEngineBadge] = useState<string | null>(null);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageTag, setNewImageTag] = useState('Inspiration');

  const daysRemaining = calculateDaysRemaining(event.date);

  // Compute budget metrics
  const totalAllocated = event.categories.reduce((sum, cat) => sum + cat.allocated, 0);
  const totalActualSpent = event.categories.reduce((catSum, cat) => {
    const itemsSum = cat.items.reduce((iSum, item) => iSum + (item.actual || 0), 0);
    return catSum + itemsSum;
  }, 0);

  const budgetRemaining = event.totalBudget - totalActualSpent;
  const budgetSpentPct = Math.min(100, Math.round((totalActualSpent / event.totalBudget) * 100));
  const perGuestCost = Math.round(event.totalBudget / (event.guestCount || 1));

  // Compute task metrics
  const totalTasks = event.tasks.length;
  const completedTasks = event.tasks.filter((t) => t.completed).length;
  const taskProgressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingCriticalTasks = event.tasks.filter((t) => !t.completed && (t.priority === 'critical' || t.priority === 'high')).length;

  const handleAddInspiration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !onAddMoodboardItem) return;

    const newItem: MoodboardItem = {
      id: `mb-custom-${Date.now()}`,
      title: newImageTitle.trim() || 'Aesthetic Reference',
      imageUrl: newImageUrl.trim(),
      caption: 'Curated inspiration element',
      tag: newImageTag.trim() || 'Atmosphere',
      aspect: 'square',
    };

    onAddMoodboardItem(newItem);
    setNewImageTitle('');
    setNewImageUrl('');
    setIsAddingImage(false);
  };

  const handleScanRiskRadar = async () => {
    setIsScanningRadar(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze logistical, noise curfew, transport, and weather risks for this ${event.eventType} event titled "${event.title}". Suggest mitigations and color palette.`,
          eventContext: event,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.riskRadar && onUpdateRiskRadar) {
          const formattedRisks: RiskRadarItem[] = data.riskRadar.map((r: any, idx: number) => ({
            id: `rr-gen-${Date.now()}-${idx}`,
            risk: r.risk,
            severity: r.severity || 'Medium',
            mitigation: r.mitigation,
            resolved: false,
          }));
          onUpdateRiskRadar(formattedRisks);
        }
        if (data.personalizedIdeas && onUpdatePersonalizedIdeas) {
          onUpdatePersonalizedIdeas(data.personalizedIdeas);
        }
        setRadarEngineBadge(data._engine || 'Gemini 2.5 Flash');
      }
    } catch (err) {
      console.warn('Risk radar scan error:', err);
    } finally {
      setIsScanningRadar(false);
    }
  };

  const handleToggleRiskResolved = (riskIndex: number) => {
    if (!event.riskRadar || !onUpdateRiskRadar) return;
    const updated = event.riskRadar.map((rr, idx) =>
      idx === riskIndex ? { ...rr, resolved: !rr.resolved } : rr
    );
    onUpdateRiskRadar(updated);
  };

  const handleConvertRiskToTask = (riskItem: RiskRadarItem, riskIndex: number) => {
    if (onAddTimelineTask) {
      const newTask: TimelineTask = {
        id: `task-mitigation-${Date.now()}`,
        title: `Mitigate: ${riskItem.risk}`,
        description: riskItem.mitigation,
        phaseId: 't-1w',
        category: 'Risk Mitigation',
        completed: false,
        priority: riskItem.severity === 'High' ? 'critical' : 'high',
        assignedTo: 'Lead Coordinator',
      };
      onAddTimelineTask(newTask);
    }
    handleToggleRiskResolved(riskIndex);
  };

  const activeRisks = event.riskRadar || [];
  const highRiskCount = activeRisks.filter((r) => r.severity === 'High').length;
  const resolvedRiskCount = activeRisks.filter((r) => r.resolved).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Editorial Hero Header Banner */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-ochre/10 via-transparent to-transparent pointer-events-none rounded-bl-full" />
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 text-[11px] font-sans font-semibold uppercase tracking-widest bg-forest/10 text-forest rounded">
                {event.eventType} Atelier
              </span>
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                {event.location}
              </span>
              <span className="text-xs text-charcoal-400">&bull;</span>
              <span className="text-xs text-charcoal-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-charcoal-400" />
                {formatDate(event.date)}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-charcoal-900 leading-tight">
              {event.title}
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 font-sans leading-relaxed italic">
              &ldquo;{event.themeVibe}&rdquo;
            </p>
          </div>

          {/* Countdown & Quick Jump Badge */}
          <div className="flex items-center gap-4 bg-cream-100 p-4 rounded-lg border border-atelier-border/80 min-w-[240px]">
            <div className="p-3 bg-forest text-cream-50 rounded-md">
              <Clock className="w-6 h-6 text-ochre-light" />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal-900 leading-none">
                {daysRemaining > 0 ? daysRemaining : daysRemaining === 0 ? 'Today' : 'Passed'}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-charcoal-500 mt-1 font-sans">
                {daysRemaining > 0 ? 'Days Until Production' : 'Event Timeline'}
              </div>
            </div>
          </div>
        </div>

        {/* Constraints Pill Badges */}
        {event.constraints && event.constraints.length > 0 && (
          <div className="mt-6 pt-5 border-t border-atelier-border/60 flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase font-sans font-semibold tracking-wider text-charcoal-500 flex items-center gap-1 mr-2">
              <Shield className="w-3.5 h-3.5 text-forest" />
              Core Constraints:
            </span>
            {event.constraints.map((constraint, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded bg-cream-200/70 border border-atelier-border text-xs text-charcoal-700 tracking-tight"
              >
                {constraint}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* High-Level Key Performance Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Budget Spent / Remaining */}
        <div className="bg-white border border-atelier-border p-5 rounded-lg shadow-atelier hover:border-charcoal-300 transition-colors">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">Budget Committed</span>
            <DollarSign className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-serif font-semibold text-charcoal-900">
            {formatCurrency(totalActualSpent)}
          </div>
          <div className="flex items-center justify-between text-xs text-charcoal-600 mt-2">
            <span>Limit: {formatCurrency(event.totalBudget)}</span>
            <span className="font-medium text-forest">{budgetSpentPct}% utilized</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-cream-300 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetSpentPct > 100 ? 'bg-red-700' : 'bg-forest'
              }`}
              style={{ width: `${Math.min(100, budgetSpentPct)}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Per Guest Allocation */}
        <div className="bg-white border border-atelier-border p-5 rounded-lg shadow-atelier hover:border-charcoal-300 transition-colors">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">Guest Capacity</span>
            <Users className="w-4 h-4 text-ochre" />
          </div>
          <div className="text-2xl font-serif font-semibold text-charcoal-900">
            {event.guestCount} <span className="text-sm font-sans font-normal text-charcoal-500">Guests</span>
          </div>
          <div className="flex items-center justify-between text-xs text-charcoal-600 mt-2">
            <span>Per-Guest Ratio</span>
            <span className="font-semibold text-charcoal-800">{formatCurrency(perGuestCost)}/guest</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal-500 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-ochre inline-block" />
            Optimized for intimate hospitality
          </div>
        </div>

        {/* Metric 3: Master Timeline Progress */}
        <div className="bg-white border border-atelier-border p-5 rounded-lg shadow-atelier hover:border-charcoal-300 transition-colors">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">Timeline Execution</span>
            <CheckCircle2 className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-serif font-semibold text-charcoal-900">
            {completedTasks} <span className="text-sm font-sans font-normal text-charcoal-500">/ {totalTasks} Tasks</span>
          </div>
          <div className="flex items-center justify-between text-xs text-charcoal-600 mt-2">
            <span>Completion Rate</span>
            <span className="font-semibold text-forest">{taskProgressPct}%</span>
          </div>
          <div className="w-full bg-cream-300 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-forest h-full rounded-full transition-all duration-500"
              style={{ width: `${taskProgressPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Vendor & Critical Action Readiness */}
        <div className="bg-white border border-atelier-border p-5 rounded-lg shadow-atelier hover:border-charcoal-300 transition-colors">
          <div className="flex items-center justify-between text-charcoal-500 mb-2">
            <span className="text-xs uppercase tracking-wider font-sans font-medium">Vendor Partners</span>
            <Layers className="w-4 h-4 text-charcoal-700" />
          </div>
          <div className="text-2xl font-serif font-semibold text-charcoal-900">
            {event.vendors.filter((v) => v.status === 'booked').length} <span className="text-sm font-sans font-normal text-charcoal-500">Booked</span>
          </div>
          <div className="flex items-center justify-between text-xs text-charcoal-600 mt-2">
            <span>Total Directory</span>
            <span className="font-medium">{event.vendors.length} Partners</span>
          </div>
          <div className="mt-3 text-[11px] text-charcoal-500 flex items-center gap-1 truncate">
            {pendingCriticalTasks > 0 ? (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {pendingCriticalTasks} urgent items pending
              </span>
            ) : (
              <span className="text-forest font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                All priority tasks up-to-date
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Automated Event Risk Radar (Gemini Powered) */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-rose-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-700" />
                Automated Event Risk Radar
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-700" />
              {radarEngineBadge && (
                <span className="px-2 py-0.5 text-[10px] font-sans font-semibold bg-forest/10 text-forest rounded-full">
                  {radarEngineBadge}
                </span>
              )}
            </div>
            <h2 className="font-serif text-2xl font-medium text-charcoal-900 tracking-tight mt-1">
              Logistical Diagnostics & Mitigation Radar
            </h2>
            <p className="text-xs text-charcoal-500 font-sans mt-0.5">
              Live AI diagnostic scan of sound curfews, single-lane access choke points, weather shifts, and capacity thresholds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isScanningRadar}
              onClick={handleScanRiskRadar}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-cream-100 hover:bg-cream-200 border border-atelier-border text-charcoal-800 transition-colors shadow-atelier disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-forest ${isScanningRadar ? 'animate-spin' : ''}`} />
              <span>{isScanningRadar ? 'Auditing with Gemini...' : 'Re-Scan Risk Radar'}</span>
            </button>
          </div>
        </div>

        {/* Risk Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeRisks.map((riskItem, idx) => (
            <div
              key={riskItem.id || idx}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                riskItem.resolved
                  ? 'bg-cream-50/70 border-atelier-border opacity-75'
                  : riskItem.severity === 'High'
                  ? 'bg-rose-50/40 border-rose-200'
                  : riskItem.severity === 'Medium'
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-cream-50 border-atelier-border'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded ${
                      riskItem.severity === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : riskItem.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-cream-300 text-charcoal-700'
                    }`}
                  >
                    {riskItem.severity} Severity Risk
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleRiskResolved(idx)}
                    className="flex items-center gap-1 text-[11px] font-sans font-medium text-charcoal-600 hover:text-charcoal-900"
                  >
                    {riskItem.resolved ? (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        <Check className="w-3.5 h-3.5" /> Mitigated
                      </span>
                    ) : (
                      <span className="text-charcoal-400 hover:text-charcoal-700">Mark Mitigated</span>
                    )}
                  </button>
                </div>

                <h4 className="font-serif text-base font-semibold text-charcoal-900">
                  {riskItem.risk}
                </h4>

                <p className="text-xs text-charcoal-700 font-sans leading-relaxed bg-white/80 p-2.5 rounded border border-atelier-border/60">
                  <strong className="text-charcoal-900 font-medium">Mitigation Plan:</strong> {riskItem.mitigation}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-atelier-border/60 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-sans text-charcoal-400">
                  Status: {riskItem.resolved ? 'Mitigated' : 'Requires Protocol'}
                </span>

                <button
                  type="button"
                  onClick={() => handleConvertRiskToTask(riskItem, idx)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded bg-white hover:bg-cream-100 border border-atelier-border text-forest transition-colors shadow-atelier"
                >
                  <Plus className="w-3 h-3 text-forest" />
                  <span>Convert to Timeline Task</span>
                </button>
              </div>
            </div>
          ))}

          {activeRisks.length === 0 && (
            <div className="col-span-2 py-8 text-center bg-cream-50 rounded border border-dashed border-atelier-border text-xs text-charcoal-500 italic">
              No active logistical vulnerabilities recorded. Click &ldquo;Re-Scan Risk Radar&rdquo; to analyze this event.
            </div>
          )}
        </div>

        {/* Personalized Ideas Swatches & Decor Highlights (if present) */}
        {event.personalizedIdeas && (
          <div className="pt-4 border-t border-atelier-border mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-cream-50 p-4 rounded-lg border border-atelier-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <Palette className="w-3.5 h-3.5 text-forest" />
                <span>Personalized Aesthetic Palette</span>
              </div>
              <p className="text-xs font-serif italic text-charcoal-600">
                &ldquo;{event.personalizedIdeas.theme}&rdquo;
              </p>
              <div className="flex items-center gap-2 pt-1">
                {event.personalizedIdeas.colorPalette.map((hex, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className="w-7 h-7 rounded border border-charcoal-300 shadow-atelier"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                    <span className="text-[9px] font-mono text-charcoal-500 uppercase">{hex}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cream-50 p-4 rounded-lg border border-atelier-border space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                <Lightbulb className="w-3.5 h-3.5 text-ochre" />
                <span>Tactile Decor Highlights</span>
              </div>
              <ul className="space-y-1 text-xs text-charcoal-600 font-sans">
                {event.personalizedIdeas.decorHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-ochre mt-1.5 flex-shrink-0" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <button
          onClick={() => onNavigateTab('budget')}
          className="text-left bg-cream-50 hover:bg-white border border-atelier-border hover:border-charcoal-400 p-5 rounded-lg transition-all group shadow-atelier"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-forest">01 / Financial Architecture</span>
            <ArrowUpRight className="w-4 h-4 text-charcoal-400 group-hover:text-forest group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-serif text-lg font-medium text-charcoal-900">Budget Calculator & Rebalancer</h3>
          <p className="text-xs text-charcoal-500 mt-1">
            Dynamic sliders, locked category protection & itemized accounting.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('timeline')}
          className="text-left bg-cream-50 hover:bg-white border border-atelier-border hover:border-charcoal-400 p-5 rounded-lg transition-all group shadow-atelier"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-ochre-dark">02 / Chronological Cadence</span>
            <ArrowUpRight className="w-4 h-4 text-charcoal-400 group-hover:text-ochre-dark group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-serif text-lg font-medium text-charcoal-900">Reverse Timeline & Run of Show</h3>
          <p className="text-xs text-charcoal-500 mt-1">
            From T-6 Months foundational milestones down to hour-by-hour day-of cues.
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('vendors')}
          className="text-left bg-cream-50 hover:bg-white border border-atelier-border hover:border-charcoal-400 p-5 rounded-lg transition-all group shadow-atelier"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-sans font-semibold tracking-wider text-charcoal-700">03 / Artisan Network</span>
            <ArrowUpRight className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-serif text-lg font-medium text-charcoal-900">Vendor Directory & AI Email Inquiries</h3>
          <p className="text-xs text-charcoal-500 mt-1">
            Tailored negotiation and load-in drafts ready to dispatch in one click.
          </p>
        </button>

      </div>

      {/* Dynamic Moodboard Section */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal-400">
                Visual Atelier
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-ochre" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-charcoal-900 tracking-tight mt-1">
              Curated Moodboard & Tactile Vignettes
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {onAddMoodboardItem && (
              <button
                onClick={() => setIsAddingImage(!isAddingImage)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-cream-100 hover:bg-cream-200 text-charcoal-800 border border-atelier-border transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-forest" />
                <span>Add Inspiration</span>
              </button>
            )}
          </div>
        </div>

        {/* Add Image Inline Form */}
        {isAddingImage && (
          <form
            onSubmit={handleAddInspiration}
            className="p-4 bg-cream-50 border border-atelier-border rounded-md space-y-3 animate-in fade-in slide-in-from-top-1"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
              Add New Moodboard Reference
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Title (e.g. Linen Table Setting)"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                className="px-3 py-1.5 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
              />
              <input
                type="url"
                required
                placeholder="Image URL (Unsplash or direct image URL)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="px-3 py-1.5 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest sm:col-span-2"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingImage(false)}
                className="px-3 py-1 text-xs text-charcoal-600 hover:text-charcoal-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold bg-forest text-cream-50 rounded hover:bg-forest-light"
              >
                Pin to Board
              </button>
            </div>
          </form>
        )}

        {/* Moodboard Image Masonry / Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {event.moodboard.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-md border border-atelier-border bg-cream-200 transition-all hover:shadow-atelier-md flex flex-col justify-between"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-cream-300 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to stylized abstract placeholder
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-sans font-medium uppercase tracking-wider bg-charcoal-900/80 backdrop-blur-sm text-cream-50 rounded">
                  {item.tag}
                </span>
              </div>

              <div className="p-3 bg-white">
                <h4 className="font-serif text-sm font-medium text-charcoal-900 tracking-tight truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-charcoal-500 font-sans mt-0.5 line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
