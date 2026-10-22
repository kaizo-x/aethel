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

export function triggerPrintPreview(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
