import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Introduction from '@/app/home/Introduction';
import Video from '@/app/home/Video';

jest.mock('@/app/home/Video', () => jest.fn(() => <div>Mocked Video Component</div>));
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Introduction Component', () => {
  it('renders the component and displays the heading', () => {
    render(<Introduction />);
    expect(screen.getByText(/About/i)).toBeInTheDocument();

    // Use getAllByText to find all elements with "Balance Buddies"
    const balanceBuddiesElements = screen.getAllByText(/Balance Buddies/i);

    // Check that the first element is the one in the heading
    expect(balanceBuddiesElements[0]).toBeInTheDocument();
    expect(balanceBuddiesElements[0].tagName).toBe('SPAN'); // Ensure it's the span in the heading
  });

  it('renders the "What we do?" section with description', () => {
    render(<Introduction />);
    expect(screen.getByText('What we do?')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Balance Buddies aims to address the common challenge that flatmates and roommates face when splitting shared expenses/i
      )
    ).toBeInTheDocument();
  });

  it('renders the "More..." link with the correct href', () => {
    render(<Introduction />);
    
    const link = screen.getByRole('link', { name: 'More...' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://docs.google.com/document/d/1BK4ptFwLC1zUDNRLu9eMYdZNUJ9PVIEKqmIu2hejXIs/edit?tab=t.0'
    );
  });

  it('renders the "How to Implement the Bill Split?" section and the Video component', () => {
    render(<Introduction />);
    expect(screen.getByText('How to Implement the Bill Split?')).toBeInTheDocument();
    expect(screen.getByText('Mocked Video Component')).toBeInTheDocument();
  });
});
