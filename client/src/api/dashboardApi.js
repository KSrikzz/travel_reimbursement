import api from "./axios";

export const getEmployeeDashboard = async () => {
  const response = await api.get("/dashboard/employee");
  return response.data;
};

export const getManagerDashboard = async () => {
  const response = await api.get("/dashboard/manager");
  return response.data;
};

export const getFinanceDashboard = async () => {
  const response = await api.get("/dashboard/finance");
  return response.data;
};