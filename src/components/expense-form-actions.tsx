'use server'
export async function extractCategoryFromTitle(description: string) {
  'use server'


  return { categoryId: 0 }
}

export type TitleExtractedInfo = Awaited<
  ReturnType<typeof extractCategoryFromTitle>
>
