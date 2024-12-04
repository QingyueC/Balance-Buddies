'use client';
import { ActiveUserBalance } from '@/app/groups/[groupId]/expenses/active-user-balance';
import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon';
import { getGroupExpenses } from '@/lib/api';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { getVars } from '@/vars/getVars';
import { Calendar } from 'lucide-react'; // Importing the Calendar icon
import { useRouter } from 'next/navigation';
import React from 'react';
import { Fragment } from 'react';

type Expense = Awaited<ReturnType<typeof getGroupExpenses>>[number];




function Participants({ expense }: { expense: Expense }) {
  const t = (key: string) => getVars(`ExpenseCard.${key}`);

  const key = expense.amount > 0 ? 'paidBy' : 'receivedBy';
  const paidForFiltered = expense.paidFor.filter(
    (participant) => participant.participant.name !== expense.paidBy.name
  );
  const paidForJSX = paidForFiltered.map((participant, index) => (
    <React.Fragment key={index}>
      {index > 0 && ', '}
      <strong>{participant.participant.name}</strong>
    </React.Fragment>
  ));

  const rawTranslation = t(key);

  const participants = rawTranslation.split(/(<[^>]+>|{[^}]+})/g).map((chunk, index) => {
    if (chunk.startsWith('{') && chunk.endsWith('}')) {
      const placeholder = chunk.slice(1, -1); 
      if (placeholder === 'paidBy') {
        return <strong key={index}>{expense.paidBy.name}</strong>;
      } else if (placeholder === 'paidFor') {
        return <React.Fragment key={index}>{paidForJSX}</React.Fragment>;
      }
    } else if (chunk === '<strong>') {
      return <strong key={index} />;
    } else if (chunk === '</strong>') {
      return null; 
    } else if (chunk === '<paidFor>') {
      return <React.Fragment key={index}>{paidForJSX}</React.Fragment>;
    } else if (chunk === '</paidFor>') {
      return null; 
    }

    return <React.Fragment key={index}>{chunk}</React.Fragment>;
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
          {formatCurrency(currency, expense.amount)}
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {formatDate(expense.expenseDate, { dateStyle: 'medium' })}
          </span>
        </div>
      </div>
    </div>
  );
}
