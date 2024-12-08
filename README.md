This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Unit Tests

To run the unit tests for the project, follow these instructions:

1. If you haven't started the development server (npm run dev) yet:
    - Run the following command:
```bash
npm test
```

2. If you have already started the development server (npm run dev):
    - Ensure tsconfig.json is in its original state before running the tests. You can use the following commands:
```bash
git checkout tsconfig.json
npm test
```

## Acceptance Tests

Use Case: Manage Group Expenses

1. Preconditions
   - User must have OpenAI API tokens in the system.

2. Main Flow
   - User will create a group and add buddies (participants) to the group [S1].
   - Add expenses to the group manually [S2].
   - Add expense to the group by uploading a picture of the receipt [S3].
   - Check balances of the group and how to pay [S4].
   - Star the group/Archive the group as needed [S5].

3. Subflows
   - [S1]: User inserts Group name/Group Information and adds multiple buddies to the group.
   - [S2]: Input details of the expense.
   - [S3]: The system uses OCR technology to read the expenses on the receipt.
   - [S4]: The system shows how to settle up the balance.
   - [S5]: Users can delete the group after archiving.