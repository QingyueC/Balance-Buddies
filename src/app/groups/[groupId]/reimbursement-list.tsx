import { Button } from '@/components/ui/button'
import { Reimbursement } from '@/lib/balances'
import { formatCurrency } from '@/lib/utils'
import { Participant } from '@prisma/client'
import { useLocale} from 'next-intl'
import Link from 'next/link'
import { getVars } from '@/vars/getVars'


type Props = {
  reimbursements: Reimbursement[]
  participants: Participant[]
  currency: string
  groupId: string
}

export function ReimbursementList({
  reimbursements,
  participants,
  currency,
  groupId,
}: Props) {
  const locale = useLocale()
  const t = (key: string, params?: Record<string, string | number>) =>
    getVars(`Balances.Reimbursements.${key}`, params)

  if (reimbursements.length === 0) {
    return <p className="text-sm pb-6">{t('noImbursements')}</p>
  }

  // Create a mapping from participant IDs to participant data for easy lookup
  const participantsById = participants.reduce((acc, participant) => {
    acc[participant.id] = participant
    return acc
  }, {} as Record<string, Participant>)

  // Group reimbursements by debtor (the person who owes money)
  const reimbursementsByDebtor = reimbursements.reduce((acc, reimbursement) => {
    const debtorId = reimbursement.from
    if (!acc[debtorId]) {
      acc[debtorId] = []
    }
    acc[debtorId].push(reimbursement)
    return acc
  }, {} as Record<string, Reimbursement[]>)

  // Create an array of debtors with their reimbursements
  const debtors = Object.keys(reimbursementsByDebtor).map((debtorId) => ({
    id: debtorId,
    name: participantsById[debtorId]?.name || '',
    reimbursements: reimbursementsByDebtor[debtorId],
  }))

  // Sort debtors alphabetically by name
  debtors.sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="text-sm">
      {debtors.map((debtor) => {
        // Sort reimbursements (creditors) alphabetically by name
        debtor.reimbursements.sort((a, b) => {
          const nameA = participantsById[a.to]?.name || ''
          const nameB = participantsById[b.to]?.name || ''
          return nameA.localeCompare(nameB)
        })

        return (
          <div key={debtor.id} className="mb-6 border p-4 rounded">
            <div className="font-bold mb-2">{debtor.name}</div>
            {debtor.reimbursements.map((reimbursement) => {
              const creditorName = participantsById[reimbursement.to]?.name || ''
              return (
                <div
                  className="py-2 flex justify-between items-center"
                  key={`${reimbursement.from}-${reimbursement.to}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span>
                      owes <strong>{creditorName}</strong>
                    </span>
                    <Button variant="link" asChild className="-mx-4 -my-3">
                      <Link
                        href={`/groups/${groupId}/expenses/create?reimbursement=yes&from=${reimbursement.from}&to=${reimbursement.to}&amount=${reimbursement.amount}`}
                      >
                        {t('markAsPaid')}
                      </Link>
                    </Button>
                  </div>
                  <div>
                    {formatCurrency(currency, reimbursement.amount, locale)}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
