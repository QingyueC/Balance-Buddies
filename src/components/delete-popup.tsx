import { Trash2 } from 'lucide-react'
import { AsyncButton } from './async-button'
import { Button } from './ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { getVars } from '@/vars/getVars'

export function DeletePopup({ onDelete }: { onDelete: () => Promise<void> }) {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`ExpenseForm.DeletePopup.${key}`, params);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Are you sure you want to delete this expense?</DialogTitle>
        <DialogDescription>Confirm if you’d like to proceed with deleting this expense. Please note that this action cannot be undone.</DialogDescription>
        <DialogFooter className="flex flex-col gap-2">
          <AsyncButton
            type="button"
            variant="destructive"
            loadingContent="Deleting…"
            action={onDelete}
          >
            Yes
          </AsyncButton>
          <DialogClose asChild>
            <Button variant={'secondary'}>Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
