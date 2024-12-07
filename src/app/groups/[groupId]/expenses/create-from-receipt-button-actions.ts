'use server'
import { env } from '@/lib/env'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index.mjs'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

export async function extractExpenseInformationFromImage(imageUrl: string) {
  'use server'

  const body: ChatCompletionCreateParamsNonStreaming = {
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'user',
        content: `
          This image contains a receipt.
          Read the total amount and store it as a non-formatted number without any other text or currency.
          Guess the expense’s date and store it as yyyy-mm-dd.
          Guess a title for the expense.
          Return the amount, the date, and the title with just a comma between them, without anything else.
        `,
      },
      {
        role: 'user',
        content: [{ type: 'image_url', image_url: { url: imageUrl } }],
      },
    ],
  }

  const completion = await openai.chat.completions.create(body)

  const [amountString, date, title] = completion.choices
    .at(0)
    ?.message.content?.split(',') ?? [null, null, null]
  
  // Hardcoding categoryId as 0
  const categoryId = 0

  return { amount: Number(amountString), categoryId, date, title }
}

export type ReceiptExtractedInfo = Awaited<
  ReturnType<typeof extractExpenseInformationFromImage>
>
