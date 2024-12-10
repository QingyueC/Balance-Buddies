import { AppRouterOutput } from '@/trpc/routers/_app'
import { PropsWithChildren, createContext, useContext } from 'react'

type Group = NonNullable<AppRouterOutput['groups']['get']['group']>

type GroupContext =
  | { isLoading: false; groupId: string; group: Group }
  | { isLoading: true; groupId: string; group: undefined }

const ActiveGrpContext = createContext<GroupContext | null>(null)

export const useCurrentGroup = () => {
  const context = useContext(ActiveGrpContext)
  if (!context)
    throw new Error(
      'Context is missing. Ensure this hook is used within an ActiveGroupProvider',
    )
  return context
}

export const CurrentGroupProvider = ({
  children,
  ...props
}: PropsWithChildren<GroupContext>) => {
  return (
    <ActiveGrpContext.Provider value={props}>
      {children}
    </ActiveGrpContext.Provider>
  )
}
