import {
  RecentGroup,
  archiveGroup,
  deleteRecentGroup,
  starGroup,
  unarchiveGroup,
  unstarGroup,
} from '@/app/groups/recent-groups-helpers'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { getVars } from '@/vars/getVars'
import { StarFilledIcon} from '@radix-ui/react-icons'
import { Calendar, Star, Users, MoreHorizontal, Trash, Archive, } from 'lucide-react'
import { useLocale} from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function RecentGroupListCard({
  group,
  groupDetail,
  isStarred,
  isArchived,
  refreshGroupsFromStorage,
}: {
  group: RecentGroup
  groupDetail?: AppRouterOutput['groups']['list']['groups'][number]
  isStarred: boolean
  isArchived: boolean
  refreshGroupsFromStorage: () => void
}) {
  const router = useRouter()
  const locale = useLocale()
  const toast = useToast()
  const t = (key: string, params?: Record<string, string | number>) => getVars(`Groups.${key}`, params);

  return (
    <li
      key={group.id}
      className="rounded-lg border bg-card shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div
        className="p-4 hover:bg-muted transition-colors cursor-pointer"
        onClick={() => router.push(`/groups/${group.id}`)}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 flex-1">
            <Link
              href={`/groups/${group.id}`}
              className="text-base font-medium truncate hover:underline flex-1"
            >
              {group.name}
            </Link>
            {groupDetail && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-primary bg-primary/20 px-2 py-0.5 rounded-full">
                  {groupDetail._count.participants} Members
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* Star Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation()
                if (isStarred) {
                  unstarGroup(group.id)
                } else {
                  starGroup(group.id)
                  unarchiveGroup(group.id)
                }
                refreshGroupsFromStorage()
              }}
            >
              {isStarred ? (
                <StarFilledIcon className="w-4 h-4 text-primary" />
              ) : (
                <Star className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>

            {/* Archive/Unarchive Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation()
                if (isArchived) {
                  unarchiveGroup(group.id)
                } else {
                  archiveGroup(group.id)
                  unstarGroup(group.id)
                }
                refreshGroupsFromStorage()
              }}
            >
              <Archive
                className={`w-4 h-4 ${
                  isArchived ? 'text-orange' : 'text-muted-foreground'
                }`}
              />
            </Button>

            {/* Delete Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation()
                deleteRecentGroup(group)
                refreshGroupsFromStorage()

                toast.toast({
                  title: t('RecentRemovedToast.title'),
                  description: t('RecentRemovedToast.description'),
                })
              }}
            >
              <Trash className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Group Details */}
        <div className="mt-3 text-muted-foreground text-sm">
          {groupDetail ? (
            <div className="flex justify-between">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(groupDetail.createdAt).toLocaleDateString(locale, {
                    dateStyle: 'medium',
                  })}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <Skeleton className="h-4 w-6 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
