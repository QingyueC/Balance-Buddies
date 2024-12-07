import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditGroup } from './edit-group';
import { trpc } from '@/trpc/client';
import { useCurrentGroup } from '../current-group-context';

// Mock the necessary dependencies
jest.mock('@/trpc/client', () => ({
  trpc: {
    groups: {
      getDetails: {
        useQuery: jest.fn(),
      },
      update: {
        useMutation: jest.fn(),
      },
    },
    useUtils: jest.fn(),
  },
}));

jest.mock('../current-group-context', () => ({
  useCurrentGroup: jest.fn(),
}));

jest.mock('@/components/group-form', () => ({
  GroupForm: jest.fn(({ onSubmit }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: 'Updated Group' }, 'participant-1');
      }}
    >
      <button type="submit">Submit</button>
    </form>
  )),
}));

describe('EditGroup Component', () => {
  const mockGroupData = {
    group: { name: 'Test Group' },
    participantsWithExpenses: ['participant-1'],
  };

  const mockMutateAsync = jest.fn().mockResolvedValue({});
  const mockInvalidate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useCurrentGroup
    (useCurrentGroup as jest.Mock).mockReturnValue({ groupId: 'group-1' });

    // Mock TRPC queries and mutations
    (trpc.groups.getDetails.useQuery as jest.Mock).mockReturnValue({
      data: mockGroupData,
      isLoading: false,
    });

    (trpc.groups.update.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
    });

    (trpc.useUtils as jest.Mock).mockReturnValue({
      groups: {
        invalidate: mockInvalidate,
      },
    });
  });

  it('renders the component correctly', () => {
    render(<EditGroup />);

    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('calls the appropriate TRPC mutation on form submission', async () => {
    render(<EditGroup />);

    // Simulate form submission
    await userEvent.click(screen.getByText('Submit'));

    // Check if the mutation was called with correct arguments
    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        groupId: 'group-1',
        participantId: 'participant-1',
        groupFormValues: { name: 'Updated Group' },
      })
    );

    // Check if the invalidation was called
    await waitFor(() => expect(mockInvalidate).toHaveBeenCalled());
  });

  it('shows nothing while loading', () => {
    (trpc.groups.getDetails.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<EditGroup />);

    expect(screen.queryByText('Submit')).not.toBeInTheDocument();
  });
});
