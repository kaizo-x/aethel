'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Download,
  Printer,
  ChevronDown,
  Calendar,
  DollarSign,
  Compass,
  FileJson,
  Check,
} from 'lucide-react';
import { EventPlan } from '@/lib/types';
import {
  formatCurrency,
  exportEventAsJson,
  exportBudgetAsCsv,
  exportTimelineAsCsv,
  generateMarkdownDossier,
  triggerPrintPreview,
} from '@/lib/utils';

interface HeaderProps {
  currentEvent: EventPlan;
  allEvents: EventPlan[];
  onSelectEvent: (event: EventPlan) => void;
  onOpenWizard: () => void;
  onToggleAiDrawer: () => void;
  isAiDrawerOpen: boolean;
  onLoadPreset: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentEvent,
  allEvents,
  onSelectEvent,
  onOpenWizard,
  onToggleAiDrawer,
  isAiDrawerOpen,
  onLoadPreset,
}) => {
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-cream-100/95 backdrop-blur-md border-b border-atelier-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Editorial Title */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-charcoal-900">
                  Aethel
                </span>
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-widest font-sans font-semibold bg-forest text-cream-50 rounded-full">
                  Atelier
                </span>
              </div>
              <span className="text-[11px] uppercase tracking-widest font-sans text-charcoal-600">
                Curated Event Architecture
              </span>
            </div>

            {/* Active Event Selector */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => {
                  setIsEventDropdownOpen(!isEventDropdownOpen);
                  setIsExportDropdownOpen(false);
                }}
                className="flex items-center gap-3 px-3.5 py-1.5 text-left rounded-md bg-white border border-atelier-border hover:border-charcoal-400 transition-colors shadow-atelier"
              >
                <div className="w-2 h-2 rounded-full bg-ochre" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-charcoal-900 tracking-tight max-w-[180px] truncate">
                    {currentEvent.title}
                  </span>
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                    {formatCurrency(currentEvent.totalBudget)} &bull; {currentEvent.guestCount} Guests
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 ml-1" />
              </button>

              {isEventDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-md bg-white border border-atelier-border shadow-atelier-lg p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400 border-b border-atelier-border/60">
                    Switch Active Event
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {allEvents.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onSelectEvent(ev);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between ${
                          ev.id === currentEvent.id
                            ? 'bg-cream-200/80 text-forest font-medium'
                            : 'text-charcoal-700 hover:bg-cream-100'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-medium truncate">{ev.title}</p>
                          <p className="text-[10px] text-charcoal-500 capitalize">
                            {ev.eventType} &bull; {formatCurrency(ev.totalBudget)}
                          </p>
                        </div>
                        {ev.id === currentEvent.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-forest" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-atelier-border/70 mt-1 flex flex-col gap-1">
                    <div className="px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400">
                      Curated Presets
                    </div>
                    <div className="grid grid-cols-3 gap-1 px-1">
                      <button
                        onClick={() => {
                          onLoadPreset('preset-wedding-sunset');
                          setIsEventDropdownOpen(false);
                        }}
                        className="px-2 py-1.5 text-[11px] text-center rounded bg-cream-100 hover:bg-cream-300 text-charcoal-800 transition-colors"
                      >
                        Wedding
                      </button>
                      <button
                        onClick={() => {
                          onLoadPreset('preset-birthday-rooftop');
                          setIsEventDropdownOpen(false);
                        }}
                        className="px-2 py-1.5 text-[11px] text-center rounded bg-cream-100 hover:bg-cream-300 text-charcoal-800 transition-colors"
                      >
                        Rooftop
                      </button>
                      <button
                        onClick={() => {
                          onLoadPreset('preset-community-planting');
                          setIsEventDropdownOpen(false);
                        }}
                        className="px-2 py-1.5 text-[11px] text-center rounded bg-cream-100 hover:bg-cream-300 text-charcoal-800 transition-colors"
                      >
                        Civic
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Quick Presets for Mobile */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                className="p-2 rounded-md border border-atelier-border bg-white text-charcoal-700"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsExportDropdownOpen(!isExportDropdownOpen);
                  setIsEventDropdownOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md bg-white border border-atelier-border text-charcoal-800 hover:border-charcoal-400 hover:bg-cream-50 transition-colors shadow-atelier"
              >
                <Download className="w-3.5 h-3.5 text-charcoal-600" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 text-charcoal-400" />
              </button>

              {isExportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-md bg-white border border-atelier-border shadow-atelier-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400 border-b border-atelier-border/60 mb-1">
                    Live Export Suite
                  </div>

                  <button
                    onClick={() => {
                      triggerPrintPreview();
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-forest" />
                    <div>
                      <p className="font-medium">Print Dossier / Save PDF</p>
                      <p className="text-[10px] text-charcoal-500">Editorial formatted layout</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportEventAsJson(currentEvent);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-ochre" />
                    <div>
                      <p className="font-medium">Export JSON Manifest</p>
                      <p className="text-[10px] text-charcoal-500">Raw data backup & sync</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportBudgetAsCsv(currentEvent);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <div>
                      <p className="font-medium">Export Budget (CSV)</p>
                      <p className="text-[10px] text-charcoal-500">Line-item financial spreadsheet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      exportTimelineAsCsv(currentEvent);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-700" />
                    <div>
                      <p className="font-medium">Export Timeline (CSV)</p>
                      <p className="text-[10px] text-charcoal-500">Production schedule spreadsheet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const md = generateMarkdownDossier(currentEvent);
                      navigator.clipboard.writeText(md);
                      setCopiedNotification(true);
                      setTimeout(() => setCopiedNotification(false), 2000);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors border-t border-atelier-border/60"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-medium">Copy Markdown Dossier</p>
                      <p className="text-[10px] text-charcoal-500">Formatted text for docs & notes</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleShareLink();
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-charcoal-800 hover:bg-cream-100 flex items-center gap-2.5 transition-colors"
                  >
                    {copiedNotification ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Compass className="w-4 h-4 text-charcoal-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {copiedNotification ? 'Link Copied!' : 'Copy Atelier URL'}
                      </p>
                      <p className="text-[10px] text-charcoal-500">Share with collaborators</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* New Event Button */}
            <button
              type="button"
              onClick={onOpenWizard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-white border border-atelier-border text-charcoal-800 hover:bg-cream-50 hover:border-charcoal-400 transition-colors shadow-atelier"
            >
              <Plus className="w-3.5 h-3.5 text-forest" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            {/* AI Atelier Co-Pilot Trigger */}
            <button
              type="button"
              onClick={onToggleAiDrawer}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-all shadow-atelier ${
                isAiDrawerOpen
                  ? 'bg-forest text-cream-50 ring-2 ring-forest/30'
                  : 'bg-forest text-cream-50 hover:bg-forest-light'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-ochre-light animate-pulse" />
              <span>AI Co-Pilot</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
