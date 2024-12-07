import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditExpenseForm } from './edit-expense-form';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/trpc/client', () => ({
  trpc: {
    groups: {
      get: {
        useQuery: jest.fn(),
      },
      expenses: {
        get: {
          useQuery: jest.fn(),
        },
        update: {
          useMutation: jest.fn(),
        },
        delete: {
          useMutation: jest.fn(),
        },
      },
    },
    categories: {
      list: {
        useQuery: jest.fn(),
      },
    },
    useUtils: jest.fn(),
  },
}));

jest.mock('./expense-form', () => ({
  ExpenseForm: jest.fn(({ onSubmit, onDelete }) => (
    <div data-testid="expense-form">
      <button
        data-testid="submit-button"
        onClick={() =>
          onSubmit({ name: 'Updated Expense', amount: 200 }, 'participant-1')
        }
      >
        Submit
      </button>
      <button
        data-testid="delete-button"
        onClick={() => onDelete('participant-1')}
      >
        Delete
      </button>
    </div>
  )),
}));

describe('EditExpenseForm Component', () => {
  const mockGroup = {
    id: 'group-1',
    name: 'Test Group',
  };
  const mockCategories = [
    { id: 'category-1', name: 'Category 1' },
    { id: 'category-2', name: 'Category 2' },
  ];
  const mockExpense = {
    id: 'expense-1',
    name: 'Test Expense',
    amount: 100,
  };

  const mockRuntimeFeatureFlags = {
    enableExpenseDocuments: true,
    enableReceiptExtract: false,
    enableCategoryExtract: true,
  };

  const mockRouter = {
    push: jest.fn(),
  };

  const mockUpdateMutateAsync = jest.fn().mockResolvedValue({});
  const mockDeleteMutateAsync = jest.fn().mockResolvedValue({});
  const mockInvalidate = jest.fn();

  const mockUtils = {
    groups: {
      expenses: {
        invalidate: mockInvalidate,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({
      data: { group: mockGroup },
    });
    (trpc.categories.list.useQuery as jest.Mock).mockReturnValue({
      data: { categories: mockCategories },
    });
    (trpc.groups.expenses.get.useQuery as jest.Mock).mockReturnValue({
      data: { expense: mockExpense },
    });
    (trpc.groups.expenses.update.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
    });
    (trpc.groups.expenses.delete.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
    });
    (trpc.useUtils as jest.Mock).mockReturnValue(mockUtils);
  });

  it('renders the ExpenseForm component when data is available', () => {
    render(
      <EditExpenseForm
        groupId="group-1"
        expenseId="expense-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    expect(screen.getByTestId('expense-form')).toBeInTheDocument();
  });

  it('returns null if group, categories, or expense data is missing', () => {
    (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({ data: null });

    const { container } = render(
      <EditExpenseForm
        groupId="group-1"
        expenseId="expense-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles the onSubmit handler correctly', async () => {
    render(
      <EditExpenseForm
        groupId="group-1"
        expenseId="expense-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    const submitButton = screen.getByTestId('submit-button');

    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
        expenseId: 'expense-1',
        groupId: 'group-1',
        expenseFormValues: { name: 'Updated Expense', amount: 200 },
        participantId: 'participant-1',
      });
    });

    expect(mockInvalidate).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/groups/group-1');
  });

  it('handles the onDelete handler correctly', async () => {
    render(
      <EditExpenseForm
        groupId="group-1"
        expenseId="expense-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');

    await act(async () => {
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith({
        expenseId: 'expense-1',
        groupId: 'group-1',
        participantId: 'participant-1',
      });
    });

    expect(mockInvalidate).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/groups/group-1');
  });
});
