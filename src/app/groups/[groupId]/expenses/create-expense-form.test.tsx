import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateExpenseForm } from './create-expense-form';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

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
        create: {
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
  ExpenseForm: jest.fn(({ onSubmit }) => (
    <div data-testid="expense-form">
      <button
        data-testid="submit-button"
        onClick={() => onSubmit({ name: 'Test Expense', amount: 100 }, 'participant-1')}
      >
        Submit
      </button>
    </div>
  )),
}));

describe('CreateExpenseForm Component', () => {
  const mockGroup = {
    id: 'group-1',
    name: 'Test Group',
  };
  const mockCategories = [
    { id: 'category-1', name: 'Category 1' },
    { id: 'category-2', name: 'Category 2' },
  ];

  const mockRuntimeFeatureFlags = {
    enableExpenseDocuments: true,
    enableReceiptExtract: false,
    enableCategoryExtract: true,
  };

  const mockRouter = {
    push: jest.fn(),
  };

  const mockMutateAsync = jest.fn().mockResolvedValue({});

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
    (trpc.groups.expenses.create.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
    (trpc.useUtils as jest.Mock).mockReturnValue(mockUtils);
  });

  it('renders the ExpenseForm component when data is available', () => {
    render(
      <CreateExpenseForm
        groupId="group-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    expect(screen.getByTestId('expense-form')).toBeInTheDocument();
  });

  it('calls onSubmit handler with correct arguments', async () => {
    render(
      <CreateExpenseForm
        groupId="group-1"
        runtimeFeatureFlags={mockRuntimeFeatureFlags}
      />
    );

    const submitButton = screen.getByTestId('submit-button');

    // Use act to handle the state updates
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for all async operations to complete
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        groupId: 'group-1',
        expenseFormValues: { name: 'Test Expense', amount: 100 },
        participantId: 'participant-1',
      });
    });

    expect(mockInvalidate).toHaveBeenCalledTimes(1);
    expect(mockRouter.push).toHaveBeenCalledWith('/groups/group-1');
  });
});
