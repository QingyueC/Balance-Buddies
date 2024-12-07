import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { trpc } from '@/trpc/client'
import { useCurrentGroup } from '../current-group-context'

// Mock trpc and current-group-context
jest.mock('@/trpc/client', () => ({
  trpc: {
    groups: {
      balances: {
        list: {
          useQuery: jest.fn(),
        },
      },
    },
    useUtils: jest.fn(() => ({
      groups: {
        balances: { invalidate: jest.fn() },
      },
    })),
  },
}))

jest.mock('../current-group-context', () => ({
  useCurrentGroup: jest.fn(),
}))

jest.mock('@/vars/getVars', () => ({
  getVars: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      'Balances.title': 'Balance Summary',
      'Balances.description':
        'Check out how much everyone paid or still owes—it’s all here!',
      'Balances.Reimbursements.title': 'Time to Settle Up',
      'Balances.Reimbursements.description':
        'Here’s a quick and easy guide to who should pay whom.',
    }
    return translations[key] || key
  }),
}))

describe('GroupPage', () => {
  it('renders BalancesAndReimbursements component', async () => {
    // Import the async component
    const { default: GroupPage } = await import('./page')

    // Mock useCurrentGroup
    ;(useCurrentGroup as jest.Mock).mockReturnValue({
      groupId: 'test-group',
      group: {
        participants: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
        currency: 'USD',
      },
    })

    // Mock trpc query
    ;(trpc.groups.balances.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        balances: [{ id: 'balance-1', amount: 100 }],
        reimbursements: [{ id: 'reimbursement-1', amount: 50 }],
      },
      isLoading: false,
    })

    // Since GroupPage is an async function component, we need to await its result
    const element = await GroupPage()

    render(element)

    // Ensure BalancesAndReimbursements is rendered
    expect(
      screen.getByTestId('balances-and-reimbursements')
    ).toBeInTheDocument()
  })
})
