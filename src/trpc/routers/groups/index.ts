import { createTRPCRouter } from '@/trpc/init'
import { activitiesRouter } from '@/trpc/routers/groups/activities'
import { groupBalancesRouter } from '@/trpc/routers/groups/balances'
import { createGrp } from '@/trpc/routers/groups/create.procedure'
import { grpExpRouter } from '@/trpc/routers/groups/expenses'
import { getGrp } from '@/trpc/routers/groups/get.procedure'
import { groupStatsRouter } from '@/trpc/routers/groups/stats'
import { updateGrp } from '@/trpc/routers/groups/update.procedure'
import { getGrpDeets } from './getDetails.procedure'
import { listGrp } from './list.procedure'

export const groupsRouter = createTRPCRouter({
  expenses: grpExpRouter,
  balances: groupBalancesRouter,
  stats: groupStatsRouter,
  activities: activitiesRouter,

  get: getGrp,
  getDetails: getGrpDeets,
  list: listGrp,
  create: createGrp,
  update: updateGrp,
})
