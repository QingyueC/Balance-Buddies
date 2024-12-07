import { render } from '@testing-library/react';
import { ProgressBar } from './progress-bar';

// Mock Next13ProgressBar
jest.mock('next13-progressbar', () => ({
  Next13ProgressBar: jest.fn(() => <div data-testid="next13-progressbar" />),
}));

describe('ProgressBar Component', () => {
  it('renders the Next13ProgressBar with the correct props', () => {
    const { getByTestId } = render(<ProgressBar />);

    // Check if the mocked Next13ProgressBar component is rendered
    const progressBar = getByTestId('next13-progressbar');
    expect(progressBar).toBeInTheDocument();

    // Assert that the props are passed correctly
    const Next13ProgressBarMock = jest.requireMock('next13-progressbar').Next13ProgressBar;
    expect(Next13ProgressBarMock).toHaveBeenCalledWith(
      expect.objectContaining({
        height: '2px',
        color: '#64748b',
        options: { showSpinner: false },
        showOnShallow: true,
      }),
      expect.any(Object)
    );
  });
});
