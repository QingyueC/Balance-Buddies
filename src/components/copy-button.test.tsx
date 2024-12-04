import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CopyButton } from './copy-button'

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
})

describe('CopyButton', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders correctly with the Copy icon initially', () => {
    render(<CopyButton text="test-text" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /copy/i })).toBeInTheDocument()
  })  

  test('copies text to the clipboard when clicked', () => {
    render(<CopyButton text="test-text" />)
    const button = screen.getByRole('button')

    fireEvent.click(button)

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-text')
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1)
  })

  test('shows the "Check" icon after copying text', async () => {
    render(<CopyButton text="test-text" />)
    const button = screen.getByRole('button')

    // Click to copy text
    fireEvent.click(button)

    // Wait for the icon to change to the "Check" icon
    await waitFor(() => {
      expect(screen.getByLabelText(/check/i)).toBeInTheDocument() // Updated query
    })

    // Wait for the "Check" icon to disappear after 1 second
    await waitFor(
      () => {
        expect(screen.getByLabelText(/copy/i)).toBeInTheDocument() // Updated query
      },
      { timeout: 1100 }
    )
  })
})
