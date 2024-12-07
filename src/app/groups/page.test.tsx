import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GroupsPage, { metadata } from '@/app/groups/page';
import { RecentGroupList } from '@/app/groups/recent-group-list';

jest.mock('@/app/groups/recent-group-list', () => ({
  RecentGroupList: jest.fn(() => <div>Mocked RecentGroupList</div>),
}));

describe('GroupsPage', () => {
  it('includes the correct metadata', () => {
    expect(metadata).toEqual({
      title: 'Recently visited groups',
    });
  });

  it('renders the RecentGroupList component', async () => {
    render(await GroupsPage());
    expect(screen.getByText('Mocked RecentGroupList')).toBeInTheDocument();
  });
});
