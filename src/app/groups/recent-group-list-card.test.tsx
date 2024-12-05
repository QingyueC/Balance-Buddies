import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RecentGroupListCard } from '@/app/groups/recent-group-list-card';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

jest.mock('@/vars/getVars', () => ({
  getVars: (key: string) => key,
}));

jest.mock('@/app/groups/recent-groups-helpers', () => ({
  unstarGroup: jest.fn(),
  starGroup: jest.fn(),
  archiveGroup: jest.fn(),
  unarchiveGroup: jest.fn(),
  deleteRecentGroup: jest.fn(),
}));

const mockRefreshGroupsFromStorage = jest.fn();

describe('RecentGroupListCard', () => {
  const mockRouterPush = jest.fn();
  const mockToast = { toast: jest.fn() };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useToast as jest.Mock).mockReturnValue(mockToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const groupMock = {
    id: '1',
    name: 'Test Group',
  };

  const groupDetailMock = {
    _count: { participants: 10 },
    createdAt: new Date().toISOString(),
    id: '1',
    name: 'Test Group',
    information: null,
    currency: 'USD'
  };

  it('renders correctly', () => {
    render(
      <RecentGroupListCard
        group={groupMock}
        groupDetail={groupDetailMock}
        isStarred={false}
        isArchived={false}
        refreshGroupsFromStorage={mockRefreshGroupsFromStorage}
      />
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('10 Members')).toBeInTheDocument();
  });

  it('navigates to group detail on click', () => {
    render(
      <RecentGroupListCard
        group={groupMock}
        groupDetail={groupDetailMock}
        isStarred={false}
        isArchived={false}
        refreshGroupsFromStorage={mockRefreshGroupsFromStorage}
      />
    );

    fireEvent.click(screen.getByText('Test Group'));
    expect(mockRouterPush).toHaveBeenCalledWith(`/groups/1`);
  });

  it('handles star button click', () => {
    const { unstarGroup, starGroup, unarchiveGroup } = jest.requireMock(
      '@/app/groups/recent-groups-helpers'
    );

    render(
      <RecentGroupListCard
        group={groupMock}
        groupDetail={groupDetailMock}
        isStarred={false}
        isArchived={false}
        refreshGroupsFromStorage={mockRefreshGroupsFromStorage}
      />
    );

    fireEvent.click(screen.getByTestId('star-button'));
    expect(starGroup).toHaveBeenCalledWith('1');
    expect(unarchiveGroup).toHaveBeenCalledWith('1');
    expect(mockRefreshGroupsFromStorage).toHaveBeenCalled();
  });

  it('handles archive button click', () => {
    const { archiveGroup, unstarGroup } = jest.requireMock(
      '@/app/groups/recent-groups-helpers'
    );

    render(
      <RecentGroupListCard
        group={groupMock}
        groupDetail={groupDetailMock}
        isStarred={false}
        isArchived={false}
        refreshGroupsFromStorage={mockRefreshGroupsFromStorage}
      />
    );

    fireEvent.click(screen.getByTestId('archive-button'));
    expect(archiveGroup).toHaveBeenCalledWith('1');
    expect(unstarGroup).toHaveBeenCalledWith('1');
    expect(mockRefreshGroupsFromStorage).toHaveBeenCalled();
  });

  it('handles delete button click', () => {
    const { deleteRecentGroup } = jest.requireMock(
      '@/app/groups/recent-groups-helpers'
    );

    render(
      <RecentGroupListCard
        group={groupMock}
        groupDetail={groupDetailMock}
        isStarred={false}
        isArchived={false}
        refreshGroupsFromStorage={mockRefreshGroupsFromStorage}
      />
    );

    fireEvent.click(screen.getByTestId('delete-button'));
    expect(deleteRecentGroup).toHaveBeenCalledWith(groupMock);
    expect(mockRefreshGroupsFromStorage).toHaveBeenCalled();
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Groups.RecentRemovedToast.title',
      description: 'Groups.RecentRemovedToast.description',
    });
  });
});
