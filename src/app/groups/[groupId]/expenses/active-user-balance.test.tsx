import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActUserBal } from './active-user-balance';
import { useActiveUser } from '@/lib/hooks';
import { getBalances } from '@/lib/balances';
import { Money } from '@/components/money';
import { SplitMode } from '@prisma/client'; // Import from Prisma client

// Mock dependencies
jest.mock('@/lib/hooks', () => ({
  useActiveUser: jest.fn(),
}));

jest.mock('@/lib/balances', () => ({
  getBalances: jest.fn(),
}));

jest.mock('@/components/money', () => ({
  Money: jest.fn(({ amount, currency }) => <span>{`${currency}${amount}`}</span>),
}));

jest.mock('@/vars/getVars', () => ({
  getVars: jest.fn((key, params) => {
    if (key === 'ExpenseCard.yourBalance') return 'Your Balance:';
    return key;
  }),
}));

// Define `Expense` type using the expected type from your codebase
type Expense = Parameters<typeof getBalances>[0][number];

describe('ActUserBal Component', () => {
  const mockExpense: Expense = {
    id: 'expense-1',
    amount: 100,
    expenseDate: new Date(),
    title: 'Test Expense',
    isReimbursement: false,
    splitMode: SplitMode.EVENLY, // Use the enum value
    createdAt: new Date(),
    category: { id: 1, grouping: 'Food', name: 'Lunch' },
    paidBy: { id: 'user-1', name: 'John Doe' },
    paidFor: [
      { participant: { id: 'user-1', name: 'John Doe' }, shares: 1 },
      { participant: { id: 'user-2', name: 'Jane Doe' }, shares: 1 },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders null if activeUserId is null, empty, or "None"', () => {
    (useActiveUser as jest.Mock).mockReturnValueOnce(null);

    render(
      <ActUserBal groupId="group-1" currency="USD" expense={mockExpense} />
    );

    expect(screen.queryByText(/Your Balance:/)).not.toBeInTheDocument();
  });

  it('renders "You are not involved" if activeUserId is not in balances', () => {
    (useActiveUser as jest.Mock).mockReturnValueOnce('user-3');
    (getBalances as jest.Mock).mockReturnValueOnce({});

    render(
      <ActUserBal groupId="group-1" currency="USD" expense={mockExpense} />
    );

    expect(screen.getByText('You are not involved')).toBeInTheDocument();
  });

  it('renders user balance with details if activeUserId is in balances', () => {
    (useActiveUser as jest.Mock).mockReturnValueOnce('user-1');
    (getBalances as jest.Mock).mockReturnValueOnce({
      'user-1': {
        total: 100,
        paid: 50,
        paidFor: 30,
      },
    });
  
    render(
      <ActUserBal groupId="group-1" currency="USD" expense={mockExpense} />
    );
  
    const container = screen.getByText(/Your Balance:/).closest('div');
    expect(container).toBeInTheDocument();
  
    // Verify the combined text content using a regular expression
    expect(container).toHaveTextContent(
      /Your Balance:\s*USD100\s*\(USD50\s*-\s*USD30\)/
    );
  });
  
  it('renders user balance without details if balance.paid or balance.paidFor is zero', () => {
    (useActiveUser as jest.Mock).mockReturnValueOnce('user-1');
    (getBalances as jest.Mock).mockReturnValueOnce({
      'user-1': {
        total: 100,
        paid: 0,
        paidFor: 0,
      },
    });

    render(
      <ActUserBal groupId="group-1" currency="USD" expense={mockExpense} />
    );

    const container = screen.getByText(/Your Balance:/).closest('div');
    expect(container).toBeInTheDocument();

    expect(within(container!).getByText('USD100')).toBeInTheDocument();
    expect(within(container!).queryByText('(USD0 - USD0)')).not.toBeInTheDocument();
  });
});
