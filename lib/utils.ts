import { BudgetCategory, EventPlan } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function calculateDaysRemaining(dateString: string): number {
  try {
    const eventDate = new Date(dateString).getTime();
    const today = new Date().getTime();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

/**
 * Rebalance categories when one category percentage is updated.
 * Locked categories remain fixed; remaining percentage is distributed
 * proportionally among the other unlocked categories.
 */
export function rebalanceCategoryPercentages(
  categories: BudgetCategory[],
  targetCategoryId: string,
  newPercentage: number,
  totalBudget: number
): BudgetCategory[] {
  // Clamp between 0 and 100
  const clampedTarget = Math.max(0, Math.min(100, Math.round(newPercentage)));

  const targetCategory = categories.find((c) => c.id === targetCategoryId);
  if (!targetCategory) return categories;

  // Calculate total locked percentage (excluding target if target was locked)
  const lockedPercentage = categories
    .filter((c) => c.locked && c.id !== targetCategoryId)
    .reduce((sum, c) => sum + c.percentage, 0);

  // Maximum allowed for target category
  const maxAllowedForTarget = Math.max(0, 100 - lockedPercentage);
  const finalTargetPercentage = Math.min(clampedTarget, maxAllowedForTarget);

  const remainingForUnlocked = 100 - lockedPercentage - finalTargetPercentage;

  const otherUnlocked = categories.filter(
    (c) => !c.locked && c.id !== targetCategoryId
  );

  const currentUnlockedSum = otherUnlocked.reduce((sum, c) => sum + c.percentage, 0);

  let distributedUnlockedSum = 0;
  const updatedCategories = categories.map((cat) => {
    if (cat.id === targetCategoryId) {
      const allocated = Math.round((finalTargetPercentage / 100) * totalBudget);
      return {
        ...cat,
        percentage: finalTargetPercentage,
        allocated,
      };
    }

    if (cat.locked) {
      return {
        ...cat,
        allocated: Math.round((cat.percentage / 100) * totalBudget),
      };
    }

    // Proportional redistribution
    let newCatPct = 0;
    if (currentUnlockedSum > 0) {
      newCatPct = Math.round((cat.percentage / currentUnlockedSum) * remainingForUnlocked);
    } else if (otherUnlocked.length > 0) {
      newCatPct = Math.round(remainingForUnlocked / otherUnlocked.length);
    }

    distributedUnlockedSum += newCatPct;

    return {
      ...cat,
      percentage: newCatPct,
      allocated: Math.round((newCatPct / 100) * totalBudget),
    };
  });

  // Adjust any rounding discrepancy on the last unlocked category
  const totalSum = updatedCategories.reduce((sum, c) => sum + c.percentage, 0);
  const diff = 100 - totalSum;
  if (diff !== 0 && otherUnlocked.length > 0) {
    const lastUnlocked = updatedCategories.find(
      (c) => !c.locked && c.id !== targetCategoryId
    );
    if (lastUnlocked) {
      lastUnlocked.percentage += diff;
      lastUnlocked.allocated = Math.round((lastUnlocked.percentage / 100) * totalBudget);
    }
  }

  return updatedCategories;
}

export function exportEventAsJson(event: EventPlan): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(event, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_aethel_manifest.json`;
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportBudgetAsCsv(event: EventPlan): void {
  const headers = ['Category', 'Item Name', 'Estimated ($)', 'Actual ($)', 'Status', 'Notes'];
  const rows: string[][] = [];

  event.categories.forEach((cat) => {
    cat.items.forEach((item) => {
      rows.push([
        `"${cat.name.replace(/"/g, '""')}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        item.estimated.toString(),
        item.actual.toString(),
        `"${item.status}"`,
        `"${(item.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    encodeURIComponent([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));

  const downloadAnchor = document.createElement('a');
  const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_budget_breakdown.csv`;
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportTimelineAsCsv(event: EventPlan): void {
  const headers = ['Phase', 'Milestone Task', 'Discipline / Category', 'Priority', 'Schedule / Due Date', 'Status', 'Assigned Lead'];
  const rows: string[][] = [];

  event.phases.forEach((phase) => {
    const tasks = event.tasks.filter((t) => t.phaseId === phase.id);
    tasks.forEach((t) => {
      rows.push([
        `"${phase.label.replace(/"/g, '""')}"`,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.category.replace(/"/g, '""')}"`,
        `"${t.priority}"`,
        `"${t.timeSlot || t.dueDate || ''}"`,
        t.completed ? '"Completed"' : '"Pending"',
        `"${(t.assignedTo || '').replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    encodeURIComponent([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));

  const downloadAnchor = document.createElement('a');
  const filename = `${event.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_production_timeline.csv`;
  downloadAnchor.setAttribute('href', csvContent);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function generateMarkdownDossier(event: EventPlan): string {
  let md = `# AETHEL ATELIER DOSSIER: ${event.title.toUpperCase()}\n\n`;
  md += `**Archetype**: ${event.eventType.toUpperCase()} | **Date**: ${formatDate(event.date)} | **Location**: ${event.location}\n`;
  md += `**Total Planned Budget**: ${formatCurrency(event.totalBudget)} | **Capacity**: ${event.guestCount} Guests (~${formatCurrency(Math.round(event.totalBudget / (event.guestCount || 1)))}/guest)\n`;
  md += `**Aesthetic Theme**: _"${event.themeVibe}"_\n\n`;

  if (event.riskRadar && event.riskRadar.length > 0) {
    md += `## EVENT RISK RADAR & MITIGATION PROTOCOL\n`;
    event.riskRadar.forEach((rr) => {
      md += `- **[${rr.severity.toUpperCase()}] ${rr.risk}**: ${rr.mitigation} (${rr.resolved ? 'RESOLVED' : 'ACTIVE'})\n`;
    });
    md += `\n`;
  }

  md += `## BUDGET ALLOCATION BREAKDOWN\n`;
  event.categories.forEach((cat) => {
    md += `### ${cat.name} — ${cat.percentage}% (${formatCurrency(cat.allocated)})\n`;
    cat.items.forEach((item) => {
      md += `- ${item.name}: Est. ${formatCurrency(item.estimated)} | Act. ${formatCurrency(item.actual)} [${item.status}]\n`;
    });
  });
  md += `\n`;

  md += `## MASTER PRODUCTION TIMELINE\n`;
  event.phases.forEach((phase) => {
    md += `### ${phase.label} (${phase.description})\n`;
    const tasks = event.tasks.filter((t) => t.phaseId === phase.id);
    tasks.forEach((t) => {
      md += `- [${t.completed ? 'x' : ' '}] **${t.title}** (${t.category}, ${t.priority.toUpperCase()})${t.timeSlot ? ` — ${t.timeSlot}` : ''}${t.dueDate ? ` — Due: ${t.dueDate}` : ''}\n`;
    });
  });
  md += `\n`;

  md += `## ARTISAN VENDOR DIRECTORY\n`;
  event.vendors.forEach((v) => {
    md += `- **${v.name}** (${v.category}) — ${v.contactName} (${v.email}) | Est. ${formatCurrency(v.estimatedCost)} [Status: ${v.status.toUpperCase()}]\n`;
  });

  return md;
}

export function triggerPrintPreview(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}

export { exportToiCal, generateShareableLink, decodeSharedPlan } from './exportUtils';
