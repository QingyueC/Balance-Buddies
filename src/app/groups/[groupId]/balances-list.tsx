import { Balances } from '@/lib/balances'
import { cn, formatCurrency } from '@/lib/utils'
import { Participant } from '@prisma/client'

type Props = {
  balances: Balances
  participants: Participant[]
  currency: string
}

export function BalancesList({ balances, participants, currency }: Props) {

  // Sort participants alphabetically by name
  const sortedParticipants = [...participants].sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="p-2 text-left">Participant</th>
          <th className="p-2 text-right">Balance</th>
        </tr>
      </thead>
      <tbody>
        {sortedParticipants.map((participant) => {
          const balance = balances[participant.id]?.total ?? 0
          const balanceClass = balance > 0 
            ? 'text-green-500 font-bold'  // Highlight positive balances in green
            : balance < 0 
            ? 'text-red-500 font-bold'   // Highlight negative balances in red
            : 'text-gray-700';           // Default for zero balance

          return (
            <tr key={participant.id}>
              <td className="p-2">{participant.name}</td>
              <td className={`p-2 text-right ${balanceClass}`}>
                {formatCurrency(currency, balance)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
