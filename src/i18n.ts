import { getRequestConfig } from 'next-intl/server'
import { getUserLocale } from './lib/locale'

export const locales = [
  'en-US'
] as const
export type Locale = (typeof locales)[number]
export type Locales = ReadonlyArray<Locale>
export const defaultLocale: Locale = 'en-US'
console.log('Locale being loaded:', locales);


export default getRequestConfig(async () => {
  const locale = defaultLocale || (await getUserLocale()) 

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
