'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Check,
  Plus,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { RiskRadarItem } from '@/lib/types';

interface RiskRadarCardProps {
  risks: RiskRadarItem[];
  onScanRadar: () => Promise<void>;
  isScanning: boolean;
  engineBadge?: string | null;
  onToggleRiskResolved: (index: number) => void;
  onConvertRiskToTask: (riskItem: RiskRadarItem, index: number) => void;
}

export const RiskRadarCard: React.FC<RiskRadarCardProps> = ({
  risks,
  onScanRadar,
  isScanning,
  engineBadge,
  onToggleRiskResolved,
  onConvertRiskToTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'active'>('all');

  const highSeverityCount = risks.filter((r) => r.severity === 'High').length;
  const mediumSeverityCount = risks.filter((r) => r.severity === 'Medium').length;
  const resolvedCount = risks.filter((r) => r.resolved).length;

  const filteredRisks = risks.filter((r) => {
    if (filter === 'high') return r.severity === 'High';
    if (filter === 'active') return !r.resolved;
    return true;
  });

  return (
    <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier space-y-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-atelier-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-sans font-semibold text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
              Contextual Risk Radar
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-700 animate-pulse" />
            {engineBadge && (
              <span className="px-2 py-0.5 text-[10px] font-sans font-semibold bg-forest/10 text-forest rounded-full border border-forest/20">
                {engineBadge}
              </span>
            )}
          </div>
          <h2 className="font-serif text-2xl font-medium text-charcoal-900 tracking-tight mt-1">
            Logistical Diagnostics & 1-Click Mitigations
          </h2>
          <p className="text-xs text-charcoal-500 font-sans mt-0.5">
            Real-time audit of weather hazards, noise curfews, single-lane access choke points, and vendor dependencies.
          </p>
        </div>

        {/* Top Actions & Counter Badges */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isScanning}
            onClick={onScanRadar}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md bg-cream-100 hover:bg-cream-200 border border-atelier-border text-charcoal-800 transition-colors shadow-atelier disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-forest ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Auditing with Gemini...' : 'Re-Scan Radar'}</span>
          </button>
        </div>
      </div>

      {/* Metric Counters & Filter Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-sans uppercase tracking-wider text-charcoal-400 font-semibold">
            Severity Status:
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold text-[10px]">
            {highSeverityCount} High
          </span>
          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
            {mediumSeverityCount} Medium
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
            {resolvedCount} Mitigated
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filter === 'all'
                ? 'bg-charcoal-900 text-cream-50 font-medium'
                : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
            }`}
          >
            All Risks ({risks.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('high')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filter === 'high'
                ? 'bg-charcoal-900 text-cream-50 font-medium'
                : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
            }`}
          >
            High Severity ({highSeverityCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-2.5 py-1 text-xs rounded transition-colors ${
              filter === 'active'
                ? 'bg-charcoal-900 text-cream-50 font-medium'
                : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200'
            }`}
          >
            Unresolved ({risks.length - resolvedCount})
          </button>
        </div>
      </div>

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRisks.map((riskItem, idx) => {
          // Find original index in full risks array
          const originalIndex = risks.findIndex(
            (r) => (r.id && r.id === riskItem.id) || r.risk === riskItem.risk
          );
          const targetIndex = originalIndex !== -1 ? originalIndex : idx;

          return (
            <div
              key={riskItem.id || idx}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between ${
                riskItem.resolved
                  ? 'bg-cream-50/70 border-atelier-border opacity-80'
                  : riskItem.severity === 'High'
                  ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                  : riskItem.severity === 'Medium'
                  ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                  : 'bg-cream-50 border-atelier-border hover:border-charcoal-300'
              }`}
            >
              <div className="space-y-2.5">
                {/* Top Badge & Mitigation Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wider rounded ${
                      riskItem.severity === 'High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : riskItem.severity === 'Medium'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-cream-300 text-charcoal-700'
                    }`}
                  >
                    {riskItem.severity} Severity Vulnerability
                  </span>

                  <button
                    type="button"
                    onClick={() => onToggleRiskResolved(targetIndex)}
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

                {/* Risk Title */}
                <h4 className="font-serif text-base font-semibold text-charcoal-900 leading-snug">
                  {riskItem.risk}
                </h4>

                {/* Concrete Mitigation Callout */}
                <div className="text-xs text-charcoal-700 font-sans leading-relaxed bg-white/90 p-3 rounded border border-atelier-border/70 space-y-1">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-forest block">
                    Actionable Mitigation Protocol:
                  </span>
                  <p>{riskItem.mitigation}</p>
                </div>
              </div>

              {/* Footer 1-Click Action */}
              <div className="pt-3 mt-3 border-t border-atelier-border/60 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-sans text-charcoal-400">
                  {riskItem.resolved ? 'Protocol Scheduled' : 'Pending Protocol'}
                </span>

                <button
                  type="button"
                  onClick={() => onConvertRiskToTask(riskItem, targetIndex)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-white hover:bg-forest hover:text-cream-50 border border-atelier-border text-forest transition-colors shadow-atelier"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>1-Click Add to Timeline</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredRisks.length === 0 && (
          <div className="col-span-2 py-8 text-center bg-cream-50 rounded border border-dashed border-atelier-border text-xs text-charcoal-500 italic">
            No risks matching the selected filter. Click &ldquo;Re-Scan Radar&rdquo; to refresh AI diagnostics.
          </div>
        )}
      </div>

    </div>
  );
};
