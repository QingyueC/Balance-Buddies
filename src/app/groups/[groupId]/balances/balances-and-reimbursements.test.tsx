import { render, screen, waitFor } from '@testing-library/react'
import BalancesAndReimbursements from './balances-and-reimbursements'
import { useCurrentGroup } from '../current-group-context'
import { trpc } from '@/trpc/client'

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

jest.mock('../current-group-context', () => ({
  useCurrentGroup: jest.fn(),
}))

describe('BalancesAndReimbursements', () => {
  beforeEach(() => {
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
  })

  it('renders loading state correctly', () => {
    ;(trpc.groups.balances.list.useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    })

    render(<BalancesAndReimbursements />)

    const participantCount = 2 // As per the mocked group
    const balancesSkeletons = participantCount * 2 // 2 skeletons per participant
    const reimbursementsSkeletons = (participantCount - 1) * 3 // 3 skeletons per reimbursement
    const expectedSkeletons = balancesSkeletons + reimbursementsSkeletons // Total skeletons

    // Check for skeleton loading elements
    expect(screen.getAllByRole('status')).toHaveLength(expectedSkeletons)
  })

  it('renders balances and reimbursements correctly', async () => {
    ;(trpc.groups.balances.list.useQuery as jest.Mock).mockReturnValue({
      data: {
        balances: [{ id: 'balance-1', amount: 100 }],
        reimbursements: [{ id: 'reimbursement-1', amount: 50 }],
      },
      isLoading: false,
    })

    render(<BalancesAndReimbursements />)

    // Check for rendered text
    await waitFor(() =>
      expect(screen.getByText('Balance Summary')).toBeInTheDocument()
    )
    expect(screen.getByText('Time to Settle Up')).toBeInTheDocument()
  })
})
