'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldAlert,
  Sliders,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { EventPlan, AiChatMessage, AiSuggestion, TimelineTask, BudgetCategory, RiskRadarItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface AiCoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventPlan;
  onApplyCategoryUpdate: (updatedCategories: BudgetCategory[]) => void;
  onAddTask: (task: TimelineTask) => void;
}

export const AiCoPilotDrawer: React.FC<AiCoPilotDrawerProps> = ({
  isOpen,
  onClose,
  event,
  onApplyCategoryUpdate,
  onAddTask,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [actionAppliedMap, setActionAppliedMap] = useState<Record<string, boolean>>({});

  // Initial welcome message tailored to current event
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Welcome to the Aethel Atelier Co-Pilot. I am analyzing the architecture for "${event.title}". You currently have ${formatCurrency(
        event.totalBudget
      )} budgeted for ${event.guestCount} guests, with ${event.tasks.length} reverse timeline milestones. How may I refine your production manifesto today?`,
      timestamp: 'Just now',
      suggestions: [
        {
          title: 'Dynamic Budget Re-Orchestration',
          description: 'Rebalance allocations for seasonal climate shifts (e.g. monsoon weather, outdoor acoustic needs).',
          category: 'budget',
          actionLabel: 'Preview Monsoon Rebalance',
          actionType: 'apply_budget_preset',
        },
        {
          title: 'Emergency Weather Protocol',
          description: 'Generate 3 high-priority contingency milestones (T-1 Week Tent hold & Day-Of Awning checks).',
          category: 'contingency',
          actionLabel: 'Add Weather Milestones',
          actionType: 'add_task',
        },
      ],
    },
  ]);

  if (!isOpen) return null;

  // Preset prompt quick triggers
  const promptPresets = [
    'Shift budget from decor to AV for an outdoor community drive in monsoon season with $4,000 budget',
    'Rebalance budget: 45% catering, 20% decor, 15% media, 10% apparel, 10% contingency',
    'Generate emergency bad-weather contingency protocol',
    'Audit Day-Of timeline for potential sound curfew or transit bottlenecks',
  ];

  // Apply suggestion actions
  const handleApplyAction = (suggestion: AiSuggestion, indexId: string) => {
    if (suggestion.actionType === 'apply_rebalance' && suggestion.payload?.categories && Array.isArray(suggestion.payload.categories)) {
      onApplyCategoryUpdate(suggestion.payload.categories);
      setActionAppliedMap((prev) => ({ ...prev, [indexId]: true }));
      return;
    }

    if (suggestion.actionType === 'apply_budget_preset') {
      // Rebalance: increase decor by 5%, decrease media by 5%
      const updatedCategories = event.categories.map((c) => {
        if (c.name.toLowerCase().includes('decor') || c.name.toLowerCase().includes('av')) {
          const newPct = Math.min(100, c.percentage + 5);
          return {
            ...c,
            percentage: newPct,
            allocated: Math.round((newPct / 100) * event.totalBudget),
          };
        }
        if (c.name.toLowerCase().includes('media') || c.name.toLowerCase().includes('contingency')) {
          const newPct = Math.max(5, c.percentage - 5);
          return {
            ...c,
            percentage: newPct,
            allocated: Math.round((newPct / 100) * event.totalBudget),
          };
        }
        return c;
      });

      onApplyCategoryUpdate(updatedCategories);
      setActionAppliedMap((prev) => ({ ...prev, [indexId]: true }));
    } else if (suggestion.actionType === 'add_task') {
      const newTask: TimelineTask = {
        id: `task-ai-${Date.now()}`,
        title: suggestion.title.startsWith('Mitigate') ? suggestion.title : 'Activate 48-Hour Weather Tent Deposit & Sidewall Inspection',
        description: suggestion.description,
        phaseId: 't-1w',
        category: 'Contingency',
        completed: false,
        priority: 'critical',
        dueDate: event.date,
        assignedTo: 'Lead Coordinator',
      };
      onAddTask(newTask);
      setActionAppliedMap((prev) => ({ ...prev, [indexId]: true }));
    }
  };

  // Generate intelligent contextual response
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text) return;

    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsThinking(true);

    // Call Gemini API route
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          eventContext: event,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let aiContent = data.chatReply || '';
        const generatedSuggestions: AiSuggestion[] = [];

        if (!aiContent) {
          if (data.personalizedIdeas?.theme) {
            aiContent = `Architectural Analysis for "${event.title}":\n\n` +
              `**Theme Synthesis**: "${data.personalizedIdeas.theme}"\n` +
              `**Color Palette**: ${data.personalizedIdeas.colorPalette?.join('  •  ') || '#1B3B36 • #C89047'}\n\n` +
              `**Key Decor Touchpoints**:\n` +
              data.personalizedIdeas.decorHighlights?.map((dh: string) => `• ${dh}`).join('\n') +
              `\n\n**Logistical Risk Radar**:\n` +
              data.riskRadar?.map((rr: RiskRadarItem) => `• [${rr.severity}] ${rr.risk}: ${rr.mitigation}`).join('\n');
          } else {
            aiContent = `Synthesized recommendations for "${event.title}" (${formatCurrency(
              event.totalBudget
            )} across ${event.guestCount} guests). Prioritize tactile materiality, 2400K lighting, and clear load-in buffers.`;
          }
        }

        // Check if rebalanced categories are provided
        if (data.rebalancedCategories && Array.isArray(data.rebalancedCategories)) {
          generatedSuggestions.push({
            title: 'Apply Rebalanced Budget Structure',
            description: `Update all categories to match new calculation (${data.budgetBreakdown?.map((b: { category: string; percentage: number }) => `${b.category}: ${b.percentage}%`).join(', ')}).`,
            category: 'budget',
            actionLabel: '1-Click Apply Budget Rebalance',
            actionType: 'apply_rebalance',
            payload: { categories: data.rebalancedCategories },
          });
        }

        if (data.riskRadar && data.riskRadar.length > 0) {
          const topRisk = data.riskRadar[0];
          generatedSuggestions.push({
            title: `Mitigate: ${topRisk.risk.slice(0, 36)}...`,
            description: topRisk.mitigation,
            category: 'contingency',
            actionLabel: 'Add Mitigation Task',
            actionType: 'add_task',
          });
        }

        const botMsg: AiChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: generatedSuggestions.length > 0 ? generatedSuggestions : undefined,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsThinking(false);
        return;
      }
    } catch (e) {
      console.warn('API call failed, using atelier fallback:', e);
    }

    // Fallback contextual response
    setTimeout(() => {
      const lower = text.toLowerCase();
      let aiContent = '';
      const generatedSuggestions: AiSuggestion[] = [];

      if (lower.includes('shift') || lower.includes('rebalance') || lower.includes('monsoon')) {
        aiContent = `Dynamic re-orchestration calculated for "${event.title}" (Monsoon & Outdoor AV Focus):\n\n` +
          `• **AV, Stage & Waterproof Audio**: Scaled to 40% ($1,600) to cover IP65 weather-sealed PA, grounded power runs, and covered wooden riser stages.\n` +
          `• **Signage & Ambience**: Trimmed to 15% ($600) focusing on laminated, rain-resistant directional wayfinding.\n` +
          `• **Permits & Municipal Security**: Maintained at 25% ($1,000) for city park pavilion hold.\n` +
          `• **Refreshments, Ponchos & Ops**: 20% ($800) for hot soup urns, 100 cornstarch rain ponchos, and cocoa-coir mud boardwalks.\n\n` +
          `Would you like to apply this rebalanced allocation to your budget canvas?`;

        generatedSuggestions.push({
          title: 'Shift Budget to AV / Stage for Monsoon',
          description: 'Rebalance allocations: 40% AV/Stage, 15% Decor, 25% Permits, 20% Refreshments/Ops.',
          category: 'budget',
          actionLabel: 'Apply 40% AV Rebalance',
          actionType: 'apply_budget_preset',
        });
      } else {
        aiContent = `Understood. Analyzing "${event.title}" (${formatCurrency(
          event.totalBudget
        )} across ${event.guestCount} guests):\n\nEnsure clear load-in buffers, verify decibel curfews at 09:30 PM, and maintain 10% contingency for unforecasted weather adjustments.`;
      }

      const botMsg: AiChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: generatedSuggestions.length > 0 ? generatedSuggestions : undefined,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-charcoal-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white h-full shadow-atelier-lg border-l border-atelier-border flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-atelier-border bg-cream-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-forest text-cream-50">
              <Sparkles className="w-5 h-5 text-ochre-light" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium text-charcoal-900 flex items-center gap-2">
                Atelier AI Co-Pilot
                <span className="text-[10px] uppercase font-sans font-semibold tracking-wider bg-ochre/20 text-ochre-dark px-2 py-0.5 rounded-full">
                  Gemini Engine
                </span>
              </h3>
              <p className="text-xs text-charcoal-500 font-sans">
                Curating &bull; {event.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close AI Co-Pilot drawer"
            className="p-2 rounded-full hover:bg-cream-200 text-charcoal-400 hover:text-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Stream History */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-forest text-cream-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-4 rounded-lg max-w-[85%] space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-charcoal-900 text-cream-50 font-sans'
                    : 'bg-cream-100 text-charcoal-800 border border-atelier-border'
                }`}
              >
                <div className="whitespace-pre-line font-sans leading-relaxed">
                  {msg.content}
                </div>

                {/* Interactive Action Cards */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-atelier-border/60 space-y-2">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-500 block">
                      Recommended 1-Click Action:
                    </span>
                    {msg.suggestions.map((sugg, idx) => {
                      const actionKey = `${msg.id}-${idx}`;
                      const isApplied = actionAppliedMap[actionKey];

                      return (
                        <div
                          key={idx}
                          className="p-3 bg-white border border-atelier-border rounded-md space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-serif font-semibold text-charcoal-900">
                              {sugg.title}
                            </span>
                            <span className="text-[10px] uppercase font-sans text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                              {sugg.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-charcoal-500">
                            {sugg.description}
                          </p>

                          {sugg.actionLabel && (
                            <div className="pt-1.5 flex justify-end">
                              <button
                                type="button"
                                disabled={isApplied}
                                onClick={() => handleApplyAction(sugg, actionKey)}
                                aria-label={sugg.actionLabel || 'Apply recommendation'}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded transition-colors ${
                                  isApplied
                                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                    : 'bg-forest hover:bg-forest-light text-cream-50'
                                }`}
                              >
                                {isApplied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Applied to Atelier</span>
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-3.5 h-3.5 text-ochre-light" />
                                    <span>{sugg.actionLabel}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="text-[10px] text-right text-charcoal-400">
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-cream-300 text-charcoal-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 text-xs">
              <div className="w-7 h-7 rounded-full bg-forest text-cream-50 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-lg bg-cream-100 border border-atelier-border text-charcoal-500 italic flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest animate-bounce" />
                Calculating dynamic re-orchestration & risk matrix...
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-cream-50 border-t border-atelier-border overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400">
              Quick Scenarios:
            </span>
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(preset)}
                aria-label={`Use quick scenario: ${preset}`}
                className="px-2.5 py-1 text-[11px] rounded bg-white hover:bg-cream-200 text-charcoal-700 border border-atelier-border transition-colors flex-shrink-0 max-w-xs truncate"
                title={preset}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 border-t border-atelier-border bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="e.g. Shift budget from decor to AV for outdoor community drive in monsoon..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-grow px-3.5 py-2.5 text-xs border border-atelier-border rounded-md bg-cream-50 focus:outline-none focus:border-forest text-charcoal-800"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isThinking}
              aria-label="Send message to AI Co-Pilot"
              className="p-2.5 bg-forest hover:bg-forest-light text-cream-50 rounded-md transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
