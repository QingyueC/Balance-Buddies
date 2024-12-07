import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ActiveUserModal } from './active-user-modal';
import { trpc } from '@/trpc/client';
import { useMediaQuery } from '@/lib/hooks';
import { getVars } from '@/vars/getVars';

// Mock ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback: any) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock('@/trpc/client', () => ({
  trpc: {
    groups: {
      get: {
        useQuery: jest.fn(),
      },
    },
  },
}));

jest.mock('@/lib/hooks', () => ({
  useMediaQuery: jest.fn(),
}));

jest.mock('@/vars/getVars', () => ({
  getVars: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();

  // Mock localStorage
  const localStorageMock = (function () {
    let store: { [key: string]: string } = {};

    return {
      getItem(key: string) {
        return store[key] || null;
      },
      setItem(key: string, value: string) {
        store[key] = value.toString();
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        store = {};
      },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock translations
  (getVars as jest.Mock).mockImplementation((key: string) => {
    const translations: Record<string, string> = {
      'Expenses.ActiveUserModal.title': 'Select Active User',
      'Expenses.ActiveUserModal.description': 'Please select an active user.',
      'Expenses.ActiveUserModal.nobody': 'Nobody',
      'Expenses.ActiveUserModal.save': 'Save',
      'Expenses.ActiveUserModal.footer': 'You can change this later.',
    };
    return translations[key] || key;
  });
});

const mockGroupData = {
  group: {
    id: 'group-1',
    participants: [
      { id: 'user-1', name: 'Alice' },
      { id: 'user-2', name: 'Bob' },
    ],
  },
};

test('opens modal when no active user is set', async () => {
  (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({
    data: mockGroupData,
  });
  (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate desktop

  render(<ActiveUserModal groupId="group-1" />);

  // Wait for useEffect to run
  await waitFor(() => {
    expect(screen.getByText('Select Active User')).toBeInTheDocument();
  });
});

test('does not open modal when active user is already set', async () => {
  (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({
    data: mockGroupData,
  });
  (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate desktop

  localStorage.setItem('group-1-activeUser', 'user-1');

  render(<ActiveUserModal groupId="group-1" />);

  // Ensure modal is not open
  expect(screen.queryByText('Select Active User')).not.toBeInTheDocument();
});

test('selecting an active user updates localStorage and closes modal', async () => {
  (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({
    data: mockGroupData,
  });
  (useMediaQuery as jest.Mock).mockReturnValue(true); // Simulate desktop

  render(<ActiveUserModal groupId="group-1" />);

  // Wait for modal to open
  await waitFor(() => {
    expect(screen.getByText('Select Active User')).toBeInTheDocument();
  });

  // Select a participant
  const aliceRadio = screen.getByLabelText('Alice');
  fireEvent.click(aliceRadio);

  // Click the save button
  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);

  // Check that localStorage is updated
  expect(localStorage.getItem('group-1-activeUser')).toBe('user-1');

  // Modal should be closed
  await waitFor(() => {
    expect(screen.queryByText('Select Active User')).not.toBeInTheDocument();
  });
});

test('renders drawer on mobile devices', async () => {
  (trpc.groups.get.useQuery as jest.Mock).mockReturnValue({
    data: mockGroupData,
  });
  (useMediaQuery as jest.Mock).mockReturnValue(false); // Simulate mobile

  render(<ActiveUserModal groupId="group-1" />);

  // Wait for drawer to open
  await waitFor(() => {
    expect(screen.getByText('Select Active User')).toBeInTheDocument();
  });

  // Ensure that DrawerContent is rendered
  expect(screen.getByRole('dialog')).toBeInTheDocument();
});