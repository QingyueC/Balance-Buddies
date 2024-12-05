import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFound from '@/app/groups/not-found';
import { getVars } from '@/vars/getVars';

jest.mock('@/vars/getVars', () => ({
  getVars: jest.fn((key: string) => key),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('NotFound', () => {
  it('renders the "not found" text', () => {
    render(<NotFound />);
    expect(screen.getByText('Groups.NotFound.text')).toBeInTheDocument();
  });

  it('renders the "return to groups" link', () => {
    render(<NotFound />);

    const link = screen.getByText('Groups.NotFound.link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/groups');
  });
});
