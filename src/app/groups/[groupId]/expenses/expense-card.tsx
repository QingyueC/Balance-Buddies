'use client';
import { ActiveUserBalance } from '@/app/groups/[groupId]/expenses/active-user-balance';
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon';
import { getGroupExpenses } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Calendar } from 'lucide-react'; // Importing the Calendar icon
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

type Expense = Awaited<ReturnType<typeof getGroupExpenses>>[number];

function Participants({ expense }: { expense: Expense }) {
  const t = useTranslations('ExpenseCard');
  const key = expense.amount > 0 ? 'paidBy' : 'receivedBy';
  const paidFor = expense.paidFor.map((paidFor, index) => (
    <Fragment key={index}>
      {index !== 0 && <>, </>}
      <strong>{paidFor.participant.name}</strong>
    </Fragment>
  ));
  const participants = t.rich(key, {
    strong: (chunks) => <strong>{chunks}</strong>,
    paidBy: expense.paidBy.name,
    paidFor: () => paidFor,
    forCount: expense.paidFor.length,
  });
  return <>{participants}</>;
}

type Props = {
  expense: Expense;
  currency: string;
  groupId: string;
};

export function ExpenseCard({ expense, currency, groupId }: Props) {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div
      key={expense.id}
      className={cn(
        'grid grid-cols-[auto,1fr,auto] items-center gap-4 p-4 border rounded-lg hover:bg-accent cursor-pointer max-w-xl mx-auto',
        expense.isReimbursement && 'italic',
      )}
      onClick={() => {
        router.push(`/groups/${groupId}/expenses/${expense.id}/edit`);
      }}
    >
      {/* Left Section - Icon */}
      <div className="flex items-center">
        <CategoryIcon
          category={expense.category}
          className="w-6 h-6 text-muted-foreground"
        />
      </div>

      {/* Middle Section - Title, Participants, and Balance */}
      <div className="flex flex-col text-sm">
        <div className={cn('font-medium', expense.isReimbursement && 'italic')}>
          {expense.title}
        </div>
        <div className="text-muted-foreground mb-1">
          <Participants expense={expense} />
        </div>
        <div className="text-xs text-muted-foreground">
          <ActiveUserBalance {...{ groupId, currency, expense }} />
        </div>
      </div>

      {/* Right Section - Amount and Date with Calendar Icon */}
      <div className="flex flex-col items-end text-right">
        <div
          className={cn(
            'text-lg font-bold tabular-nums',
            expense.isReimbursement && 'italic',
          )}
        >
          {formatCurrency(currency, expense.amount, locale)}
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatDate(expense.expenseDate, locale, { dateStyle: 'medium' })}
          </span>
        </div>
      </div>
    </div>
  );
}
