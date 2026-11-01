import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetCalculator } from '../components/BudgetCalculator';
import { INITIAL_WEDDING } from '../lib/initialData';

function setup() {
  const onUpdateCategories = jest.fn();
  const onUpdateTotalBudget = jest.fn();

  render(
    <BudgetCalculator
      event={INITIAL_WEDDING}
      onUpdateCategories={onUpdateCategories}
      onUpdateTotalBudget={onUpdateTotalBudget}
    />
  );

  return { onUpdateCategories, onUpdateTotalBudget };
}

describe('BudgetCalculator Component Test', () => {
  test('renders category breakdown and sums allocation to 100%', () => {
    setup();

    const totalPercentage = INITIAL_WEDDING.categories.reduce(
      (acc, item) => acc + item.percentage,
      0
    );
    expect(totalPercentage).toBeCloseTo(100, 0);

    // Parity banner reflects exact 100% allocation
    expect(screen.getByText('100% Allocated (Exact Parity)')).toBeInTheDocument();

    // Core categories are rendered (legend + category header)
    expect(screen.getAllByText('Venue & Catering').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contingency').length).toBeGreaterThan(0);
  });

  test('applying a persona financial preset rebalances to an exact 100%', async () => {
    const { onUpdateCategories } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Wedding/ }));

    expect(onUpdateCategories).toHaveBeenCalledTimes(1);
    const passedCategories = onUpdateCategories.mock.calls[0][0];
    const presetSum = passedCategories.reduce(
      (acc: number, cat: { percentage: number }) => acc + cat.percentage,
      0
    );
    expect(presetSum).toBe(100);
  });

  test('editing the total budget propagates the new value', async () => {
    const { onUpdateTotalBudget } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Edit/ }));

    // The master budget input is the only field holding the current total.
    const input = screen.getByDisplayValue(String(INITIAL_WEDDING.totalBudget));
    await user.clear(input);
    await user.type(input, '30000');

    await user.click(screen.getByRole('button', { name: /Save/ }));

    expect(onUpdateTotalBudget).toHaveBeenCalledWith(30000);
  });
});
