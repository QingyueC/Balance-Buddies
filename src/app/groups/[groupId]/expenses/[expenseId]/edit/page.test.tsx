import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditExpensePage from './page';
import { EditExpenseForm } from '@/app/groups/[groupId]/expenses/edit-expense-form';
import { getRuntimeFeatureFlags } from '@/lib/featureFlags';

// Mock dependencies
jest.mock('@/app/groups/[groupId]/expenses/edit-expense-form', () => ({
  EditExpenseForm: jest.fn(() => <div>Edit Expense Form</div>),
}));

jest.mock('@/lib/featureFlags', () => ({
  getRuntimeFeatureFlags: jest.fn(),
}));

describe('EditExpensePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders EditExpenseForm with correct props', async () => {
    const mockFeatureFlags = { featureA: true, featureB: false };
    (getRuntimeFeatureFlags as jest.Mock).mockResolvedValue(mockFeatureFlags);

    // Mock the params object
    const params = { groupId: 'group-1', expenseId: 'expense-1' };

    // Since EditExpensePage is an async function component, we need to call it and await the result
    const element = await EditExpensePage({ params });

    // Render the resulting element
    render(element);

    // Wait for the form to render
    await waitFor(() => {
      expect(screen.getByText('Edit Expense Form')).toBeInTheDocument();
    });

    // Check if EditExpenseForm was called with the correct props
    expect(EditExpenseForm).toHaveBeenCalledWith(
      {
        groupId: 'group-1',
        expenseId: 'expense-1',
        runtimeFeatureFlags: mockFeatureFlags,
      },
      {}
    );
  });
});
