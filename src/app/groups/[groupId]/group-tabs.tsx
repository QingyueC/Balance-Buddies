'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getVars } from '@/vars/getVars'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  groupId: string
}

export function GrpTab({ groupId }: Props) {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`.${key}`, params);
  const path = usePathname()
  const val =
    path.replace(/\/groups\/[^\/]+\/([^/]+).*/, '$1') || 'expenses'
  const r = useRouter()

  return (
    <Tabs
      value={val}
      className="[&>*]:border overflow-x-auto"
      onValueChange={(value) => {
        r.push(`/groups/${groupId}/${value}`)
      }}
    >
      <TabsList>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="balances">Balances</TabsTrigger>
        <TabsTrigger value="edit">Bill Group</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
