import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GroupForm, Props } from './group-form'
import { GroupFormValues } from '@/lib/schemas'

// Mock getVars
jest.mock('../vars/getVars', () => ({
  getVars: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'GroupForm.title': 'Group information',
      'GroupForm.NameField.label': 'Group name',
      'GroupForm.NameField.placeholder': 'Summer vacations',
      'GroupForm.NameField.description': 'Enter a name for your group.',
      'GroupForm.InformationField.label': 'Group information',
      'GroupForm.InformationField.placeholder':
        'What information is relevant to group participants?',
      'GroupForm.Participants.title': 'Participants',
      'GroupForm.Participants.description':
        'Enter the name for each participant.',
      'GroupForm.Participants.new': 'New',
      'GroupForm.Participants.add': 'Add participant',
      'GroupForm.Settings.create': 'Create group',
      'GroupForm.Settings.creating': 'Creating...',
      'GroupForm.Participants.John': 'John',
      'GroupForm.Participants.Jane': 'Jane',
      'GroupForm.Participants.Jack': 'Jack',
      // Add other necessary translations here
    }
    return translations[key] || key
  }),
}))

describe('GroupForm', () => {
  const mockOnSubmit = jest.fn()

  const defaultProps: Props = {
    onSubmit: mockOnSubmit,
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders the form with default values', () => {
    render(<GroupForm {...defaultProps} />)

    // Use getByRole with level and name to disambiguate headings
    expect(
      screen.getByRole('heading', { level: 3, name: 'Group information' })
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Group name')).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { level: 3, name: 'Participants' })
    ).toBeInTheDocument()
  })

  test('allows the user to fill out and submit the form', async () => {
    render(<GroupForm {...defaultProps} />)

    fireEvent.change(screen.getByLabelText('Group name'), {
      target: { value: 'Test Group' },
    })

    // Specify that we're targeting the textarea
    fireEvent.change(
      screen.getByLabelText('Group information', { selector: 'textarea' }),
      {
        target: { value: 'This is a test group.' },
      }
    )

    fireEvent.click(screen.getByText('Create group'))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })

    const expectedValues: GroupFormValues = {
      name: 'Test Group',
      information: 'This is a test group.',
      currency: '$',
      participants: [{ name: 'John' }, { name: 'Jane' }, { name: 'Jack' }],
    }

    expect(mockOnSubmit).toHaveBeenCalledWith(expectedValues, undefined)
  })

  test('allows the user to add and remove participants', () => {
    render(<GroupForm {...defaultProps} />)

    fireEvent.click(screen.getByText('Add participant'))

    const participantInputs = screen.getAllByPlaceholderText('New')
    expect(participantInputs.length).toBe(4)

    fireEvent.change(participantInputs[3], {
      target: { value: 'New Participant' },
    })

    // Use getAllByLabelText since the buttons have aria-label="trash"
    const deleteButtons = screen.getAllByLabelText('trash')
    fireEvent.click(deleteButtons[3])

    expect(screen.getAllByPlaceholderText('New').length).toBe(3)
  })
})
