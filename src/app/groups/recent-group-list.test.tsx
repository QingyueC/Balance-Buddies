import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentGroupList } from '@/app/groups/recent-group-list';
import { trpc } from '@/trpc/client';
import { getRecentGroups, getStarredGroups, getArchivedGroups } from '@/app/groups/recent-groups-helpers';
import { useRouter } from 'next/navigation';

jest.mock('@/trpc/client', () => ({
  trpc: {
    groups: {
      list: {
        useQuery: jest.fn(),
      },
    },
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/app/groups/recent-groups-helpers', () => ({
  getRecentGroups: jest.fn(),
  getStarredGroups: jest.fn(),
  getArchivedGroups: jest.fn(),
}));

jest.mock('@/vars/getVars', () => ({
  getVars: (key: string) => key,
}));

describe('RecentGroupList', () => {
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock return value for each test
    (trpc.groups.list.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true
    });
  });

  it('loads groups from storage and renders them', () => {
    (getRecentGroups as jest.Mock).mockReturnValue([{ id: '1', name: 'Group 1' }]);
    (getStarredGroups as jest.Mock).mockReturnValue([]);
    (getArchivedGroups as jest.Mock).mockReturnValue([]);

    (trpc.groups.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        groups: [
          {
            id: '1',
            name: 'Group 1',
            _count: { participants: 10 },
            createdAt: new Date().toISOString(),
          },
        ],
      },
      isLoading: false,
    });

    render(<RecentGroupList />);
    expect(screen.getByText('Group 1')).toBeInTheDocument();
    expect(screen.getByText('My Groups')).toBeInTheDocument();
  });

  it('renders loading state when data is not ready', () => {
    (getRecentGroups as jest.Mock).mockReturnValue([{ id: '1', name: 'Group 1' }]);
    (getStarredGroups as jest.Mock).mockReturnValue([]);
    (getArchivedGroups as jest.Mock).mockReturnValue([]);

    (trpc.groups.list.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<RecentGroupList />);
    expect(screen.getByText('Groups.loadingRecent')).toBeInTheDocument();
  });

  it('renders "no recent groups" message when no groups are found', () => {
    (getRecentGroups as jest.Mock).mockReturnValue([]);
    (getStarredGroups as jest.Mock).mockReturnValue([]);
    (getArchivedGroups as jest.Mock).mockReturnValue([]);

    (trpc.groups.list.useQuery as jest.Mock).mockReturnValue({
      data: { groups: [] },
      isLoading: false,
    });

    render(<RecentGroupList />);
    expect(screen.getByText('Groups.NoRecent.description')).toBeInTheDocument();
    expect(screen.getByText('Groups.NoRecent.create')).toBeInTheDocument();
  });

  it('categorizes groups into starred, recent, and archived', () => {
    const groupsMock = [
      { id: '1', name: 'Starred Group' },
      { id: '2', name: 'Recent Group' },
      { id: '3', name: 'Archived Group' },
    ];

    (getRecentGroups as jest.Mock).mockReturnValue(groupsMock);
    (getStarredGroups as jest.Mock).mockReturnValue(['1']);
    (getArchivedGroups as jest.Mock).mockReturnValue(['3']);

    (trpc.groups.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        groups: [
          {
            id: '1',
            name: 'Starred Group',
            _count: { participants: 10 },
            createdAt: new Date().toISOString(),
            information: null,
            currency: 'USD'
          },
          {
            id: '2',
            name: 'Recent Group',
            _count: { participants: 5 },
            createdAt: new Date().toISOString(),
            information: null,
            currency: 'USD'
          },
          {
            id: '3',
            name: 'Archived Group',
            _count: { participants: 3 },
            createdAt: new Date().toISOString(),
            information: null,
            currency: 'USD'
          },
        ],
      },
      isLoading: false,
    });

    render(<RecentGroupList />);

    expect(screen.getByText('Groups.starred')).toBeInTheDocument();
    expect(screen.getByText('Starred Group')).toBeInTheDocument();
    expect(screen.getByText('Groups.recent')).toBeInTheDocument();
    expect(screen.getByText('Recent Group')).toBeInTheDocument();
    expect(screen.getByText('Groups.archived')).toBeInTheDocument();
    expect(screen.getByText('Archived Group')).toBeInTheDocument();
  });
});
