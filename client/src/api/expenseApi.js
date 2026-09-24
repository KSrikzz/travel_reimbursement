import api from "./axios";

export const getMyExpenses = async () => {
  const response = await api.get("/expenses/my");
  return response.data;
};

export const createExpense = async (expenseData) => {
  const response = await api.post(
    "/expenses",
    expenseData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};