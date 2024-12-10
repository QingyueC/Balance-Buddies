import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ReimbursementList } from './reimbursement-list'

jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
  formatCurrency: (currency: string, amount: number) =>
    `${currency}${amount.toFixed(2)}`,
}))

jest.mock('@/vars/getVars', () => ({
  getVars: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'Balances.Reimbursements.noImbursements': 'No reimbursements found',
      'Balances.Reimbursements.markAsPaid': 'Mark as Paid',
    }
    return translations[key] || key
  }),
}))

describe('ReimbursementList', () => {
    it('renders reimbursements grouped by debtors and creditors', () => {
      const participants = [
        { id: '1', name: 'Alice', groupId: 'g1' },
        { id: '2', name: 'Bob', groupId: 'g1' },
        { id: '3', name: 'Charlie', groupId: 'g1' },
      ];
  
      const reimbursements = [
        { from: '1', to: '2', amount: 50 },
        { from: '1', to: '3', amount: 30 },
        { from: '3', to: '2', amount: 20 },
      ];
  
      render(
        <ReimbursementList
          reimbursements={reimbursements}
          participants={participants}
          currency="$"
          groupId="group1"
        />
      );
  
      const aliceSection = within(screen.getByText('Alice').closest('.mb-6') as HTMLElement);
      const charlieSection = within(screen.getByText('Charlie', { selector: '.font-bold' }).closest('.mb-6') as HTMLElement);
  
      expect(aliceSection.getByText('Alice')).toBeInTheDocument();
      expect(charlieSection.getByText('Charlie')).toBeInTheDocument();
  
      expect(aliceSection.getByText('Bob')).toBeInTheDocument();
      expect(aliceSection.getByText('$50.00')).toBeInTheDocument();
      expect(aliceSection.getByText('Charlie')).toBeInTheDocument();
      expect(aliceSection.getByText('$30.00')).toBeInTheDocument();
  
      expect(charlieSection.getByText('Bob')).toBeInTheDocument();
      expect(charlieSection.getByText('$20.00')).toBeInTheDocument();
    });
  });
  