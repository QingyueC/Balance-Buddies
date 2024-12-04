import { Button } from '@/components/ui/button'
import { getVars } from '@/vars/getVars';
import Link from 'next/link'

export default function NotFound() {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`Groups.NotFound.${key}`, params);
  return (
    <div className="flex flex-col gap-2">
      <p>{t('text')}</p>
      <p>
        <Button asChild variant="secondary">
          <Link href="/groups">{t('link')}</Link>
        </Button>
      </p>
    </div>
  )
}
