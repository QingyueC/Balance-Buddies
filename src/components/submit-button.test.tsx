import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SubmitButton } from '@/components/submit-button';
import { useFormState } from 'react-hook-form';

jest.mock('react-hook-form', () => ({
  useFormState: jest.fn(),
}));

describe('SubmitButton Component', () => {
  const mockUseFormState = useFormState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the button with children when not submitting', () => {
    mockUseFormState.mockReturnValue({ isSubmitting: false });

    render(
      <SubmitButton loadingContent="Submitting..." className="custom-class">
        Submit
      </SubmitButton>
    );

    const button = screen.getByRole('button', { name: 'Submit' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('custom-class');
  });

  it('renders the loading state when submitting', () => {
    mockUseFormState.mockReturnValue({ isSubmitting: true });

    render(
      <SubmitButton loadingContent="Submitting..." className="custom-class">
        Submit
      </SubmitButton>
    );

    const button = screen.getByRole('button', { name: /submitting/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    const loaderIcon = screen.getByTestId('spinner-icon');
    expect(loaderIcon).toHaveClass('animate-spin');

  });

  it('displays the correct loading content when submitting', () => {
    mockUseFormState.mockReturnValue({ isSubmitting: true });

    render(
      <SubmitButton loadingContent="Please wait..." className="custom-class">
        Submit
      </SubmitButton>
    );

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });
});
