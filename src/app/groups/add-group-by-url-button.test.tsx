import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddGroupByUrlButton } from '@/app/groups/add-group-by-url-button';
import { saveRecentGroup } from '@/app/groups/recent-groups-helpers';
import { trpc } from '@/trpc/client';

jest.mock('@/app/groups/recent-groups-helpers', () => ({
  saveRecentGroup: jest.fn(),
}));

jest.mock('@/trpc/client', () => ({
  trpc: {
    useUtils: jest.fn(() => ({
      groups: {
        get: {
          fetch: jest.fn(),
        },
      },
    })),
  },
}));

jest.mock('@/vars/getVars', () => ({
  getVars: (key: string) => key,
}));

jest.mock('@/lib/hooks', () => ({
  useMediaQuery: jest.fn(() => true), // Simulating desktop environment
}));

describe('AddGroupByUrlButton', () => {
  const mockReload = jest.fn();
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (trpc.useUtils as jest.Mock).mockReturnValue({
      groups: {
        get: {
          fetch: mockFetch,
        },
      },
    });
  });

  it('renders the button and opens the popover on click', () => {
    render(<AddGroupByUrlButton reload={mockReload} />);

    const button = screen.getByText('Groups.AddByURL.button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('Groups.AddByURL.title')).toBeInTheDocument();
    expect(screen.getByText('Groups.AddByURL.description')).toBeInTheDocument();
  });

  it('submits a valid URL and successfully adds a group', async () => {
    const mockGroup = { id: '1', name: 'Test Group' };
    mockFetch.mockResolvedValueOnce({ group: mockGroup });

    render(<AddGroupByUrlButton reload={mockReload} />);

    fireEvent.click(screen.getByText('Groups.AddByURL.button'));

    const input = screen.getByPlaceholderText('https://banlancebuddies.app/...');
    fireEvent.change(input, { target: { value: `${window.location.origin}/groups/1` } });

    fireEvent.click(screen.getByTestId('submit-button'));
    await waitFor(() => {
      expect(input).toHaveValue('');
    });

    // Then verify the popover closes and other effects occur
    await waitFor(() => {
      expect(saveRecentGroup).toHaveBeenCalledWith(mockGroup);
      expect(mockReload).toHaveBeenCalled();
      expect(screen.queryByText('Groups.AddByURL.title')).not.toBeInTheDocument();
    });
  });

  it('shows an error message when the group is not found', async () => {
    mockFetch.mockResolvedValueOnce({ group: null });

    render(<AddGroupByUrlButton reload={mockReload} />);

    fireEvent.click(screen.getByText('Groups.AddByURL.button'));

    const input = screen.getByPlaceholderText('https://banlancebuddies.app/...');
    fireEvent.change(input, { target: { value: `${window.location.origin}/groups/unknown` } });

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByText('Groups.AddByURL.error')).toBeInTheDocument());
    expect(saveRecentGroup).not.toHaveBeenCalled();
    expect(mockReload).not.toHaveBeenCalled();
  });

  it('resets the error message on input change', async () => {
    mockFetch.mockResolvedValueOnce({ group: null });

    render(<AddGroupByUrlButton reload={mockReload} />);

    fireEvent.click(screen.getByText('Groups.AddByURL.button'));

    const input = screen.getByPlaceholderText('https://banlancebuddies.app/...');
    fireEvent.change(input, { target: { value: `${window.location.origin}/groups/unknown` } });

    fireEvent.click(screen.getByTestId('submit-button'));

    await waitFor(() => expect(screen.getByText('Groups.AddByURL.error')).toBeInTheDocument());

    fireEvent.change(input, { target: { value: `${window.location.origin}/groups/1` } });

    expect(screen.queryByText('Groups.AddByURL.error')).not.toBeInTheDocument();
  });

  it('disables the input and button while the request is pending', async () => {
    const mockPromise = new Promise((resolve) => setTimeout(() => resolve({ group: null }), 1000));
    mockFetch.mockReturnValueOnce(mockPromise);

    render(<AddGroupByUrlButton reload={mockReload} />);

    fireEvent.click(screen.getByText('Groups.AddByURL.button'));

    const input = screen.getByPlaceholderText('https://banlancebuddies.app/...');
    fireEvent.change(input, { target: { value: `${window.location.origin}/groups/1` } });

    const button = screen.getByTestId('submit-button');

    fireEvent.click(button);

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();

    await waitFor(() => expect(input).not.toBeDisabled());
    await waitFor(() => expect(button).not.toBeDisabled());
  });
});
