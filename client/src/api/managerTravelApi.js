import api from "./axios";

export const getPendingTravelRequests = async () => {
  const response = await api.get("/travel-requests/pending");
  return response.data;
};

export const updateTravelRequestStatus = async (
  requestId,
  status,
  managerComment
) => {
  const response = await api.patch(
    `/travel-requests/${requestId}/status`,
    {
      status,
      managerComment,
    }
  );

  return response.data;
};