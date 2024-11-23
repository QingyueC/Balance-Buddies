import BalancesAndReimbursements from './balances-and-reimbursements'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Balances',
}

export default async function GroupPage() {
  return <BalancesAndReimbursements />
}
