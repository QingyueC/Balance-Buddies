import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExpensePage from './page';
import { CreateExpenseForm } from '@/app/groups/[groupId]/expenses/create-expense-form';
import { getRuntimeFeatureFlags } from '@/lib/featureFlags';

// Mock dependencies
jest.mock('@/app/groups/[groupId]/expenses/create-expense-form', () => ({
  CreateExpenseForm: jest.fn(() => <div>Create Expense Form</div>),
}));

jest.mock('@/lib/featureFlags', () => ({
  getRuntimeFeatureFlags: jest.fn(),
}));

describe('ExpensePage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders CreateExpenseForm with correct props', async () => {
    const mockFeatureFlags = { featureX: true, featureY: false };
    (getRuntimeFeatureFlags as jest.Mock).mockResolvedValue(mockFeatureFlags);

    // Mock the params object
    const params = { groupId: 'group-1' };

    // Since ExpensePage is an async function component, we need to call it and await the result
    const element = await ExpensePage({ params });

    // Render the resulting element
    render(element);

    // Wait for the form to render
    await waitFor(() => {
      expect(screen.getByText('Create Expense Form')).toBeInTheDocument();
    });

    // Check if CreateExpenseForm was called with the correct props
    expect(CreateExpenseForm).toHaveBeenCalledWith(
      {
        groupId: 'group-1',
        runtimeFeatureFlags: mockFeatureFlags,
      },
      {}
    );
  });
});
