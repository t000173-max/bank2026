import api from "./index";

export const getUsersApi = async () => {
  const res = await api.get("/api/users");
  return res.data;
};

export const transferMoneyApi = async (data: {
  toUserId: string;
  amount: number;
}) => {
  try {
    console.log("Transfer API call:", data);
    const res = await api.post("/api/transactions/transfer", data);
    console.log("Transfer API response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Transfer API error:", error);
    throw error;
  }
};

export const getTransactionsApi = async () => {
  const res = await api.get("/api/transactions/my");
  return res.data;
};

export const depositMoneyApi = async (data: {
  amount: number;
}) => {
  try {
    console.log("Deposit API call:", data);
    const res = await api.post("/api/transactions/deposit", data);
    console.log("Deposit API response:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("Deposit API error:", error);
    throw error;
  }
};

