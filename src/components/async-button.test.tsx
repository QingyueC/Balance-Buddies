import React from 'react'
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AsyncButton } from './async-button'
import '@testing-library/jest-dom'

describe('AsyncButton', () => {
  test('renders correctly with the provided children', () => {
    render(<AsyncButton>Click Me</AsyncButton>)
    expect(
      screen.getByRole('button', { name: /click me/i })
    ).toBeInTheDocument()
  })

  test('calls the action when clicked', async () => {
    const user = userEvent.setup()
    const actionMock = jest.fn().mockResolvedValue(undefined)
    render(<AsyncButton action={actionMock}>Click Me</AsyncButton>)

    await user.click(screen.getByRole('button', { name: /click me/i }))

    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  test('shows loading indicator while action is in progress', async () => {
    const user = userEvent.setup()
    let resolveAction!: () => void
    const actionMock = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve
        })
    )

    render(<AsyncButton action={actionMock}>Click Me</AsyncButton>)

    await user.click(screen.getByRole('button', { name: /click me/i }))

    // Expect the button to be disabled
    expect(screen.getByRole('button')).toBeDisabled()

    // Expect the loading indicator to be present
    expect(
      screen.getByRole('img', { name: /loading/i })
    ).toBeInTheDocument()

    // Finish the action
    resolveAction()

    // Wait for the loading indicator to be removed
    await waitFor(() => {
      expect(
        screen.queryByRole('img', { name: /loading/i })
      ).not.toBeInTheDocument()
    })

    // Ensure the button is enabled again
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  test('displays loading content when provided', async () => {
    const user = userEvent.setup()
    let resolveAction!: () => void
    const actionMock = jest.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve
        })
    )

    render(
      <AsyncButton action={actionMock} loadingContent="Loading...">
        Click Me
      </AsyncButton>
    )

    await user.click(screen.getByRole('button', { name: /click me/i }))

    // Expect loading content to be displayed
    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument()

    // Finish the action
    resolveAction()

    await waitFor(() => {
      expect(
        screen.queryByText(/loading\.\.\./i)
      ).not.toBeInTheDocument()
    })
  })

  test('handles errors from the action function', async () => {
    const user = userEvent.setup()
    const consoleErrorMock = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    const actionMock = jest.fn().mockRejectedValue(new Error('Action failed'))

    render(<AsyncButton action={actionMock}>Click Me</AsyncButton>)

    await user.click(screen.getByRole('button', { name: /click me/i }))

    // Wait for the action to complete
    await waitFor(() => {
      expect(actionMock).toHaveBeenCalledTimes(1)
    })

    // Ensure loading state is reset
    expect(
      screen.queryByRole('img', { name: /loading/i })
    ).not.toBeInTheDocument()

    // Ensure error is logged
    expect(consoleErrorMock).toHaveBeenCalledWith(new Error('Action failed'))

    consoleErrorMock.mockRestore()
  })

  test('does not throw error when action is not provided', async () => {
    const user = userEvent.setup()
    render(<AsyncButton>Click Me</AsyncButton>)

    await user.click(screen.getByRole('button', { name: /click me/i }))

    // Since no action is provided, nothing should happen
    expect(screen.getByRole('button')).not.toBeDisabled()
  })
})
