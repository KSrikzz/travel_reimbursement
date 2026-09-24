import api from "./axios";

export const getPendingExpenses = async () => {
  const response = await api.get("/expenses/pending");
  return response.data;
};

export const updateExpenseStatus = async (
  expenseId,
  status
) => {
  const response = await api.patch(
    `/expenses/${expenseId}/status`,
    {
      status,
    }
  );

  return response.data;
};