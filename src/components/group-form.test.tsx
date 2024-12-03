import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GroupForm, Props } from './group-form';
import { useTranslations } from 'next-intl';
import { GroupFormValues } from '@/lib/schemas';

jest.mock('next-intl', () => ({
  useTranslations: jest.fn().mockReturnValue((key: string) => key),
  useMessages: jest.fn().mockReturnValue({}),
}));

describe('GroupForm', () => {
  const mockOnSubmit = jest.fn();

  const defaultProps: Props = {
    onSubmit: mockOnSubmit,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the form with default values', () => {
    render(<GroupForm {...defaultProps} />);

    expect(screen.getByText('title')).toBeInTheDocument();

    expect(screen.getByLabelText('NameField.label')).toBeInTheDocument();

    expect(screen.getByText('Participants.title')).toBeInTheDocument();
  });

  test('allows the user to fill out and submit the form', async () => {
    render(<GroupForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('NameField.label'), {
      target: { value: 'Test Group' },
    });

    fireEvent.change(screen.getByLabelText('InformationField.label'), {
      target: { value: 'This is a test group.' },
    });

    fireEvent.click(screen.getByText('Settings.create'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    const expectedValues: GroupFormValues = {
      name: 'Test Group',
      information: 'This is a test group.',
      currency: '$',
      participants: [
        { name: 'Participants.John' },
        { name: 'Participants.Jane' },
        { name: 'Participants.Jack' },
      ],
    };

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedValues, undefined);
  });

  test('allows the user to add and remove participants', () => {
    render(<GroupForm {...defaultProps} />);

    fireEvent.click(screen.getByText('Participants.add'));

    const participantInputs = screen.getAllByPlaceholderText('Participants.new');
    expect(participantInputs.length).toBe(4);

    fireEvent.change(participantInputs[3], {
      target: { value: 'New Participant' },
    });

    const deleteButtons = screen.getAllByRole('button', { name: /trash/i });
    fireEvent.click(deleteButtons[3]);

    expect(screen.getAllByPlaceholderText('Participants.new').length).toBe(3);
  });
});
