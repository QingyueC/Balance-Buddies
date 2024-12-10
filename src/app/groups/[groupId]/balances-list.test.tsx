import React from 'react'
import { render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ListBal } from './balances-list'

jest.mock('@/lib/utils', () => ({
  formatCurrency: (currency: string, amount: number) =>
    `${currency}${amount.toFixed(2)}`,
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}))

describe('ListBal', () => {
  it('renders the balances for participants correctly', () => {
    const participants = [
      { id: '1', name: 'Charlie', groupId: 'g1' },
      { id: '2', name: 'Alice', groupId: 'g1' },
      { id: '3', name: 'Bob', groupId: 'g1' },
    ]

    const balances: Record<string, { paid: number; paidFor: number; total: number }> = {
      '1': { paid: 100, paidFor: 0, total: 100 },
      '2': { paid: 50, paidFor: 100, total: -50 },
      '3': { paid: 0, paidFor: 0, total: 0 },
    }

    const currency = '$'

    render(
      <ListBal
        balances={balances}
        participants={participants}
        currency={currency}
      />
    )

    const table = screen.getByRole('table')

    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(participants.length + 1)

    const headerRow = rows[0]
    expect(within(headerRow).getByText('Participant')).toBeInTheDocument()
    expect(within(headerRow).getByText('Balance')).toBeInTheDocument()

    const expectedOrder = ['Alice', 'Bob', 'Charlie']
    const dataRows = rows.slice(1)

    dataRows.forEach((row, index) => {
      const cells = within(row).getAllByRole('cell')
      expect(cells).toHaveLength(2)

      const nameCell = cells[0]
      const balanceCell = cells[1]

      expect(nameCell).toHaveTextContent(expectedOrder[index])

      const participantId = participants.find(
        (p) => p.name === expectedOrder[index]
      )!.id
      const balance = balances[participantId].total
      const formattedBalance = `${currency}${balance.toFixed(2)}`

      expect(balanceCell).toHaveTextContent(formattedBalance)

      if (balance > 0) {
        expect(balanceCell).toHaveClass('text-green-500', 'font-bold')
      } else if (balance < 0) {
        expect(balanceCell).toHaveClass('text-red-500', 'font-bold')
      } else {
        expect(balanceCell).toHaveClass('text-gray-700')
      }
    })
  })
})
