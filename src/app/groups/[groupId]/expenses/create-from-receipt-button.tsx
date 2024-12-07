'use client'

import { CategoryIcon } from '@/app/groups/[groupId]/expenses/category-icon'
import {
  ReceiptExtractedInfo,
  extractExpenseInformationFromImage,
} from '@/app/groups/[groupId]/expenses/create-from-receipt-button-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { useMediaQuery } from '@/lib/hooks'
import { formatCurrency, formatDate, formatFileSize } from '@/lib/utils'
import { trpc } from '@/trpc/client'
import { ChevronRight, FileQuestion, Loader2, Plus, Receipt } from 'lucide-react'
import { getImageData, usePresignedUpload } from 'next-s3-upload'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, ReactNode, useState } from 'react'
import { useCurrentGroup } from '../current-group-context'
import { getVars } from '@/vars/getVars'
import {bgWhite} from "next/dist/lib/picocolors";

const MAX_FILE_SIZE = 5 * 1024 ** 2

export function CreateFromReceiptButton() {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`CreateFromReceipt.${key}`, params);
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const DialogOrDrawer = isDesktop
      ? CreateFromReceiptDialog
      : CreateFromReceiptDrawer

  return (
      <div className="bg-white">
        <DialogOrDrawer
            trigger={
              <Button
                  variant="secondary"
                  title={t('Dialog.triggerTitle')}

              >
                <Plus className="w-4 h-4" />
                <span>Import From Image</span>
              </Button>
            }
            title={
              <>
                <span>{t('Dialog.title')}</span>
              </>
            }
            description={<>{t('Dialog.description')}
            </>}
        >
          <ReceiptDialogContent />
        </DialogOrDrawer>
      </div>

  )
}

function ReceiptDialogContent() {
  const { group } = useCurrentGroup()
  const { data: categoriesData } = trpc.categories.list.useQuery()
  const categories = categoriesData?.categories

  const t = (key: string, params?: Record<string, string | number>) => getVars(`CreateFromReceipt.${key}`, params);
  const [pending, setPending] = useState(false)
  const { uploadToS3, FileInput, openFileDialog } = usePresignedUpload()
  const { toast } = useToast()
  const router = useRouter()
  const [receiptInfo, setReceiptInfo] = useState<
      | null
      | (ReceiptExtractedInfo & { url: string; width?: number; height?: number })
  >(null)

  const handleFileChange = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: t('TooBigToast.title'),
        description: t('TooBigToast.description', {
          maxSize: formatFileSize(MAX_FILE_SIZE),
          size: formatFileSize(file.size),
        }),
        variant: 'destructive',
      })
      return
    }

    const upload = async () => {
      try {
        setPending(true)
        console.log('Uploading image…')
        let { url } = await uploadToS3(file)
        console.log('Extracting information from receipt…')
        const { amount, categoryId, date, title } =
            await extractExpenseInformationFromImage(url)
        const { width, height } = await getImageData(file)
        setReceiptInfo({ amount, categoryId, date, title, url, width, height })
      } catch (err) {
        console.error(err)
        toast({
          title: t('ErrorToast.title'),
          description: t('ErrorToast.description'),
          variant: 'destructive',
          action: (
              <ToastAction
                  altText={t('ErrorToast.retry')}
                  onClick={() => upload()}
              >
                {t('ErrorToast.retry')}
              </ToastAction>
          ),
        })
      } finally {
        setPending(false)
      }
    }
    upload()
  }

  return (
      <div className="bg-white prose prose-sm dark:prose-invert">
        {/*<p>{t('Dialog.body')}</p>*/}
        <div>
          <FileInput onChange={handleFileChange} accept="image/jpeg,image/png"/>
          {/*<div className="grid gap-x-4 gap-y-2 grid-cols-3">*/}
          <div className="mt-6 flex flex-col items-center">
            <div className="bg-blue-100 rounded-md w-32 h-32 flex items-center justify-center">
              <Button
                  variant="secondary"
                  className="row-span-3 w-full h-full relative"
                  title="Create expense from receipt"
                  onClick={openFileDialog}
                  disabled={pending}
              >
                {pending ? (
                    <Loader2 className="w-8 h-8 animate-spin"/>
                ) : receiptInfo ? (
                    <div className="absolute top-2 left-2 bottom-2 right-2">
                      <Image
                          src={receiptInfo.url}
                          width={receiptInfo.width}
                          height={receiptInfo.height}
                          className="w-full h-full m-0 object-contain drop-shadow-lg"
                          alt="Scanned receipt"
                      />
                    </div>
                ) : (
                    <span className="text-xs sm:text-sm text-muted-foreground">
                {t('Dialog.selectImage')}
              </span>
                )}
              </Button>

            </div>
            <p className="mt-2 text-sm text-gray-500">Please upload your receipt image here</p>
          </div>


          <div className="flex flex-row justify-center items-center gap-8 mt-6">
            <div className="flex flex-col items-center">
              <div></div>
              <div className="flex-2">
                <strong>{t('Dialog.titleLabel')}</strong>
              </div>
              <div className="">{receiptInfo ? receiptInfo.title ?? <Unknown/> : 'Receipt Title'}</div>
              <div></div>
            </div>

            <div className="flex flex-col items-center">
              <strong>{t('Dialog.amountLabel')}</strong>
              <div>
                {receiptInfo && group ? (
                    receiptInfo.amount ? (
                        <>
                          {formatCurrency(
                              group.currency,
                              receiptInfo.amount,
                              true,
                          )}
                        </>
                    ) : (
                        <Unknown/>
                    )
                ) : ("0.00")}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <strong>{t('Dialog.dateLabel')}</strong>
              <div>
                {receiptInfo ? (
                    receiptInfo.date ? (
                        formatDate(
                            new Date(`${receiptInfo?.date}T12:00:00.000Z`),
                            {dateStyle: 'medium'},
                        )
                    ) : (
                        <Unknown/>
                    )
                ) : (
                    'yyyy/mm/dd'
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <p>{t('Dialog.editNext')}</p>
        </div>
        <div className="text-center">
          <Button
              disabled={pending || !receiptInfo}
              onClick={() => {
                if (!receiptInfo || !group) return
                router.push(
                    `/groups/${group.id}/expenses/create?amount=${
                        receiptInfo.amount
                    }&categoryId=${receiptInfo.categoryId}&date=${
                        receiptInfo.date
                    }&title=${encodeURIComponent(
                        receiptInfo.title ?? '',
                    )}&imageUrl=${encodeURIComponent(receiptInfo.url)}&imageWidth=${
                        receiptInfo.width
                    }&imageHeight=${receiptInfo.height}`,
                )
              }}
          >
            {t('Dialog.continue')}
          </Button>
        </div>
      </div>
  )
}

function Unknown() {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`CreateFromReceipt.${key}`, params);
  return (
      <div className="flex gap-1 items-center text-muted-foreground">
        <FileQuestion className="w-4 h-4" />
        <em>{t('unknown')}</em>
      </div>
  )
}

function CreateFromReceiptDialog({
                                   trigger,
                                   title,
                                   description,
                                   children,
                                 }: PropsWithChildren<{
  trigger: ReactNode
  title: ReactNode
  description: ReactNode
}>) {
  return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
  )
}

function CreateFromReceiptDrawer({
                                   trigger,
                                   title,
                                   description,
                                   children,
                                 }: PropsWithChildren<{
  trigger: ReactNode
  title: ReactNode
  description: ReactNode
}>) {
  return (
      <Drawer>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">{title}</DrawerTitle>
            <DrawerDescription className="text-left">
              {description}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
        </DrawerContent>
      </Drawer>
  )
}
