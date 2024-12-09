This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started
1. First create a .env file in the project folder and copy the contents of .env.example into .env 
2. Make sure you have postgres installed in your system.
3. Replace username and password with the local database credentials in the .env file.

Next, install dependencies and database migrations.
```bash
npm install
```

Next, run the development server:

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
