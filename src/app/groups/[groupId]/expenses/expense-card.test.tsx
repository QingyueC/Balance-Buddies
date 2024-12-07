import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExpenseCard } from './expense-card';
import { useRouter } from 'next/navigation';
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon';
import { ActiveUserBalance } from '@/app/groups/[groupId]/expenses/active-user-balance';
import { SplitMode } from '@prisma/client';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/groups/[groupId]/expenses/category-icon', () => ({
  CategoryIcon: jest.fn(() => <div data-testid="category-icon">Icon</div>),
}));

jest.mock('@/app/groups/[groupId]/expenses/active-user-balance', () => ({
  ActiveUserBalance: jest.fn(() => <div data-testid="active-user-balance">Balance</div>),
}));

jest.mock('@/lib/utils', () => {
  const actualUtils = jest.requireActual('@/lib/utils');
  return {
    ...actualUtils,
    formatCurrency: jest.fn((currency, amount) => `${currency}${amount}`),
    formatDate: jest.fn((date) => date.toDateString()),
  };
});

describe('ExpenseCard Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockExpense = {
    id: 'expense-1',
    title: 'Test Expense',
    amount: 100,
    isReimbursement: false,
    splitMode: SplitMode.EVENLY,
    createdAt: new Date('2023-11-01'),
    category: { id: 1, name: 'Test Category', grouping: 'Test Group' },
    expenseDate: new Date('2023-11-01'),
    paidBy: { id: 'user-1', name: 'John Doe' },
    paidFor: [
      {
        participant: { id: 'user-2', name: 'Jane Doe' },
        shares: 1,
      },
    ],
  };

  const mockCurrency = 'USD';
  const mockGroupId = 'group-1';

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders correctly with provided props', () => {
    render(<ExpenseCard expense={mockExpense} currency={mockCurrency} groupId={mockGroupId} />);

    // Check CategoryIcon
    expect(screen.getByTestId('category-icon')).toBeInTheDocument();

    // Check title
    expect(screen.getByText('Test Expense')).toBeInTheDocument();

    // Check Participants
    const participantsContainer = screen.getByText(/Paid by/).closest('div');
    expect(participantsContainer).toBeInTheDocument();

    // Ensure fragments render correctly
    expect(within(participantsContainer!).getByText('John Doe')).toBeInTheDocument();
    expect(within(participantsContainer!).getByText('Jane Doe')).toBeInTheDocument();

    // Check ActiveUserBalance
    expect(screen.getByTestId('active-user-balance')).toBeInTheDocument();

    // Check formatted amount
    expect(screen.getByText('USD100')).toBeInTheDocument();

    // Check formatted date
    expect(screen.getByText(/Tue Oct 31 2023/)).toBeInTheDocument();
  });

  it('navigates to the correct page on click', () => {
    render(<ExpenseCard expense={mockExpense} currency={mockCurrency} groupId={mockGroupId} />);

    const card = screen.getByText('Test Expense').closest('div');
    fireEvent.click(card!);

    expect(mockRouter.push).toHaveBeenCalledWith(`/groups/${mockGroupId}/expenses/${mockExpense.id}/edit`);
  });

  it('displays italicized text for reimbursements', () => {
    const reimbursementExpense = { ...mockExpense, isReimbursement: true };

    render(<ExpenseCard expense={reimbursementExpense} currency={mockCurrency} groupId={mockGroupId} />);

    const title = screen.getByText('Test Expense');
    const amount = screen.getByText('USD100');

    expect(title).toHaveClass('italic');
    expect(amount).toHaveClass('italic');
  });

  it('passes the correct props to ActiveUserBalance', () => {
    render(<ExpenseCard expense={mockExpense} currency={mockCurrency} groupId={mockGroupId} />);

    expect(ActiveUserBalance).toHaveBeenCalledWith(
      {
        groupId: mockGroupId,
        currency: mockCurrency,
        expense: mockExpense,
      },
      {}
    );
  });

  it('passes the correct props to CategoryIcon', () => {
    render(<ExpenseCard expense={mockExpense} currency={mockCurrency} groupId={mockGroupId} />);

    expect(CategoryIcon).toHaveBeenCalledWith(
      {
        category: mockExpense.category,
        className: 'w-6 h-6 text-muted-foreground',
      },
      {}
    );
  });
});
