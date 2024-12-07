import { render, screen } from '@testing-library/react';
import { Money } from './money';

jest.mock('@/lib/utils', () => ({
  ...jest.requireActual('@/lib/utils'),
  formatCurrency: (currency: string, amount: number) =>
    `${currency}${amount.toFixed(2)}`, // Adjust this to match actual implementation
}));

describe('Money Component', () => {
  it('renders the formatted currency', () => {
    render(<Money currency="USD" amount={100} />);
    expect(screen.getByText('USD100.00')).toBeInTheDocument();
  });

  it('applies the bold class if bold is true', () => {
    render(<Money currency="USD" amount={100} bold />);
    const element = screen.getByText('USD100.00');
    expect(element).toHaveClass('font-bold');
  });

  it('applies the green color class if amount is >= 1 and colored is true', () => {
    render(<Money currency="USD" amount={10} colored />);
    const element = screen.getByText('USD10.00');
    expect(element).toHaveClass('text-green-600');
  });

  it('applies the red color class if amount is <= 1 and colored is true', () => {
    render(<Money currency="USD" amount={0.5} colored />);
    const element = screen.getByText('USD0.50');
    expect(element).toHaveClass('text-red-600');
  });

  it('does not apply any color class if colored is false', () => {
    render(<Money currency="USD" amount={10} />);
    const element = screen.getByText('USD10.00');
    expect(element).not.toHaveClass('text-red-600');
    expect(element).not.toHaveClass('text-green-600');
  });

  it('handles a large amount properly', () => {
    render(<Money currency="EUR" amount={1000000} />);
    expect(screen.getByText('EUR1000000.00')).toBeInTheDocument();
  });
});
