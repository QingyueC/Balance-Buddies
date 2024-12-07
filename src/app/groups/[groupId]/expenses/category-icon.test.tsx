import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryIcon } from './category-icon';
import { Banknote, FerrisWheel, Dices, Home } from 'lucide-react';

// Mock `lucide-react` icons to test rendering
jest.mock('lucide-react', () => ({
  Banknote: jest.fn(() => <span data-testid="icon-banknote" />),
  FerrisWheel: jest.fn(() => <span data-testid="icon-ferris-wheel" />),
  Dices: jest.fn(() => <span data-testid="icon-dices" />),
  Home: jest.fn(() => <span data-testid="icon-home" />),
}));

describe('CategoryIcon Component', () => {
  it('renders the correct icon for "Uncategorized/General"', () => {
    render(
      <CategoryIcon
        category={{ grouping: 'Uncategorized', name: 'General' } as any}
      />
    );
    expect(Banknote).toHaveBeenCalled();
  });

  it('renders the correct icon for "Entertainment/Entertainment"', () => {
    render(
      <CategoryIcon
        category={{ grouping: 'Entertainment', name: 'Entertainment' } as any}
      />
    );
    expect(FerrisWheel).toHaveBeenCalled();
  });

  it('renders the correct icon for "Entertainment/Games"', () => {
    render(
      <CategoryIcon
        category={{ grouping: 'Entertainment', name: 'Games' } as any}
      />
    );
    expect(Dices).toHaveBeenCalled();
  });

  it('renders the default icon when category is not recognized', () => {
    render(
      <CategoryIcon
        category={{ grouping: 'Unknown', name: 'Category' } as any}
      />
    );
    expect(Banknote).toHaveBeenCalled();
  });

  it('renders the default icon when category is null', () => {
    render(<CategoryIcon category={null} />);
    expect(Banknote).toHaveBeenCalled();
  });

  it('renders the correct icon for "Home/Home"', () => {
    render(
      <CategoryIcon
        category={{ grouping: 'Home', name: 'Home' } as any}
      />
    );
    expect(Home).toHaveBeenCalled();
  });
});
