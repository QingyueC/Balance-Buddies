'use client'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getVars } from '@/vars/getVars'
import { usePathname, useRouter } from 'next/navigation'

type Props = {
  groupId: string
}

export function GroupTabs({ groupId }: Props) {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`.${key}`, params);
  const pathname = usePathname()
  const value =
    pathname.replace(/\/groups\/[^\/]+\/([^/]+).*/, '$1') || 'expenses'
  const router = useRouter()

  return (
    <Tabs
      value={value}
      className="[&>*]:border overflow-x-auto"
      onValueChange={(value) => {
        router.push(`/groups/${groupId}/${value}`)
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
