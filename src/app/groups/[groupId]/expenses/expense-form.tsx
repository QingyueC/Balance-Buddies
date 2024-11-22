import Bill from '../../../../../public/Bill.png'
import Image from 'next/image'
import { CategorySelector } from '@/components/category-selector'
import { ExpenseDocumentsInput } from '@/components/expense-documents-input'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { randomId } from '@/lib/api'
import { RuntimeFeatureFlags } from '@/lib/featureFlags'
import { useActiveUser } from '@/lib/hooks'
import {
  ExpenseFormValues,
  SplittingOptions,
  expenseFormSchema,
} from '@/lib/schemas'
import { cn } from '@/lib/utils'
import { AppRouterOutput } from '@/trpc/routers/_app'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'
import { DeletePopup } from '../../../../components/delete-popup'
import { extractCategoryFromTitle } from '../../../../components/expense-form-actions'
import { Textarea } from '../../../../components/ui/textarea'

const enforceCurrencyPattern = (value: string) =>
  value
    .replace(/^\s*-/, '_') // replace leading minus with _
    .replace(/[.,]/, '#') // replace first comma with #
    .replace(/[-.,]/g, '') // remove other minus and commas characters
    .replace(/_/, '-') // change back _ to minus
    .replace(/#/, '.') // change back # to dot
    .replace(/[^-\d.]/g, '') // remove all non-numeric characters

const getDefaultSplittingOptions = (
  group: NonNullable<AppRouterOutput['groups']['get']['group']>,
) => {
  const defaultValue = {
    splitMode: 'EVENLY' as const,
    paidFor: group.participants.map(({ id }) => ({
      participant: id,
      shares: '1' as unknown as number,
    })),
  }

  if (typeof localStorage === 'undefined') return defaultValue
  const defaultSplitMode = localStorage.getItem(
    `${group.id}-defaultSplittingOptions`,
  )
  if (defaultSplitMode === null) return defaultValue
  const parsedDefaultSplitMode = JSON.parse(
    defaultSplitMode,
  ) as SplittingOptions

  if (parsedDefaultSplitMode.paidFor === null) {
    parsedDefaultSplitMode.paidFor = defaultValue.paidFor
  }

  // if there is a participant in the default options that does not exist anymore,
  // remove the stale default splitting options
  for (const parsedPaidFor of parsedDefaultSplitMode.paidFor) {
    if (
      !group.participants.some(({ id }) => id === parsedPaidFor.participant)
    ) {
      localStorage.removeItem(`${group.id}-defaultSplittingOptions`)
      return defaultValue
    }
  }

  return {
    splitMode: parsedDefaultSplitMode.splitMode,
    paidFor: parsedDefaultSplitMode.paidFor.map((paidFor) => ({
      participant: paidFor.participant,
      shares: String(paidFor.shares / 100) as unknown as number,
    })),
  }
}

async function persistDefaultSplittingOptions(
  groupId: string,
  expenseFormValues: ExpenseFormValues,
) {
  if (localStorage && expenseFormValues.saveDefaultSplittingOptions) {
    const computePaidFor = (): SplittingOptions['paidFor'] => {
      if (expenseFormValues.splitMode === 'EVENLY') {
        return expenseFormValues.paidFor.map(({ participant }) => ({
          participant,
          shares: '100' as unknown as number,
        }))
      } else if (expenseFormValues.splitMode === 'BY_AMOUNT') {
        return null
      } else {
        return expenseFormValues.paidFor
      }
    }

    const splittingOptions = {
      splitMode: expenseFormValues.splitMode,
      paidFor: computePaidFor(),
    } satisfies SplittingOptions

    localStorage.setItem(
      `${groupId}-defaultSplittingOptions`,
      JSON.stringify(splittingOptions),
    )
  }
}

export function ExpenseForm({
  group,
  categories,
  expense,
  onSubmit,
  onDelete,
  runtimeFeatureFlags,
}: {
  group: NonNullable<AppRouterOutput['groups']['get']['group']>
  categories: AppRouterOutput['categories']['list']['categories']
  expense?: AppRouterOutput['groups']['expenses']['get']['expense']
  onSubmit: (value: ExpenseFormValues, participantId?: string) => Promise<void>
  onDelete?: (participantId?: string) => Promise<void>
  runtimeFeatureFlags: RuntimeFeatureFlags
}) {
  const t = useTranslations('ExpenseForm')
  const isCreate = expense === undefined
  const searchParams = useSearchParams()

  const getSelectedPayer = (field?: { value: string }) => {
    if (isCreate && typeof window !== 'undefined') {
      const activeUser = localStorage.getItem(`${group.id}-activeUser`)
      if (activeUser && activeUser !== 'None' && field?.value === undefined) {
        return activeUser
      }
    }
    return field?.value
  }
  const defaultSplittingOptions = getDefaultSplittingOptions(group)
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? {
        title: expense.title,
        expenseDate: expense.expenseDate ?? new Date(),
        amount: String(expense.amount / 100) as unknown as number, // hack
        category: expense.categoryId,
        paidBy: expense.paidById,
        paidFor: expense.paidFor.map(({ participantId, shares }) => ({
          participant: participantId,
          shares: String(shares / 100) as unknown as number,
        })),
        splitMode: expense.splitMode,
        saveDefaultSplittingOptions: false,
        isReimbursement: expense.isReimbursement,
        documents: expense.documents,
        notes: expense.notes ?? '',
      }
      : searchParams.get('reimbursement')
        ? {
          title: t('reimbursement'),
          expenseDate: new Date(),
          amount: String(
            (Number(searchParams.get('amount')) || 0) / 100,
          ) as unknown as number, // hack
          category: 1, // category with Id 1 is Payment
          paidBy: searchParams.get('from') ?? undefined,
          paidFor: [
            searchParams.get('to')
              ? {
                participant: searchParams.get('to')!,
                shares: '1' as unknown as number,
              }
              : undefined,
          ],
          isReimbursement: true,
          splitMode: defaultSplittingOptions.splitMode,
          saveDefaultSplittingOptions: false,
          documents: [],
          notes: '',
        }
        : {
          title: searchParams.get('title') ?? '',
          expenseDate: searchParams.get('date')
            ? new Date(searchParams.get('date') as string)
            : new Date(),
          amount: (searchParams.get('amount') || 0) as unknown as number, // hack,
          category: searchParams.get('categoryId')
            ? Number(searchParams.get('categoryId'))
            : 0, // category with Id 0 is General
          // paid for all, split evenly
          paidFor: defaultSplittingOptions.paidFor,
          paidBy: getSelectedPayer(),
          isReimbursement: false,
          splitMode: defaultSplittingOptions.splitMode,
          saveDefaultSplittingOptions: false,
          documents: searchParams.get('imageUrl')
            ? [
              {
                id: randomId(),
                url: searchParams.get('imageUrl') as string,
                width: Number(searchParams.get('imageWidth')),
                height: Number(searchParams.get('imageHeight')),
              },
            ]
            : [],
          notes: '',
        },
  })
  const [isCategoryLoading, setCategoryLoading] = useState(false)
  const activeUserId = useActiveUser(group.id)

  const submit = async (values: ExpenseFormValues) => {
    await persistDefaultSplittingOptions(group.id, values)
    return onSubmit(values, activeUserId ?? undefined)
  }

  const [isIncome, setIsIncome] = useState(Number(form.getValues().amount) < 0)
  const [manuallyEditedParticipants, setManuallyEditedParticipants] = useState<
    Set<string>
  >(new Set())

  const sExpense = isIncome ? 'Income' : 'Expense'

  useEffect(() => {
    setManuallyEditedParticipants(new Set())
  }, [form.watch('splitMode'), form.watch('amount')])

  useEffect(() => {
    const splitMode = form.getValues().splitMode

    // Only auto-balance for split mode 'Unevenly - By amount'
    if (
      splitMode === 'BY_AMOUNT' &&
      (form.getFieldState('paidFor').isDirty ||
        form.getFieldState('amount').isDirty)
    ) {
      const totalAmount = Number(form.getValues().amount) || 0
      const paidFor = form.getValues().paidFor
      let newPaidFor = [...paidFor]

      const editedParticipants = Array.from(manuallyEditedParticipants)
      let remainingAmount = totalAmount
      let remainingParticipants = newPaidFor.length - editedParticipants.length

      newPaidFor = newPaidFor.map((participant) => {
        if (editedParticipants.includes(participant.participant)) {
          const participantShare = Number(participant.shares) || 0
          if (splitMode === 'BY_AMOUNT') {
            remainingAmount -= participantShare
          }
          return participant
        }
        return participant
      })

      if (remainingParticipants > 0) {
        let amountPerRemaining = 0
        if (splitMode === 'BY_AMOUNT') {
          amountPerRemaining = remainingAmount / remainingParticipants
        }

        newPaidFor = newPaidFor.map((participant) => {
          if (!editedParticipants.includes(participant.participant)) {
            return {
              ...participant,
              shares: String(
                Number(amountPerRemaining.toFixed(2)),
              ) as unknown as number,
            }
          }
          return participant
        })
      }
      form.setValue('paidFor', newPaidFor, { shouldValidate: true })
    }
  }, [
    manuallyEditedParticipants,
    form.watch('amount'),
    form.watch('splitMode'),
  ])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <Card>
          <CardHeader>
            <CardTitle>
              {t(`${sExpense}.${isCreate ? 'create' : 'edit'}`)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className='flex flex-row justify-center items-center space-x-12'>
              <div>
                {/* category */}
                {/* <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="order-3 sm:order-2">
                      <CategorySelector
                        categories={categories}
                        defaultValue={
                          form.watch(field.name) // may be overwritten externally
                        }
                        onValueChange={field.onChange}
                        isLoading={isCategoryLoading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
                <Image src={Bill} alt="bill image" className='w-24 h-24'></Image>
              </div>
              <div>
                {/* expense description */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Expense Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Lunch after Software Engineering class"
                          className="text-base"
                          {...field}
                          onBlur={async () => {
                            field.onBlur()
                            if (runtimeFeatureFlags.enableCategoryExtract) {
                              setCategoryLoading(true)
                              const { categoryId } = await extractCategoryFromTitle(
                                field.value,
                              )
                              form.setValue('category', categoryId)
                              setCategoryLoading(false)
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Amount */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem className="sm:order-3">
                      <FormLabel>{t('amountField.label')}</FormLabel>
                      <div className="flex items-baseline gap-2">
                        <span>{group.currency}</span>
                        <FormControl>
                          <Input
                            className="text-base max-w-[120px]"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            onChange={(event) => {
                              const v = enforceCurrencyPattern(event.target.value)
                              const income = Number(v) < 0
                              setIsIncome(income)
                              if (income) form.setValue('isReimbursement', false)
                              onChange(v)
                            }}
                            onFocus={(e) => {
                              const target = e.currentTarget
                              setTimeout(() => target.select(), 1)
                            }}
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='flex flex-row items-center justify-center space-x-24'>
              <div>
                {/* paid by */}
                <FormField
                  control={form.control}
                  name="paidBy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row sm:order-5">
                      <FormLabel>Paid by</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={getSelectedPayer(field)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a participant" />
                        </SelectTrigger>
                        <SelectContent>
                          {group.participants.map(({ id, name }: { id: string; name: string }) => (
                            <SelectItem key={id} value={id}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Split By</span>
                    <Button
                      variant="link"
                      type="button"
                      className="-my-2 -mx-4 ml-6"
                      onClick={() => {
                        const paidFor = form.getValues().paidFor
                        const allSelected =
                          paidFor.length === group.participants.length
                        const newPaidFor = allSelected
                          ? []
                          : group.participants.map((p) => ({
                            participant: p.id,
                            shares:
                              paidFor.find((pfor) => pfor.participant === p.id)
                                ?.shares ?? ('1' as unknown as number),
                          }))
                        form.setValue('paidFor', newPaidFor, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }}
                    >
                      {form.getValues().paidFor.length ===
                        group.participants.length ? (
                        <>Clear</>
                      ) : (
                        <>selectAll</>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="paidFor"
                    render={() => (
                      <FormItem className="sm:order-4 row-span-2 space-y-0">
                        {group.participants.map(({ id, name }) => (
                          <FormField
                            key={id}
                            control={form.control}
                            name="paidFor"
                            render={({ field }) => {
                              return (
                                <div
                                  data-id={`${id}/${form.getValues().splitMode}/${group.currency
                                    }`}
                                  className="flex items-center border-t last-of-type:border-b last-of-type:!mb-4 -mx-6 px-6 py-3"
                                >
                                  <FormItem className="flex-1 flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.some(
                                          ({ participant }) => participant === id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          const options = {
                                            shouldDirty: true,
                                            shouldTouch: true,
                                            shouldValidate: true,
                                          }
                                          checked
                                            ? form.setValue(
                                              'paidFor',
                                              [
                                                ...field.value,
                                                {
                                                  participant: id,
                                                  shares: '1' as unknown as number,
                                                },
                                              ],
                                              options,
                                            )
                                            : form.setValue(
                                              'paidFor',
                                              field.value?.filter(
                                                (value) => value.participant !== id,
                                              ),
                                              options,
                                            )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal flex-1">
                                      {name}
                                    </FormLabel>
                                  </FormItem>
                                </div>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className='mt-12'>
              {/* Date */}
              <FormField
                control={form.control}
                name="expenseDate"
                render={({ field }) => (
                  <FormItem className="sm:order-1">
                    <FormControl>
                      <Input
                        className="date-base"
                        type="date"
                        defaultValue={formatDate(field.value)}
                        onChange={(event) => {
                          return field.onChange(new Date(event.target.value))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>








            {/* <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="sm:order-6">
                  <FormLabel>{t('notesField.label')}</FormLabel>
                  <FormControl>
                    <Textarea className="text-base" {...field} />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </CardContent>
        </Card>



        {runtimeFeatureFlags.enableExpenseDocuments && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{t('attachDocuments')}</span>
              </CardTitle>
              <CardDescription>
                {t(`${sExpense}.attachDescription`)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <ExpenseDocumentsInput
                    documents={field.value}
                    updateDocuments={field.onChange}
                  />
                )}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex mt-4 gap-2">
          <SubmitButton loadingContent={t(isCreate ? 'creating' : 'saving')}>
            <Save className="w-4 h-4 mr-2" />
            {t(isCreate ? 'create' : 'save')}
          </SubmitButton>
          {!isCreate && onDelete && (
            <DeletePopup
              onDelete={() => onDelete(activeUserId ?? undefined)}
            ></DeletePopup>
          )}
          <Button variant="ghost" asChild>
            <Link href={`/groups/${group.id}`}>{t('cancel')}</Link>
          </Button>
        </div>
      </form>
    </Form>
  )
}

function formatDate(date?: Date) {
  if (!date || isNaN(date as any)) date = new Date()
  return date.toISOString().substring(0, 10)
}
