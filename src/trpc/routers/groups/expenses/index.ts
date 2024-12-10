import { createTRPCRouter } from '@/trpc/init'
import { createExpG } from '@/trpc/routers/groups/expenses/create.procedure'
import { DeleteExpG } from '@/trpc/routers/groups/expenses/delete.procedure'
import { GetExpG } from '@/trpc/routers/groups/expenses/get.procedure'
import { ListExpG } from '@/trpc/routers/groups/expenses/list.procedure'
import { UpdateExpG } from '@/trpc/routers/groups/expenses/update.procedure'

export const grpExpRouter = createTRPCRouter({
  list: ListExpG,
  get: GetExpG,
  create: createExpG,
  update: UpdateExpG,
  delete: DeleteExpG,
})
