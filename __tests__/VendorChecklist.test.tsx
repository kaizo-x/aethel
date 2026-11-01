import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VendorChecklist } from '../components/VendorChecklist';
import { INITIAL_WEDDING } from '../lib/initialData';

describe('VendorChecklist Component Test', () => {
  const setup = () => {
    const onUpdateVendors = jest.fn();
    render(<VendorChecklist event={INITIAL_WEDDING} onUpdateVendors={onUpdateVendors} />);
    return { onUpdateVendors };
  };

  test('renders vendor list correctly', () => {
    setup();

    expect(screen.getByText('Studio Terrene Florals')).toBeInTheDocument();
    expect(screen.getByText('Alta Vista Estate & Olive Grounds')).toBeInTheDocument();
    expect(screen.queryByText(/Grand Floral/i)).not.toBeInTheDocument();
  });

  test('opens the smart outreach generator with a prefilled draft', async () => {
    setup();
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: /Outreach Generator/i })[0]);

    expect(screen.getByText('Smart Vendor Outreach Generator')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(/Curatorial Partnership Inquiry/)
    ).toBeInTheDocument();
  });

  test('registers a new artisan partner and propagates the updated directory', async () => {
    const { onUpdateVendors } = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Add Artisan Partner/i }));
    await user.type(screen.getByPlaceholderText('e.g. Studio Botanica'), 'Maison Lumen Studio');
    await user.click(screen.getByRole('button', { name: /Save Partner/i }));

    expect(onUpdateVendors).toHaveBeenCalledTimes(1);
    const updatedVendors = onUpdateVendors.mock.calls[0][0];
    expect(updatedVendors).toHaveLength(INITIAL_WEDDING.vendors.length + 1);
    expect(updatedVendors[updatedVendors.length - 1].name).toBe('Maison Lumen Studio');
  });
});
