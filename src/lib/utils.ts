import { Category } from '@prisma/client'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export type DateTimeStyle = NonNullable<
  ConstructorParameters<typeof Intl.DateTimeFormat>[1]
>['dateStyle']
export function formatDate(
  date: Date,
  options: { dateStyle?: DateTimeStyle; timeStyle?: DateTimeStyle } = {},
) {
  return date.toLocaleString('en-US', {
    ...options,
    timeZone: 'UTC',
  })
}

export function formatCategoryForAIPrompt(category: Category) {
  return `"${category.grouping}/${category.name}" (ID: ${category.id})`
}

/**
 * @param fractions Financial values in this app are generally processed in cents (or equivalent).
 * They are are therefore integer representations of the amount (e.g. 100 for USD 1.00).
 * Set this to `true` if you need to pass a value with decimal fractions instead (e.g. 1.00 for USD 1.00).
 */
export function formatCurrency(
  currency: string,
  amount: number,
  fractions?: boolean,
) {
  const format = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'currency',
    // '€' will be placed in correct position
    currency: 'EUR',
  })
  const formattedAmount = format.format(fractions ? amount : amount / 100)
  return formattedAmount.replace('€', currency)
}

export function formatFileSize(size: number) {
  const formatNumber = (num: number) =>
    num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })

  if (size > 1024 ** 3) return `${formatNumber(size / 1024 ** 3)} GB`
  if (size > 1024 ** 2) return `${formatNumber(size / 1024 ** 2)} MB`
  if (size > 1024) return `${formatNumber(size / 1024)} kB`
  return `${formatNumber(size)} B`
}

export function normalizeString(input: string): string {
  // Replaces special characters
  // Input: áäåèéę
  // Output: aaaeee
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}
