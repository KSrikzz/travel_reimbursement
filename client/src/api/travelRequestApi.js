import api from "./axios";

export const getMyTravelRequests = async () => {
  const response = await api.get("/travel-requests/my");
  return response.data;
};

export const createTravelRequest = async (travelRequestData) => {
  const response = await api.post(
    "/travel-requests",
    travelRequestData
  );

  return response.data;
};