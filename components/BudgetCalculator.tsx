'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Lock,
  Unlock,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  PieChart,
  HelpCircle,
  Building,
  Sparkles,
  Camera,
  ShieldCheck,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { BudgetCategory, BudgetSubItem, EventPlan } from '@/lib/types';
import { formatCurrency, rebalanceCategoryPercentages } from '@/lib/utils';

interface BudgetCalculatorProps {
  event: EventPlan;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  onUpdateTotalBudget: (newBudget: number) => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  event,
  onUpdateCategories,
  onUpdateTotalBudget,
}) => {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(
    event.categories[0]?.id || null
  );
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetValueInput, setBudgetValueInput] = useState(event.totalBudget.toString());

  // State for adding a new item inside expanded category
  const [newItemName, setNewItemName] = useState('');
  const [newItemEstimated, setNewItemEstimated] = useState('');
  const [newItemActual, setNewItemActual] = useState('');
  const [newItemStatus, setNewItemStatus] = useState<BudgetSubItem['status']>('planned');

  // Calculate totals
  const totalPercentage = event.categories.reduce((acc, cat) => acc + cat.percentage, 0);
  const totalAllocated = event.categories.reduce((acc, cat) => acc + cat.allocated, 0);
  const totalActualSpent = event.categories.reduce((catSum, cat) => {
    return catSum + cat.items.reduce((iSum, item) => iSum + (item.actual || 0), 0);
  }, 0);

  const isOverBudget = totalActualSpent > event.totalBudget;
  const isAllocationSkewed = totalPercentage !== 100;

  // Toggle Category Lock
  const handleToggleLock = (categoryId: string) => {
    const updated = event.categories.map((c) => {
      if (c.id === categoryId) {
        return { ...c, locked: !c.locked };
      }
      return c;
    });
    onUpdateCategories(updated);
  };

  // Slider change handler with real-time rebalancing
  const handleSliderChange = (categoryId: string, newPercentage: number) => {
    const rebalanced = rebalanceCategoryPercentages(
      event.categories,
      categoryId,
      newPercentage,
      event.totalBudget
    );
    onUpdateCategories(rebalanced);
  };

  // Add Item to Category
  const handleAddItem = (categoryId: string) => {
    if (!newItemName.trim()) return;

    const est = parseFloat(newItemEstimated) || 0;
    const act = parseFloat(newItemActual) || 0;

    const newItem: BudgetSubItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      estimated: est,
      actual: act,
      status: newItemStatus,
    };

    const updated = event.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...cat.items, newItem],
        };
      }
      return cat;
    });

    onUpdateCategories(updated);
    setNewItemName('');
    setNewItemEstimated('');
    setNewItemActual('');
    setNewItemStatus('planned');
  };

  // Delete item from category
  const handleDeleteItem = (categoryId: string, itemId: string) => {
    const updated = event.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.filter((item) => item.id !== itemId),
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
  };

  // Update Item status
  const handleItemStatusChange = (
    categoryId: string,
    itemId: string,
    status: BudgetSubItem['status']
  ) => {
    const updated = event.categories.map((cat) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        };
      }
      return cat;
    });
    onUpdateCategories(updated);
  };

  // Save updated total budget
  const handleSaveBudget = () => {
    const parsed = parseFloat(budgetValueInput);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateTotalBudget(parsed);
      // Recalculate category allocated values
      const updated = event.categories.map((cat) => ({
        ...cat,
        allocated: Math.round((cat.percentage / 100) * parsed),
      }));
      onUpdateCategories(updated);
    }
    setEditingBudget(false);
  };

  // Helper icon render
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building':
        return <Building className="w-4 h-4 text-forest" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-ochre" />;
      case 'Camera':
        return <Camera className="w-4 h-4 text-charcoal-700" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-700" />;
      default:
        return <Sliders className="w-4 h-4 text-charcoal-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Master Budget Adjustment */}
      <div className="bg-white border border-atelier-border rounded-lg p-6 sm:p-8 shadow-atelier">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-atelier-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-sans font-semibold text-charcoal-400">
                Financial Blueprint
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal-900 tracking-tight mt-1">
              Dynamic Budget Allocation & Rebalancing
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-600 mt-1 max-w-2xl font-sans">
              Drag any slider to proportionally redistribute budget to other unlocked categories in real-time. Lock categories like Contingency to protect fixed deposits.
            </p>
          </div>

          {/* Master Budget Box */}
          <div className="bg-cream-100 p-4 rounded-lg border border-atelier-border min-w-[260px] flex flex-col justify-between">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-charcoal-500">
              Total Event Budget
            </span>

            {editingBudget ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="font-serif text-xl font-medium text-charcoal-800">$</span>
                <input
                  type="number"
                  value={budgetValueInput}
                  onChange={(e) => setBudgetValueInput(e.target.value)}
                  className="w-full px-2 py-1 text-lg font-serif font-semibold border border-charcoal-400 rounded bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveBudget}
                  className="px-2.5 py-1 text-xs font-semibold bg-forest text-cream-50 rounded hover:bg-forest-light"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <span className="font-serif text-3xl font-semibold text-charcoal-900">
                  {formatCurrency(event.totalBudget)}
                </span>
                <button
                  onClick={() => {
                    setBudgetValueInput(event.totalBudget.toString());
                    setEditingBudget(true);
                  }}
                  className="text-[11px] text-forest underline hover:text-forest-light font-medium"
                >
                  Edit
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-charcoal-600 mt-2 pt-2 border-t border-atelier-border/60">
              <span>Actual Spent:</span>
              <span className={`font-semibold ${isOverBudget ? 'text-red-700' : 'text-charcoal-900'}`}>
                {formatCurrency(totalActualSpent)}
              </span>
            </div>
          </div>
        </div>

        {/* Live Over/Under Warning Bar */}
        {(isOverBudget || isAllocationSkewed) && (
          <div className="mt-4 p-3 rounded bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              {isOverBudget && (
                <p className="font-medium">
                  Actual expenses ({formatCurrency(totalActualSpent)}) exceed the total planned budget by {formatCurrency(totalActualSpent - event.totalBudget)}. Consider rebalancing lower-priority categories.
                </p>
              )}
              {isAllocationSkewed && (
                <p>
                  Category percentage allocations sum to {totalPercentage}% (Target: 100%). Adjust unlocked sliders to balance.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Category Allocation Visual Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-charcoal-500 mb-2">
            <span className="font-sans uppercase tracking-wider text-[11px] font-medium">Proportional Allocation Spectrum</span>
            <span className="font-medium">{totalPercentage}% Allocated</span>
          </div>

          <div className="h-4 w-full flex rounded-md overflow-hidden bg-cream-300 p-0.5 border border-atelier-border">
            {event.categories.map((cat) => (
              <div
                key={cat.id}
                title={`${cat.name}: ${cat.percentage}% (${formatCurrency(cat.allocated)})`}
                className="h-full transition-all duration-300 relative group cursor-pointer"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
                onClick={() => setExpandedCategoryId(cat.id)}
              />
            ))}
          </div>

          {/* Mini Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-3 pt-2">
            {event.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setExpandedCategoryId(cat.id)}
                className="flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900"
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate max-w-[140px]">{cat.name}</span>
                <span className="text-[11px] font-semibold text-charcoal-400">({cat.percentage}%)</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Sliders & Itemized Breakdown List */}
      <div className="space-y-4">
        {event.categories.map((cat) => {
          const isExpanded = expandedCategoryId === cat.id;
          const catActualSpent = cat.items.reduce((s, it) => s + (it.actual || 0), 0);
          const isCategoryOver = catActualSpent > cat.allocated;

          return (
            <div
              key={cat.id}
              className={`bg-white border rounded-lg transition-all shadow-atelier overflow-hidden ${
                isExpanded ? 'border-charcoal-400 ring-1 ring-charcoal-200' : 'border-atelier-border hover:border-charcoal-300'
              }`}
            >
              {/* Category Header Row with Interactive Slider */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Category Title & Icon */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-md bg-cream-100 border border-atelier-border">
                      {renderCategoryIcon(cat.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-medium text-charcoal-900">
                          {cat.name}
                        </h3>
                        {cat.locked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase font-sans font-semibold bg-charcoal-100 text-charcoal-700 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                        {cat.items.length} itemized lines &bull; Actual: {formatCurrency(catActualSpent)}
                      </p>
                    </div>
                  </div>

                  {/* Allocation Figures & Lock Control */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-serif text-xl font-semibold text-charcoal-900">
                        {formatCurrency(cat.allocated)}
                      </div>
                      <div className="text-[11px] text-charcoal-500 font-sans">
                        <span className="font-semibold text-charcoal-800">{cat.percentage}%</span> of total budget
                      </div>
                    </div>

                    {/* Lock Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleLock(cat.id)}
                      title={cat.locked ? 'Unlock category for automatic rebalancing' : 'Lock category to freeze percentage'}
                      className={`p-2 rounded-md border transition-colors ${
                        cat.locked
                          ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                          : 'bg-white text-charcoal-500 border-atelier-border hover:border-charcoal-400'
                      }`}
                    >
                      {cat.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>

                    {/* Expand/Collapse Accordion */}
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat.id)}
                      className="p-2 rounded-md border border-atelier-border bg-cream-50 text-charcoal-600 hover:bg-cream-100"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Slider Control */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs text-charcoal-500">
                    <span>Rebalance Slider</span>
                    <span className="font-medium">{cat.percentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={cat.percentage}
                    disabled={cat.locked}
                    onChange={(e) => handleSliderChange(cat.id, parseInt(e.target.value, 10))}
                    className={`w-full ${cat.locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                  />
                  {cat.locked && (
                    <p className="text-[10px] text-charcoal-400 italic">
                      Category is locked. Unlock to slide and redistribute to others.
                    </p>
                  )}
                </div>

                {/* Spent vs Allocated Warning */}
                {isCategoryOver && (
                  <div className="text-xs text-red-700 bg-red-50 p-2 rounded flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    Actual spent exceeds allocated amount by {formatCurrency(catActualSpent - cat.allocated)}.
                  </div>
                )}
              </div>

              {/* Itemized Detail Drawer */}
              {isExpanded && (
                <div className="border-t border-atelier-border bg-cream-50/50 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-sans font-semibold tracking-wider text-charcoal-600">
                      Line Item Breakdown
                    </h4>
                    <span className="text-xs text-charcoal-500">
                      {cat.items.length} Recorded Items
                    </span>
                  </div>

                  {/* Items Table */}
                  <div className="bg-white border border-atelier-border rounded-md overflow-hidden">
                    <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-cream-100 text-[10px] uppercase font-sans font-semibold tracking-wider text-charcoal-500 border-b border-atelier-border">
                      <div className="col-span-5">Item / Scope</div>
                      <div className="col-span-2 text-right">Estimated</div>
                      <div className="col-span-2 text-right">Actual</div>
                      <div className="col-span-2 text-center">Status</div>
                      <div className="col-span-1 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-atelier-border/70">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 sm:px-4 sm:py-3 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-2 items-center text-xs"
                        >
                          <div className="sm:col-span-5">
                            <p className="font-medium text-charcoal-900">{item.name}</p>
                            {item.notes && (
                              <p className="text-[11px] text-charcoal-500 mt-0.5">{item.notes}</p>
                            )}
                          </div>

                          <div className="sm:col-span-2 sm:text-right text-charcoal-700 font-sans">
                            <span className="sm:hidden text-charcoal-400 mr-2">Estimated:</span>
                            {formatCurrency(item.estimated)}
                          </div>

                          <div className="sm:col-span-2 sm:text-right font-medium font-sans">
                            <span className="sm:hidden text-charcoal-400 mr-2">Actual:</span>
                            <span className={item.actual > item.estimated ? 'text-amber-800' : 'text-charcoal-900'}>
                              {formatCurrency(item.actual)}
                            </span>
                          </div>

                          <div className="sm:col-span-2 sm:text-center">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleItemStatusChange(
                                  cat.id,
                                  item.id,
                                  e.target.value as BudgetSubItem['status']
                                )
                              }
                              className="w-full sm:w-auto px-2 py-1 text-[11px] rounded border border-atelier-border bg-cream-50 text-charcoal-700 focus:outline-none"
                            >
                              <option value="planned">Planned</option>
                              <option value="deposit_paid">Deposit Paid</option>
                              <option value="paid_in_full">Paid in Full</option>
                            </select>
                          </div>

                          <div className="sm:col-span-1 text-right">
                            <button
                              onClick={() => handleDeleteItem(cat.id, item.id)}
                              className="text-charcoal-400 hover:text-red-700 p-1 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {cat.items.length === 0 && (
                        <div className="p-4 text-center text-xs text-charcoal-400 italic">
                          No line items entered yet for this category.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add New Line Item Form */}
                  <div className="p-3.5 bg-cream-100 rounded-md border border-atelier-border space-y-3">
                    <span className="text-[11px] uppercase tracking-wider font-sans font-semibold text-charcoal-600 block">
                      Add New Expense Item
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Vintage Glassware)"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="sm:col-span-5 px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                      />
                      <input
                        type="number"
                        placeholder="Est. $"
                        value={newItemEstimated}
                        onChange={(e) => setNewItemEstimated(e.target.value)}
                        className="sm:col-span-2 px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                      />
                      <input
                        type="number"
                        placeholder="Act. $"
                        value={newItemActual}
                        onChange={(e) => setNewItemActual(e.target.value)}
                        className="sm:col-span-2 px-2.5 py-1.5 text-xs border border-atelier-border rounded bg-white focus:outline-none focus:border-forest"
                      />
                      <select
                        value={newItemStatus}
                        onChange={(e) => setNewItemStatus(e.target.value as BudgetSubItem['status'])}
                        className="sm:col-span-2 px-2 py-1.5 text-xs border border-atelier-border rounded bg-white text-charcoal-700 focus:outline-none"
                      >
                        <option value="planned">Planned</option>
                        <option value="deposit_paid">Deposit Paid</option>
                        <option value="paid_in_full">Paid in Full</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleAddItem(cat.id)}
                        className="sm:col-span-1 inline-flex items-center justify-center py-1.5 px-3 bg-forest text-cream-50 text-xs font-semibold rounded hover:bg-forest-light transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
