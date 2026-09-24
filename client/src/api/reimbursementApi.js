import api from "./axios";

export const getApprovedExpenses = async () => {
  const response = await api.get(
    "/expenses/approved"
  );

  return response.data;
};

export const processReimbursement = async (
  expenseId
) => {
  const response = await api.patch(
    `/reimbursements/${expenseId}/process`
  );

  return response.data;
};

export const getMyReimbursements = async () => {
  const response = await api.get(
    "/reimbursements/my"
  );

  return response.data;
};