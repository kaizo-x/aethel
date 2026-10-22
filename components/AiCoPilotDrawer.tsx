'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { EventPlan, AiChatMessage, AiSuggestion, TimelineTask, BudgetCategory } from '@/lib/types';
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
          title: 'Eco-Friendly Rebalance',
          description: 'Rebalance 5% from media into organic foam-free floral curation and add composting permits.',
          category: 'budget',
          actionLabel: 'Apply 5% Shift to Decor',
          actionType: 'apply_budget_preset',
        },
        {
          title: 'Emergency Rain / Weather Plan',
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
    'Adjust budget for an eco-friendly venue & foam-free florals',
    'Generate emergency bad-weather contingency protocol',
    'Audit Day-Of timeline for potential sound curfew or transit bottlenecks',
    'Suggest 4 seasonal cocktails & natural wine varietals',
  ];

  // Apply suggestion actions
  const handleApplyAction = (suggestion: AiSuggestion, indexId: string) => {
    if (suggestion.actionType === 'apply_budget_preset') {
      // Rebalance: increase decor by 5%, decrease media by 5%
      const updatedCategories = event.categories.map((c) => {
        if (c.name.includes('Decor')) {
          const newPct = Math.min(100, c.percentage + 5);
          return {
            ...c,
            percentage: newPct,
            allocated: Math.round((newPct / 100) * event.totalBudget),
          };
        }
        if (c.name.includes('Media')) {
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
      // Add contingency task
      const newTask: TimelineTask = {
        id: `task-ai-${Date.now()}`,
        title: 'Activate 48-Hour Weather Tent Deposit & Sidewall Inspection',
        description: 'Verify canopy tie-downs, ground staking permits, and acoustic baffle coverage',
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
        let aiContent = '';
        let generatedSuggestions: AiSuggestion[] = [];

        if (data.personalizedIdeas?.theme) {
          aiContent = `Architectural Analysis for "${event.title}":\n\n` +
            `**Theme Synthesis**: "${data.personalizedIdeas.theme}"\n` +
            `**Color Palette**: ${data.personalizedIdeas.colorPalette?.join('  •  ') || '#1B3B36 • #C89047'}\n\n` +
            `**Key Decor Touchpoints**:\n` +
            data.personalizedIdeas.decorHighlights?.map((dh: string) => `• ${dh}`).join('\n') +
            `\n\n**Logistical Risk Radar**:\n` +
            data.riskRadar?.map((rr: any) => `• [${rr.severity}] ${rr.risk}: ${rr.mitigation}`).join('\n');
        } else {
          aiContent = `Synthesized recommendations for "${event.title}" (${formatCurrency(
            event.totalBudget
          )} across ${event.guestCount} guests). Prioritize tactile materiality, 2400K lighting, and clear load-in buffers.`;
        }

        if (data.riskRadar && data.riskRadar.length > 0) {
          const topRisk = data.riskRadar[0];
          generatedSuggestions.push({
            title: `Mitigate: ${topRisk.risk.slice(0, 30)}...`,
            description: topRisk.mitigation,
            category: 'contingency',
            actionLabel: 'Add Risk Mitigation',
            actionType: 'add_task',
          });
        }

        generatedSuggestions.push({
          title: 'Shift 5% Budget to Eco Decor',
          description: 'Redistribute allocation toward heirloom tableware and foam-free botanical mechanics.',
          category: 'budget',
          actionLabel: 'Apply Eco Allocation',
          actionType: 'apply_budget_preset',
        });

        const botMsg: AiChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: generatedSuggestions,
        };

        setMessages((prev) => [...prev, botMsg]);
        setIsThinking(false);
        return;
      }
    } catch (e) {
      console.warn('API call failed, using atelier fallback:', e);
    }

    // Fallback contextual responses
    setTimeout(() => {
      let aiContent = '';
      let generatedSuggestions: AiSuggestion[] = [];

      const lower = text.toLowerCase();

      if (lower.includes('eco') || lower.includes('green') || lower.includes('sustainable')) {
        aiContent = `For "${event.title}", prioritizing sustainability will elevate the tactile elegance without inflating costs. I recommend:\n\n1. **Floral Architecture**: Specify foam-free wire mechanics (chicken wire and water tubes). Floral foam contains microplastics and is chemically harsh.\n2. **Linens & Tableware**: Rent heirloom stonewares and unbleached Belgian linen runners rather than single-use paper goods.\n3. **Biodynamic Beverage Curation**: Partner with minimal-intervention natural winemakers (e.g. orange pét-nats and local low-sulfite varietals).\n\nWould you like me to shift 5% of media into curated botanical decor?`;
        generatedSuggestions = [
          {
            title: 'Shift 5% Budget to Eco Decor',
            description: 'Redistribute allocation toward heirloom tableware and foam-free botanical mechanics.',
            category: 'budget',
            actionLabel: 'Apply Eco Allocation',
            actionType: 'apply_budget_preset',
          },
        ];
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('contingency') || lower.includes('storm')) {
        aiContent = `Inclement weather mitigation requires clear chronological triggers. Here is the recommended protocol for ${event.location}:\n\n- **T-72 Hours**: Check Doppler pressure systems. If precipitation probability > 35%, confirm tent sidewalls with rental provider.\n- **T-24 Hours**: Verify dry-run electrical cabling, covered catering prep paths, and mud mats for guest walkways.\n- **Day-Of**: Position an emergency umbrella valet station with 40 ivory canopy umbrellas.\n\nI have prepared a critical weather milestone for your master timeline.`;
        generatedSuggestions = [
          {
            title: 'Insert Weather Milestone',
            description: 'Add "Activate 48-Hour Weather Tent Deposit & Sidewall Inspection" to T-1 Week.',
            category: 'contingency',
            actionLabel: 'Add to Timeline',
            actionType: 'add_task',
          },
        ];
      } else if (lower.includes('curfew') || lower.includes('bottleneck') || lower.includes('timeline') || lower.includes('transit')) {
        aiContent = `Analyzing the master run of show for "${event.title}":\n\n- **Acoustic Compliance**: The valley noise ordinance cut-off is strictly 10:00 PM. We recommend transitioning from amplified vinyl sound to acoustic strings or low ambient murmurs at 09:30 PM to avoid sudden abrupt cessation.\n- **Transit Loop Buffer**: With ${event.guestCount} guests requiring hillside shuttle transport, dispatch the first return shuttle loop at 09:15 PM so older guests or families can depart comfortably before the final mass exodus.\n\nEverything else in your Day-Of schedule flows with natural cadence.`;
      } else if (lower.includes('cocktail') || lower.includes('wine') || lower.includes('drink') || lower.includes('menu')) {
        aiContent = `Here is a bespoke beverage menu tailored to the vibe of "${event.themeVibe}":\n\n1. **The Ojai Golden Hour** (Botanical Aperitivo, Smoked Orange Peel, Rosemary Sprig, Dry Prosecco)\n2. **Topatopa Earth** (Mezcal Espadín, Clarified Grapefruit, Agave Nectar, Smoked Salt Rim)\n3. **Terracotta Sunset (Zero-Proof)** (Cold Brew Hibiscus, Spiced Ginger Cordial, Sparkling Mineral Water)\n\nRecommended wine pairing: Unfiltered Orange skin-contact Pinot Gris and a crisp Chablis.`;
      } else {
        aiContent = `Understood. Analyzing your request in context with "${event.title}" (${formatCurrency(
          event.totalBudget
        )} across ${event.guestCount} guests):\n\nTo ensure an effortless guest journey, every touchpoint should feel intentional and unhurried. Focus on tactile materiality (deckled-edge paper signage, warm 2400k candle amber hues, and seamless load-in buffers).\n\nLet me know if you would like me to adjust any category allocations or add specific operational checklists to your reverse timeline.`;
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
    }, 600);
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
                    <span className="text-[10px] uppercase font-sans font-semibold tracking-wider text-charcoal-500 block">
                      Recommended Action:
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

                <div
                  className={`text-[10px] text-right ${
                    msg.role === 'user' ? 'text-charcoal-400' : 'text-charcoal-400'
                  }`}
                >
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
                Synthesizing architectural recommendations...
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-5 py-2.5 bg-cream-50 border-t border-atelier-border overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-charcoal-400">
              Inquire:
            </span>
            {promptPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(preset)}
                className="px-2.5 py-1 text-[11px] rounded bg-white hover:bg-cream-200 text-charcoal-700 border border-atelier-border transition-colors flex-shrink-0"
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
              placeholder="Ask Aethel to rebalance budget, craft email, or assess risks..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-grow px-3.5 py-2.5 text-xs border border-atelier-border rounded-md bg-cream-50 focus:outline-none focus:border-forest text-charcoal-800"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isThinking}
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
