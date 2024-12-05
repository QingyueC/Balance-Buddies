// expense-list-fetch-action.test.ts
import { getGroupExpensesAction } from './expense-list-fetch-action';
import { getGroupExpenses } from '@/lib/api';

jest.mock('@/lib/api', () => ({
  getGroupExpenses: jest.fn(),
}));

describe('getGroupExpensesAction', () => {
  const mockGroupId = 'test-group-id';
  const mockOptions = { offset: 0, length: 10 };
  const mockResponse = [
    { id: 'expense-1', title: 'Lunch', amount: 1500 },
    { id: 'expense-2', title: 'Dinner', amount: 3000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls getGroupExpenses with correct arguments', async () => {
    (getGroupExpenses as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getGroupExpensesAction(mockGroupId, mockOptions);

    expect(getGroupExpenses).toHaveBeenCalledTimes(1);
    expect(getGroupExpenses).toHaveBeenCalledWith(mockGroupId, mockOptions);
    expect(result).toEqual(mockResponse);
  });

  it('calls getGroupExpenses with undefined options when no options are provided', async () => {
    (getGroupExpenses as jest.Mock).mockResolvedValue(mockResponse);

    const result = await getGroupExpensesAction(mockGroupId);

    expect(getGroupExpenses).toHaveBeenCalledTimes(1);
    expect(getGroupExpenses).toHaveBeenCalledWith(mockGroupId, undefined);
    expect(result).toEqual(mockResponse);
  });
});
