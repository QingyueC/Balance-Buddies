import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ShareUrlButton } from '@/components/share-url-button';

describe('ShareUrlButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockNavigator = {
    share: jest.fn(),
    canShare: jest.fn(),
  };

  beforeAll(() => {
    Object.defineProperty(global, 'navigator', {
      value: mockNavigator,
      writable: true,
    });
  });

  it('renders the button when sharing is available', () => {
    mockNavigator.share = jest.fn();
    mockNavigator.canShare = jest.fn(() => true);

    render(<ShareUrlButton url="https://example.com" text="Share this content" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    const svg = button.querySelector('svg');
    expect(svg).toHaveClass('w-4 h-4');

  });
  it('does not render the button when sharing is unavailable', () => {
    mockNavigator.share = jest.fn();
    mockNavigator.canShare = jest.fn(() => false);

    render(<ShareUrlButton url="https://example.com" text="Share this content" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls navigator.share when the button is clicked', () => {
    mockNavigator.share = jest.fn();
    mockNavigator.canShare = jest.fn(() => true);

    render(<ShareUrlButton url="https://example.com" text="Share this content" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockNavigator.share).toHaveBeenCalledWith({
      text: 'Share this content',
      url: 'https://example.com',
    });
  });

});
