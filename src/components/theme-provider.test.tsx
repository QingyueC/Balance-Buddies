import { render } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

// Mock NextThemesProvider
jest.mock('next-themes', () => ({
  ThemeProvider: jest.fn(({ children }) => <div data-testid="next-themes-provider">{children}</div>),
}));

describe('ThemeProvider Component', () => {
  it('renders the NextThemesProvider with the correct children and props', () => {
    const mockProps = { attribute: 'class', defaultTheme: 'dark' };
    const { getByTestId, getByText } = render(
      <ThemeProvider {...mockProps}>
        <div>Test Child</div>
      </ThemeProvider>
    );

    // Check if the mocked NextThemesProvider component is rendered
    const provider = getByTestId('next-themes-provider');
    expect(provider).toBeInTheDocument();

    // Check if the children are passed correctly
    expect(getByText('Test Child')).toBeInTheDocument();

    // Assert that props are passed correctly
    const NextThemesProviderMock = jest.requireMock('next-themes').ThemeProvider;
    expect(NextThemesProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: 'class',
        defaultTheme: 'dark',
      }),
      expect.any(Object)
    );
  });
});
