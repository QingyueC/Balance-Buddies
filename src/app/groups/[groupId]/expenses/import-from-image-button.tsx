'use client'

import {
  ReceiptExtractedInfo,
  extractExpenseInformationFromImage,
} from '@/app/groups/[groupId]/expenses/import-from-image-button-action'
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
import {  FileQuestion, Loader2, Plus, Receipt } from 'lucide-react'
import { getImageData, usePresignedUpload } from 'next-s3-upload'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, ReactNode, useState } from 'react'
import { useCurrentGroup } from '../current-group-context'
import { getVars } from '@/vars/getVars'

const MAX_FILE_SIZE = 5 * 1024 ** 2

export function ImportFromImage() {
  const t = (key: string, params?: Record<string, string | number>) => getVars(`ImportFromImage.${key}`, params);
  const isDesktop = useMediaQuery('(min-width: 640px)')

  const DialogOrDrawer = isDesktop
      ? ImportFromImageDialog
      : ImportFromImageDrawer

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
          <ReceiptDialog />
        </DialogOrDrawer>
      </div>

  )
}

function ReceiptDialog() {
  const { group } = useCurrentGroup()
  const { data: categoriesData } = trpc.categories.list.useQuery()
  const categories = categoriesData?.categories

  const t = (key: string, params?: Record<string, string | number>) => getVars(`ImportFromImage.${key}`, params);
  const [pending, setPending] = useState(false)
  const { uploadToS3, FileInput, openFileDialog } = usePresignedUpload()
  const { toast } = useToast()
  const router = useRouter()
  const [receipt, setReceipt] = useState<
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
        setReceipt({ amount, categoryId, date, title, url, width, height })
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
        <div>
          <FileInput onChange={handleFileChange} accept="image/jpeg,image/png"/>
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
                ) : receipt ? (
                    <div className="absolute top-2 left-2 bottom-2 right-2">
                      <Image
                          src={receipt.url}
                          width={receipt.width}
                          height={receipt.height}
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
              <div className="">{receipt? receipt.title ?? <Unknown/> : 'Receipt Title'}</div>
              <div></div>
            </div>

            <div className="flex flex-col items-center">
              <strong>{t('Dialog.amountLabel')}</strong>
              <div>
                {receipt && group ? (
                    receipt.amount ? (
                        <>
                          {formatCurrency(
                              group.currency,
                              receipt.amount,
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
                {receipt ? (
                    receipt.date ? (
                        formatDate(
                            new Date(`${receipt?.date}T12:00:00.000Z`),
                            {dateStyle: 'medium'},
                        )
                    ) : (
                        <Unknown/>
                    )
                ) : (
                    'mm/dd/yyyy'
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
              disabled={pending || !receipt}
              onClick={() => {
                if (!receipt || !group) return
                router.push(
                    `/groups/${group.id}/expenses/create?amount=${
                        receipt.amount
                    }&categoryId=${receipt.categoryId}&date=${
                        receipt.date
                    }&title=${encodeURIComponent(
                        receipt.title ?? '',
                    )}&imageUrl=${encodeURIComponent(receipt.url)}&imageWidth=${
                        receipt.width
                    }&imageHeight=${receipt.height}`,
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
  const t = (key: string, params?: Record<string, string | number>) => getVars(`ImportFromImage.${key}`, params);
  return (
      <div className="flex gap-1 items-center text-muted-foreground">
        <FileQuestion className="w-4 h-4" />
        <em>{t('unknown')}</em>
      </div>
  )
}

function ImportFromImageDialog({
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

function ImportFromImageDrawer({
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
