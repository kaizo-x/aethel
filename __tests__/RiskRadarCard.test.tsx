import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskRadarCard } from '../components/RiskRadarCard';
import { RiskRadarItem } from '../lib/types';

describe('RiskRadarCard Component Test', () => {
  const mockRisks: RiskRadarItem[] = [
    {
      id: 'r1',
      risk: 'Rain threat during outdoor ceremony',
      severity: 'High',
      mitigation: 'Rent waterproof tent, sidewalls and grounded power runs',
      resolved: false,
    },
    {
      id: 'r2',
      risk: 'Neighborhood noise curfew at 10:00 PM',
      severity: 'Medium',
      mitigation: 'Schedule acoustic sets earlier and relocate the DJ to the indoor pavilion',
      resolved: false,
    },
  ];

  const renderCard = (overrides: Partial<React.ComponentProps<typeof RiskRadarCard>> = {}) => {
    const props = {
      risks: mockRisks,
      onScanRadar: jest.fn().mockResolvedValue(undefined),
      isScanning: false,
      onToggleRiskResolved: jest.fn(),
      onConvertRiskToTask: jest.fn(),
      ...overrides,
    };
    render(<RiskRadarCard {...props} />);
    return props;
  };

  test('renders risk items and triggers mitigation action', () => {
    const { onToggleRiskResolved } = renderCard();

    expect(screen.getByText(/Rain threat/i)).toBeInTheDocument();
    expect(screen.getByText(/Rent waterproof tent/i)).toBeInTheDocument();

    const mitigateBtn = screen.getAllByRole('button', { name: /Mark Mitigated/i })[0];
    fireEvent.click(mitigateBtn);

    // The card reports the index of the toggled risk to its parent.
    expect(onToggleRiskResolved).toHaveBeenCalledWith(0);
  });

  test('converts a risk into a timeline task via the 1-click action', () => {
    const { onConvertRiskToTask } = renderCard();

    const convertBtn = screen.getAllByRole('button', { name: /1-Click Add to Timeline/i })[0];
    fireEvent.click(convertBtn);

    expect(onConvertRiskToTask).toHaveBeenCalledWith(mockRisks[0], 0);
  });

  test('filters risks by severity', () => {
    renderCard();

    fireEvent.click(screen.getByRole('button', { name: /High Severity \(1\)/i }));

    expect(screen.getByText(/Rain threat/i)).toBeInTheDocument();
    expect(screen.queryByText(/Neighborhood noise curfew/i)).not.toBeInTheDocument();
  });
});
