'use client'

import { ActiveUserModal } from '@/app/groups/[groupId]/expenses/active-user-modal';
import { ImportFromImage} from '@/app/groups/[groupId]/expenses/import-from-image-button';
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
import Link from 'next/link';
import { useCurrentGroup } from '../current-group-context';
import { getVars } from '@/vars/getVars';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Expenses',
};

export default function ExpGrpPC({
                                                  enableReceiptExtract,
                                                }: {
  enableReceiptExtract: boolean;
}) {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`Expenses.${key}`, params);
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

              { <ImportFromImage />}
              {}
              <Button
                  variant="default" 
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
