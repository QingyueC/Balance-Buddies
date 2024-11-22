'use client'

import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal';
import { CreateFromReceiptButton } from '@/app/groups/[groupId]/expenses/create-from-receipt-button';
import { ExpenseList } from '@/app/groups/[groupId]/expenses/expense-list';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Download, Plus } from 'lucide-react';
import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useCurrentGroup } from '../current-group-context';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Expenses',
};

export default function GroupExpensesPageClient({
  enableReceiptExtract,
}: {
  enableReceiptExtract: boolean;
}) {
  const t = useTranslations('Expenses');
  const { groupId } = useCurrentGroup();

  return (
    <>
      <Card className="mb-4 rounded-none -mx-4 border-x-0 sm:border-x sm:rounded-lg sm:mx-0">
        <div className="flex flex-1">
          <CardHeader className="flex-1 p-4 sm:p-6">
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardHeader className="p-4 sm:p-6 flex flex-row space-y-0 gap-2">
            {/* Updated Export JSON Button */}
            <Button variant="secondary" className="flex items-center px-4 py-2">
              <Link
                prefetch={false}
                href={`/groups/${groupId}/expenses/export/json`}
                target="_blank"
                title={t('exportJson')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{t('exportJson')}</span>
              </Link>
            </Button>
            {enableReceiptExtract && <CreateFromReceiptButton />}
            {/* Updated Create Button */}
            <Button
              variant="default" // or "secondary" depending on your design system
              className="flex items-center px-4 py-2"
              asChild
            >
              <Link
                href={`/groups/${groupId}/expenses/create`}
                title={t('create')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{t('create')}</span>
              </Link>
            </Button>

          </CardHeader>
        </div>

        <CardContent className="p-0 pt-2 pb-4 sm:pb-6 flex flex-col gap-4 relative">
          <ExpenseList />
        </CardContent>
      </Card>

      <ActiveUserModal groupId={groupId} />
    </>
  );
}
